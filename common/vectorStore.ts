/** A single vector. */
export interface PineconeVector {
  /** URI that references the content */
  id: string;
  /** Embedded vector of the content */
  values?: number[];
  metadata?: any;
}

export async function saveVecs(vectors: PineconeVector[]) {
  const upsert = { vectors };
  const resp = await fetch(`${process.env.PINECONE_BASE_URL}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": process.env.PINECONE_KEY!,
    },
    body: JSON.stringify(upsert),
  }).catch((err) => console.log("error: ", err));
}

export async function loadVecs(ids: string[]): Promise<PineconeVector[]> {
  const query = ids.map((id) => "ids=" + encodeURIComponent(id)).join("&");
  const url = `${process.env.PINECONE_BASE_URL}/vectors/fetch?${query}`;
  console.log(url);
  console.log(`Fetching ${ids.length} vectors...`);
  const storedEmbeddingResp = await fetch(url, {
    method: "GET",
    headers: { "Api-Key": process.env.PINECONE_KEY! },
  });
  if (!storedEmbeddingResp.ok) {
    console.error("Error fetching vectors", storedEmbeddingResp);
    console.error("Response text", await storedEmbeddingResp.text());
    return [];
  }
  const storedEmbedding = (await storedEmbeddingResp.json()) as {
    vectors: Record<string, PineconeVector>;
  };
  return ids.map((id) => storedEmbedding.vectors[id]);
}

/** A list of vectors from querying the vector DB. */
export interface PineconeResponse {
  matches: (PineconeVector & { score: number })[];
  namespace: string;
}

/** Finds the closest vectors to a given vector. */
export async function findClosestK(
  vector: number[],
  k: number
): Promise<(PineconeVector & { score: number })[]> {
  const closestVectors: PineconeResponse = await fetch(
    `${process.env.PINECONE_BASE_URL}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PINECONE_KEY!,
      },
      body: JSON.stringify({
        vector,
        topK: k,
        includeValues: false,
        includeMetadata: true,
      }),
    }
  ).then((response) => response.json());
  if (closestVectors.matches == null) {
    console.error("Bad query response", closestVectors);
    return [];
  }
  return closestVectors.matches;
}
