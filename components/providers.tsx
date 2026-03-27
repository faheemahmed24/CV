'use client';

// Safe console patch for AI Studio iframe compatibility
if (typeof window !== 'undefined') {
  const patchConsole = (method: keyof Console) => {
    const original = console[method] as (...args: unknown[]) => void;
    (console[method] as (...args: unknown[]) => void) = (...args: unknown[]) => {
      original.bind(console)(...args.map(a => 
        a === undefined ? 'undefined' : 
        typeof a === 'function' ? `[Function: ${a.name || 'anonymous'}]` : 
        a
      ));
    };
  };
  patchConsole('log');
  patchConsole('warn');
  patchConsole('error');
}

import { Auth0Provider } from '@auth0/nextjs-auth0/client';

console.log('Auth0Provider:', Auth0Provider !== undefined ? Auth0Provider : 'undefined');

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      {children}
    </Auth0Provider>
  );
}
