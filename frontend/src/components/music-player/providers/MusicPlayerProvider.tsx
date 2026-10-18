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
  type YouTubePlayerProgress,
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
      ?.map(
        (artistId) =>
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

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [queue, setQueue] = useState<QueueItem[]>([]);

  const queueRef = useRef<QueueItem[]>([]);
  const queueCounterRef = useRef(0);

  const currentSongRef = useRef<MusicTrack | null>(null);
  const pendingVideoIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  const playerActionsRef =
    useRef<YouTubePlayerControls | null>(null);

  // ประวัติการเล่นเพลงจริง ใช้สำหรับปุ่มย้อนกลับ
  const playHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  // ป้องกันการเพิ่มประวัติซ้ำเมื่อย้อนกลับไปเพลงก่อนหน้า
  const isNavigatingHistoryRef = useRef(false);

  // อัปเดต refs ให้เป็นข้อมูลล่าสุด
  currentSongRef.current = currentSong;
  isPlayingRef.current = isPlaying;
  queueRef.current = queue;

  // เล่นเพลงที่เลือกจากคลังเพลง
  const playSong = useCallback(
    (songId: string) => {
      const song = allSongs.find((item) => item.id === songId);

      if (!song) {
        console.error("ไม่พบเพลงใน catalog:", songId);
        isNavigatingHistoryRef.current = false;
        return;
      }

      if (!song.videoId) {
        console.error(
          "เพลงนี้ไม่มี YouTube video ID:",
          song.title,
          song.id,
        );
        isNavigatingHistoryRef.current = false;
        return;
      }

      // บันทึกประวัติเมื่อเป็นการเล่นเพลงใหม่
      if (!isNavigatingHistoryRef.current) {
        const history = playHistoryRef.current;
        const index = historyIndexRef.current;

        // หากย้อนกลับแล้วเลือกเพลงใหม่ ให้ตัดประวัติข้างหน้าออก
        const updatedHistory = history.slice(0, index + 1);

        // ไม่บันทึกเพลงเดิมซ้ำติดกัน
        if (
          updatedHistory[updatedHistory.length - 1] !== song.id
        ) {
          updatedHistory.push(song.id);
        }

        playHistoryRef.current = updatedHistory;
        historyIndexRef.current = updatedHistory.length - 1;
      }

      isNavigatingHistoryRef.current = false;

      currentSongRef.current = song;
      setCurrentSong(song);

      setCurrentTime(0);
      setDuration(0);

      setIsPlaying(true);
      isPlayingRef.current = true;

      pendingVideoIdRef.current = song.videoId;

      // โหลดเพลงเมื่อ Player พร้อมแล้ว
      if (playerReady && playerActionsRef.current) {
        playerActionsRef.current.loadVideo(song.videoId);
        pendingVideoIdRef.current = null;
      }
    },
    [playerReady],
  );

  // เพิ่มเพลงเข้าคิว
  const addToQueue = useCallback((songId: string) => {
    const song = allSongs.find((item) => item.id === songId);

    if (!song?.videoId) {
      console.error(
        "ไม่พบเพลงหรือไม่มี YouTube Video ID:",
        songId,
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

  // นำเพลงออกจากคิว
  const removeFromQueue = useCallback((queueId: string) => {
    const nextQueue = queueRef.current.filter(
      (item) => item.queueId !== queueId,
    );

    queueRef.current = nextQueue;
    setQueue(nextQueue);
  }, []);

  // จัดลำดับเพลงในคิวใหม่
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

  // เล่นเพลงที่เลือกจากคิวและนำเพลงออกจากคิว
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

  // สุ่มเพลงจากคลัง โดยเลือกเฉพาะเพลงที่มี YouTube ID
  const playRandomSong = useCallback(() => {
    const playableSongs = allSongs.filter(
      (song) => Boolean(song.videoId),
    );

    if (playableSongs.length === 0) {
      console.warn("ไม่มีเพลงที่สามารถเล่นได้ในคลัง");

      setIsPlaying(false);
      isPlayingRef.current = false;
      pendingVideoIdRef.current = null;

      setCurrentTime(0);
      setDuration(0);

      return;
    }

    const currentSongId = currentSongRef.current?.id;

    // ถ้ามีเพลงอื่นให้เลือก จะไม่สุ่มเพลงปัจจุบันซ้ำทันที
    const otherSongs = playableSongs.filter(
      (song) => song.id !== currentSongId,
    );

    const candidates =
      otherSongs.length > 0 ? otherSongs : playableSongs;

    const randomIndex = Math.floor(
      Math.random() * candidates.length,
    );

    playSong(candidates[randomIndex].id);
  }, [playSong]);

  // เล่นเพลงถัดไป: ใช้คิวก่อน หากคิวว่างให้สุ่ม
  const playNext = useCallback(() => {
    while (queueRef.current.length > 0) {
      const [nextItem, ...remainingQueue] = queueRef.current;

      queueRef.current = remainingQueue;
      setQueue(remainingQueue);

      if (nextItem.song.videoId) {
        playSong(nextItem.song.id);
        return;
      }
    }

    playRandomSong();
  }, [playSong, playRandomSong]);

  // ย้อนกลับตามประวัติการเล่นจริง
  const playPrevious = useCallback(() => {
    const player = playerActionsRef.current;

    // หากเล่นเกิน 3 วินาที ให้เริ่มเพลงปัจจุบันใหม่
    if (currentTime > 3 && player) {
      player.seekTo(0);
      setCurrentTime(0);
      return;
    }

    const history = playHistoryRef.current;
    let index = historyIndexRef.current - 1;

    while (index >= 0) {
      const previousSongId = history[index];

      const previousSong = allSongs.find(
        (song) =>
          song.id === previousSongId && Boolean(song.videoId),
      );

      if (previousSong) {
        historyIndexRef.current = index;
        isNavigatingHistoryRef.current = true;
        playSong(previousSong.id);
        return;
      }

      index -= 1;
    }

    // หากไม่มีประวัติก่อนหน้า ให้เริ่มเพลงปัจจุบันใหม่
    if (player) {
      player.seekTo(0);
      setCurrentTime(0);
    }
  }, [currentTime, playSong]);

  // เล่นหรือหยุดเพลงชั่วคราว
  const togglePlay = useCallback(() => {
    const player = playerActionsRef.current;
    const current = currentSongRef.current;

    // ยังไม่ได้เลือกเพลง
    if (!current) {
      const nextItem = queueRef.current[0];

      // ถ้ามีเพลงในคิว ให้เล่นเพลงแรก
      if (nextItem) {
        const remainingQueue = queueRef.current.slice(1);

        queueRef.current = remainingQueue;
        setQueue(remainingQueue);

        playSong(nextItem.song.id);
      }

      // ถ้าไม่มีเพลงและไม่มีคิว ไม่ทำอะไร
      return;
    }

    // Player ยังไม่พร้อม ให้รอโหลดเพลง
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

  // ปรับระดับเสียง
  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(100, nextVolume));

    setVolumeState(safeVolume);
  }, []);

  // เลื่อนไปยังตำแหน่งที่ต้องการในเพลง
  const seekTo = useCallback(
    (seconds: number) => {
      if (!Number.isFinite(seconds)) return;

      const controls = playerActionsRef.current;

      if (!controls) return;

      const safeSeconds = Math.max(
        0,
        duration > 0 ? Math.min(seconds, duration) : seconds,
      );

      controls.seekTo(safeSeconds);
      setCurrentTime(safeSeconds);
    },
    [duration],
  );

  // รับคำสั่งควบคุมจาก YouTube Player
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

  // อัปเดตเวลาจริงจาก YouTube Player
  const handlePlayerProgress = useCallback(
    (progress: YouTubePlayerProgress) => {
      setCurrentTime(progress.currentTime);
      setDuration(progress.duration);
    },
    [],
  );

  // เมื่อเพลงจบ ให้เล่นคิวต่อ หรือสุ่มเพลงเมื่อคิวว่าง
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

        setCurrentTime(0);
        setDuration(0);

        playNext();
      } else if (state === "error") {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    },
    [playNext],
  );

  // จัดการข้อผิดพลาดจาก YouTube Player
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
      currentTime,
      duration,
      seekTo,
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
      currentTime,
      duration,
      seekTo,
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
        onProgress={handlePlayerProgress}
        onError={handlePlayerError}
      />
    </MusicPlayerContext.Provider>
  );
}