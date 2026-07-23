type Environment = Readonly<Record<string, string | undefined>>;

export type ApiConfig = Readonly<{
  databaseUrl: string;
  port: number;
  webOrigins: string[];
}>;

export const readDatabaseUrl = (
  environment: Environment = process.env,
): string => {
  const databaseUrl = environment.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Copy .env.example to .env and add your Neon connection string.',
    );
  }

  return databaseUrl;
};

const readPort = (environment: Environment): number => {
  const value = environment.PORT ?? '4000';
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
};

const readWebOrigins = (environment: Environment): string[] => {
  const origins = (environment.WEB_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('WEB_ORIGINS must contain at least one browser origin.');
  }

  return origins;
};

export const readApiConfig = (
  environment: Environment = process.env,
): ApiConfig => ({
  databaseUrl: readDatabaseUrl(environment),
  port: readPort(environment),
  webOrigins: readWebOrigins(environment),
});
