import type {Metadata} from 'next';
import { Providers } from '@/components/providers';
import { validateEnv } from '@/lib/env';
import './globals.css'; // Global styles

// Validate environment variables at startup
if (process.env.NODE_ENV !== 'development') {
  validateEnv();
}

console.log('Providers component:', Providers !== undefined ? Providers : 'undefined');

export const metadata: Metadata = {
  title: 'CV Architect Pro',
  description: 'AI-Powered Career Engine',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
