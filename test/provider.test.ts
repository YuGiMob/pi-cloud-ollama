import { describe, expect, it, vi } from "vitest";
import { buildModels, registerProvider } from "../src/provider.js";
import { DEFAULT_META } from "../src/models.js";

describe("buildModels", () => {
  it("returns empty array for empty input", () => {
    const result = buildModels([], {});
    expect(result).toEqual([]);
  });

  it("maps ids with known metadata", () => {
    const knownModels = {
      "gpt-4": { contextWindow: 128_000, maxTokens: 4096, reasoning: true, vision: false },
    };

    const result = buildModels(["gpt-4"], knownModels);

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("gpt-4");
    expect(result[0]!.name).toBe("gpt-4");
    expect(result[0]!.reasoning).toBe(true);
    expect(result[0]!.input).toEqual(["text"]);
    expect(result[0]!.contextWindow).toBe(128_000);
    expect(result[0]!.maxTokens).toBe(4096);
  });

  it("uses DEFAULT_META for unknown models", () => {
    const result = buildModels(["unknown-model"], {});

    expect(result[0]!.reasoning).toBe(DEFAULT_META.reasoning);
    expect(result[0]!.contextWindow).toBe(DEFAULT_META.contextWindow);
    expect(result[0]!.maxTokens).toBe(DEFAULT_META.maxTokens);
    expect(result[0]!.input).toEqual(["text"]);
  });

  it("includes image input for vision models", () => {
    const knownModels = {
      "gpt-4-vision": { contextWindow: 128_000, maxTokens: 4096, reasoning: true, vision: true },
    };

    const result = buildModels(["gpt-4-vision"], knownModels);

    expect(result[0]!.input).toEqual(["text", "image"]);
  });

  it("applies idTransform when provided", () => {
    const knownModels = {
      "base-model": { contextWindow: 128_000, maxTokens: 4096, reasoning: true, vision: false },
    };

    const result = buildModels(["base-model:cloud"], knownModels, (id) => id.replace(/:cloud$/, ""));

    expect(result[0]!.reasoning).toBe(true);
  });

  it("prefers exact id match over transformed lookup", () => {
    const knownModels = {
      "base-model:cloud": { contextWindow: 64_000, maxTokens: 2048, reasoning: false, vision: false },
    };

    const result = buildModels(["base-model:cloud"], knownModels, (id) => id.replace(/:cloud$/, ""));

    expect(result[0]!.contextWindow).toBe(64_000);
    expect(result[0]!.maxTokens).toBe(2048);
  });

  it("sets zero cost for all models", () => {
    const result = buildModels(["test"], {});

    expect(result[0]!.cost).toEqual({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
  });

  it("sets compat with reasoningEffort and no developer role", () => {
    const knownModels = {
      "test": { contextWindow: 128_000, maxTokens: 4096, reasoning: true, vision: false },
    };

    const result = buildModels(["test"], knownModels);

    expect(result[0]!.compat.supportsDeveloperRole).toBe(false);
    expect(result[0]!.compat.supportsReasoningEffort).toBe(true);
  });

  it("passes through thinkingLevelMap from metadata", () => {
    const thinkingLevelMap = { low: "low", high: "high" };
    const knownModels = {
      "test": { contextWindow: 128_000, maxTokens: 4096, reasoning: true, vision: false, thinkingLevelMap },
    };

    const result = buildModels(["test"], knownModels);

    expect(result[0]!.thinkingLevelMap).toEqual(thinkingLevelMap);
  });
});

describe("registerProvider", () => {
  it("calls pi.registerProvider with correct config", () => {
    const pi = { registerProvider: vi.fn() };
    const models = [{ id: "test", name: "Test", reasoning: false, input: ["text"] as ("text" | "image")[], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128_000, maxTokens: 4096, compat: { supportsDeveloperRole: false, supportsReasoningEffort: false } }];

    registerProvider(pi as any, "test-provider", {
      name: "Test Provider",
      baseUrl: "https://test.com/v1",
      apiKey: "$TEST_KEY",
      models,
    });

    expect(pi.registerProvider).toHaveBeenCalledWith("test-provider", {
      name: "Test Provider",
      baseUrl: "https://test.com/v1",
      apiKey: "$TEST_KEY",
      api: "openai-completions",
      models,
    });
  });
});
