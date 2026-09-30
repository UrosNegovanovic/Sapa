import type { SearchParams } from "@/features/search/search-schema";

export type SearchResult = { id: string; slug: string; title: string };

export interface SearchService {
  searchListings(input: SearchParams): Promise<SearchResult[]>;
}
