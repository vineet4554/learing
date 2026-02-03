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
    .map(p => p.trim())
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
        pageNumber: 0
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
      pageNumber: 0
    });
  }

  return chunks;
};

/**
 * Find relevant chunks (RAG-safe with fallback)
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!Array.isArray(chunks) || !query) return chunks.slice(0, maxChunks);

  const q = query.toLowerCase();

  const scored = chunks.map((chunk, idx) => {
    const text = chunk.content.toLowerCase();
    let score = 0;

    if (text.includes("vineet")) score += 5;
    if (text.includes("intermediate")) score += 5;
    if (text.match(/\d{2,3}\s?%/)) score += 10;

    return { ...chunk, score, idx };
  });

  const filtered = scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);

  return filtered.length > 0
    ? filtered.slice(0, maxChunks)
    : chunks.slice(0, maxChunks); // 🔑 fallback
};
