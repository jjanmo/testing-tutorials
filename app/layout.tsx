import type { PropsWithChildren } from 'react';
import './globals.css';

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
