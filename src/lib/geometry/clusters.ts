/**
 * Simple k-means clustering for identifying sub-manifold regions.
 * Operates on the original high-dimensional vectors, not projections.
 */

import { cosineSimilarity } from "./cosine";

interface Cluster {
  id: number;
  centroidIdx: number;
  members: number[];
}

/**
 * Assign points to k clusters using k-means with cosine distance.
 * Returns cluster assignment for each point index.
 */
export function kMeansCosine(vectors: number[][], k: number, maxIter = 20): number[] {
  const n = vectors.length;
  if (n <= k) return vectors.map((_, i) => i);

  // Initialize centroids using k-means++ style (pick spread-out points)
  const centroids: number[][] = [];
  centroids.push(vectors[Math.floor(Math.random() * n)]);

  for (let c = 1; c < k; c++) {
    const dists = vectors.map(v => {
      const minSim = Math.max(...centroids.map(cent => cosineSimilarity(v, cent)));
      return 1 - minSim;
    });
    const total = dists.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < n; i++) {
      r -= dists[i];
      if (r <= 0) { idx = i; break; }
    }
    centroids.push(vectors[idx]);
  }

  // Iterate
  let assignments = new Array(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    // Assign
    const newAssignments = vectors.map(v => {
      let bestK = 0;
      let bestSim = -Infinity;
      for (let c = 0; c < k; c++) {
        const sim = cosineSimilarity(v, centroids[c]);
        if (sim > bestSim) { bestSim = sim; bestK = c; }
      }
      return bestK;
    });

    // Check convergence
    if (newAssignments.every((a, i) => a === assignments[i])) break;
    assignments = newAssignments;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const members = vectors.filter((_, i) => assignments[i] === c);
      if (members.length === 0) continue;
      const dim = vectors[0].length;
      const mean = new Array(dim).fill(0);
      for (const m of members) {
        for (let d = 0; d < dim; d++) mean[d] += m[d];
      }
      for (let d = 0; d < dim; d++) mean[d] /= members.length;
      centroids[c] = mean;
    }
  }

  return assignments;
}

/**
 * Auto-detect number of clusters using silhouette-like heuristic.
 * Tries k=2,3,4 and picks the best.
 */
export function autoClusters(vectors: number[][], maxK = 4): number[] {
  if (vectors.length <= 3) return vectors.map(() => 0);

  const effectiveMaxK = Math.min(maxK, Math.floor(vectors.length / 2));
  if (effectiveMaxK < 2) return vectors.map(() => 0);

  let bestAssignments = vectors.map(() => 0);
  let bestScore = -Infinity;

  for (let k = 2; k <= effectiveMaxK; k++) {
    const assignments = kMeansCosine(vectors, k);

    // Compute simple separation score: avg inter-cluster distance - avg intra-cluster distance
    let intra = 0, intraCount = 0;
    let inter = 0, interCount = 0;

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const dist = 1 - cosineSimilarity(vectors[i], vectors[j]);
        if (assignments[i] === assignments[j]) {
          intra += dist; intraCount++;
        } else {
          inter += dist; interCount++;
        }
      }
    }

    const avgIntra = intraCount > 0 ? intra / intraCount : 0;
    const avgInter = interCount > 0 ? inter / interCount : 0;
    const score = avgInter - avgIntra;

    if (score > bestScore) {
      bestScore = score;
      bestAssignments = assignments;
    }
  }

  return bestAssignments;
}

/**
 * Find edges between points that are above a similarity threshold.
 * Returns pairs of indices.
 */
export function proximityEdges(
  vectors: number[][],
  threshold = 0.7,
  maxEdges = 200
): [number, number][] {
  const edges: Array<{ i: number; j: number; sim: number }> = [];

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const sim = cosineSimilarity(vectors[i], vectors[j]);
      if (sim >= threshold) {
        edges.push({ i, j, sim });
      }
    }
  }

  // Sort by similarity descending, take top maxEdges
  edges.sort((a, b) => b.sim - a.sim);
  return edges.slice(0, maxEdges).map(e => [e.i, e.j]);
}
