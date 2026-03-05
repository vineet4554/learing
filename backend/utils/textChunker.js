/**
 * Split text into chunks
 */
export const textChunker = (text, chunkSize = 1000, overlap = 200) => {
  if (!text || !text.trim()) return [];

  overlap = Math.max(0, Math.min(overlap, chunkSize - 1));

  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ ]+/g, " ")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  const paragraphs = cleanedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    const wordCount = words.length;

    if (currentWordCount + wordCount > chunkSize && currentChunk.length) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      const overlapWords = currentChunk
        .join(" ")
        .split(/\s+/)
        .slice(-overlap);

      currentChunk = [overlapWords.join(" "), paragraph];
      currentWordCount = overlapWords.length + wordCount;
    } else {
      currentChunk.push(paragraph);
      currentWordCount += wordCount;
    }
  }

  if (currentChunk.length) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  }

  return chunks;
};

/**
 * Find relevant chunks
 */
export const findRelevantChunks = (
  chunks,
  query,
  maxChunks = 3,
  fallbackToFirst = true
) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  if (!query) {
    return chunks.slice(0, maxChunks);
  }

  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2);

  const termBigrams = (term) => {
    const t = term.toLowerCase();
    if (t.length < 2) return [t];
    const grams = [];
    for (let i = 0; i < t.length - 1; i += 1) grams.push(t.slice(i, i + 2));
    return grams;
  };

  const diceSimilarity = (a, b) => {
    const aGrams = termBigrams(a);
    const bGrams = termBigrams(b);
    if (!aGrams.length || !bGrams.length) return 0;
    const bMap = new Map();
    for (const g of bGrams) bMap.set(g, (bMap.get(g) || 0) + 1);
    let overlap = 0;
    for (const g of aGrams) {
      const count = bMap.get(g) || 0;
      if (count > 0) {
        overlap += 1;
        bMap.set(g, count - 1);
      }
    }
    return (2 * overlap) / (aGrams.length + bGrams.length);
  };

  const scored = chunks.map((chunk, idx) => {
    const text = (chunk?.content || "").toLowerCase();
    const words = Array.from(
      new Set(
        text
          .replace(/[^\w\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 2)
      )
    );
    let score = 0;

    for (const term of queryTerms) {
      if (text.includes(term)) {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matches = text.match(new RegExp(`\\b${escapedTerm}\\b`, "g"));
        score += matches ? matches.length : 1;
        continue;
      }

      // typo-tolerant fallback for near matches
      const nearMatch = words.some((w) => {
        if (Math.abs(w.length - term.length) > 2) return false;
        return diceSimilarity(term, w) >= 0.7;
      });
      if (nearMatch) score += 1;
    }

    return { ...chunk, score, idx };
  });

  const filtered = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (filtered.length > 0) {
    return filtered.slice(0, maxChunks);
  }

  return fallbackToFirst ? chunks.slice(0, maxChunks) : [];
};
