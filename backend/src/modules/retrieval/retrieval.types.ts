/**
 * Retrieval contracts for grounding Rit and explainability flows.
 * TODO: Add embedding model metadata, citation types, and relevance scoring details.
 */
export interface RetrievalDocument {
  id: string;
  source: string;
  title: string;
  content: string;
  localityId?: string;
}

export interface RetrievalResult {
  documentId: string;
  score: number;
  excerpt: string;
}
