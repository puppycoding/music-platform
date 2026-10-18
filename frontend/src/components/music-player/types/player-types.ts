
/**
 * ประเภทแพลตฟอร์มที่ Music Platform รองรับ
 */
export type PlayerProvider =
  | "youtube"
  | "spotify"
  | "apple_music"
  | "joox";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export type YouTubePlayerState =
  | "unstarted"
  | "playing"
  | "paused"
  | "ended"
  | "buffering"
  | "cued"
  | "error";

export type SongProviderLink = {
  url?: string | null;
  video_id?: string | null;
  link_type?: string | null;
};

export type SongProviders = Partial<
  Record<PlayerProvider, SongProviderLink>
>;

export type SongPlaybackSource = {
  listen_provider?: string | null;
  listen_url?: string | null;
  providers?: SongProviders | null;
};

export type PlaybackSource = {
  provider: PlayerProvider;
  url: string;
  videoId: string | null;
};

export type MusicTrack = {
  id: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
  durationSeconds: number;
  videoId: string | null;
};

export type QueueItem = {
  queueId: string;
  song: MusicTrack;
};

/** เวลาเล่นเพลงที่อ่านได้จาก Player */
export type PlayerProgress = {
  currentTime: number;
  duration: number;
};

/** คำสั่งควบคุมตัวเล่นเพลง */
export type PlayerControls = {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
};

/** ข้อมูลสถานะที่ตัวเล่นส่งกลับไปยัง Provider */
export type PlayerCallbacks = {
  onReady?: () => void;
  onStateChange?: (status: PlayerStatus) => void;
  onError?: (errorCode: number) => void;
};

export type MusicPlayerContextValue = {
  songs: MusicTrack[];
  currentSong: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  queue: QueueItem[];

  /** เวลาปัจจุบันของเพลง หน่วยวินาที */
  currentTime: number;

  /** ความยาวเพลงจริงจาก Player หน่วยวินาที */
  duration: number;

  /** เปลี่ยนตำแหน่งการเล่นเพลง */
  seekTo: (seconds: number) => void;

  playSong: (songId: string) => void;
  addToQueue: (songId: string) => void;
  removeFromQueue: (queueId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  playQueueItem: (queueId: string) => void;

  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
};
