// Busca o RSS público do Letterboxd do Isaac e grava data/letterboxd.js
// Roda sozinho no GitHub Actions (.github/workflows/letterboxd.yml). Node 18+.
import { readFile, writeFile } from "node:fs/promises";

const USER = "isaacalexandre";
const LIMIT = 4; // o site mostra as 4 últimas fitas
const res = await fetch(`https://letterboxd.com/${USER}/rss/`, {
  headers: { "User-Agent": "Mozilla/5.0 (portfolio feed reader)" },
});
if (!res.ok) throw new Error(`RSS respondeu ${res.status}`);
const xml = await res.text();

const decode = (s = "") =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
   .replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
   .trim();
const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};
const clip = (s, n = 280) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
};

const films = [];
for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const title = tag(item, "letterboxd:filmTitle");
  if (!title) continue; // ignora listas
  const desc = tag(item, "description");
  const poster = (desc.match(/<img src="([^"]+)"/) || [])[1] || "";
  const review = desc
    .replace(/<p><img[^>]*\/?><\/p>/, "")
    .replace(/<p>Watched on [^<]*<\/p>/, "")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const rating = tag(item, "letterboxd:memberRating");
  films.push({
    title,
    year: tag(item, "letterboxd:filmYear"),
    rating: rating ? Number(rating) : null,
    liked: tag(item, "letterboxd:memberLike") === "Yes",
    rewatch: tag(item, "letterboxd:rewatch") === "Yes",
    watched: tag(item, "letterboxd:watchedDate"),
    link: tag(item, "link"),
    poster,
    review: "", // o widget não exibe resenhas
  });
  if (films.length >= LIMIT) break;
}

const out = new URL("../data/letterboxd.js", import.meta.url);
// só regrava se a lista de filmes mudou (evita commits vazios)
try {
  const old = await readFile(out, "utf8");
  const prev = JSON.parse(old.slice(old.indexOf("{"), old.lastIndexOf("}") + 1));
  if (JSON.stringify(prev.films) === JSON.stringify(films)) {
    console.log("sem novidades");
    process.exit(0);
  }
} catch {}

const data = { updated: new Date().toISOString(), profile: `https://letterboxd.com/${USER}/`, films };
await writeFile(
  out,
  "/* Gerado automaticamente a partir do RSS do Letterboxd (scripts/update-letterboxd.mjs). */\n" +
  "window.LETTERBOXD = " + JSON.stringify(data, null, 1) + ";\n"
);
console.log(`ok: ${films.length} filmes`);
