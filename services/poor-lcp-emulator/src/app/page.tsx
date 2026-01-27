import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_LCP_MS = 60_000;

function clampInt(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function parseLcpMs(value: string | undefined) {
    if (!value) return 0;

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed)) return 0;

    return clampInt(parsed, 0, MAX_LCP_MS);
}

async function sleep(ms: number) {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
}

function svgDataUri(params: { width: number; height: number; title: string; subtitle: string }) {
    const { width, height, title, subtitle } = params;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c3aed"/>
      <stop offset="0.5" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="blur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="#0b0f19"/>
  <circle cx="${Math.round(width * 0.2)}" cy="${Math.round(height * 0.35)}" r="${Math.round(
      Math.min(width, height) * 0.22,
  )}" fill="url(#g)" opacity="0.9" filter="url(#blur)"/>
  <circle cx="${Math.round(width * 0.78)}" cy="${Math.round(height * 0.55)}" r="${Math.round(
      Math.min(width, height) * 0.18,
  )}" fill="url(#g)" opacity="0.75" filter="url(#blur)"/>
  <rect x="${Math.round(width * 0.06)}" y="${Math.round(height * 0.12)}" width="${Math.round(
      width * 0.88,
  )}" height="${Math.round(height * 0.76)}" rx="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
  <text x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.32)}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="56" font-weight="700" fill="#e6eaf2">
    ${title}
  </text>
  <text x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.4)}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="26" font-weight="500" fill="rgba(230,234,242,0.8)">
    ${subtitle}
  </text>
  <text x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.76)}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="18" font-weight="500" fill="rgba(230,234,242,0.65)">
    Largest Contentful Paint candidate
  </text>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type PageProps = {
    searchParams: Promise<{
        LCP?: string;
        mode?: string;
    }>;
};

export default async function Home({ searchParams }: Readonly<PageProps>) {
    const params = await searchParams;
    const mode = params.mode === 'server' ? 'server' : 'image';
    const requestedLcpMs = parseLcpMs(params.LCP);

    if (mode === 'server') {
        await sleep(requestedLcpMs);
    }

    const imgSrc =
        mode === 'image'
            ? `/api/image?delay=${requestedLcpMs}`
            : svgDataUri({
                  width: 1440,
                  height: 810,
                  title: 'Speed LCP Emulator',
                  subtitle: `mode=server, LCP=${requestedLcpMs}ms`,
              });

    return (
        <main className="container">
            <div className="header">
                <h1 className="title">Speed LCP Emulator</h1>
                <p className="subtitle">
                    Используй query параметры: <code>?LCP=3000</code> и <code>&amp;mode=server</code>.
                </p>
            </div>

            <div className="controls">
                <Link className="linkCard" href="/?LCP=0">
                    <div className="linkTitle">LCP=0ms</div>
                    <div className="linkDesc">Быстрая загрузка (mode=image)</div>
                </Link>
                <Link className="linkCard" href="/?LCP=3000">
                    <div className="linkTitle">LCP=3000ms</div>
                    <div className="linkDesc">Задержка LCP через отложенную загрузку изображения</div>
                </Link>
                <Link className="linkCard" href="/?LCP=3000&mode=server">
                    <div className="linkTitle">LCP=3000ms, mode=server</div>
                    <div className="linkDesc">Задержка LCP через server-side задержку рендера</div>
                </Link>
            </div>

            <div className="info">
                <div className="infoCard">
                    <p className="infoLabel">mode</p>
                    <p className="infoValue">{mode}</p>
                </div>
                <div className="infoCard">
                    <p className="infoLabel">requested LCP</p>
                    <p className="infoValue">{requestedLcpMs}ms</p>
                </div>
                <div className="infoCard">
                    <p className="infoLabel">LCP element</p>
                    <p className="infoValue">{mode === 'image' ? '/api/image' : 'data URI SVG'}</p>
                </div>
            </div>

            <div className="lcpBox">
                {/* eslint-disable-next-line @next/next/no-img-element -- intentionally using <img> for LCP testing without Next.js optimization */}
                <img
                    className="lcpImage"
                    src={imgSrc}
                    alt="LCP element"
                    width={1440}
                    height={810}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                />
            </div>
        </main>
    );
}
