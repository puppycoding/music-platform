"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import catalog from "../../../data/music-catalog";
import { getSongYouTubeVideoId } from "../services/player-service";

import YouTubePlayer, {
  type YouTubePlayerState,
  type YouTubePlayerControls,
} from "../players/YouTubePlayer";

import type {
  MusicTrack,
  MusicPlayerContextValue,
  QueueItem,
} from "../types/player-types";

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

const rawSongs = (
  catalog as unknown as { songs: RawSong[] }
).songs;

const rawArtists = (
  catalog as unknown as {
    artists: { id: string; name: string }[];
  }
).artists;

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
    coverUrl: song.cover_url ?? song.image_url ?? null,
    durationSeconds: song.duration_seconds ?? 0,
    videoId: getSongYouTubeVideoId(song),
  };
}

const allSongs: MusicTrack[] = rawSongs.map(normalizeSong);

const MusicPlayerContext =
  createContext<MusicPlayerContextValue | null>(null);

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

  // คิวเพลง
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const queueRef = useRef<QueueItem[]>([]);
  const queueCounterRef = useRef(0);

  const currentSongRef = useRef<MusicTrack | null>(null);
  const pendingVideoIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  const playerActionsRef =
    useRef<YouTubePlayerControls | null>(null);

  currentSongRef.current = currentSong;
  isPlayingRef.current = isPlaying;
  queueRef.current = queue;

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
        isPlayingRef.current = false;
        pendingVideoIdRef.current = null;

        return;
      }

      setCurrentSong(song);
      currentSongRef.current = song;

      setIsPlaying(true);
      isPlayingRef.current = true;

      pendingVideoIdRef.current = song.videoId;

      if (playerReady && playerActionsRef.current) {
        playerActionsRef.current.loadVideo(song.videoId);
        pendingVideoIdRef.current = null;
      }
    },
    [playerReady],
  );

  // เพิ่มเพลงเข้าคิว โดยไม่เปลี่ยนเพลงที่กำลังเล่น
  const addToQueue = useCallback((songId: string) => {
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
      return;
    }

    queueCounterRef.current += 1;

    const item: QueueItem = {
      queueId: `${song.id}-${queueCounterRef.current}`,
      song,
    };

    const nextQueue = [...queueRef.current, item];

    queueRef.current = nextQueue;
    setQueue(nextQueue);
  }, []);

  // ลบเพลงออกจากคิว โดยใช้ queueId
  const removeFromQueue = useCallback((queueId: string) => {
    const nextQueue = queueRef.current.filter(
      (item) => item.queueId !== queueId,
    );

    queueRef.current = nextQueue;
    setQueue(nextQueue);
  }, []);

  // จัดเรียงลำดับเพลงในคิว
  const reorderQueue = useCallback(
    (fromIndex: number, toIndex: number) => {
      const currentQueue = queueRef.current;

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= currentQueue.length ||
        toIndex >= currentQueue.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const nextQueue = [...currentQueue];
      const [movedItem] = nextQueue.splice(fromIndex, 1);

      nextQueue.splice(toIndex, 0, movedItem);

      queueRef.current = nextQueue;
      setQueue(nextQueue);
    },
    [],
  );

  // เล่นเพลงที่เลือกจากคิวทันที แล้วนำรายการนั้นออกจากคิว
  const playQueueItem = useCallback(
    (queueId: string) => {
      const item = queueRef.current.find(
        (entry) => entry.queueId === queueId,
      );

      if (!item) return;

      const nextQueue = queueRef.current.filter(
        (entry) => entry.queueId !== queueId,
      );

      queueRef.current = nextQueue;
      setQueue(nextQueue);

      playSong(item.song.id);
    },
    [playSong],
  );

  // เล่นเพลงถัดไปในคิวเมื่อเพลงปัจจุบันจบ
  const playNext = useCallback(() => {
    const nextItem = queueRef.current[0];

    if (nextItem) {
      const remainingQueue = queueRef.current.slice(1);

      queueRef.current = remainingQueue;
      setQueue(remainingQueue);

      playSong(nextItem.song.id);
      return;
    }

    // เมื่อคิวว่าง ให้หยุด ไม่เล่นเพลงอื่นจาก catalog อัตโนมัติ
    setIsPlaying(false);
    isPlayingRef.current = false;
    pendingVideoIdRef.current = null;
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
    const player = playerActionsRef.current;
    const current = currentSongRef.current;

    if (!current) {
      const firstPlayableSong = allSongs.find(
        (song) => song.videoId,
      );

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
      player.pause();

      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      player.play();

      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  }, [playerReady, playSong]);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(
      0,
      Math.min(100, nextVolume),
    );

    setVolumeState(safeVolume);
  }, []);

  const handlePlayerControlsReady = useCallback(
    (controls: YouTubePlayerControls) => {
      playerActionsRef.current = controls;

      const pendingVideoId = pendingVideoIdRef.current;

      if (pendingVideoId) {
        controls.loadVideo(pendingVideoId);
        pendingVideoIdRef.current = null;
      }
    },
    [],
  );

  const handlePlayerReady = useCallback(() => {
    setPlayerReady(true);
  }, []);

  const handlePlayerStateChange = useCallback(
    (state: YouTubePlayerState) => {
      if (state === "playing") {
        setIsPlaying(true);
        isPlayingRef.current = true;
      } else if (state === "paused") {
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else if (state === "ended") {
        setIsPlaying(false);
        isPlayingRef.current = false;
        playNext();
      } else if (state === "error") {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    },
    [playNext],
  );

  const handlePlayerError = useCallback(
    (errorCode: number) => {
      console.error(
        "YouTube Player error:",
        errorCode,
        "ตรวจสอบ video ID หรือข้อจำกัดการฝังวิดีโอ",
      );

      setIsPlaying(false);
      isPlayingRef.current = false;
    },
    [],
  );

  const value = useMemo(
    () => ({
      songs: allSongs,
      currentSong,
      isPlaying,
      volume,
      queue,
      playSong,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      playQueueItem,
      togglePlay,
      playNext,
      playPrevious,
      setVolume,
    }),
    [
      currentSong,
      isPlaying,
      volume,
      queue,
      playSong,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      playQueueItem,
      togglePlay,
      playNext,
      playPrevious,
      setVolume,
    ],
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}

      <YouTubePlayer
        videoId={currentSong?.videoId ?? null}
        volume={volume}
        autoplay={false}
        onReady={handlePlayerReady}
        onControlsReady={handlePlayerControlsReady}
        onStateChange={handlePlayerStateChange}
        onError={handlePlayerError}
      />
    </MusicPlayerContext.Provider>
  );
}