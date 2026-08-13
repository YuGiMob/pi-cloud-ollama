# pi-cloud-ollama

Registers [Ollama Cloud](https://ollama.com) as a provider in [pi-coding-agent](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent), with live model discovery and accurate metadata for the hosted catalog.

## What you get

- **One provider, zero config beyond a key.** `ollama-cloud` speaks the OpenAI-completions API against `https://ollama.com/v1` and reads your key from `OLLAMA_API_KEY`.
- **Live model discovery.** The model list is fetched from `ollama.com/api/tags` at startup (fallback: `GET https://ollama.com/v1/models`), with a 10 s timeout and graceful degradation — a network failure never crashes the session.
- **Accurate metadata.** Known models get their real context windows, max tokens, reasoning and vision flags, and thinking-level maps. Unknown models fall back to sensible defaults instead of being dropped.
- **Tag-suffix normalization.** `:cloud` and date-stamped tags (`:0731`) are stripped for metadata lookup, so `deepseek-v4-flash:cloud` resolves to the same metadata as `deepseek-v4-flash`.
- **Refresh support.** When pi refreshes models, the catalog is re-discovered — but only when network access is allowed.

## Quick start

1. Set your API key:

```bash
export OLLAMA_API_KEY=ollama_...
```

2. Start pi and select the `ollama-cloud` provider.

3. Pick a model. The catalog is live, so whatever Ollama Cloud currently hosts is available:

```text
ollama-cloud / deepseek-v4-flash
ollama-cloud / qwen3-coder:480b
ollama-cloud / gemma3:27b
```

## Installation

```bash
pi install npm:pi-cloud-ollama
```

From a local checkout:

```bash
pi install /path/to/pi-cloud-ollama
```

## Configuration

| Setting | Value |
| --- | --- |
| Provider key | `ollama-cloud` |
| Base URL | `https://ollama.com/v1` |
| API key env var | `OLLAMA_API_KEY` |
| API style | `openai-completions` |

## Model metadata

Known model families and their metadata (context window / max tokens / reasoning / vision):

| Family | Context | Max tokens | Reasoning | Vision |
| --- | --- | --- | --- | --- |
| `gemma3:4b/12b/27b` | 128k | 8,192 | — | ✓ |
| `gemma4:31b` | 128k | 8,192 | ✓ | ✓ |
| `qwen3-coder:480b`, `qwen3-coder-next`, `qwen3.5:397b` | 256k | 16,384 | ✓ | — |
| `deepseek-v3.1:671b`, `deepseek-v3.2` | 160–164k | 32,768 | ✓ | — |
| `deepseek-v4-pro`, `deepseek-v4-flash` | 1M | 65,536 | ✓ | — |
| `ministral-3:3b/8b/14b` | 256k | 4,096 | — | — |
| `mistral-large-3:675b` | 128k | 16,384 | ✓ | — |
| `devstral-small-2:24b`, `devstral-2:123b` | 128k | 16,384 | ✓* | — |
| `glm-4.7` / `glm-5` / `glm-5.1` / `glm-5.2` | 198k–976k | 8,192–131,072 | ✓* | — |
| `kimi-k2.5` / `kimi-k2.6` / `kimi-k2.7-code` | 256k | 8,192–16,384 | ✓ | ✓ |
| `gpt-oss:20b/120b` | 128k | 8,192 | ✓ | — |
| `minimax-m2.1` / `m2.5` / `m2.7` / `m3` | 198k–512k | 8,192–16,384 | ✓* | ✓* |
| `nemotron-3-nano:30b` / `super` / `ultra` | 128k–256k | 8,192–16,384 | ✓ | — |
| `gemini-3-flash-preview` | 1M | 8,192 | — | ✓ |
| `rnj-1:8b` | 128k | 8,192 | — | — |

\* Deepseek-family reasoning models carry a `thinkingLevelMap` that maps pi's reasoning-effort levels (`minimal`/`low`/`medium`/`high`/`xhigh`) onto the provider's (`low`/`medium`/`high`/`max`).

Anything not in the table gets the defaults: 128k context, 8,192 max tokens, no reasoning, no vision. All models are registered with zero cost, so pi never mis-budgets spend for this provider.

## How discovery works

At startup (and on every model refresh when network is allowed):

1. `GET https://ollama.com/api/tags` — the live hosted catalog.
2. If that fails or returns nothing, `GET https://ollama.com/v1/models` is tried as a fallback.
3. Each model id is looked up as-is, then with `:cloud` / date-stamp suffixes stripped, then against the defaults.
4. If no models can be discovered at all, the provider is not registered and an error is logged — the session continues normally.

## Troubleshooting

- **Provider missing from the model picker.** Check the network connection; discovery needs to reach `ollama.com`. The failure is logged with an `[ollama-cloud]` prefix.
- **Wrong context window or max tokens.** The model id may not be in the known table — it falls back to the 128k/8,192 defaults. Open an issue with the exact model id.
- **401 / authentication errors.** Verify `OLLAMA_API_KEY` is set in the environment pi was started from.

## Development

Requires [Node.js](https://nodejs.org) ≥ 22.19 and npm.

```bash
npm install
npm test
npm run typecheck
```

## Credits

- [badlogic](https://github.com/badlogic), pi-coding-agent and the provider registration API

## License

[MIT](LICENSE)
