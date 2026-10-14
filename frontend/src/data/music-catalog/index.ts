import guncharlie from "./guncharlie/music.json";
import drFuu from "./dr_fuu/music.json";
import purpeech from "./purpeech/music.json";
import threeManDown from "./three_man_down/music.json";

/**
 * รวมข้อมูลเพลงจากไฟล์แยกตามศิลปินให้เป็น catalog เดียว
 * ต้องเปิดใช้ resolveJsonModule ใน tsconfig.json
 */
const musicCatalog = {
  schema_version: drFuu.schema_version,
  catalog_title: drFuu.catalog_title,
  language: drFuu.language,
  created_at: drFuu.created_at,
  purpose: drFuu.purpose,
  artists: [...guncharlie.artists, ...drFuu.artists, ...purpeech.artists, ...threeManDown.artists],
  albums: [...guncharlie.albums, ...drFuu.albums, ...purpeech.albums, ...threeManDown.albums],
  songs: [...guncharlie.songs, ...drFuu.songs, ...purpeech.songs, ...threeManDown.songs],
  data_quality: {
  ...drFuu.data_quality,
  songs_total:
    guncharlie.songs.length +
    drFuu.songs.length +
    purpeech.songs.length +
    threeManDown.songs.length,
},
};

export { musicCatalog };
export default musicCatalog;
