import Script from "next/script";

const ADSENSE_CLIENT = "ca-pub-3833961791559830";

export function AdSenseScript() {
  return (
    <Script
      id="adsense-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
