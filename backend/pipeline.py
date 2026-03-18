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
from typing import Any

from anthropic import AsyncAnthropic
from anthropic.types import TextBlock
from openai import AsyncOpenAI

from backend.prompt_loader import load_and_render, load_field_examples

logger = logging.getLogger(__name__)

# Per-token pricing (USD) as of 2025-03.
# Keys must match the model strings actually sent to each API.
_PRICING = {
    # Anthropic
    "claude-sonnet-4-6": {"input": 3.00 / 1e6, "output": 15.00 / 1e6},
    "claude-opus-4-6": {"input": 15.00 / 1e6, "output": 75.00 / 1e6},
    # OpenAI (mapped names)
    "gpt-5-mini": {"input": 1.50 / 1e6, "output": 6.00 / 1e6},
    "gpt-5.4": {"input": 10.00 / 1e6, "output": 30.00 / 1e6},
}

# Default number of JSON-parse retry attempts.
_DEFAULT_RETRIES = 2


def _estimate_cost(usage_records: list[dict]) -> float:
    """Sum up estimated cost from a list of {model, input_tokens, output_tokens}."""
    total = 0.0
    for rec in usage_records:
        prices = _PRICING.get(rec["model"], {"input": 0, "output": 0})
        total += rec["input_tokens"] * prices["input"]
        total += rec["output_tokens"] * prices["output"]
    return round(total, 4)


# Each tuple is (prompt_yaml_filename, pass_name_key).
# The six passes analyze the same essay through different economic lenses:
#   identities    — accounting identities and hidden assumptions
#   general_eq    — general-equilibrium effects ignored by partial analysis
#   exog_endog    — which variables the author treats as fixed vs. determined
#   quantitative  — empirical claims, magnitudes, and missing data
#   consistency   — internal contradictions and logical gaps
#   steelman      — strongest version of the argument + counterarguments
# All six run in parallel (batched for rate limits); results are merged in Stage 2.5.
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
    retries: int = _DEFAULT_RETRIES,
) -> tuple[str, dict]:
    """Make a single Claude API call and return (text, usage_record).

    If the response fails JSON parsing, retries with a nudge to produce valid JSON.
    """
    messages = [{"role": "user", "content": user_prompt}]
    total_input = 0
    total_output = 0

    for attempt in range(retries + 1):
        response = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=messages,
        )
        text_block = response.content[0]
        if not isinstance(text_block, TextBlock):
            raise ValueError(f"Expected TextBlock, got {type(text_block).__name__}")
        text = text_block.text
        total_input += response.usage.input_tokens
        total_output += response.usage.output_tokens

        if response.stop_reason != "end_turn":
            logger.warning(
                f"Response truncated (stop_reason={response.stop_reason}, "
                f"{len(text)} chars). Consider increasing max_tokens."
            )

        # Try parsing. If it works, return immediately.
        try:
            _extract_json(text)
            usage = {"model": model, "input_tokens": total_input, "output_tokens": total_output}
            return text, usage
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
                    {
                        "role": "user",
                        "content": (
                            "Your response contained invalid JSON. Please return the "
                            "complete response again as valid JSON. Ensure all strings "
                            "are properly escaped (especially quotes and newlines within "
                            "strings). Return only the JSON, no other text."
                        ),
                    },
                ]
            else:
                # Last attempt failed. Return as-is, let caller handle it.
                usage = {"model": model, "input_tokens": total_input, "output_tokens": total_output}
                return text, usage


def _map_model_for_openai(model: str) -> str:
    """Map Anthropic prompt model names to OpenAI equivalents."""
    model_map = {
        "claude-sonnet-4-6": "gpt-5-mini",
        "claude-opus-4-6": "gpt-5.4",
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
    retries: int = _DEFAULT_RETRIES,
) -> tuple[str, dict]:
    """Make a single OpenAI Chat Completions API call and return (text, usage_record)."""
    model = _map_model_for_openai(model)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    total_input = 0
    total_output = 0

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
        if response.usage:
            total_input += response.usage.prompt_tokens
            total_output += response.usage.completion_tokens

        if choice.finish_reason == "length":
            logger.warning(
                f"OpenAI response truncated ({len(text)} chars). Consider increasing max_tokens."
            )

        try:
            _extract_json(text)
            usage = {"model": model, "input_tokens": total_input, "output_tokens": total_output}
            return text, usage
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
                usage = {"model": model, "input_tokens": total_input, "output_tokens": total_output}
                return text, usage


async def _call_model(
    client: AsyncAnthropic | AsyncOpenAI,
    provider: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    max_tokens: int,
    retries: int = _DEFAULT_RETRIES,
) -> tuple[str, dict]:
    """Route model calls to Claude or OpenAI. Returns (text, usage_record)."""
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


def _extract_json(text: str) -> dict[str, Any]:
    """Extract JSON from a response that might contain markdown fences or truncation."""
    text = text.strip()
    # Strip ```json ... ``` fences
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json) and last line (```)
        lines = [line for line in lines[1:] if not line.strip() == "```"]
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
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in ("{", "["):
            stack.append(ch)
        elif ch == "}":
            stack.pop() if stack else None
            # After closing, if we're back to depth 1 (inside the root object/array),
            # this is a safe truncation point (right after a complete nested value)
            if len(stack) <= 2:
                safe_positions.append(i + 1)
        elif ch == "]":
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
        if ch == "\\" and in_string:
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == "{":
            open_braces += 1
        elif ch == "}":
            open_braces -= 1
        elif ch == "[":
            open_brackets += 1
        elif ch == "]":
            open_brackets -= 1

    result = truncated + "]" * open_brackets + "}" * open_braces

    cut = len(text) - last_safe
    logger.warning(
        f"Repaired truncated JSON (cut {cut} trailing chars, "
        f"closed {open_brackets} brackets, {open_braces} braces)"
    )
    return result


async def run_stage1(
    client: AsyncAnthropic | AsyncOpenAI, source_text: str, provider: str = "anthropic"
) -> tuple[dict, dict]:
    """Stage 1: Decompose the source text into structural components."""
    logger.info("Stage 1: Decomposition")
    prompt = load_and_render("stage1_decomposition.yaml", source_text=source_text)
    raw, usage = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return _extract_json(raw), usage


async def _run_single_pass(
    client: AsyncAnthropic | AsyncOpenAI,
    provider: str,
    yaml_file: str,
    pass_name: str,
    source_text: str,
    decomposition_json: str,
    field_examples: dict[str, str] | None = None,
) -> tuple[str, dict, dict]:
    """Run a single Stage 2 analysis pass. Returns (pass_name, result_dict, usage)."""
    logger.info("Stage 2: %s", pass_name)
    runtime_vars = dict(
        source_text=source_text,
        decomposition=decomposition_json,
    )
    # Inject field-specific examples if available
    if field_examples:
        runtime_vars.update(field_examples)
    prompt = load_and_render(yaml_file, **runtime_vars)
    raw, usage = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return pass_name, _extract_json(raw), usage


async def run_stage2(
    client: AsyncAnthropic | AsyncOpenAI,
    source_text: str,
    decomposition: dict,
    provider: str = "anthropic",
    batch_size: int = 2,
    batch_delay: float = 5.0,
) -> tuple[dict[str, dict], list[dict]]:
    """Stage 2: Run analysis passes in rate-limited batches.

    Args:
        batch_size: Number of concurrent calls per batch (default 2 to stay
                    under typical rate limits with large inputs).
        batch_delay: Seconds to wait between batches.

    Returns:
        (results_dict, list_of_usage_records)
    """
    logger.info("Stage 2: Parallel analysis passes")
    decomposition_json = json.dumps(decomposition, indent=2)

    # Load field-specific examples based on stage 1 classification
    field = decomposition.get("field", "macro_fiscal")
    field_examples = load_field_examples(field)
    logger.info("  Field classification: %s", field)

    results = {}
    usage_records = []
    for i in range(0, len(STAGE2_PASSES), batch_size):
        batch = STAGE2_PASSES[i : i + batch_size]
        if i > 0:
            logger.info("  Rate limit pause (%.1fs)...", batch_delay)
            await asyncio.sleep(batch_delay)
        tasks = [
            _run_single_pass(
                client,
                provider,
                yaml_file,
                name,
                source_text,
                decomposition_json,
                field_examples,
            )
            for yaml_file, name in batch
        ]
        batch_results = await asyncio.gather(*tasks)
        for name, result, usage in batch_results:
            results[name] = result
            usage_records.append(usage)

    return results, usage_records


async def run_stage2_5(
    client: AsyncAnthropic | AsyncOpenAI,
    decomposition: dict,
    stage2_results: dict[str, dict],
    provider: str = "anthropic",
) -> tuple[dict, dict]:
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
    raw, usage = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return _extract_json(raw), usage


async def run_stage3(
    client: AsyncAnthropic | AsyncOpenAI,
    source_text: str,
    decomposition: dict,
    merged_annotations: dict,
    provider: str = "anthropic",
) -> tuple[dict, dict]:
    """Stage 3: Synthesis report (Opus)."""
    logger.info("Stage 3: Synthesis")
    prompt = load_and_render(
        "stage3_synthesis.yaml",
        source_text=source_text,
        decomposition=json.dumps(decomposition, indent=2),
        merged_annotations=json.dumps(merged_annotations, indent=2),
    )
    raw, usage = await _call_model(
        client,
        provider,
        prompt["model"],
        prompt["system_prompt"],
        prompt["user_prompt"],
        prompt["temperature"],
        prompt["max_tokens"],
    )
    return _extract_json(raw), usage


async def run_pipeline(
    client: AsyncAnthropic | AsyncOpenAI,
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
    all_usage = []

    # Stage 1
    decomposition, usage1 = await run_stage1(client, source_text, provider=provider)
    all_usage.append(usage1)
    if on_stage_complete:
        on_stage_complete("decomposition", decomposition)

    # Stage 2 (parallel)
    stage2_results, usage2_list = await run_stage2(
        client,
        source_text,
        decomposition,
        provider=provider,
    )
    all_usage.extend(usage2_list)
    if on_stage_complete:
        on_stage_complete("stage2", stage2_results)

    # Stage 2.5
    merged, usage25 = await run_stage2_5(
        client,
        decomposition,
        stage2_results,
        provider=provider,
    )
    all_usage.append(usage25)
    if on_stage_complete:
        on_stage_complete("dedup", merged)

    # Stage 3
    synthesis, usage3 = await run_stage3(
        client,
        source_text,
        decomposition,
        merged,
        provider=provider,
    )
    all_usage.append(usage3)
    if on_stage_complete:
        on_stage_complete("synthesis", synthesis)

    estimated_cost = _estimate_cost(all_usage)
    logger.info("Pipeline complete. Estimated API cost: $%.4f", estimated_cost)

    return {
        "workflow": provider,
        "estimated_cost": estimated_cost,
        "decomposition": decomposition,
        "stage2_results": stage2_results,
        "merged_annotations": merged,
        "synthesis": synthesis,
    }
