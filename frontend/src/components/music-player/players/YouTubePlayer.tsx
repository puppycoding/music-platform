
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type YouTubePlayerState =
  | "unstarted"
  | "playing"
  | "paused"
  | "ended"
  | "buffering"
  | "cued"
  | "error";

export type YouTubePlayerControls = {
  play: () => void;
  pause: () => void;
  loadVideo: (videoId: string) => void;
};

type YouTubePlayerInstance = {
  loadVideoById: (videoId: string) => void;
  cueVideoById?: (videoId: string) => void;
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

type YouTubeErrorEvent = {
  data: number;
};

type YouTubePlayerOptions = {
  videoId?: string | null;
  volume?: number;
  autoplay?: boolean;
  onReady?: () => void;
  onControlsReady?: (controls: YouTubePlayerControls) => void;
  onStateChange?: (state: YouTubePlayerState) => void;
  onError?: (errorCode: number) => void;
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
            onError?: (event: YouTubeErrorEvent) => void;
          };
        },
      ) => YouTubePlayerInstance;

      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };

    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadingPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("YouTube Player ต้องทำงานบนเบราว์เซอร์"),
    );
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (apiLoadingPromise) {
    return apiLoadingPromise;
  }

  apiLoadingPromise = new Promise<void>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    let settled = false;

    const finish = () => {
      if (settled) return;

      if (!window.YT?.Player) {
        settled = true;
        apiLoadingPromise = null;
        reject(new Error("YouTube IFrame API โหลดไม่สำเร็จ"));
        return;
      }

      settled = true;
      resolve();
    };

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      finish();
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;

      script.onerror = () => {
        apiLoadingPromise = null;

        if (!settled) {
          settled = true;
          reject(
            new Error("ไม่สามารถโหลด YouTube IFrame API ได้"),
          );
        }
      };

      document.head.appendChild(script);
    } else if (window.YT?.Player) {
      finish();
    }
  });

  return apiLoadingPromise;
}

function mapPlayerState(state: number): YouTubePlayerState {
  const states = window.YT?.PlayerState;

  if (!states) return "unstarted";

  if (state === states.PLAYING) return "playing";
  if (state === states.PAUSED) return "paused";
  if (state === states.ENDED) return "ended";
  if (state === states.BUFFERING) return "buffering";
  if (state === states.CUED) return "cued";

  return "unstarted";
}

export default function YouTubePlayer({
  videoId = null,
  volume = 65,
  autoplay = false,
  onReady,
  onControlsReady,
  onStateChange,
  onError,
}: YouTubePlayerOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  const latestVideoIdRef = useRef(videoId);
  const latestVolumeRef = useRef(volume);
  const latestAutoplayRef = useRef(autoplay);

  const onReadyRef = useRef(onReady);
  const onControlsReadyRef = useRef(onControlsReady);
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);

  const [isReady, setIsReady] = useState(false);

  latestVideoIdRef.current = videoId;
  latestVolumeRef.current = volume;
  latestAutoplayRef.current = autoplay;

  onReadyRef.current = onReady;
  onControlsReadyRef.current = onControlsReady;
  onStateChangeRef.current = onStateChange;
  onErrorRef.current = onError;

  const createPlayer = useCallback(async () => {
    const container = containerRef.current;

    if (!container || playerRef.current) return;

    try {
      await loadYouTubeAPI();

      if (!containerRef.current || playerRef.current) return;

      const target = document.createElement("div");
      target.id = `youtube-player-${Math.random()
        .toString(36)
        .slice(2)}`;

      container.appendChild(target);

      const player = new window.YT!.Player(target.id, {
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
            const readyPlayer = event.target;

            playerRef.current = readyPlayer;

            readyPlayer.setVolume(
              Math.max(
                0,
                Math.min(100, latestVolumeRef.current),
              ),
            );

            onControlsReadyRef.current?.({
              play: () => {
                readyPlayer.playVideo();
              },

              pause: () => {
                readyPlayer.pauseVideo();
              },

              loadVideo: (nextVideoId: string) => {
                if (!nextVideoId.trim()) return;
                readyPlayer.loadVideoById(nextVideoId);
              },
            });

            setIsReady(true);
            onReadyRef.current?.();

            // ใช้ autoplay เฉพาะกรณีที่ระบุไว้
            // การเปลี่ยนเพลงปกติให้ Provider เป็นผู้สั่ง loadVideo
            const currentVideoId = latestVideoIdRef.current;

            if (currentVideoId && latestAutoplayRef.current) {
              readyPlayer.loadVideoById(currentVideoId);
            }
          },

          onStateChange: (event) => {
            onStateChangeRef.current?.(
              mapPlayerState(event.data),
            );
          },

          onError: (event) => {
            onErrorRef.current?.(event.data);
          },
        },
      });

      playerRef.current = player;
    } catch (error) {
      console.error(
        "YouTube Player initialization failed:",
        error,
      );

      onErrorRef.current?.(-1);
    }
  }, []);

  useEffect(() => {
    void createPlayer();

    return () => {
      const player = playerRef.current;

      playerRef.current = null;

      if (player?.destroy) {
        player.destroy();
      }

      if (containerRef.current) {
        containerRef.current.replaceChildren();
      }
    };
  }, [createPlayer]);

  useEffect(() => {
    const player = playerRef.current;

    if (!isReady || !player) return;

    const safeVolume = Math.max(0, Math.min(100, volume));
    player.setVolume(safeVolume);
  }, [volume, isReady]);

  return (
    <div
      ref={containerRef}
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
      data-youtube-player="true"
    />
  );
}
