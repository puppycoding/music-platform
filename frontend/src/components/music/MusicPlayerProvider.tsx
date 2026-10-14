
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import catalog from "../../data/music-catalog";

type RawSong = {
  id: string;
  title: string;
  artist_ids?: string[];
  cover_url?: string | null;
  image_url?: string | null;
  duration_seconds?: number | null;
  providers?: {
    youtube?: {
      video_id?: string | null;
      url?: string | null;
    };
  };
  listen_url?: string | null;
};

export type MusicTrack = {
  id: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
  durationSeconds: number;
  videoId: string | null;
};

type YouTubePlayerInstance = {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  destroy?: () => void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayerInstance;
};

type YouTubeStateEvent = {
  data: number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          width: string;
          height: string;
          videoId: string;
          playerVars?: Record<string, number>;
          events?: {
            onReady?: (event: YouTubePlayerEvent) => void;
            onStateChange?: (event: YouTubeStateEvent) => void;
            onError?: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayerInstance;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type MusicPlayerContextValue = {
  songs: MusicTrack[];
  currentSong: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  playSong: (songId: string) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
};

const MusicPlayerContext =
  createContext<MusicPlayerContextValue | null>(null);

const rawSongs = (
  catalog as unknown as { songs: RawSong[] }
).songs;

const rawArtists = (
  catalog as unknown as {
    artists: { id: string; name: string }[];
  }
).artists;

function getYouTubeVideoId(song: RawSong): string | null {
  const videoId = song.providers?.youtube?.video_id?.trim();

  if (videoId) {
    return videoId;
  }

  const url = song.providers?.youtube?.url ?? song.listen_url ?? null;

  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (
      parsedUrl.hostname.includes("youtube.com") ||
      parsedUrl.hostname.includes("youtube-nocookie.com")
    ) {
      return (
        parsedUrl.searchParams.get("v") ??
        parsedUrl.pathname.match(/\/embed\/([^/]+)/)?.[1] ??
        parsedUrl.pathname.match(/\/shorts\/([^/]+)/)?.[1] ??
        null
      );
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeSong(song: RawSong): MusicTrack {
  const artistName =
    song.artist_ids
      ?.map((artistId) =>
        rawArtists.find((artist) => artist.id === artistId)?.name,
      )
      .filter((name): name is string => Boolean(name))
      .join(", ") || "ไม่ทราบศิลปิน";

  return {
    id: song.id,
    title: song.title,
    artistName,
    coverUrl:
      song.cover_url ??
      song.image_url ??
      null,
    durationSeconds: song.duration_seconds ?? 0,
    videoId: getYouTubeVideoId(song),
  };
}

const allSongs: MusicTrack[] = rawSongs.map(normalizeSong);

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);

  if (!context) {
    throw new Error(
      "useMusicPlayer must be used inside MusicPlayerProvider",
    );
  }

  return context;
}

export default function MusicPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentSong, setCurrentSong] =
    useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(65);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const currentSongRef = useRef<MusicTrack | null>(null);
  const volumeRef = useRef(volume);
  const pendingVideoIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  currentSongRef.current = currentSong;
  volumeRef.current = volume;
  isPlayingRef.current = isPlaying;

  const playSong = useCallback(
    (songId: string) => {
      const song = allSongs.find((item) => item.id === songId);

      if (!song) {
        console.error("ไม่พบเพลงใน catalog:", songId);
        return;
      }

      if (!song.videoId) {
        console.error(
          "เพลงนี้ไม่มี YouTube video ID:",
          song.title,
          song.id,
        );
        setIsPlaying(false);
        return;
      }

      setCurrentSong(song);
      setIsPlaying(true);
      isPlayingRef.current = true;

      // จำเพลงไว้ เผื่อผู้ใช้กดก่อน YouTube Player พร้อม
      pendingVideoIdRef.current = song.videoId;

      const player = playerRef.current;

      if (playerReady && player) {
        player.loadVideoById(song.videoId);
        pendingVideoIdRef.current = null;
      }
    },
    [playerReady],
  );

  const playNext = useCallback(() => {
    const current = currentSongRef.current;

    if (!current) {
      const firstPlayableSong = allSongs.find((song) => song.videoId);

      if (firstPlayableSong) {
        playSong(firstPlayableSong.id);
      }

      return;
    }

    const currentIndex = allSongs.findIndex(
      (song) => song.id === current.id,
    );

    const nextSong = allSongs
      .slice(currentIndex + 1)
      .find((song) => song.videoId);

    const firstPlayableSong = allSongs.find((song) => song.videoId);
    const target = nextSong ?? firstPlayableSong;

    if (target) {
      playSong(target.id);
    }
  }, [playSong]);

  const playPrevious = useCallback(() => {
    const current = currentSongRef.current;

    if (!current) return;

    const currentIndex = allSongs.findIndex(
      (song) => song.id === current.id,
    );

    const previousSong = allSongs
      .slice(0, Math.max(0, currentIndex))
      .reverse()
      .find((song) => song.videoId);

    const lastPlayableSong = [...allSongs]
      .reverse()
      .find((song) => song.videoId);

    const target = previousSong ?? lastPlayableSong;

    if (target) {
      playSong(target.id);
    }
  }, [playSong]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    const current = currentSongRef.current;

    if (!current) {
      const firstPlayableSong = allSongs.find((song) => song.videoId);

      if (firstPlayableSong) {
        playSong(firstPlayableSong.id);
      }

      return;
    }

    if (!playerReady || !player) {
      if (current.videoId) {
        pendingVideoIdRef.current = current.videoId;
        setIsPlaying(true);
        isPlayingRef.current = true;
      }

      return;
    }

    if (isPlayingRef.current) {
      player.pauseVideo();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      player.playVideo();
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  }, [playerReady, playSong]);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(100, nextVolume));

    setVolumeState(safeVolume);
    volumeRef.current = safeVolume;
    playerRef.current?.setVolume(safeVolume);
  }, []);

  // โหลด YouTube API และสร้าง Player เพียงครั้งเดียว
  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !window.YT?.Player) return;
      if (playerRef.current) return;

      const player = new window.YT.Player("moodify-youtube-player", {
        width: "1",
        height: "1",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;

            playerRef.current = event.target;
            event.target.setVolume(volumeRef.current);
            setPlayerReady(true);

            // เล่นเพลงที่ผู้ใช้เลือกไว้ระหว่างรอ Player
            const pendingVideoId = pendingVideoIdRef.current;

            if (pendingVideoId) {
              event.target.loadVideoById(pendingVideoId);
              pendingVideoIdRef.current = null;
            }
          },
          onStateChange: (event) => {
            const states = window.YT?.PlayerState;

            if (!states) return;

            if (event.data === states.PLAYING) {
              setIsPlaying(true);
              isPlayingRef.current = true;
            } else if (event.data === states.PAUSED) {
              setIsPlaying(false);
              isPlayingRef.current = false;
            } else if (event.data === states.ENDED) {
              setIsPlaying(false);
              isPlayingRef.current = false;
              playNext();
            }
          },
          onError: (event) => {
            console.error(
              "YouTube Player error:",
              event.data,
              "ตรวจสอบ video ID หรือข้อจำกัดการฝังวิดีโอ",
            );
            setIsPlaying(false);
            isPlayingRef.current = false;
          },
        },
      });

      playerRef.current = player;
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      );

      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        createPlayer();
      };

      if (!existingScript) {
        const script = document.createElement("script");

        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.onerror = () => {
          console.error("โหลด YouTube IFrame API ไม่สำเร็จ");
        };

        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      // ไม่ destroy Player ใน cleanup นี้ เพราะ React Strict Mode
      // อาจเรียก cleanup และ setup ซ้ำระหว่าง development
    };
  }, [playNext]);

  // ถ้าเลือกเพลงก่อน Player พร้อม ให้โหลดเมื่อ Player พร้อม
  useEffect(() => {
    if (!playerReady || !currentSong?.videoId) return;

    const pendingVideoId = pendingVideoIdRef.current;

    if (pendingVideoId) {
      playerRef.current?.loadVideoById(pendingVideoId);
      pendingVideoIdRef.current = null;
    }
  }, [playerReady, currentSong?.videoId]);

  const value = useMemo(
    () => ({
      songs: allSongs,
      currentSong,
      isPlaying,
      volume,
      playSong,
      togglePlay,
      playNext,
      playPrevious,
      setVolume,
    }),
    [
      currentSong,
      isPlaying,
      volume,
      playSong,
      togglePlay,
      playNext,
      playPrevious,
      setVolume,
    ],
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}

      {/* YouTube player สำหรับเล่นเพลง โดยซ่อนพื้นที่วิดีโอ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          left: 0,
          bottom: 0,
        }}
      >
        <div id="moodify-youtube-player" />
      </div>
    </MusicPlayerContext.Provider>
  );
}
