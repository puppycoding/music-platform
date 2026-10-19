import type {
  PlayerProvider,
  SongPlaybackSource,
  PlaybackSource,
} from "../types/player-types";
export type {
  PlayerProvider,
  SongProviderLink,
  SongProviders,
  SongPlaybackSource,
  PlaybackSource,
} from "../types/player-types";

const SUPPORTED_PROVIDERS: PlayerProvider[] = [
  "youtube",
  "spotify",
  "apple_music",
  "joox",
];

/**
 * ตรวจสอบว่าแพลตฟอร์มที่ระบุมารองรับหรือไม่
 */
export function isSupportedProvider(
  provider: string,
): provider is PlayerProvider {
  return SUPPORTED_PROVIDERS.includes(provider as PlayerProvider);
}

/**
 * แปลง URL ให้เป็น YouTube Video ID
 */
export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com")
    ) {
      return (
        parsedUrl.searchParams.get("v") ??
        parsedUrl.pathname.match(/\/embed\/([^/]+)/)?.[1] ??
        parsedUrl.pathname.match(/\/shorts\/([^/]+)/)?.[1] ??
        null
      );
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * ดึง YouTube Video ID จากข้อมูลเพลง
 */
export function getSongYouTubeVideoId(song: SongPlaybackSource): string | null {
  const videoId = song.providers?.youtube?.video_id?.trim();

  if (videoId) return videoId;

  const youtubeUrl = song.providers?.youtube?.url;

  if (youtubeUrl) {
    return getYouTubeVideoId(youtubeUrl);
  }

  // รองรับข้อมูลเก่าที่เก็บ URL ไว้ใน listen_url
  return getYouTubeVideoId(song.listen_url);
}

/**
 * เลือกแหล่งเพลงตามแพลตฟอร์มที่ผู้ใช้เลือก
 * หากไม่ได้เลือก จะใช้ listen_provider ของเพลง
 */
export function getPlaybackSource(
  song: SongPlaybackSource,
  selectedProvider?: PlayerProvider | null,
): PlaybackSource | null {
  const provider = selectedProvider ?? song.listen_provider ?? "youtube";

  if (!isSupportedProvider(provider)) {
    return null;
  }

  const providerData = song.providers?.[provider];

  // ใช้ URL ของแพลตฟอร์มที่เลือกก่อนเสมอ
  let url = providerData?.url?.trim() ?? "";

  if (!url && provider === song.listen_provider) {
    url = song.listen_url?.trim() ?? "";
  }

  if (!url && provider === "youtube") {
    const videoId = getSongYouTubeVideoId(song);

    if (videoId) {
      url = `https://www.youtube.com/watch?v=${videoId}`;
    }
  }

  if (!url) {
    return null;
  }

  // ป้องกัน URL ที่ไม่ใช่ HTTP(S)
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return null;
    }
  } catch {
    return null;
  }

  return {
    provider,
    url,
    videoId:
      provider === "youtube"
        ? providerData?.video_id?.trim() || getYouTubeVideoId(url)
        : null,
  };
}
