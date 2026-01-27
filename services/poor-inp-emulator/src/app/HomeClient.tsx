'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Mode = 'sync' | 'setTimeout' | 'raf';

const MAX_INP_MS = 60_000;

function clampInt(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function parseMs(value: string | null) {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 0;
    return clampInt(parsed, 0, MAX_INP_MS);
}

function parseMode(value: string | null): Mode {
    if (value === 'setTimeout') return 'setTimeout';
    if (value === 'raf') return 'raf';
    return 'sync';
}

function blockMainThread(ms: number) {
    if (ms <= 0) return;
    const start = performance.now();
    while (performance.now() - start < ms) {
        // busy loop
    }
}

type LastInteraction = {
    name: string;
    startTime: number;
    duration: number;
    processingStart?: number;
    processingEnd?: number;
    interactionId?: number;
};

function formatMs(ms: number) {
    return `${Math.round(ms)}ms`;
}

function buildHref(pathname: string, params: URLSearchParams, patch: Record<string, string | null>) {
    const nextParams = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
        if (value === null) nextParams.delete(key);
        else nextParams.set(key, value);
    }
    const qs = nextParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}

export function HomeClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const inpMs = useMemo(() => parseMs(searchParams.get('INP')), [searchParams]);
    const mode = useMemo(() => parseMode(searchParams.get('mode')), [searchParams]);

    const [clicks, setClicks] = useState(0);
    const [isBusy, setIsBusy] = useState(false);
    const [last, setLast] = useState<LastInteraction | null>(null);
    const observerSupported = typeof PerformanceObserver !== 'undefined';
    const lastInteractionIdRef = useRef<number | null>(null);
    const pendingInteractionRef = useRef<string | null>(null);

    useEffect(() => {
        if (!observerSupported) return;

        let observer: PerformanceObserver | null = null;

        try {
            observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType !== 'event') continue;
                    const anyEntry = entry as unknown as {
                        name: string;
                        startTime: number;
                        duration: number;
                        processingStart?: number;
                        processingEnd?: number;
                        interactionId?: number;
                    };

                    const interactionId =
                        typeof anyEntry.interactionId === 'number' ? anyEntry.interactionId : undefined;

                    if (interactionId !== undefined && interactionId === lastInteractionIdRef.current) {
                        continue;
                    }

                    if (interactionId !== undefined) {
                        lastInteractionIdRef.current = interactionId;
                    }

                    const interesting =
                        anyEntry.name === 'click' ||
                        anyEntry.name === 'pointerdown' ||
                        anyEntry.name === 'keydown' ||
                        anyEntry.name === 'keyup';

                    if (!interesting) continue;

                    const pendingName = pendingInteractionRef.current;
                    pendingInteractionRef.current = null;

                    setLast({
                        name: pendingName ? `${anyEntry.name} (${pendingName})` : anyEntry.name,
                        startTime: anyEntry.startTime,
                        duration: anyEntry.duration,
                        processingStart: anyEntry.processingStart,
                        processingEnd: anyEntry.processingEnd,
                        interactionId,
                    });
                }
            });

            observer.observe({
                type: 'event',
                buffered: true,
                durationThreshold: 0,
            } as unknown as PerformanceObserverInit);
        } catch {
            if (observer) observer.disconnect();
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [observerSupported]);

    function setQuery(patch: Record<string, string | null>) {
        const href = buildHref(pathname, new URLSearchParams(searchParams.toString()), patch);
        router.push(href);
    }

    function runInteraction(label: string, workMs: number) {
        pendingInteractionRef.current = label;

        if (mode === 'sync') {
            setIsBusy(true);
            blockMainThread(workMs);
            setClicks((v) => v + 1);
            setIsBusy(false);
            return;
        }

        if (mode === 'setTimeout') {
            setIsBusy(true);
            window.setTimeout(() => {
                setClicks((v) => v + 1);
                setIsBusy(false);
            }, workMs);
            return;
        }

        setIsBusy(true);
        requestAnimationFrame(() => {
            blockMainThread(workMs);
            setClicks((v) => v + 1);
            setIsBusy(false);
        });
    }

    const href0 = buildHref(pathname, new URLSearchParams(searchParams.toString()), { INP: '0' });
    const href200 = buildHref(pathname, new URLSearchParams(searchParams.toString()), { INP: '200' });
    const href500 = buildHref(pathname, new URLSearchParams(searchParams.toString()), { INP: '500' });
    const href3000 = buildHref(pathname, new URLSearchParams(searchParams.toString()), { INP: '3000' });

    const hrefSync = buildHref(pathname, new URLSearchParams(searchParams.toString()), { mode: 'sync' });
    const hrefTimeout = buildHref(pathname, new URLSearchParams(searchParams.toString()), { mode: 'setTimeout' });
    const hrefRaf = buildHref(pathname, new URLSearchParams(searchParams.toString()), { mode: 'raf' });

    return (
        <main className="container">
            <div className="header">
                <h1 className="title">Speed INP Emulator</h1>
                <p className="subtitle">
                    Query параметры: <code>?INP=3000</code> и <code>&amp;mode=sync</code>. Для плохого INP используем{' '}
                    <span className="kbd">mode=sync</span> и большую задержку.
                </p>
            </div>

            <div className="controls">
                <Link className="linkCard" href={href0}>
                    <div className="linkTitle">INP=0ms</div>
                    <div className="linkDesc">Нормальная отзывчивость</div>
                </Link>
                <Link className="linkCard" href={href200}>
                    <div className="linkTitle">INP=200ms</div>
                    <div className="linkDesc">На грани «плохо» для быстрых устройств</div>
                </Link>
                <Link className="linkCard" href={href500}>
                    <div className="linkTitle">INP=500ms</div>
                    <div className="linkDesc">Заметная деградация ввода</div>
                </Link>
                <Link className="linkCard" href={href3000}>
                    <div className="linkTitle">INP=3000ms</div>
                    <div className="linkDesc">Очень плохой INP (длинные задачи)</div>
                </Link>
            </div>

            <div className="grid">
                <div className="card">
                    <p className="label">mode</p>
                    <p className="value">{mode}</p>
                </div>
                <div className="card">
                    <p className="label">requested INP</p>
                    <p className="value">{formatMs(inpMs)}</p>
                </div>
                <div className="card">
                    <p className="label">clicks</p>
                    <p className="value">{clicks}</p>
                </div>
                <div className="card">
                    <p className="label">PerformanceObserver(event)</p>
                    <p className="value">{observerSupported ? 'supported' : 'not supported'}</p>
                </div>
            </div>

            <div className="panel">
                <div className="row">
                    <button
                        className="btn btnPrimary"
                        type="button"
                        onPointerDown={() => runInteraction('primary-button', inpMs)}
                        aria-busy={isBusy}
                    >
                        PointerDown: emulate {formatMs(inpMs)}
                    </button>

                    <button
                        className="btn"
                        type="button"
                        onClick={() => runInteraction('click-button', inpMs)}
                        aria-busy={isBusy}
                    >
                        Click: emulate {formatMs(inpMs)}
                    </button>

                    <button
                        className="btn btnDanger"
                        type="button"
                        onClick={() => {
                            pendingInteractionRef.current = 'reset';
                            setClicks(0);
                            setLast(null);
                        }}
                    >
                        Reset
                    </button>

                    <span className="pill">Try: mode {mode}</span>
                    <span className="pill">Main thread work: {formatMs(inpMs)}</span>
                    <span className="pill">Busy: {isBusy ? 'yes' : 'no'}</span>
                </div>

                <div className="divider" />

                <div className="row">
                    <input
                        className="input"
                        placeholder="Type here (keydown will be measured)"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                runInteraction('input-enter', inpMs);
                            } else {
                                runInteraction('input-keydown', Math.min(inpMs, 250));
                            }
                        }}
                    />

                    <button className="btn" type="button" onClick={() => setQuery({ INP: '50' })}>
                        Set INP=50
                    </button>
                    <button className="btn" type="button" onClick={() => setQuery({ INP: '200' })}>
                        Set INP=200
                    </button>
                    <button className="btn" type="button" onClick={() => setQuery({ INP: '800' })}>
                        Set INP=800
                    </button>
                    <button className="btn" type="button" onClick={() => setQuery({ INP: '3000' })}>
                        Set INP=3000
                    </button>
                </div>

                <div className="divider" />

                <div className="row">
                    <Link className="btn" href={hrefSync}>
                        mode=sync
                    </Link>
                    <Link className="btn" href={hrefTimeout}>
                        mode=setTimeout
                    </Link>
                    <Link className="btn" href={hrefRaf}>
                        mode=raf
                    </Link>
                </div>

                <p className="hint">
                    <span className="kbd">mode=sync</span> блокирует main thread прямо в обработчике события, поэтому
                    следующий paint задерживается — это и бьёт по INP. <span className="kbd">mode=setTimeout</span>{' '}
                    скорее покажет «поздний результат», но обычно не даёт такого же INP.{' '}
                    <span className="kbd">mode=raf</span> переносит блокировку ближе к кадру отрисовки.
                </p>
            </div>

            <div className="grid gridTop">
                <div className="card">
                    <p className="label">last event (Event Timing)</p>
                    <p className="value">{last ? last.name : '—'}</p>
                </div>
                <div className="card">
                    <p className="label">last duration</p>
                    <p className="value">{last ? formatMs(last.duration) : '—'}</p>
                </div>
                <div className="card">
                    <p className="label">processing (start → end)</p>
                    <p className="value">
                        {last && typeof last.processingStart === 'number' && typeof last.processingEnd === 'number'
                            ? `${formatMs(last.processingStart)} → ${formatMs(last.processingEnd)}`
                            : '—'}
                    </p>
                </div>
                <div className="card">
                    <p className="label">startTime</p>
                    <p className="value">{last ? formatMs(last.startTime) : '—'}</p>
                </div>
            </div>
        </main>
    );
}
