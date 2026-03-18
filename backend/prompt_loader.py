"""
Loads YAML prompt files, resolves shared references, and templates in runtime variables.

Two-stage templating:
  1. Shared resolution: {{ persona }}, {{ tone_guidelines }} resolved from shared/persona.yaml
  2. Runtime resolution: {{ source_text }}, {{ decomposition }}, etc. resolved at call time
"""

import re
from pathlib import Path

import yaml

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"
SHARED_DIR = PROMPTS_DIR / "shared"
EXAMPLES_DIR = SHARED_DIR / "examples"

# Map of field names to example YAML files.
# Falls back to macro_fiscal if the field is unknown.
_FIELD_EXAMPLE_FILES = {
    "macro_fiscal": "macro_fiscal.yaml",
    "trade": "trade.yaml",
    "micro_io": "micro_io.yaml",
    "finance": "finance.yaml",
    "labor": "labor.yaml",
}
_DEFAULT_FIELD = "macro_fiscal"


def _load_shared() -> dict[str, str]:
    """Load all shared template variables from shared/*.yaml files."""
    shared = {}
    for path in SHARED_DIR.glob("*.yaml"):
        with open(path) as f:
            data = yaml.safe_load(f)
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    shared[key] = value.strip()
    return shared


def _resolve_templates(text: str, variables: dict[str, str]) -> str:
    """Replace {{ variable }} placeholders with values from the variables dict."""

    def replacer(match):
        key = match.group(1).strip()
        if key in variables:
            return variables[key]
        # Leave unresolved placeholders for runtime resolution
        return match.group(0)

    return re.sub(r"\{\{\s*(\w+)\s*\}\}", replacer, text)


def load_prompt(yaml_filename: str) -> dict:
    """
    Load a prompt YAML file and resolve shared template variables.

    Returns a dict with:
      - name, version, stage, model, temperature, max_tokens
      - system_prompt: shared variables resolved, runtime variables still as {{ placeholders }}
      - user_prompt_template: runtime variables still as {{ placeholders }}
    """
    path = PROMPTS_DIR / yaml_filename
    with open(path) as f:
        prompt = yaml.safe_load(f)

    shared = _load_shared()

    # Resolve shared variables in system_prompt
    if "system_prompt" in prompt:
        prompt["system_prompt"] = _resolve_templates(prompt["system_prompt"], shared)

    # user_prompt_template keeps its runtime placeholders
    return prompt


def render_prompt(prompt: dict, **runtime_vars: str) -> tuple[str, str]:
    """
    Render a loaded prompt with runtime variables.

    Returns (system_prompt, user_prompt) with all placeholders resolved.
    """
    system = _resolve_templates(prompt["system_prompt"], runtime_vars)
    user = _resolve_templates(prompt.get("user_prompt_template", ""), runtime_vars)
    return system, user


def load_field_examples(field: str) -> dict[str, str]:
    """Load field-specific example blocks for stage 2 prompts.

    Returns a dict mapping template variable names (e.g. 'field_examples')
    to the appropriate example text for the given field. Each stage 2 checker
    gets its own key: identities_examples, general_eq_examples, etc.
    """
    filename = _FIELD_EXAMPLE_FILES.get(field, _FIELD_EXAMPLE_FILES[_DEFAULT_FIELD])
    path = EXAMPLES_DIR / filename
    if not path.exists():
        path = EXAMPLES_DIR / _FIELD_EXAMPLE_FILES[_DEFAULT_FIELD]
    with open(path) as f:
        data = yaml.safe_load(f)
    # Return all string values as template variables
    return {k: v.strip() for k, v in data.items() if isinstance(v, str)}


def load_and_render(yaml_filename: str, **runtime_vars: str) -> dict:
    """
    Convenience: load a prompt YAML and render it in one step.

    Returns a dict with:
      - model, temperature, max_tokens
      - system_prompt, user_prompt (fully resolved)
    """
    prompt = load_prompt(yaml_filename)
    system, user = render_prompt(prompt, **runtime_vars)
    return {
        "model": prompt.get("model", "claude-sonnet-4-6"),
        "temperature": prompt.get("temperature", 0.3),
        "max_tokens": prompt.get("max_tokens", 8192),
        "system_prompt": system,
        "user_prompt": user,
    }
