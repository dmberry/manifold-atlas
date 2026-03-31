"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Camera } from "lucide-react";
import type { PlotlyPlotHandle } from "./PlotlyPlot";

/**
 * Reusable control overlay for 3D Plotly plots.
 * Provides auto-rotate, pause, and PNG export buttons.
 * Pass the PlotlyPlot ref to connect.
 */
interface Plot3DControlsProps {
  plotRef: React.RefObject<PlotlyPlotHandle | null>;
  exportFilename?: string;
}

export function Plot3DControls({ plotRef, exportFilename = "manifold-atlas-3d" }: Plot3DControlsProps) {
  const [rotating, setRotating] = useState(false);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const startRotation = useCallback(() => {
    // Capture current camera position to preserve zoom level and elevation
    let r = 2.2;
    let z = 0.8;

    const handle = plotRef.current;
    if (handle) {
      const div = handle.getDiv() as any;
      if (div?._fullLayout?.scene?.camera?.eye) {
        const eye = div._fullLayout.scene.camera.eye;
        r = Math.sqrt(eye.x * eye.x + eye.y * eye.y);
        z = eye.z;
        angleRef.current = (Math.atan2(eye.y, eye.x) * 180) / Math.PI;
      }
    }

    const step = () => {
      const handle = plotRef.current;
      if (!handle) { rafRef.current = requestAnimationFrame(step); return; }
      const div = handle.getDiv();
      const Plotly = handle.getPlotly();
      if (!div || !Plotly) { rafRef.current = requestAnimationFrame(step); return; }

      angleRef.current += 0.3;
      const radians = (angleRef.current * Math.PI) / 180;

      Plotly.relayout(div, {
        "scene.camera.eye": {
          x: r * Math.cos(radians),
          y: r * Math.sin(radians),
          z,
        },
      });

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [plotRef]);

  const stopRotation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (rotating) startRotation();
    else stopRotation();
    return stopRotation;
  }, [rotating, startRotation, stopRotation]);

  const handleExport = useCallback(() => {
    const handle = plotRef.current;
    if (!handle) return;
    const div = handle.getDiv();
    const Plotly = handle.getPlotly();
    if (!div || !Plotly) return;
    Plotly.downloadImage(div, {
      format: "png",
      width: 1920,
      height: 1080,
      filename: exportFilename,
      scale: 2,
    });
  }, [plotRef, exportFilename]);

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
      <button
        onClick={() => setRotating(r => !r)}
        className="flex items-center gap-1 px-2 py-1 rounded-sm text-caption text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors bg-card/80 shadow-editorial"
        title={rotating ? "Pause rotation" : "Auto-rotate"}
      >
        {rotating ? <Pause size={13} /> : <Play size={13} />}
        <span>{rotating ? "Pause" : "Rotate"}</span>
      </button>
      <button
        onClick={handleExport}
        className="flex items-center gap-1 px-2 py-1 rounded-sm text-caption text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors bg-card/80 shadow-editorial"
        title="Export as PNG"
      >
        <Camera size={13} />
        <span>Export</span>
      </button>
    </div>
  );
}
