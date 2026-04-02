import { Auth0Client } from '@auth0/nextjs-auth0/server';

const isAuth0Configured = !!(
  process.env.AUTH0_ISSUER_BASE_URL &&
  process.env.AUTH0_CLIENT_ID &&
  process.env.AUTH0_CLIENT_SECRET &&
  process.env.AUTH0_SECRET &&
  process.env.AUTH0_BASE_URL
);

export const auth0 = isAuth0Configured 
  ? new Auth0Client({
      domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '').replace('/', ''),
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      secret: process.env.AUTH0_SECRET,
      appBaseUrl: process.env.AUTH0_BASE_URL,
    })
  : {
      middleware: () => {
        throw new Error('Auth0 is not configured. Please check your environment variables.');
      },
      getSession: () => Promise.resolve(null),
    } as unknown as Auth0Client;

export { isAuth0Configured };
