declare module "plotly.js" {
  const Plotly: any;
  export = Plotly;
  export type Data = any;
  export type Layout = any;
  export type Config = any;
  export type Frame = any;
}

declare module "react-plotly.js" {
  import { Component } from "react";
  import Plotly from "plotly.js";

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Plotly.Frame[];
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    onInitialized?: (figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: { data: Plotly.Data[]; layout: Partial<Plotly.Layout> }, graphDiv: HTMLElement) => void;
    [key: string]: unknown;
  }

  class Plot extends Component<PlotParams> {}
  export default Plot;
}

declare module "plotly.js-basic-dist-min" {
  import Plotly from "plotly.js";
  export = Plotly;
}

declare module "plotly.js-gl3d-dist-min" {
  import Plotly from "plotly.js";
  export = Plotly;
}
