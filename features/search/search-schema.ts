import { z } from "zod";

const trimmedText = z.string().trim().max(120).default("");

export const searchParamsSchema = z.object({
  kind: z.enum(["pets", "grooming", "boarding"]).default("pets"),
  vrsta: trimmedText,
  rasa: trimmedText,
  grad: trimmedText,
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export function buildSearchHref(input: SearchParams) {
  const parsed = searchParamsSchema.parse(input);
  const params = new URLSearchParams({
    vrsta: parsed.vrsta,
    rasa: parsed.rasa,
    grad: parsed.grad,
  });
  return `/pretraga?${params.toString()}`;
}
