"use client";

import { X, Check, AlertCircle } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useEmbeddingCache } from "@/context/EmbeddingCacheContext";
import { EMBEDDING_PROVIDERS, type EmbeddingProviderId } from "@/types/embeddings";

export function SettingsPanel() {
  const { settings, settingsOpen, setSettingsOpen, updateProvider } = useSettings();
  const { cacheSize, clearCache } = useEmbeddingCache();

  if (!settingsOpen) return null;

  const providerIds = Object.keys(EMBEDDING_PROVIDERS) as EmbeddingProviderId[];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSettingsOpen(false)} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[90vw] bg-card border-l border-parchment-dark shadow-editorial-lg z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-display-md font-bold">Settings</h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="btn-editorial-ghost px-2 py-2"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            {providerIds.map(pid => {
              const provider = EMBEDDING_PROVIDERS[pid];
              const provSettings = settings.providers[pid];

              return (
                <div key={pid} className="card-editorial p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-sans text-body-sm font-semibold">{provider.name}</h3>
                      <p className="font-sans text-caption text-slate mt-0.5">
                        {provider.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provSettings.enabled}
                        onChange={e => updateProvider(pid, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-parchment-dark rounded-full peer peer-checked:bg-burgundy transition-colors">
                        <div
                          className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
                            provSettings.enabled ? "translate-x-4.5 ml-[18px]" : "ml-0.5"
                          }`}
                        />
                      </div>
                    </label>
                  </div>

                  {provSettings.enabled && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-parchment">
                      {provider.requiresApiKey && (
                        <div>
                          <label className="block font-sans text-caption text-slate mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={provSettings.apiKey}
                            onChange={e => updateProvider(pid, { apiKey: e.target.value })}
                            placeholder={`Enter ${provider.name} API key`}
                            className="input-editorial text-body-sm py-2"
                          />
                        </div>
                      )}

                      {provider.baseUrlConfigurable && (
                        <div>
                          <label className="block font-sans text-caption text-slate mb-1">
                            Base URL
                          </label>
                          <input
                            type="text"
                            value={provSettings.baseUrl || provider.defaultBaseUrl || ""}
                            onChange={e => updateProvider(pid, { baseUrl: e.target.value })}
                            placeholder={provider.defaultBaseUrl || "https://..."}
                            className="input-editorial text-body-sm py-2"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block font-sans text-caption text-slate mb-1">
                          Models
                        </label>
                        <div className="space-y-1.5">
                          {provider.models.map(model => (
                            <label
                              key={model.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={provSettings.selectedModels.includes(model.id)}
                                onChange={e => {
                                  const selected = e.target.checked
                                    ? [...provSettings.selectedModels, model.id]
                                    : provSettings.selectedModels.filter(m => m !== model.id);
                                  updateProvider(pid, { selectedModels: selected });
                                }}
                                className="rounded border-parchment-dark text-burgundy focus:ring-burgundy"
                              />
                              <span className="font-sans text-body-sm">{model.name}</span>
                              {model.dimensions > 0 && (
                                <span className="font-sans text-caption text-slate">
                                  {model.dimensions}d
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      {pid === "openai-compatible" && (
                        <div>
                          <label className="block font-sans text-caption text-slate mb-1">
                            Custom Model ID
                          </label>
                          <input
                            type="text"
                            value={provSettings.customModelId || ""}
                            onChange={e =>
                              updateProvider(pid, { customModelId: e.target.value })
                            }
                            placeholder="e.g. text-embedding-ada-002"
                            className="input-editorial text-body-sm py-2"
                          />
                        </div>
                      )}

                      {provider.requiresApiKey && provSettings.apiKey && (
                        <div className="flex items-center gap-1.5 text-success-600">
                          <Check size={14} />
                          <span className="font-sans text-caption">Key configured</span>
                        </div>
                      )}
                      {provider.requiresApiKey && !provSettings.apiKey && (
                        <div className="flex items-center gap-1.5 text-warning-600">
                          <AlertCircle size={14} />
                          <span className="font-sans text-caption">API key required</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Cache management */}
            <div className="card-editorial p-4">
              <h3 className="font-sans text-body-sm font-semibold mb-2">Cache</h3>
              <p className="font-sans text-caption text-slate mb-3">
                {cacheSize} embedding vector{cacheSize !== 1 ? "s" : ""} cached in IndexedDB.
                Cached embeddings avoid redundant API calls.
              </p>
              <button
                onClick={clearCache}
                className="btn-editorial-secondary text-caption px-3 py-1.5"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
