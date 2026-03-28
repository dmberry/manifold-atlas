/**
 * UMAP wrapper for browser-side dimensionality reduction.
 * Falls back to PCA if UMAP fails or input is too small.
 */

import { UMAP } from "umap-js";
import { projectPCA } from "./pca";

export interface UMAPOptions {
  nNeighbors?: number;
  minDist?: number;
  nComponents?: number;
}

/**
 * Project vectors to 2D using UMAP.
 * Requires at least ~15 points for meaningful results.
 * Falls back to PCA for small datasets.
 */
export function projectUMAP(
  vectors: number[][],
  options: UMAPOptions = {}
): [number, number][] {
  const { nNeighbors = 15, minDist = 0.1, nComponents = 2 } = options;

  if (vectors.length < Math.max(nNeighbors, 5)) {
    return projectPCA(vectors);
  }

  const effectiveNeighbors = Math.min(nNeighbors, vectors.length - 1);

  const umap = new UMAP({
    nNeighbors: effectiveNeighbors,
    minDist,
    nComponents,
  });

  const embedding = umap.fit(vectors);
  return embedding.map(row => [row[0], row[1]]);
}

/**
 * Project vectors to 3D using UMAP.
 */
export function projectUMAP3D(
  vectors: number[][],
  options: UMAPOptions = {}
): [number, number, number][] {
  const { nNeighbors = 15, minDist = 0.1 } = options;

  if (vectors.length < Math.max(nNeighbors, 5)) {
    const { projectPCA3D } = require("./pca");
    return projectPCA3D(vectors);
  }

  const effectiveNeighbors = Math.min(nNeighbors, vectors.length - 1);

  const umap = new UMAP({
    nNeighbors: effectiveNeighbors,
    minDist,
    nComponents: 3,
  });

  const embedding = umap.fit(vectors);
  return embedding.map(row => [row[0], row[1], row[2]]);
}
