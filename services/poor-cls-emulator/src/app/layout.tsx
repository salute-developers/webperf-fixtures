import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'Speed CLS Emulator',
    description: 'Эмулятор CLS через query параметры',
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
