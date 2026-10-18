
"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import catalog from "../../../data/music-catalog";

type Artist = {
    id: string;
    name: string;
    image_url?: string | null;
    country?: string;
};

type Album = {
    id: string;
    title: string;
    artist_ids?: string[];
    artist_id?: string;
    artistId?: string;
    release_year?: number | null;
    album_type?: string;
    cover_url?: string | null;
};

type Catalog = {
    artists: Artist[];
    albums: Album[];
};

const musicCatalog = catalog as unknown as Catalog;

export default function ArtistDetailPage() {
    const params = useParams<{ artistId: string }>();
    const artistId = decodeURIComponent(params.artistId ?? "");

    const artist = (musicCatalog.artists ?? []).find(
        (item) => item.id === artistId
    );

    const albums = (musicCatalog.albums ?? []).filter((album) => {
        const artistIds = [
            ...(album.artist_ids ?? []),
            ...(album.artist_id ? [album.artist_id] : []),
            ...(album.artistId ? [album.artistId] : []),
        ];

        return artistIds.includes(artistId);
    });

    if (!artist) {
        return (
            <main className="relative min-h-screen overflow-hidden bg-[#0d0b12] px-4 py-12 text-[#f5f3ff] sm:px-6 lg:px-10">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-700/10 blur-[100px]"
                />

                <div className="relative mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#191522] text-3xl text-violet-300">
                        ♫
                    </div>

                    <h1 className="mt-5 text-2xl font-bold">
                        ไม่พบศิลปิน
                    </h1>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                        ศิลปินที่คุณเลือกอาจไม่มีอยู่ในแค็ตตาล็อก
                        หรือข้อมูลอาจถูกเปลี่ยนแปลง
                    </p>

                    <Link
                        href="/artists"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0b12]"
                    >
                        ดูศิลปินทั้งหมด
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0d0b12] text-[#f5f3ff]">
            {/* Background */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-violet-950/20 via-[#171020]/10 to-transparent"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-violet-700/[0.08] blur-[120px]"
            />

            <div className="relative mx-auto max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-10">
                {/* Artist profile */}
                <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#15121c]">
                    {artist.image_url && (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                        >
                            <Image
                                src={artist.image_url}
                                fill
                                sizes="(max-width: 1440px) 100vw, 1440px"
                                unoptimized={!artist.image_url.startsWith("/")}
                                alt=""
                                className="h-full w-full scale-110 object-cover opacity-[0.08] blur-3xl"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#15121c] via-[#15121c]/95 to-[#21172d]/70" />
                        </div>
                    )}

                    <div className="relative flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center md:gap-8 lg:gap-10 lg:p-9">
                        <div className="relative mx-auto w-full max-w-[210px] shrink-0 sm:max-w-[240px] md:mx-0 md:w-[220px] lg:w-[250px]">
                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#38234f] via-[#21172d] to-[#100d16]">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-8xl font-black text-white/15">
                                        {artist.name.slice(0, 1).toUpperCase()}
                                    </span>
                                </div>

                                {artist.image_url && (
                                    <Image
                                        src={artist.image_url}
                                        fill
                                        sizes="(max-width: 640px) 210px, (max-width: 768px) 240px, 250px"
                                        unoptimized={!artist.image_url.startsWith("/")}
                                        alt={artist.name}
                                        className="z-10 object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = "none";
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="min-w-0 flex-1 text-center md:text-left">
                            <p className="text-xs font-semibold tracking-[0.18em] text-violet-300">
                                ARTIST PROFILE
                            </p>

                            <h1 className="mt-3 break-words text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {artist.name}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-sm text-zinc-400 md:justify-start">
                                {artist.country && (
                                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            className="h-4 w-4 text-violet-300"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" />
                                            <circle cx="12" cy="9" r="2.3" />
                                        </svg>
                                        {artist.country}
                                    </span>
                                )}

                                <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        className="h-4 w-4 text-violet-300"
                                        aria-hidden="true"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="3" />
                                        <path d="M3 9h18M9 3v18" />
                                    </svg>
                                    {albums.length} อัลบั้ม
                                </span>
                            </div>

                            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400 md:mx-0 sm:text-base">
                                สำรวจผลงานและอัลบั้มของ {artist.name} แล้วเลือกอัลบั้มที่คุณต้องการเพื่อค้นพบรายชื่อเพลง
                            </p>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                <a
                                    href="#artist-albums"
                                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                                >
                                    สำรวจอัลบั้ม
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 5v14m-7-7 7 7 7-7" />
                                    </svg>
                                </a>

                                <span className="inline-flex items-center gap-2 px-1 py-2 text-xs text-zinc-500">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Music Platform
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Albums section */}
                <section
                    id="artist-albums"
                    className="mt-10 scroll-mt-24 sm:mt-14"
                >
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.18em] text-violet-400">
                                DISCOVER THE MUSIC
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                อัลบั้มของศิลปิน
                            </h2>

                            <p className="mt-2 text-sm text-zinc-400">
                                เลือกอัลบั้มเพื่อดูรายชื่อเพลงทั้งหมด
                            </p>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.07] bg-[#15121c] px-3 py-2 text-sm text-zinc-400">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-4 w-4 text-violet-300"
                                aria-hidden="true"
                            >
                                <rect x="3" y="4" width="18" height="17" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {albums.length} รายการ
                        </div>
                    </div>

                    {albums.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.07] bg-[#15121c] px-5 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/[0.08] text-3xl text-violet-300">
                                ♫
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-white">
                                ยังไม่มีอัลบั้ม
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                ขณะนี้ยังไม่มีข้อมูลอัลบั้มของศิลปินนี้ในแค็ตตาล็อก
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {albums.map((album) => (
                                <Link
                                    key={album.id}
                                    href={`/artists/${encodeURIComponent(
                                        artist.id
                                    )}/albums/${encodeURIComponent(album.id)}`}
                                    className="group min-w-0 rounded-2xl border border-white/[0.07] bg-[#15121c] p-3.5 transition duration-200 hover:border-violet-500/35 hover:bg-[#1a1523] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:p-4"
                                >
                                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#38234f] via-[#21172d] to-[#100d16]">
                                        {album.cover_url ? (
                                            <img
                                                src={album.cover_url}
                                                alt={album.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-6xl text-white/15">
                                                    ♫
                                                </span>
                                            </div>
                                        )}

                                        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.06]" />
                                    </div>

                                    <div className="px-1 pb-1 pt-4">
                                        <h3
                                            className="truncate text-base font-semibold text-zinc-100 transition-colors group-hover:text-violet-300"
                                            title={album.title}
                                        >
                                            {album.title}
                                        </h3>

                                        <p className="mt-1.5 text-sm text-zinc-400">
                                            {album.release_year ?? "ไม่ระบุปี"}
                                        </p>

                                        {album.album_type && (
                                            <span className="mt-3 inline-flex max-w-full truncate rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-400">
                                                {album.album_type}
                                            </span>
                                        )}

                                        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                                            <span className="text-sm font-medium text-violet-300">
                                                ดูรายชื่อเพลง
                                            </span>

                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-violet-300"
                                                aria-hidden="true"
                                            >
                                                <path d="M5 12h14m-6-6 6 6-6 6" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Bottom note */}
                {albums.length > 0 && (
                    <div className="mt-10 flex items-center justify-center gap-3 text-center text-xs text-zinc-600">
                        <span className="h-px w-8 bg-white/10" />
                        <span>
                            แสดงอัลบั้มทั้งหมด {albums.length} รายการ
                        </span>
                        <span className="h-px w-8 bg-white/10" />
                    </div>
                )}
            </div>
        </main>
    );
}
