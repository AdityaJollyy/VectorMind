import { Schema, model, Types, type HydratedDocument } from 'mongoose';

export const MESSAGE_ROLES = ['user', 'assistant'] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export interface IMessage {
  userId: Types.ObjectId;
  sourceId: Types.ObjectId;
  role: MessageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
    role: { type: String, enum: MESSAGE_ROLES, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

// Primary access pattern: all messages for one user's source, in chronological order.
messageSchema.index({ userId: 1, sourceId: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', messageSchema);
export type MessageDocument = HydratedDocument<IMessage>;
