// Ambient module augmentation: adds custom properties to Express's Request.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
