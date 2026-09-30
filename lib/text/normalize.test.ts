import { describe, expect, it } from "vitest";

import {
  isPublicSlug,
  normalizeSearchText,
  slugify,
} from "@/lib/text/normalize";

describe("normalizeSearchText", () => {
  it.each([
    ["Mačka", "macka"],
    ["Niš", "nis"],
    ["Čačak", "cacak"],
    ["Ćuprija", "cuprija"],
    ["Žabalj", "zabalj"],
    ["Šabac", "sabac"],
    ["Aranđelovac", "arandjelovac"],
    ["ĐURĐEVO", "djurdjevo"],
    ["  Novi   Sad ", "novi sad"],
    ["Sremska-Mitrovica", "sremska mitrovica"],
    ["žako!", "zako"],
    ["", ""],
  ])("normalizes %j to %j", (input, expected) => {
    expect(normalizeSearchText(input)).toBe(expected);
  });

  it("keeps already normalized ASCII input unchanged", () => {
    expect(normalizeSearchText("arandjelovac")).toBe("arandjelovac");
  });
});

describe("slugify", () => {
  it.each([
    ["Farmske životinje", "farmske-zivotinje"],
    ["Aranđelovac", "arandjelovac"],
    ["Nemački ovčar", "nemacki-ovcar"],
    ["Primer oglasa — zlatni retriver", "primer-oglasa-zlatni-retriver"],
    ["  --Novi Sad--  ", "novi-sad"],
  ])("slugifies %j to %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("always produces a valid public slug for non-empty Latin input", () => {
    for (const value of ["Mačke", "Činčila", "Škotski fold", "Đakovo 2"]) {
      expect(isPublicSlug(slugify(value))).toBe(true);
    }
  });
});

describe("isPublicSlug", () => {
  it.each(["pas", "novi-sad", "sibirski-haski", "a1-b2"])(
    "accepts %j",
    (value) => {
      expect(isPublicSlug(value)).toBe(true);
    },
  );

  it.each([
    "",
    "mačka",
    "Novi-Sad",
    "novi sad",
    "-pas",
    "pas-",
    "novi--sad",
    "đurđevo",
    "pas_1",
  ])("rejects %j", (value) => {
    expect(isPublicSlug(value)).toBe(false);
  });
});
