import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { initPosthog } from '@/lib/posthogClient';
import '../style.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initPosthog();
  }, []);

  return <Component {...pageProps} />;
}

