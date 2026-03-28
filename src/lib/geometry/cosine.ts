/**
 * Cosine similarity and distance computations for embedding vectors.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

export function cosineDistance(a: number[], b: number[]): number {
  return 1 - cosineSimilarity(a, b);
}

export function distanceMatrix(vectors: number[][]): number[][] {
  const n = vectors.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = cosineSimilarity(vectors[i], vectors[j]);
      matrix[i][j] = sim;
      matrix[j][i] = sim;
    }
    matrix[i][i] = 1;
  }
  return matrix;
}
