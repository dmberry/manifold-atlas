"use client";

/**
 * Modal for adding a user-defined protocol to the Library.
 *
 * Takes markdown (pasted directly or uploaded as a file), parses and
 * validates it, persists via saveCustomProtocol. Shows any parse /
 * validation error inline; on success closes and notifies the caller.
 */

import { useRef, useState } from "react";
import { X, Upload, Plus } from "lucide-react";
import {
  saveCustomProtocol,
  CustomProtocolError,
  CUSTOM_PROTOCOL_EXAMPLE,
  type CustomProtocol,
} from "@/lib/protocols/custom";

interface AddProtocolModalProps {
  open: boolean;
  onClose: () => void;
  /** Ids that already exist (built-in + other custom) for collision detection. */
  existingIds: string[];
  onAdded: (protocol: CustomProtocol) => void;
}

export function AddProtocolModal({ open, onClose, existingIds, onAdded }: AddProtocolModalProps) {
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const handleSave = () => {
    try {
      const protocol = saveCustomProtocol(markdown, existingIds);
      setMarkdown("");
      setError(null);
      onAdded(protocol);
      onClose();
    } catch (err) {
      if (err instanceof CustomProtocolError) setError(err.message);
      else setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleFileChosen = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setMarkdown(text);
    setError(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[680px] max-w-[calc(100vw-2rem)] card-editorial shadow-editorial-lg flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        <div className="px-6 pt-6 pb-4 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-display text-display-md font-bold">Add a protocol</h2>
            <p className="font-sans text-caption text-muted-foreground mt-0.5">
              Paste your own protocol markdown, or upload a .md file. Added
              protocols are saved to this browser and appear in the Library.
            </p>
          </div>
          <button onClick={onClose} className="btn-editorial-ghost px-2 py-1">
            <X size={16} />
          </button>
        </div>

        <div className="thin-rule mx-6" />

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              className="hidden"
              onChange={e => handleFileChosen(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-editorial-ghost flex items-center gap-1"
            >
              <Upload size={14} />
              Upload .md file
            </button>
            <button
              onClick={() => setMarkdown(CUSTOM_PROTOCOL_EXAMPLE)}
              className="btn-editorial-ghost text-caption"
            >
              Load example
            </button>
          </div>

          <label className="block font-sans text-caption text-muted-foreground uppercase tracking-wider font-semibold">
            Protocol markdown
          </label>
          <textarea
            value={markdown}
            onChange={e => {
              setMarkdown(e.target.value);
              if (error) setError(null);
            }}
            rows={18}
            placeholder={CUSTOM_PROTOCOL_EXAMPLE}
            className="input-editorial text-body-sm w-full resize-y font-mono"
          />

          {error && (
            <div className="card-editorial border-error-500 border p-3">
              <p className="font-sans text-caption text-error-700">{error}</p>
            </div>
          )}

          <details className="font-sans text-caption text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Format reference</summary>
            <div className="mt-2 space-y-1">
              <p>
                Front matter (between <code>---</code> fences) must include:{" "}
                <code>id</code>, <code>title</code>, <code>description</code>, and{" "}
                <code>category</code> (one of: <code>workshop</code>, <code>research</code>, <code>demo</code>).
              </p>
              <p>
                Body: numbered steps, one per operation. Each step starts with
                <code> 1. &lt;operation-id&gt;</code> at column zero. Indented
                lines (3 spaces) below it are the step's inputs as{" "}
                <code>key: value</code> pairs or YAML-ish lists.
              </p>
              <p>
                Supported operations: <code>distance</code>, <code>analogy</code>,{" "}
                <code>negation</code>, <code>sectioning</code>, <code>battery</code>,{" "}
                <code>agonism</code>.
              </p>
            </div>
          </details>
        </div>

        <div className="thin-rule mx-6" />

        <div className="px-6 py-4 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={markdown.trim().length === 0}
            className="btn-editorial-primary flex items-center gap-1 disabled:opacity-50"
          >
            <Plus size={14} />
            Add to Library
          </button>
          <button onClick={onClose} className="btn-editorial-ghost">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
