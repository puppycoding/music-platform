"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { fillPlayingNext } from "../services/playing-next";

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
    durationSeconds:
      typeof song.duration_seconds === "number" &&
      Number.isFinite(song.duration_seconds) && song.duration_seconds > 0
        ? song.duration_seconds : null,
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

  const [playingNext, setPlayingNext] = useState<MusicTrack[]>([]);
  const playingNextRef = useRef<MusicTrack[]>([]);
  const seenSongsRef = useRef(new Set<string>());
  const [repeatOne, setRepeatOne] = useState(false);
  const repeatOneRef = useRef(false);
  const toggleRepeat = useCallback(() => {
    repeatOneRef.current = !repeatOneRef.current;
    setRepeatOne(repeatOneRef.current);
  }, []);
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

  const updatePlayingNext = useCallback((currentId?: string) => {
    const next = fillPlayingNext(
      playingNextRef.current, allSongs, currentId, seenSongsRef.current,
      undefined, new Set(queueRef.current.map(item => item.song.id)),
    );
    playingNextRef.current = next;
    setPlayingNext(next);
  }, []);

  // Compute both lists first, then publish refs synchronously before rendering.
  // Next/ended callbacks can only observe the complete queue transaction.
  const commitQueue = useCallback((nextQueue: QueueItem[]) => {
    const next = fillPlayingNext(
      playingNextRef.current, allSongs, currentSongRef.current?.id,
      seenSongsRef.current, undefined,
      new Set(nextQueue.map(item => item.song.id)),
    );
    queueRef.current = nextQueue;
    playingNextRef.current = next;
    setQueue(nextQueue);
    setPlayingNext(next);
  }, []);

  useEffect(() => {
    // Defer random initialization until after hydration, independently of the panel.
    const timer = setTimeout(() => updatePlayingNext(currentSongRef.current?.id), 0);
    return () => clearTimeout(timer);
  }, [updatePlayingNext]);

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
      updatePlayingNext(song.id);

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
    [playerReady, updatePlayingNext],
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

    commitQueue(nextQueue);
  }, [commitQueue]);

  const movePlayingNextToQueue = useCallback((songId: string) => {
    // The first call removes the song from the live list; stale/double clicks
    // cannot append it again, even before React has rendered the new state.
    if (!playingNextRef.current.some(song => song.id === songId)) return;
    if (queueRef.current.some(item => item.song.id === songId)) return;
    addToQueue(songId);
  }, [addToQueue]);

  // นำเพลงออกจากคิว
  const removeFromQueue = useCallback((queueId: string) => {
    const nextQueue = queueRef.current.filter(
      (item) => item.queueId !== queueId,
    );

    commitQueue(nextQueue);
  }, [commitQueue]);

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

  // Selecting a later recommendation skips preceding recommendations.
  const playPlayingNext = useCallback((songId: string) => {
    const index = playingNextRef.current.findIndex(song => song.id === songId);
    if (index < 0) return;
    playingNextRef.current = playingNextRef.current.slice(index + 1);
    playSong(songId);
  }, [playSong]);

  // Shuffle keeps its original one-click playback behavior, using the shared list.
  const playRandomSong = useCallback(() => {
    const next = playingNextRef.current[0];
    if (next) playPlayingNext(next.id);
  }, [playPlayingNext]);

  // เล่นเพลงถัดไป: ใช้คิวก่อน แล้วใช้รายการเดียวกับที่แสดงใน Playing Next
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

    const next = playingNextRef.current[0];
    if (next) {
      playPlayingNext(next.id);
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
      pendingVideoIdRef.current = null;
    }
  }, [playSong, playPlayingNext]);

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
      playNext();

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
  }, [playerReady, playNext]);

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

        if (repeatOneRef.current && currentSongRef.current) {
          playSong(currentSongRef.current.id);
        } else {
          playNext();
        }
      } else if (state === "error") {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    },
    [playNext, playSong],
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
      playingNext,
      playPlayingNext,
      movePlayingNextToQueue,
      playRandomSong,
      repeatOne,
      toggleRepeat,
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
      playingNext,
      playPlayingNext,
      movePlayingNextToQueue,
      playRandomSong,
      repeatOne,
      toggleRepeat,
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