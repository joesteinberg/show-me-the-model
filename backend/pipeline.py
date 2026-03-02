"""
Orchestrates the multi-stage analysis pipeline.

Stage 1:   Decomposition (1 Sonnet call)
Stage 2:   6 parallel analysis passes (6 Sonnet calls)
Stage 2.5: Deduplication & merge (1 Sonnet call)
Stage 3:   Synthesis (1 Opus call)
"""

import asyncio
import json
import logging
from pathlib import Path
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from backend.prompt_loader import load_and_render

logger = logging.getLogger(__name__)

STAGE2_PASSES = [
    ("stage2_identities.yaml", "identities"),
    ("stage2_general_eq.yaml", "general_eq"),
    ("stage2_exog_endog.yaml", "exog_endog"),
    ("stage2_quantitative.yaml", "quantitative"),
    ("stage2_consistency.yaml", "consistency"),
    ("stage2_steelman.yaml", "steelman"),
]


async def _call_claude(
    client: AsyncAnthropic,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
    retries: int = 2,
) -> str:
    """Make a single Claude API call and return the text response.

    If the response fails JSON parsing, retries with a nudge to produce valid JSON.
    """
    messages = [{"role": "user", "content": user_prompt}]

    for attempt in range(retries + 1):
        response = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=messages,
        )
        text = response.content[0].text
        if response.stop_reason != "end_turn":
            logger.warning(
                f"Response truncated (stop_reason={response.stop_reason}, "
                f"{len(text)} chars). Consider increasing max_tokens."
            )

        # Try parsing — if it works, return immediately
        try:
            _extract_json(text)
            return text
        except (json.JSONDecodeError, ValueError):
            if attempt < retries:
                logger.warning(
                    f"JSON parse failed (attempt {attempt + 1}/{retries + 1}), "
                    f"retrying with correction prompt..."
                )
                # Ask the model to fix its own output
                messages = [
                    {"role": "user", "content": user_prompt},
                    {"role": "assistant", "content": text},
                    {"role": "user", "content": (
                        "Your response contained invalid JSON. Please return the "
                        "complete response again as valid JSON. Ensure all strings "
                        "are properly escaped (especially quotes and newlines within "
                        "strings). Return only the JSON, no other text."
                    )},
                ]
            else:
                # Last attempt failed — return as-is, let caller handle it
                return text


def _map_model_for_openai(model: str) -> str:
    """Map Anthropic prompt model names to OpenAI equivalents."""
    model_map = {
        "claude-sonnet-4-6": "gpt-5-mini",
        "claude-opus-4-6": "gpt-5.2",
    }
    return model_map.get(model, model)


# Models that only accept temperature=1 (the default)
_OPENAI_NO_TEMPERATURE = {"gpt-5-mini"}


async def _call_openai(
    client: AsyncOpenAI,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
    retries: int = 2,
) -> str:
    """Make a single OpenAI Chat Completions API call and return text response."""
    model = _map_model_for_openai(model)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    base_kwargs = dict(
        model=model,
        max_completion_tokens=max_tokens,
        messages=messages,
        response_format={"type": "json_object"},
    )
    if model not in _OPENAI_NO_TEMPERATURE:
        base_kwargs["temperature"] = temperature

    for attempt in range(retries + 1):
        base_kwargs["messages"] = messages
        response = await client.chat.completions.create(**base_kwargs)
        choice = response.choices[0]
        text = choice.message.content
        if choice.finish_reason == "length":
            logger.warning(
                f"OpenAI response truncated ({len(text)} chars). "
                f"Consider increasing max_tokens."
            )

        try:
            _extract_json(text)
            return text
        except (json.JSONDecodeError, ValueError):
            if attempt < retries:
                logger.warning(
                    "OpenAI JSON parse failed (attempt %s/%s), retrying...",
                    attempt + 1,
                    retries + 1,
                )
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                    {"role": "assistant", "content": text},
                    {
                        "role": "user",
                        "content": (
                            "Your response contained invalid JSON. Please return "
                            "the complete response again as valid JSON. Ensure all "
                            "strings are properly escaped. Return only JSON."
                        ),
                    },
                ]
            else:
                return text


async def _call_model(
    client,
    provider: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
    retries: int = 2,
) -> str:
    """Route model calls to Claude or OpenAI."""
    if provider == "openai":
        return await _call_openai(
            client,
            model,
            system_prompt,
            user_prompt,
            temperature,
            max_tokens,
            retries,
        )

    return await _call_claude(
        client,
        model,
        system_prompt,
        user_prompt,
        temperature,
        max_tokens,
        retries,
    )


# Directory for saving raw responses for debugging
_RAW_OUTPUT_DIR = Path(__file__).parent.parent / "eval" / "outputs" / "_raw"


def _save_raw(stage_name: str, text: str):
    """Save raw API response for debugging."""
    _RAW_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = _RAW_OUTPUT_DIR / f"{stage_name}.txt"
    path.write_text(text)
    logger.debug(f"Saved raw response to {path}")


def _extract_json(text: str) -> dict:
    """Extract JSON from a response that might contain markdown fences or truncation."""
    text = text.strip()
    # Strip ```json ... ``` fences
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json) and last line (```)
        lines = [l for l in lines[1:] if not l.strip() == "```"]
        text = "\n".join(lines)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Attempt to repair truncated JSON by closing open structures
        repaired = _repair_truncated_json(text)
        return json.loads(repaired)


def _repair_truncated_json(text: str) -> str:
    """Best-effort repair of JSON truncated by max_tokens.

    Strategy: walk backward to find the last complete JSON value boundary
    (a closing } or ] that's not inside a string), then trim to that point
    and close any remaining open structures.
    """
    # Step 1: If we're inside a truncated string, find and trim it.
    # Walk backward from end to find the last unescaped quote that opens
    # a string, then trim everything from that quote onward.
    # After trimming, also remove a trailing key like `"key":` if present.

    # Simple approach: try progressively trimming from the end until
    # we find something parseable, or fall back to structural repair.

    # First, try to find last complete top-level entry by walking backward
    # to find a } or ] that's at a balanced depth.
    # We need to be string-aware going forward, so scan forward to build
    # a picture of nesting.

    # Forward scan to find all balanced positions
    in_string = False
    escape = False
    stack = []  # track nesting: '{' or '['
    # Positions right after a closing } or ] at the top level of the
    # outermost object/array — these are safe truncation points.
    safe_positions = []

    for i, ch in enumerate(text):
        if escape:
            escape = False
            continue
        if ch == '\\' and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in ('{', '['):
            stack.append(ch)
        elif ch == '}':
            stack.pop() if stack else None
            # After closing, if we're back to depth 1 (inside the root object/array),
            # this is a safe truncation point (right after a complete nested value)
            if len(stack) <= 2:
                safe_positions.append(i + 1)
        elif ch == ']':
            stack.pop() if stack else None
            if len(stack) <= 2:
                safe_positions.append(i + 1)

    if not safe_positions:
        raise json.JSONDecodeError("Cannot repair: no safe truncation point found", text, 0)

    # Trim to the last safe position
    last_safe = safe_positions[-1]
    truncated = text[:last_safe]

    # Now count unclosed structures
    in_string = False
    escape = False
    open_braces = 0
    open_brackets = 0

    for ch in truncated:
        if escape:
            escape = False
            continue
        if ch == '\\' and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == '{':
            open_braces += 1
        elif ch == '}':
            open_braces -= 1
        elif ch == '[':
            open_brackets += 1
        elif ch == ']':
            open_brackets -= 1

    result = truncated + ']' * open_brackets + '}' * open_braces

    cut = len(text) - last_safe
    logger.warning(f"Repaired truncated JSON (cut {cut} trailing chars, "
                   f"closed {open_brackets} brackets, {open_braces} braces)")
    return result


async def run_stage1(client, source_text: str, provider: str = "anthropic") -> dict:
    """Stage 1: Decompose the source text into structural components."""
    logger.info("Stage 1: Decomposition")
    prompt = load_and_render("stage1_decomposition.yaml", source_text=source_text)
    raw = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return _extract_json(raw)


async def _run_single_pass(
    client,
    provider: str,
    yaml_file: str,
    pass_name: str,
    source_text: str,
    decomposition_json: str,
) -> tuple[str, dict]:
    """Run a single Stage 2 analysis pass. Returns (pass_name, result_dict)."""
    logger.info(f"Stage 2: {pass_name}")
    prompt = load_and_render(
        yaml_file,
        source_text=source_text,
        decomposition=decomposition_json,
    )
    raw = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return pass_name, _extract_json(raw)


async def run_stage2(
    client,
    source_text: str,
    decomposition: dict,
    provider: str = "anthropic",
    batch_size: int = 2,
    batch_delay: float = 5.0,
) -> dict[str, dict]:
    """Stage 2: Run analysis passes in rate-limited batches.

    Args:
        batch_size: Number of concurrent calls per batch (default 2 to stay
                    under typical rate limits with large inputs).
        batch_delay: Seconds to wait between batches.
    """
    logger.info("Stage 2: Parallel analysis passes")
    decomposition_json = json.dumps(decomposition, indent=2)

    results = {}
    for i in range(0, len(STAGE2_PASSES), batch_size):
        batch = STAGE2_PASSES[i:i + batch_size]
        if i > 0:
            logger.info(f"  Rate limit pause ({batch_delay}s)...")
            await asyncio.sleep(batch_delay)
        tasks = [
            _run_single_pass(client, provider, yaml_file, name, source_text, decomposition_json)
            for yaml_file, name in batch
        ]
        batch_results = await asyncio.gather(*tasks)
        results.update(dict(batch_results))

    return results


async def run_stage2_5(
    client,
    decomposition: dict,
    stage2_results: dict[str, dict],
    provider: str = "anthropic",
) -> dict:
    """Stage 2.5: Deduplicate and merge overlapping annotations."""
    logger.info("Stage 2.5: Dedup & merge")
    decomposition_json = json.dumps(decomposition, indent=2)

    prompt = load_and_render(
        "stage2_5_dedup.yaml",
        decomposition=decomposition_json,
        identities_output=json.dumps(stage2_results["identities"], indent=2),
        general_eq_output=json.dumps(stage2_results["general_eq"], indent=2),
        exog_endog_output=json.dumps(stage2_results["exog_endog"], indent=2),
        quantitative_output=json.dumps(stage2_results["quantitative"], indent=2),
        consistency_output=json.dumps(stage2_results["consistency"], indent=2),
        steelman_output=json.dumps(stage2_results["steelman"], indent=2),
    )
    raw = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return _extract_json(raw)


async def run_stage3(
    client,
    source_text: str,
    decomposition: dict,
    merged_annotations: dict,
    provider: str = "anthropic",
) -> dict:
    """Stage 3: Synthesis report (Opus)."""
    logger.info("Stage 3: Synthesis")
    prompt = load_and_render(
        "stage3_synthesis.yaml",
        source_text=source_text,
        decomposition=json.dumps(decomposition, indent=2),
        merged_annotations=json.dumps(merged_annotations, indent=2),
    )
    raw = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return _extract_json(raw)


async def run_pipeline(
    client,
    source_text: str,
    provider: str = "anthropic",
    on_stage_complete=None,
) -> dict:
    """
    Run the full analysis pipeline on a source text.

    Args:
        client: AsyncAnthropic client instance
        source_text: The raw text to analyze
        on_stage_complete: Optional callback(stage_name, result) for progress tracking

    Returns:
        dict with keys: decomposition, stage2_results, merged_annotations, synthesis
    """
    # Stage 1
    decomposition = await run_stage1(client, source_text, provider=provider)
    if on_stage_complete:
        on_stage_complete("decomposition", decomposition)

    # Stage 2 (parallel)
    stage2_results = await run_stage2(
        client,
        source_text,
        decomposition,
        provider=provider,
    )
    if on_stage_complete:
        on_stage_complete("stage2", stage2_results)

    # Stage 2.5
    merged = await run_stage2_5(
        client,
        decomposition,
        stage2_results,
        provider=provider,
    )
    if on_stage_complete:
        on_stage_complete("dedup", merged)

    # Stage 3
    synthesis = await run_stage3(
        client,
        source_text,
        decomposition,
        merged,
        provider=provider,
    )
    if on_stage_complete:
        on_stage_complete("synthesis", synthesis)

    return {
        "workflow": provider,
        "decomposition": decomposition,
        "stage2_results": stage2_results,
        "merged_annotations": merged,
        "synthesis": synthesis,
    }
