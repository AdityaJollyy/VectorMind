import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Reject query fields that aren't in the schema (prevents a whole class of silent bugs).
mongoose.set('strictQuery', true);

export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB connection error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
