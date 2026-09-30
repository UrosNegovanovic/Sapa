import { describe, expect, it } from "vitest";

import {
  buildSearchHref,
  searchParamsSchema,
} from "@/features/search/search-schema";

describe("searchParamsSchema", () => {
  it("normalizes an allowed marketplace search", () => {
    expect(
      searchParamsSchema.parse({
        kind: "pets",
        vrsta: " pas ",
        rasa: "",
        grad: " Beograd ",
      }),
    ).toEqual({ kind: "pets", vrsta: "pas", rasa: "", grad: "Beograd" });
  });

  it("rejects unsupported search kinds", () => {
    expect(() => searchParamsSchema.parse({ kind: "payments" })).toThrow();
  });
});

describe("buildSearchHref", () => {
  it("keeps the required search parameter names and omits the internal tab kind", () => {
    expect(
      buildSearchHref({
        kind: "pets",
        vrsta: "pas",
        rasa: "zlatni retriver",
        grad: "Niš",
      }),
    ).toBe("/pretraga?vrsta=pas&rasa=zlatni+retriver&grad=Ni%C5%A1");
  });
});
