import type { ExtensionAPI, ProviderConfig } from "@earendil-works/pi-coding-agent";
import { type ModelMeta, DEFAULT_META } from "./models.js";

export interface ProviderModel {
  id: string;
  name: string;
  reasoning: boolean;
  input: ("text" | "image")[];
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  contextWindow: number;
  maxTokens: number;
  compat: { supportsDeveloperRole: boolean; supportsReasoningEffort: boolean };
  thinkingLevelMap?: { [key: string]: string };
}

export function buildModels(
  ids: string[],
  knownModels: Record<string, ModelMeta>,
  idTransform?: (id: string) => string,
): ProviderModel[] {
  return ids.map((id) => {
    const lookupId = idTransform ? idTransform(id) : id;
    const meta = knownModels[id] ?? knownModels[lookupId] ?? DEFAULT_META;
    return {
      id,
      name: id,
      reasoning: meta.reasoning,
      input: (meta.vision ? ["text", "image"] : ["text"]) as ("text" | "image")[],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: meta.contextWindow,
      maxTokens: meta.maxTokens,
      compat: { supportsDeveloperRole: false, supportsReasoningEffort: meta.reasoning },
      thinkingLevelMap: meta.thinkingLevelMap,
    };
  });
}

export function registerProvider(
  pi: ExtensionAPI,
  key: string,
  config: {
    name: string;
    baseUrl: string;
    apiKey: string;
    models: ProviderModel[];
    refreshModels?: ProviderConfig["refreshModels"];
  },
) {
  pi.registerProvider(key, {
    name: config.name,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    api: "openai-completions",
    models: config.models,
    ...(config.refreshModels ? { refreshModels: config.refreshModels } : {}),
  });
}
