
"use client";

import VolumeControl from "./VolumeControl";
import { useMusicPlayer } from "./music/MusicPlayerProvider";

export default function PlayerVolume() {
  const { volume, setVolume } = useMusicPlayer();

  return (
    <VolumeControl
      volume={volume}
      onVolumeChange={setVolume}
    />
  );
}
