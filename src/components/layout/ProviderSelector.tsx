"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Circle, Star } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { EMBEDDING_PROVIDERS, EMBEDDING_MODELS, type EmbeddingProviderId } from "@/types/embeddings";

export function ProviderSelector() {
  const { settings, updateProvider, setPrimaryModel } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Count active models
  const enabledModels: Array<{ providerId: EmbeddingProviderId; modelId: string; modelName: string; providerName: string }> = [];
  for (const [pid, ps] of Object.entries(settings.providers)) {
    if (!ps.enabled) continue;
    const provider = EMBEDDING_PROVIDERS[pid as EmbeddingProviderId];
    if (!provider) continue;
    for (const mid of ps.selectedModels) {
      const spec = EMBEDDING_MODELS.find(m => m.id === mid && m.providerId === pid);
      if (spec) {
        enabledModels.push({
          providerId: pid as EmbeddingProviderId,
          modelId: mid,
          modelName: spec.name,
          providerName: provider.name,
        });
      }
    }
  }

  const primaryModel = settings.primaryModel
    ? enabledModels.find(m => m.modelId === settings.primaryModel)
    : null;

  const label = enabledModels.length === 0
    ? "No models"
    : primaryModel
      ? primaryModel.modelName
      : enabledModels.length === 1
        ? enabledModels[0].modelName
        : `${enabledModels.length} models`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-parchment-dark bg-card hover:bg-cream/50 transition-colors font-sans text-body-sm"
      >
        <Circle
          size={8}
          className={enabledModels.length > 0 ? "fill-success-500 text-success-500" : "fill-error-500 text-error-500"}
        />
        <span className="font-medium">{label}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 w-[320px] card-editorial shadow-editorial-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-parchment">
            <p className="font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold">
              Active Embedding Models
            </p>
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-parchment">
            {(Object.keys(EMBEDDING_PROVIDERS) as EmbeddingProviderId[]).map(pid => {
              const provider = EMBEDDING_PROVIDERS[pid];
              const ps = settings.providers[pid];
              if (!ps) return null;

              return (
                <div key={pid} className="px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-caption font-semibold text-foreground">
                      {provider.name}
                    </span>
                    <button
                      onClick={() => updateProvider(pid, { enabled: !ps.enabled })}
                      className={`relative w-8 h-[18px] rounded-full transition-colors ${ps.enabled ? "bg-burgundy" : "bg-parchment-dark"}`}
                    >
                      <span
                        className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${
                          ps.enabled ? "left-[16px]" : "left-[2px]"
                        }`}
                      />
                    </button>
                  </div>

                  {ps.enabled && (
                    <div className="space-y-0.5 ml-1">
                      {provider.models.map(model => {
                        const isSelected = ps.selectedModels.includes(model.id);
                        return (
                          <div key={model.id} className="flex items-center gap-1 py-0.5">
                            {/* Checkbox: include in queries */}
                            <div
                              className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-burgundy border-burgundy text-white"
                                  : "border-parchment-dark"
                              }`}
                              onClick={() => {
                                const selected = isSelected
                                  ? ps.selectedModels.filter(m => m !== model.id)
                                  : [...ps.selectedModels, model.id];
                                updateProvider(pid, { selectedModels: selected });
                              }}
                            >
                              {isSelected && <Check size={10} />}
                            </div>
                            <span className="font-sans text-caption flex-1 cursor-pointer" onClick={() => {
                              const selected = isSelected
                                ? ps.selectedModels.filter(m => m !== model.id)
                                : [...ps.selectedModels, model.id];
                              updateProvider(pid, { selectedModels: selected });
                            }}>{model.name}</span>
                            {/* Star: set as default */}
                            {isSelected && (
                              <button
                                onClick={() => setPrimaryModel(settings.primaryModel === model.id ? null : model.id)}
                                className="p-0.5"
                                title={settings.primaryModel === model.id ? "Remove as default (use all)" : "Set as default model"}
                              >
                                <Star
                                  size={12}
                                  className={settings.primaryModel === model.id
                                    ? "fill-gold text-gold"
                                    : "text-parchment-dark hover:text-gold transition-colors"
                                  }
                                />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!ps.enabled && provider.requiresApiKey && !ps.apiKey && (
                    <p className="font-sans text-[9px] text-muted-foreground ml-1">
                      Needs API key — configure in Settings
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-3 py-2 border-t border-parchment">
            <p className="font-sans text-[9px] text-muted-foreground">
              <Star size={9} className="inline fill-gold text-gold" /> = default model (queries use only this one).
              No star = queries run all selected models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
