/**
 * Cohere Embeddings API provider.
 * https://docs.cohere.com/reference/embed
 */

export async function embedCohere(
  texts: string[],
  model: string,
  apiKey: string
): Promise<number[][]> {
  const response = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      texts,
      model,
      input_type: "search_document",
      embedding_types: ["float"],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Cohere API error (${response.status}): ${error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.embeddings.float;
}
