import { Schema, model, Types, type HydratedDocument } from 'mongoose';

export const SOURCE_TYPES = ['pdf', 'docx', 'csv', 'txt', 'text', 'url'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_STATUSES = ['processing', 'ready', 'failed'] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export interface ISource {
  userId: Types.ObjectId;
  type: SourceType;
  status: SourceStatus;
  title: string | null;
  summary: string | null;
  originalName: string | null; // original filename, for uploaded files
  sourceUrl: string | null; // the URL, for 'url' sources
  chunkCount: number; // how many chunks were embedded
  error: string | null; // failure reason, if status === 'failed'
  createdAt: Date;
  updatedAt: Date;
}

const sourceSchema = new Schema<ISource>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: SOURCE_TYPES, required: true },
    status: { type: String, enum: SOURCE_STATUSES, default: 'processing', index: true },
    title: { type: String, default: null },
    summary: { type: String, default: null },
    originalName: { type: String, default: null },
    sourceUrl: { type: String, default: null },
    chunkCount: { type: Number, default: 0 },
    error: { type: String, default: null },
  },
  { timestamps: true },
);

export const Source = model<ISource>('Source', sourceSchema);
export type SourceDocument = HydratedDocument<ISource>;
