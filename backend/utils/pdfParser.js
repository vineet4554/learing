import fs from "fs/promises";

export const extractTextFromPDF = async (filePath) => {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const buffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(buffer);
    
    const loadingTask = pdfjsLib.getDocument(uint8Array);
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    const numPages = pdf.numPages;
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
    
    return {
      text: fullText.trim(),
      numPages: numPages
    };
  } catch (err) {
    console.error("PDF parse error:", err);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
};