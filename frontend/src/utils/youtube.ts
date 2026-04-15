const RX_EMBED = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i;
const RX_SHORTS = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i;
const RX_WATCH = /[?&]v=([a-zA-Z0-9_-]{11})/;
const RX_YOUTU = /youtu\.be\/([a-zA-Z0-9_-]{11})/i;

/**
 * Normalize watch / shorts / youtu.be links to youtube.com/embed/VIDEO_ID for iframes.
 */
export function toYouTubeEmbedUrl(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  const u = input.trim();

  let m = u.match(RX_EMBED);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  m = u.match(RX_SHORTS);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  m = u.match(RX_YOUTU);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  m = u.match(RX_WATCH);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  return null;
}
