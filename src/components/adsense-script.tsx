import Script from "next/script";

const ADSENSE_CLIENT = "ca-pub-3833961791559830";

/**
 * Must load in <head> for Google AdSense site verification.
 * beforeInteractive injects this into the initial HTML before hydration.
 */
export function AdSenseScript() {
  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
