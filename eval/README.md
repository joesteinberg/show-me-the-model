# Eval

This directory contains the evaluation infrastructure for the analysis pipeline.

---

## Directory layout

```
eval/
  source-texts/          Raw text files used as pipeline inputs.
    citrini.txt
    pettis.txt
    cass.txt
  gold-standard/         Human-written reference analyses for each benchmark.
    citrini.md
    pettis.md
    cass.md
  outputs/               Pipeline outputs from eval runs. Gitignored.
    <source>/<timestamp>/
      stage1.json
      stage2.json
      stage2_5.json
      stage3.json
  eval_runner.py         Script that runs the pipeline on source texts.
```

`eval/outputs/` is listed in `.gitignore` and is never committed.

---

## Gold-standard files

Each file in `eval/gold-standard/` is a human-written Markdown document that serves as a reference benchmark for one source text. The documents are written by economists who have read the source text carefully.

Each gold-standard file is structured as:

1. A header identifying the source essay, author, publication, and the economist who wrote the evaluation.
2. **Part I: Passage-Level Annotations** — a set of named annotations, each with a severity rating (`Critical`, `Moderate`, `Minor`), an issue type tag from the taxonomy, the exact quoted passage, and a multi-paragraph explanation aimed at an educated non-economist reader.
3. Additional sections covering the essay's strengths and a synthesis assessment, depending on the file.

The gold-standard files are used for qualitative review. There is no automated scoring; evaluation involves reading the pipeline output alongside the gold standard and judging whether the pipeline identifies the same issues, at the same severity, with comparable explanations.

---

## How to run an evaluation

### Prerequisites

Copy `.env.example` to `.env` and add your API key:

```
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENAI_API_KEY=sk-...
```

### Run the full pipeline on all benchmarks

```bash
python -m eval.eval_runner
```

### Run on a single source text

```bash
python -m eval.eval_runner --source citrini
```

Valid values for `--source` are `citrini`, `pettis`, and `cass`.

### Run only up to a specific stage

```bash
python -m eval.eval_runner --source citrini --stage 1
python -m eval.eval_runner --source citrini --stage 2
python -m eval.eval_runner --source citrini --stage 2.5
python -m eval.eval_runner --source citrini --stage 3
```

Outputs are saved to `eval/outputs/<source>/<timestamp>/` as one JSON file per stage (`stage1.json`, `stage2.json`, `stage2_5.json`, `stage3.json`).

### Resume from a partial run

If a run was interrupted after Stage 1 or Stage 2, you can reload the saved intermediate outputs instead of re-running those stages:

```bash
python -m eval.eval_runner --source citrini --resume
```

This loads from the most recent timestamped directory for that source.

### Use a different provider

```bash
python -m eval.eval_runner --source citrini --provider openai
```

Defaults to `anthropic`. The OpenAI provider maps Anthropic model names to OpenAI equivalents as defined in `backend/pipeline.py`.

---

## How to add a new test case

1. **Add the source text.** Place the raw text of the essay in `eval/source-texts/<name>.txt`.

2. **Write a gold standard.** Create `eval/gold-standard/<name>.md` following the format of the existing files. Include at minimum:
   - A header with source, author, publication, and evaluator.
   - Part I: Passage-Level Annotations with at least the most important issues identified with severity, issue type, quoted passage, and explanation.

3. **Register the source name.** Add `"<name>"` to the `SOURCES` list at the top of `eval/eval_runner.py`:
   ```python
   SOURCES = ["citrini", "pettis", "cass", "<name>"]
   ```

4. **Run the pipeline** on your new source and compare the output against your gold standard:
   ```bash
   python -m eval.eval_runner --source <name>
   ```
