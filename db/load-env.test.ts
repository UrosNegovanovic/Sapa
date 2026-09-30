// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadLocalEnv } from "@/db/load-env";

const keys = ["SAPA_TEST_A", "SAPA_TEST_B", "SAPA_TEST_C"] as const;

describe("loadLocalEnv", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "sapa-env-"));
    for (const key of keys) delete process.env[key];
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
    for (const key of keys) delete process.env[key];
  });

  it("reads .env.local, the file the README tells developers to create", () => {
    writeFileSync(path.join(directory, ".env.local"), "SAPA_TEST_A=local\n");

    loadLocalEnv(directory);

    expect(process.env.SAPA_TEST_A).toBe("local");
  });

  it("prefers .env.local over .env, like next dev", () => {
    writeFileSync(path.join(directory, ".env.local"), "SAPA_TEST_A=local\n");
    writeFileSync(
      path.join(directory, ".env"),
      "SAPA_TEST_A=shared\nSAPA_TEST_B=shared\n",
    );

    loadLocalEnv(directory);

    expect(process.env.SAPA_TEST_A).toBe("local");
    expect(process.env.SAPA_TEST_B).toBe("shared");
  });

  it("never overrides variables already set in the environment", () => {
    process.env.SAPA_TEST_C = "from-shell";
    writeFileSync(path.join(directory, ".env.local"), "SAPA_TEST_C=local\n");

    loadLocalEnv(directory);

    expect(process.env.SAPA_TEST_C).toBe("from-shell");
  });

  it("does nothing when no env file exists", () => {
    expect(() => loadLocalEnv(directory)).not.toThrow();
    expect(process.env.SAPA_TEST_A).toBeUndefined();
  });
});
