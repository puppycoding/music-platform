const fs = require("node:fs");
const path = require("node:path");
const catalog = require("../src/data/music-catalog/index.ts").default;
function auditData(catalog) {
    const errors = [],
        warnings = [];
    const sets = {};
    for (const kind of ["artists", "albums", "songs"]) {
        sets[kind] = new Set();
        for (const item of catalog[kind]) {
            if (sets[kind].has(item.id)) errors.push(kind + ": duplicate " + item.id);
            sets[kind].add(item.id);
        }
    }
    for (const album of catalog.albums) {
        for (const id of album.artist_ids ??
            (album.artist_id ? [album.artist_id] : []))
            if (!sets.artists.has(id))
                errors.push(album.id + ": missing artist " + id);
    }
    for (const song of catalog.songs) {
        for (const id of song.artist_ids ?? [])
            if (!sets.artists.has(id))
                errors.push(song.id + ": missing artist " + id);
        if (song.album_id && !sets.albums.has(song.album_id))
            errors.push(song.id + ": missing album " + song.album_id);
        if (song.duration_seconds == null)
            warnings.push(song.id + ": missing duration");
        else if (
            !Number.isFinite(song.duration_seconds) ||
            song.duration_seconds <= 0
        )
            errors.push(song.id + ": invalid duration");
        const video = song.providers?.youtube?.video_id;
        if (!video || !/^[-_a-zA-Z0-9]{11}$/.test(video))
            warnings.push(song.id + ": missing or malformed video ID");
    }
    for (const kind of ["artists", "albums", "songs"])
        for (const item of catalog[kind])
            for (const key of ["image_url", "cover_url"]) {
                const url = item[key];
                if (!url) continue;
                if (url.startsWith("/")) {
                    if (!fs.existsSync(path.join(__dirname, "../public", url)))
                        errors.push(item.id + ": missing asset " + url);
                } else {
                    try {
                        const parsed = new URL(url);
                        if (!["https:", "http:"].includes(parsed.protocol))
                            errors.push(item.id + ": invalid image protocol");
                    } catch {
                        errors.push(item.id + ": malformed image URL");
                    }
                }
            }
    return {
        counts: Object.fromEntries(
            Object.entries(sets).map(([key, value]) => [key, value.size]),
        ),
        errors,
        warnings,
        remoteUrls:
            "Syntax checked only; remote reachability and playable YouTube availability require network/manual verification.",
    };
}
module.exports = { auditData };
if (require.main === module) {
    const result = auditData(catalog);
    console.log(JSON.stringify(result, null, 2));
    if (result.errors.length) process.exitCode = 1;
}
