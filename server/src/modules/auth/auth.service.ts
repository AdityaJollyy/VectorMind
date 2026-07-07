import { User, type UserDocument } from '../../models/user.model';
import { ApiError } from '../../utils/ApiError';
import type { RegisterInput, LoginInput } from './auth.schema';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

function toPublicUser(user: UserDocument): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  );
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.badRequest('An account with this email already exists');
  }

  try {
    const user = await User.create(input); // password is hashed by the pre-save hook
    return toPublicUser(user);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw ApiError.badRequest('An account with this email already exists');
    }
    throw err;
  }
}

export async function loginUser(input: LoginInput): Promise<PublicUser> {
  // password has select:false, so request it explicitly
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await user.comparePassword(input.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return toPublicUser(user);
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return toPublicUser(user);
}
