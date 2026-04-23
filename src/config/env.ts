import type { StringValue } from 'ms';

export const ENV_KEYS = {
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  CORS_ORIGIN: 'CORS_ORIGIN',
  NODE_ENV: 'NODE_ENV',
} as const;

export const DEFAULT_PORT = 4000;
export const DEFAULT_JWT_EXPIRES_IN = '1d';
export const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';
export const DEFAULT_NODE_ENV = 'development';

export type JwtExpiresIn = number | StringValue;

export interface AppEnvironment {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: JwtExpiresIn;
  CORS_ORIGIN: string;
  NODE_ENV: string;
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readPort(value: unknown): number {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 65535
  ) {
    return value;
  }

  const parsed = readString(value);
  if (!parsed) {
    return DEFAULT_PORT;
  }

  const port = Number(parsed);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${ENV_KEYS.PORT} must be a valid TCP port`);
  }

  return port;
}

function readJwtExpiresIn(value: unknown): JwtExpiresIn {
  const parsed = readString(value);
  if (!parsed) {
    return DEFAULT_JWT_EXPIRES_IN;
  }

  return /^\d+$/.test(parsed) ? Number(parsed) : (parsed as StringValue);
}

function readRequiredString(value: unknown, key: string): string {
  const parsed = readString(value);
  if (!parsed) {
    throw new Error(`${key} is required`);
  }

  return parsed;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): AppEnvironment {
  return {
    PORT: readPort(config[ENV_KEYS.PORT]),
    DATABASE_URL: readRequiredString(
      config[ENV_KEYS.DATABASE_URL],
      ENV_KEYS.DATABASE_URL,
    ),
    JWT_SECRET: readRequiredString(
      config[ENV_KEYS.JWT_SECRET],
      ENV_KEYS.JWT_SECRET,
    ),
    JWT_EXPIRES_IN: readJwtExpiresIn(config[ENV_KEYS.JWT_EXPIRES_IN]),
    CORS_ORIGIN:
      readString(config[ENV_KEYS.CORS_ORIGIN]) ?? DEFAULT_CORS_ORIGIN,
    NODE_ENV: readString(config[ENV_KEYS.NODE_ENV]) ?? DEFAULT_NODE_ENV,
  };
}
