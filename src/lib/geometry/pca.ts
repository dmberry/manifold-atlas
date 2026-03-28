/**
 * Simple PCA for projecting high-dimensional vectors to 2D.
 * Uses power iteration to find the top 2 principal components.
 */

function mean(vectors: number[][]): number[] {
  const d = vectors[0].length;
  const m = new Array(d).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < d; i++) m[i] += v[i];
  }
  for (let i = 0; i < d; i++) m[i] /= vectors.length;
  return m;
}

function subtract(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - b[i]);
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function scale(v: number[], s: number): number[] {
  return v.map(x => x * s);
}

/** Find dominant eigenvector of X^T X via power iteration */
function powerIteration(centered: number[][], iterations = 100): number[] {
  const d = centered[0].length;
  let vec = Array.from({ length: d }, () => Math.random() - 0.5);

  for (let iter = 0; iter < iterations; iter++) {
    // Multiply: X^T (X v)
    const xv = centered.map(row => dot(row, vec));
    const result = new Array(d).fill(0);
    for (let i = 0; i < centered.length; i++) {
      for (let j = 0; j < d; j++) {
        result[j] += centered[i][j] * xv[i];
      }
    }
    const n = norm(result);
    if (n === 0) break;
    vec = scale(result, 1 / n);
  }

  return vec;
}

/** Deflate: remove the component along a direction */
function deflate(centered: number[][], direction: number[]): number[][] {
  return centered.map(row => {
    const proj = dot(row, direction);
    return subtract(row, scale(direction, proj));
  });
}

/**
 * Project vectors to 2D using PCA (top 2 principal components).
 * Returns array of [x, y] coordinates.
 */
export function projectPCA(vectors: number[][]): [number, number][] {
  if (vectors.length < 2) {
    return vectors.map(() => [0, 0]);
  }

  const m = mean(vectors);
  let centered = vectors.map(v => subtract(v, m));

  const pc1 = powerIteration(centered);
  const x = centered.map(row => dot(row, pc1));

  centered = deflate(centered, pc1);
  const pc2 = powerIteration(centered);
  const y = centered.map(row => dot(row, pc2));

  return vectors.map((_, i) => [x[i], y[i]]);
}

/**
 * Project vectors to 3D using PCA (top 3 principal components).
 * Returns array of [x, y, z] coordinates.
 */
export function projectPCA3D(vectors: number[][]): [number, number, number][] {
  if (vectors.length < 3) {
    return vectors.map(() => [0, 0, 0]);
  }

  const m = mean(vectors);
  let centered = vectors.map(v => subtract(v, m));

  const pc1 = powerIteration(centered);
  const x = centered.map(row => dot(row, pc1));

  centered = deflate(centered, pc1);
  const pc2 = powerIteration(centered);
  const y = centered.map(row => dot(row, pc2));

  centered = deflate(centered, pc2);
  const pc3 = powerIteration(centered);
  const z = centered.map(row => dot(row, pc3));

  return vectors.map((_, i) => [x[i], y[i], z[i]]);
}
