import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Database URL is not defined');
}

export const db = drizzle(databaseUrl);
