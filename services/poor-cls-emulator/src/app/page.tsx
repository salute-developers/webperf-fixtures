import Link from 'next/link';
import Script from 'next/script';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_CLS = 1;

function clampNumber(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function parseCls(value: string | undefined) {
    if (!value) return 0;

    const normalized = value.replace(',', '.');
    const parsed = Number.parseFloat(normalized);

    if (!Number.isFinite(parsed)) return 0;

    return clampNumber(parsed, 0, MAX_CLS);
}

type PageProps = {
    searchParams: Promise<{
        CLS?: string;
    }>;
};

export default async function Home({ searchParams }: Readonly<PageProps>) {
    const params = await searchParams;
    const requestedCls = parseCls(params.CLS);

    const script = `
(function () {
  var targetCls = ${requestedCls};
  if (!(targetCls > 0)) return;

  function inject() {
    var vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!(vh > 0)) return;

    var bannerHeightPx = Math.round(targetCls * vh);
    if (!(bannerHeightPx > 0)) return;

    var root = document.getElementById('cls-root');
    if (!root) return;

    var existing = root.querySelector('.shiftBanner');
    if (existing) {
      existing.style.height = bannerHeightPx + 'px';
      var existingInner = existing.querySelector('.shiftBannerInner');
      if (existingInner) {
        existingInner.textContent = 'Injected banner: ' + bannerHeightPx + 'px (target CLS=' + targetCls + ')';
      }
      return;
    }

    var banner = document.createElement('div');
    banner.className = 'shiftBanner';
    banner.style.height = bannerHeightPx + 'px';

    var inner = document.createElement('div');
    inner.className = 'shiftBannerInner';
    inner.textContent = 'Injected banner: ' + bannerHeightPx + 'px (target CLS=' + targetCls + ')';

    banner.appendChild(inner);
    root.insertBefore(banner, root.firstChild);
  }

  function schedule() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(inject, 50);
      });
    });
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
})();`;

    return (
        <main className="container" id="cls-root">
            <div className="header">
                <h1 className="title">Speed CLS Emulator</h1>
                <p className="subtitle">
                    Используй query параметр: <code>?CLS=0.8</code>. Параметр mode не нужен.
                </p>
            </div>

            <div className="controls">
                <Link className="linkCard" href="/?CLS=0">
                    <div className="linkTitle">CLS=0</div>
                    <div className="linkDesc">Без инъекции баннера</div>
                </Link>
                <Link className="linkCard" href="/?CLS=0.1">
                    <div className="linkTitle">CLS=0.1</div>
                    <div className="linkDesc">Good</div>
                </Link>
                <Link className="linkCard" href="/?CLS=0.25">
                    <div className="linkTitle">CLS=0.25</div>
                    <div className="linkDesc">Needs improvement</div>
                </Link>
                <Link className="linkCard" href="/?CLS=0.8">
                    <div className="linkTitle">CLS=0.8</div>
                    <div className="linkDesc">Poor</div>
                </Link>
            </div>

            <div className="info">
                <div className="infoCard">
                    <p className="infoLabel">requested CLS</p>
                    <p className="infoValue">{requestedCls}</p>
                </div>
                <div className="infoCard">
                    <p className="infoLabel">shift technique</p>
                    <p className="infoValue">top banner injection</p>
                </div>
                <div className="infoCard">
                    <p className="infoLabel">banner height</p>
                    <p className="infoValue">~{Math.round(requestedCls * 100)}vh (approx)</p>
                </div>
            </div>

            <div className="viewportBox">
                <div className="hero">
                    <div className="heroInner">
                        <h2 className="heroTitle">Content that fills the viewport</h2>
                        <p className="heroText">
                            Этот блок специально занимает весь viewport по высоте. Когда сверху вставится баннер, весь
                            контент сдвинется вниз, и это должно дать контролируемый CLS.
                        </p>
                    </div>
                </div>
            </div>

            <Script id="cls-injector" strategy="afterInteractive">
                {script}
            </Script>
        </main>
    );
}
