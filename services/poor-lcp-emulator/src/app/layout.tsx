import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Speed LCP Emulator',
    description: 'Эмулятор задержки LCP через query параметры',
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
