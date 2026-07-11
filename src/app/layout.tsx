import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowReplay — Banking reliability lab',
  description: 'Every banking failure becomes a test the next release must pass.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
