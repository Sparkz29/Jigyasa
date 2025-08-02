import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here",
});

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: any;
}

export class VectorStore {
  private documents: Map<string, VectorDocument[]> = new Map();

  async addDocuments(documentId: string, chunks: Array<{ content: string; metadata: any }>): Promise<void> {
    const vectorDocs: VectorDocument[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateEmbedding(chunk.content);
      
      vectorDocs.push({
        id: `${documentId}_${i}`,
        content: chunk.content,
        embedding,
        metadata: chunk.metadata,
      });
    }
    
    this.documents.set(documentId, vectorDocs);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async similaritySearch(documentId: string, query: string, topK: number = 3): Promise<VectorDocument[]> {
    const docs = this.documents.get(documentId);
    if (!docs) {
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(query);
    
    // Calculate cosine similarity for each document
    const similarities = docs.map(doc => ({
      doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));
    
    // Sort by similarity and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.doc);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  removeDocument(documentId: string): void {
    this.documents.delete(documentId);
  }
}

export const vectorStore = new VectorStore();
