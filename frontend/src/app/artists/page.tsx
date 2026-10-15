
"use client";

import Link from "next/link";
import catalog from "../../data/music-catalog";

type Artist = {
  id: string;
  name: string;
  image_url?: string | null;
  country?: string;
};

type Catalog = {
  artists: Artist[];
};

const musicCatalog = catalog as unknown as Catalog;
const artists = musicCatalog.artists ?? [];

export default function ArtistsPage() {
  return (
    <main className="min-h-screen bg-[#0d0b12] px-4 py-8 text-[#f5f3ff] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-violet-400">
            MUSIC PLATFORM
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            ศิลปินทั้งหมด
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            ค้นพบศิลปินและอัลบั้มเพลงที่คุณชื่นชอบ
          </p>
        </div>

        {artists.length === 0 ? (
          <div className="rounded-2xl border border-[#302a3b] bg-[#191522] p-10 text-center">
            <p className="text-zinc-400">ยังไม่มีข้อมูลศิลปิน</p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-zinc-400">
              {artists.length} ศิลปิน
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${encodeURIComponent(artist.id)}`}
                  className="group min-w-0 rounded-2xl border border-[#302a3b] bg-[#191522] p-3 transition hover:-translate-y-1 hover:border-violet-500/60 hover:bg-[#211a2d]"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#35234f] to-[#191522]">
                    {artist.image_url && (
                      <img
                        src={artist.image_url}
                        alt={artist.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/20">
                        {artist.name.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h2 className="truncate font-semibold text-white transition group-hover:text-violet-300">
                    {artist.name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">ศิลปิน</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
