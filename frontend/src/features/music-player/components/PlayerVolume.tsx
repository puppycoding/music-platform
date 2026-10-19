"use client";

import VolumeControl from "./VolumeControl";
import { useMusicPlayer } from "../providers/MusicPlayerProvider";

export default function PlayerVolume() {
  const { volume, setVolume } = useMusicPlayer();

  return <VolumeControl volume={volume} onVolumeChange={setVolume} />;
}
