import { Suspense } from 'react';

import { HomeClient } from './HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
    return (
        <Suspense
            fallback={
                <main className="container">
                    <div className="header">
                        <h1 className="title">Speed INP Emulator</h1>
                        <p className="subtitle">Loading…</p>
                    </div>
                </main>
            }
        >
            <HomeClient />
        </Suspense>
    );
}
