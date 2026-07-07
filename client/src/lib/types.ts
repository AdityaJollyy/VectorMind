export interface User {
  id: string;
  name: string;
  email: string;
}

export type SourceType = "pdf" | "docx" | "csv" | "txt" | "text" | "url";
export type SourceStatus = "processing" | "ready" | "failed";

export interface Source {
  id: string;
  type: SourceType;
  status: SourceStatus;
  title: string | null;
  summary: string | null;
  originalName: string | null;
  sourceUrl: string | null;
  chunkCount: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/** The shape every backend response follows. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
