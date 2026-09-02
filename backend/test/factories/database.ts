import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../src/generated/prisma/client.js';

export interface TestDatabase {
  prisma: PrismaClient;
  destroy: () => Promise<void>;
}

export interface ProvisionedDatabase {
  cleanup: () => void;
  url: string;
}

/**
 * Applies the versioned migrations to a throwaway SQLite file so database tests
 * observe the same constraints the delivery ships, never a shared dev database.
 */
export function provisionDatabase(): ProvisionedDatabase {
  const directory = mkdtempSync(join(tmpdir(), 'financy-test-'));
  const url = `file:${join(directory, 'test.db')}`;
  // Resolved from this file so the spawn does not depend on the working
  // directory Vitest happens to inherit.
  const backendRoot = fileURLToPath(new URL('../..', import.meta.url));

  try {
    execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
      cwd: backendRoot,
      env: { ...process.env, DATABASE_URL: url },
      // `pnpm` resolves to a .CMD shim on Windows, which execFile cannot spawn directly.
      shell: process.platform === 'win32',
      stdio: 'pipe',
    });
  } catch (error) {
    rmSync(directory, { force: true, recursive: true });
    const details = (error as { stderr?: Buffer }).stderr?.toString() ?? '';
    throw new Error(`Failed to apply migrations to the test database.\n${details}`);
  }

  return { cleanup: () => rmSync(directory, { force: true, recursive: true }), url };
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const { cleanup, url } = provisionDatabase();
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
  await prisma.$connect();

  return {
    prisma,
    destroy: async () => {
      await prisma.$disconnect();
      cleanup();
    },
  };
}

export async function truncateAll(prisma: PrismaClient): Promise<void> {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}
