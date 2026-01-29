import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Speed INP Emulator',
    description: 'Эмулятор плохого INP через query параметры и блокировку main thread',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <body>{children}</body>
        </html>
    );
}
