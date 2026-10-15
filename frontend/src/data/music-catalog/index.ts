import guncharlieArtists from "./artists/guncharlie.json";
import drFuuArtists from "./artists/dr_fuu.json";
import purpeechArtists from "./artists/purpeech.json";
import threeManDownArtists from "./artists/three_man_down.json";

import guncharlieAlbums from "./albums/guncharlie.json";
import drFuuAlbums from "./albums/dr_fuu.json";
import purpeechAlbums from "./albums/purpeech.json";
import threeManDownAlbums from "./albums/three_man_down.json";

import guncharlieSongs from "./songs/guncharlie.json";
import drFuuSongs from "./songs/dr_fuu.json";
import purpeechSongs from "./songs/purpeech.json";
import threeManDownSongs from "./songs/three_man_down.json";

/**
 * รวมข้อมูลจาก JSON ของศิลปินทั้ง 4 คน
 *
 * โครงสร้างที่คาดหวัง:
 * - artists/*.json มี property artists เป็น Array
 * - albums/*.json มี property albums เป็น Array
 * - songs/*.json มี property songs เป็น Array
 *
 * ไม่แก้ไขข้อมูลใน Array ต้นฉบับ
 */

type DataQuality = {
  youtube_only_export?: boolean | null;
  songs_total?: number | null;
  youtube_direct_links_found?: number | null;
  songs_without_verified_youtube_link?: number | null;
  complete?: boolean | null;
  note?: string | null;
  youtube_complete?: boolean | null;
  allowed_artists_only?: boolean | null;
  allowed_artist_names?: string[] | null;
  songs_removed_outside_allowed_artists?: number | null;
  songs_without_youtube_link?: number | null;
};

type SongCatalogFile = {
  schema_version?: string;
  catalog_title?: string;
  language?: string;
  created_at?: string;
  purpose?: string;
  songs: unknown[];
  data_quality?: DataQuality;
};

// Metadata ของไฟล์เพลงทั้ง 4 ศิลปิน
const songCatalogs: SongCatalogFile[] = [
  guncharlieSongs,
  drFuuSongs,
  purpeechSongs,
  threeManDownSongs,
];

// รวมศิลปิน
const artists = [
  ...guncharlieArtists.artists,
  ...drFuuArtists.artists,
  ...purpeechArtists.artists,
  ...threeManDownArtists.artists,
];

// รวมอัลบั้ม
const albums = [
  ...guncharlieAlbums.albums,
  ...drFuuAlbums.albums,
  ...purpeechAlbums.albums,
  ...threeManDownAlbums.albums,
];

// รวมเพลง
const songs = [
  ...guncharlieSongs.songs,
  ...drFuuSongs.songs,
  ...purpeechSongs.songs,
  ...threeManDownSongs.songs,
];

// รวมตัวเลขเฉพาะกรณีที่ทุกไฟล์มีค่าตัวเลขที่ตรวจสอบแล้ว
// ถ้ามีไฟล์ใดเป็น null หรือไม่มีค่า จะคืน null เพื่อไม่ให้ยอดรวมคลาดเคลื่อน
function sumIfAllKnown(
  values: (number | null | undefined)[]
): number | null {
  if (
    values.length === 0 ||
    values.some((value) => typeof value !== "number")
  ) {
    return null;
  }

  return (values as number[]).reduce(
    (total, value) => total + value,
    0
  );
}

// รวมสถานะ true/false โดยไม่เดาค่าที่ไม่ทราบ
function combineStatus(
  values: (boolean | null | undefined)[]
): boolean | null {
  if (values.some((value) => value === false)) {
    return false;
  }

  if (
    values.length > 0 &&
    values.every((value) => value === true)
  ) {
    return true;
  }

  return null;
}

// รวมรายชื่อศิลปินที่อนุญาตจาก Metadata ของทุกไฟล์
const allowedArtistNames = [
  ...new Set(
    songCatalogs.flatMap((catalog) =>
      catalog.data_quality?.allowed_artist_names ?? []
    )
  ),
];

// รวมหมายเหตุที่มีอยู่จริง โดยไม่สร้างข้อความขึ้นมาแทนข้อมูลเดิม
const notes = [
  ...new Set(
    songCatalogs
      .map((catalog) => catalog.data_quality?.note)
      .filter(
        (note): note is string =>
          typeof note === "string" && note.trim().length > 0
      )
  ),
];

// สร้าง Data Quality ระดับแค็ตตาล็อกรวม
const dataQuality = {
  youtube_only_export: combineStatus(
    songCatalogs.map(
      (catalog) => catalog.data_quality?.youtube_only_export
    )
  ),

  artists_total: artists.length,
  albums_total: albums.length,
  songs_total: songs.length,

  youtube_direct_links_found: sumIfAllKnown(
    songCatalogs.map(
      (catalog) =>
        catalog.data_quality?.youtube_direct_links_found
    )
  ),

  songs_without_verified_youtube_link: sumIfAllKnown(
    songCatalogs.map(
      (catalog) =>
        catalog.data_quality?.songs_without_verified_youtube_link
    )
  ),

  complete: combineStatus(
    songCatalogs.map(
      (catalog) => catalog.data_quality?.complete
    )
  ),

  note: notes.length > 0 ? notes.join("\n") : null,

  youtube_complete: combineStatus(
    songCatalogs.map(
      (catalog) => catalog.data_quality?.youtube_complete
    )
  ),

  allowed_artists_only: combineStatus(
    songCatalogs.map(
      (catalog) => catalog.data_quality?.allowed_artists_only
    )
  ),

  allowed_artist_names: allowedArtistNames,

  songs_removed_outside_allowed_artists: sumIfAllKnown(
    songCatalogs.map(
      (catalog) =>
        catalog.data_quality?.songs_removed_outside_allowed_artists
    )
  ),

  songs_without_youtube_link: sumIfAllKnown(
    songCatalogs.map(
      (catalog) =>
        catalog.data_quality?.songs_without_youtube_link
    )
  ),
};

// ใช้ Metadata จากไฟล์แรกที่มีค่า ไม่ยึดติดกับ Dr.Fuu เพียงไฟล์เดียว
function firstDefined<T>(
  values: (T | undefined)[]
): T | undefined {
  return values.find((value) => value !== undefined);
}

const musicCatalog = {
  schema_version: firstDefined(
    songCatalogs.map((catalog) => catalog.schema_version)
  ),

  catalog_title: firstDefined(
    songCatalogs.map((catalog) => catalog.catalog_title)
  ),

  language: firstDefined(
    songCatalogs.map((catalog) => catalog.language)
  ),

  created_at: firstDefined(
    songCatalogs.map((catalog) => catalog.created_at)
  ),

  purpose: firstDefined(
    songCatalogs.map((catalog) => catalog.purpose)
  ),

  artists,
  albums,
  songs,

  data_quality: dataQuality,
};

export { musicCatalog };
export default musicCatalog;