import { Schema, model, Types, type HydratedDocument } from 'mongoose';

export interface IUsageLog {
  userId: Types.ObjectId;
  day: string; // 'YYYY-MM-DD' in UTC
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const usageLogSchema = new Schema<IUsageLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Exactly one counter document per user per day.
usageLogSchema.index({ userId: 1, day: 1 }, { unique: true });

// Auto-delete usage rows 40 days after creation to keep the collection small.
usageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 40 });

export const UsageLog = model<IUsageLog>('UsageLog', usageLogSchema);
export type UsageLogDocument = HydratedDocument<IUsageLog>;
