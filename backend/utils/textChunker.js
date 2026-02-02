/**
 * Split text into chunks
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} overlap
 * @returns {Array<{content:string, chunkIndex:number, pageNumber:number}>}
 */
export const textChunker = (text, chunkSize = 1000, overlap = 200) => {
   if (!text || text.trim().length === 0) return [];
 
   // safety
   overlap = Math.max(0, Math.min(overlap, chunkSize - 1));
 
   // -------- CLEAN TEXT --------
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
 
     // -------- VERY LARGE PARAGRAPH --------
     if (wordCount > chunkSize) {
       if (currentChunk.length > 0) {
         chunks.push({
           content: currentChunk.join("\n\n"),
           chunkIndex: chunkIndex++,
           pageNumber: 0
         });
         currentChunk = [];
         currentWordCount = 0;
       }
 
       for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
         chunks.push({
           content: words.slice(i, i + chunkSize).join(" "),
           chunkIndex: chunkIndex++,
           pageNumber: 0
         });
 
         if (i + chunkSize >= words.length) break;
       }
       continue;
     }
 
     // -------- NORMAL PARAGRAPH --------
     if (currentWordCount + wordCount > chunkSize && currentChunk.length > 0) {
       chunks.push({
         content: currentChunk.join("\n\n"),
         chunkIndex: chunkIndex++,
         pageNumber: 0
       });
 
       const prevWords = currentChunk.join(" ").split(/\s+/);
       const overlapWords = prevWords.slice(
         -Math.min(overlap, prevWords.length)
       );
 
       currentChunk = [overlapWords.join(" "), paragraph];
       currentWordCount = overlapWords.length + wordCount;
     } else {
       currentChunk.push(paragraph);
       currentWordCount += wordCount;
     }
   }
 
   // -------- LAST CHUNK --------
   if (currentChunk.length > 0) {
     chunks.push({
       content: currentChunk.join("\n\n"),
       chunkIndex: chunkIndex++,
       pageNumber: 0
     });
   }
 
   return chunks;
 };
/**
 * Escape regex special characters
 */
const escapeRegExp = (str) =>
   str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
 /**
  * Find relevant chunks for a query
  * @param {Array<Object>} chunks
  * @param {string} query
  * @param {number} maxChunks
  * @returns {Array<Object>}
  */
 export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
   if (!chunks || chunks.length === 0) return [];
 
   const stopWords = new Set([
     "the", "is", "at", "which", "on", "a", "an",
     "and", "or", "to", "of"
   ]);
 
   const queryWords = query
     .toLowerCase()
     .split(/\s+/)
     .filter(w => w.length > 2 && !stopWords.has(w));
 
   // fallback
   if (queryWords.length === 0) {
     return chunks.slice(0, maxChunks);
   }
 
   const scoredChunks = chunks.map((chunk, index) => {
     const text = chunk.content.toLowerCase();
     const words = text.split(/\s+/);
 
     let score = 0;
     let matchedWords = 0;
 
     for (const rawWord of queryWords) {
       const word = escapeRegExp(rawWord);
 
       const exactMatches =
         (text.match(new RegExp(`\\b${word}\\b`, "gi")) || []).length;
 
       if (exactMatches > 0) matchedWords++;
 
       score += exactMatches * 3;
 
       const partialMatches =
         (text.match(new RegExp(word, "gi")) || []).length;
 
       score += Math.max(0, partialMatches - exactMatches) * 1.5;
     }
 
     if (matchedWords > 1) score += matchedWords * 2;
 
     const normalizedScore = score / Math.sqrt(words.length);
     const positionBonus = 1 - (index / chunks.length) * 0.1;
 
     return {
       ...chunk,
       score: normalizedScore * positionBonus,
       rawScore: score,
       matchWords: matchedWords
     };
   });
 
   return scoredChunks
     .filter(c => c.score > 0)
     .sort((a, b) => {
       if (b.score !== a.score) return b.score - a.score;
       if (b.matchWords !== a.matchWords) return b.matchWords - a.matchWords;
       return a.chunkIndex - b.chunkIndex;
     })
     .slice(0, maxChunks);
 };
  