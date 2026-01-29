import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_DELAY_MS = 60_000;

function clampInt(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function parseDelayMs(value: string | null) {
    if (!value) return 0;

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed)) return 0;

    return clampInt(parsed, 0, MAX_DELAY_MS);
}

async function sleep(ms: number) {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const delayMs = parseDelayMs(url.searchParams.get('delay'));

    await sleep(delayMs);

    const filePath = path.join(process.cwd(), 'public', 'SONIC.jpeg');
    let image: Buffer;
    try {
        image = await readFile(filePath);
    } catch (error) {
        const errorCode =
            typeof error === 'object' && error && 'code' in error
                ? (error as { code?: unknown }).code
                : undefined;
        const status = errorCode === 'ENOENT' ? 404 : 500;
        const label = status === 404 ? 'Image not found' : 'Failed to read image';
        const message = error instanceof Error ? error.message : 'Unknown error';

        return new Response(
            JSON.stringify({
                error: label,
                message,
            }),
            {
                status,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, max-age=0, must-revalidate',
                },
            }
        );
    }

    return new Response(new Uint8Array(image), {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
    });
}
