import { existsSync } from "node:fs";
import path from "node:path";

// Standalone scripts (seed, drizzle-kit) do not get Next's env loading, so
// mirror its precedence: shell > .env.local > .env.
export function loadLocalEnv(directory = process.cwd()) {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(directory, file);
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
}
