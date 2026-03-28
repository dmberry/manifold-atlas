/**
 * Voyage AI Embeddings API provider (Anthropic's recommended embedding partner).
 * https://docs.voyageai.com/reference/embeddings-api
 */

export async function embedVoyage(
  texts: string[],
  model: string,
  apiKey: string
): Promise<number[][]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: texts,
      model,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Voyage AI API error (${response.status}): ${error?.detail || response.statusText}`
    );
  }

  const data = await response.json();
  const sorted = data.data.sort(
    (a: { index: number }, b: { index: number }) => a.index - b.index
  );
  return sorted.map((item: { embedding: number[] }) => item.embedding);
}
