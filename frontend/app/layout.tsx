import './globals.css';
import type { Metadata } from 'next';
import { TopNav } from '../components/TopNav';

export const metadata: Metadata = {
  title: 'Privacy-First Agent UI',
  description: 'Web-UI für die Privacy-First API des Master-Agenten',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div style={{ padding: '24px 20px 0' }}>
          <TopNav />
        </div>
        {children}
      </body>
    </html>
  );
}
