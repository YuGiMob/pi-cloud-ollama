# pi-cloud-ollama

A [pi-coding-agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) extension that registers the [Ollama Cloud](https://ollama.com) OpenAI-compatible endpoint as a provider.

## Features

- **Model discovery.** Fetches the live model list from `ollama.com/api/tags` (fallback: `GET https://ollama.com/v1/models`), with a 10 s timeout and graceful degradation.
- **Metadata mapping.** Known models get accurate context windows, max tokens, reasoning and vision flags; `:cloud` and date-stamped tag suffixes (`:0731`) are normalized for lookup. Unknown models fall back to sensible defaults.
- **Refresh support.** `refreshModels` re-discovers the catalog when pi refreshes models (only when network access is allowed).

## Installation

```bash
pi install npm:pi-cloud-ollama
```

## Configuration

Set your Ollama API key:

```bash
export OLLAMA_API_KEY=ollama_...
```

Then select the `ollama-cloud` provider in pi.
