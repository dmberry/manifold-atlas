/**
 * OpenAI Embeddings API provider.
 * https://platform.openai.com/docs/guides/embeddings
 */

export async function embedOpenAI(
  texts: string[],
  model: string,
  apiKey: string
): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
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
      `OpenAI API error (${response.status}): ${error?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  // Sort by index to ensure correct ordering
  const sorted = data.data.sort(
    (a: { index: number }, b: { index: number }) => a.index - b.index
  );
  return sorted.map((item: { embedding: number[] }) => item.embedding);
}
