
"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ artistId: string }>();

    const artistId = decodeURIComponent(params.artistId ?? "");

    const artist = (musicCatalog.artists ?? []).find(
        (item) => item.id === artistId
    );

    const albums = (musicCatalog.albums ?? []).filter((album) =>
        album.artist_ids?.includes(artistId)
    );

    // ย้อนกลับไปยังหน้าที่เข้ามา หากมาจากหน้าค้นหา
    // ถ้าไม่ได้มาจากหน้าค้นหา ให้กลับไปหน้ารวมศิลปิน

    const handleBack = () => {
        // ใช้ returnTo จาก URL ก่อน เพื่อให้รู้แน่นอนว่ามาจากหน้าค้นหา

        const returnTo = searchParams.get("returnTo");
        const savedPath = sessionStorage.getItem("artistDetailReturnTo");

        if (returnTo === "/search" || savedPath?.startsWith("/search")) {
            sessionStorage.removeItem("artistDetailReturnTo");
            router.replace(savedPath?.startsWith("/search") ? savedPath : "/search");
            return;
        }

        sessionStorage.removeItem("artistDetailReturnTo");
        router.replace("/artists");
    };


    if (!artist) {
        return (
            <main className="min-h-screen bg-[#0d0b12] px-4 py-12 text-[#f5f3ff] sm:px-6">
                <div className="mx-auto max-w-5xl">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                        aria-label="ย้อนกลับ"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span>ย้อนกลับ</span>
                    </button>

                    <div className="mt-8 rounded-2xl border border-[#302a3b] bg-[#191522] p-8 text-center">
                        <h1 className="text-2xl font-bold">ไม่พบศิลปิน</h1>
                        <p className="mt-2 text-zinc-400">
                            ศิลปินที่คุณเลือกอาจไม่มีอยู่ในแค็ตตาล็อก
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0d0b12] px-4 py-8 text-[#f5f3ff] sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                {/* ปุ่มย้อนกลับ */}
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 rounded-full p-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-violet-300"
                    aria-label="ย้อนกลับ"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    ย้อนกลับ
                </button>

                {/* Artist information */}
                <section className="mt-6 flex flex-col gap-6 rounded-3xl border border-[#302a3b] bg-gradient-to-br from-[#241b32] to-[#191522] p-5 sm:flex-row sm:items-center sm:p-8">
                    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700/50 to-[#191522] sm:h-44 sm:w-44">
                        <span className="absolute text-6xl font-bold text-white/25">
                            {artist.name.slice(0, 1).toUpperCase()}
                        </span>

                        {artist.image_url && (
                            <img
                                src={artist.image_url}
                                alt={artist.name}
                                className="relative z-10 h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-medium text-violet-300">ARTIST</p>

                        <h1 className="mt-2 break-words text-3xl font-bold sm:text-5xl">
                            {artist.name}
                        </h1>

                        {artist.country && (
                            <p className="mt-3 text-sm text-zinc-400">
                                ประเทศ: {artist.country}
                            </p>
                        )}

                        <p className="mt-3 text-sm text-zinc-400">
                            {albums.length} อัลบั้ม
                        </p>
                    </div>
                </section>

                {/* Artist albums */}
                <section className="mt-10">
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold">อัลบั้มของศิลปิน</h2>

                        <p className="mt-1 text-sm text-zinc-400">
                            เลือกอัลบั้มเพื่อดูรายชื่อเพลง
                        </p>
                    </div>

                    {albums.length === 0 ? (
                        <div className="rounded-2xl border border-[#302a3b] bg-[#191522] p-8 text-center">
                            <p className="text-zinc-400">
                                ยังไม่มีอัลบั้มของศิลปินนี้
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                            {albums.map((album) => (
                                <Link
                                    key={album.id}
                                    href={`/artists/${encodeURIComponent(
                                        artist.id
                                    )}/albums/${encodeURIComponent(album.id)}`}
                                    className="group min-w-0 rounded-2xl border border-[#302a3b] bg-[#191522] p-3 transition hover:-translate-y-1 hover:border-violet-500/60 hover:bg-[#211a2d]"
                                >
                                    <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#35234f] to-[#191522]">
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <span className="text-5xl text-white/20">♫</span>
                                        </div>

                                        {album.cover_url && (
                                            <img
                                                src={album.cover_url}
                                                alt={album.title}
                                                loading="lazy"
                                                className="relative z-10 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                            />
                                        )}
                                    </div>

                                    <h3 className="truncate font-semibold text-white transition group-hover:text-violet-300">
                                        {album.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        {album.release_year ?? "ไม่ระบุปี"}
                                    </p>

                                    {album.album_type && (
                                        <p className="mt-1 text-xs capitalize text-zinc-500">
                                            {album.album_type}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}