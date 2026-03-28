"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

let plotlyPromise: Promise<any> | null = null;
function getPlotly(): Promise<any> {
  if (!plotlyPromise) {
    plotlyPromise = import("plotly.js-gl3d-dist-min");
  }
  return plotlyPromise;
}

interface PlotlyPlotProps {
  data: any[];
  layout?: Record<string, any>;
  config?: Record<string, any>;
  style?: React.CSSProperties;
}

export interface PlotlyPlotHandle {
  getDiv: () => HTMLDivElement | null;
  getPlotly: () => any;
}

export const PlotlyPlot = forwardRef<PlotlyPlotHandle, PlotlyPlotProps>(
  function PlotlyPlot({ data, layout, config, style }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const plotlyRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getDiv: () => containerRef.current,
      getPlotly: () => plotlyRef.current,
    }));

    useEffect(() => {
      let mounted = true;

      getPlotly().then(Plotly => {
        if (!mounted || !containerRef.current) return;
        plotlyRef.current = Plotly;
        Plotly.newPlot(containerRef.current, data, layout, config);
      });

      return () => {
        mounted = false;
        if (containerRef.current && plotlyRef.current) {
          plotlyRef.current.purge(containerRef.current);
        }
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!containerRef.current || !plotlyRef.current) return;
      plotlyRef.current.react(containerRef.current, data, layout, config);
    }, [data, layout, config]);

    return <div ref={containerRef} style={style} />;
  }
);
