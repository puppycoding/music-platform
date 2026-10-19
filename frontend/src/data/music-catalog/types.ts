/** Types follow the actual immutable JSON aggregation, without unsafe casts. */
import type catalog from "./index";
export type Artist = (typeof catalog.artists)[number];
export type Album = (typeof catalog.albums)[number];
export type Song = (typeof catalog.songs)[number];
export type MusicCatalogDataQuality = typeof catalog.data_quality;
export type MusicCatalog = typeof catalog;
