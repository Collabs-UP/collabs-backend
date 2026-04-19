import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_NODE_ENV,
  DEFAULT_PORT,
  validateEnvironment,
} from './env';

describe('validateEnvironment', () => {
  it('normaliza la configuración y aplica valores por defecto', () => {
    const environment = validateEnvironment({
      DATABASE_URL:
        'postgresql://postgres:postgres@railway.internal:5432/collabs?schema=public',
      JWT_SECRET: 'super-secret',
    });

    expect(environment).toEqual({
      PORT: DEFAULT_PORT,
      DATABASE_URL:
        'postgresql://postgres:postgres@railway.internal:5432/collabs?schema=public',
      JWT_SECRET: 'super-secret',
      JWT_EXPIRES_IN: DEFAULT_JWT_EXPIRES_IN,
      CORS_ORIGIN: DEFAULT_CORS_ORIGIN,
      NODE_ENV: DEFAULT_NODE_ENV,
    });
  });

  it('convierte expiraciones numéricas a number', () => {
    const environment = validateEnvironment({
      DATABASE_URL:
        'postgresql://postgres:postgres@railway.internal:5432/collabs?schema=public',
      JWT_SECRET: 'super-secret',
      JWT_EXPIRES_IN: '3600',
    });

    expect(environment.JWT_EXPIRES_IN).toBe(3600);
  });

  it('falla si falta DATABASE_URL', () => {
    expect(() =>
      validateEnvironment({
        JWT_SECRET: 'super-secret',
      }),
    ).toThrow('DATABASE_URL is required');
  });

  it('falla si falta JWT_SECRET', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL:
          'postgresql://postgres:postgres@railway.internal:5432/collabs?schema=public',
      }),
    ).toThrow('JWT_SECRET is required');
  });
});
