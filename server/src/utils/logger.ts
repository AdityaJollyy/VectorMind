import pino from 'pino';
import { env, isProd, isTest } from '../config/env';

export const logger = pino({
  level: isTest ? 'silent' : 'info',
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
  base: { env: env.NODE_ENV },
});
