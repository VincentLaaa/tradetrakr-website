import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { initPostHog } from '@/lib/posthogClient';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <Component {...pageProps} />;
}

