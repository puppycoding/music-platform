/**
 * ประเภทแพลตฟอร์มที่ Music Platform รองรับ
 * เพิ่มแพลตฟอร์มใหม่ได้ในอนาคต
 */
export type PlayerProvider =
  | "youtube"
  | "spotify"
  | "apple_music"
  | "joox";

/**
 * สถานะการเล่นเพลงทั่วไป
 */
export type PlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

/**
 * สถานะที่ได้รับจาก YouTube Player
 */
export type YouTubePlayerState =
  | "unstarted"
  | "playing"
  | "paused"
  | "ended"
  | "buffering"
  | "cued"
  | "error";

/**
 * ข้อมูลลิงก์เพลงของแต่ละแพลตฟอร์ม
 */
export type SongProviderLink = {
  url?: string | null;
  video_id?: string | null;
  link_type?: string | null;
};

/**
 * ลิงก์ของเพลงที่แยกตามแพลตฟอร์ม
 */
export type SongProviders = Partial<
  Record<PlayerProvider, SongProviderLink>
>;

/**
 * ข้อมูลแหล่งเพลงที่อ่านได้จาก catalog
 */
export type SongPlaybackSource = {
  listen_provider?: string | null;
  listen_url?: string | null;
  providers?: SongProviders | null;
};

/**
 * แหล่งเพลงที่ผ่านการตรวจสอบแล้ว
 */
export type PlaybackSource = {
  provider: PlayerProvider;
  url: string;
  videoId: string | null;
};

/**
 * ข้อมูลเพลงที่ใช้ภายใน Music Player
 */
export type MusicTrack = {
  id: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
  durationSeconds: number;
  videoId: string | null;
};

/**
 * เพลงหนึ่งรายการในคิว
 * ใช้ queueId แยกแต่ละรายการ
 * เพื่อให้สามารถเพิ่มเพลงเดิมซ้ำในคิวได้
 */
export type QueueItem = {
  queueId: string;
  song: MusicTrack;
};

/**
 * คำสั่งควบคุมตัวเล่นเพลง
 */
export type PlayerControls = {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
};

/**
 * ข้อมูลสถานะที่ตัวเล่นส่งกลับไปยัง Provider
 */
export type PlayerCallbacks = {
  onReady?: () => void;
  onStateChange?: (status: PlayerStatus) => void;
  onError?: (errorCode: number) => void;
};

/**
 * ค่าที่เปิดให้ component อื่นเรียกใช้ผ่าน MusicPlayerProvider
 */
export type MusicPlayerContextValue = {
  songs: MusicTrack[];
  currentSong: MusicTrack | null;
  isPlaying: boolean;
  volume: number;

  /** รายการเพลงที่รอเล่น */
  queue: QueueItem[];

  /** เล่นเพลงที่เลือกทันที */
  playSong: (songId: string) => void;

  /** เพิ่มเพลงเข้าคิวโดยไม่ขัดจังหวะเพลงปัจจุบัน */
  addToQueue: (songId: string) => void;

  /** ลบเพลงออกจากคิวด้วย queueId */
  removeFromQueue: (queueId: string) => void;

  /** จัดเรียงลำดับเพลงในคิวจากตำแหน่งเดิมไปตำแหน่งใหม่ */
  reorderQueue: (fromIndex: number, toIndex: number) => void;

  /** เล่นเพลงในคิวทันที และนำรายการนั้นออกจากคิว */
  playQueueItem: (queueId: string) => void;

  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
};