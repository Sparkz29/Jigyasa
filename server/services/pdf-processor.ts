import pdf from 'pdf-parse';

export interface DocumentChunk {
  content: string;
  metadata: {
    page?: number;
    chunkIndex: number;
  };
}

export class PDFProcessor {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;
    
    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    for (let i = 0; i < cleanText.length; i += chunkSize - overlap) {
      const chunk = cleanText.slice(i, i + chunkSize);
      
      if (chunk.trim().length > 0) {
        chunks.push({
          content: chunk.trim(),
          metadata: {
            chunkIndex: chunkIndex++,
          },
        });
      }
    }
    
    return chunks;
  }
}

export const pdfProcessor = new PDFProcessor();
