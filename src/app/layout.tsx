import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConditionalHeader from "../components/navigation/ConditionalHeader";
import ConditionalFooter from "../components/ConditionalFooter";
import { LayoutProvider } from "../contexts/FooterContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SeniorSimple - Retirement Rescue™ Made Simple",
    template: "%s | SeniorSimple"
  },
  description: "Free retirement planning help for seniors. Get expert guidance on annuities, taxes, estate planning, reverse mortgages, and more. Simple tools and resources for people 55+.",
  keywords: ["retirement planning", "seniors", "annuities", "estate planning", "reverse mortgage", "medicare", "tax planning", "financial planning"],
  authors: [{ name: "SeniorSimple Team" }],
  creator: "SeniorSimple",
  publisher: "SeniorSimple",
  icons: {
    icon: [
      { url: '/images/logos/senior-simple-logo-circle-mark-favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/images/logos/senior-simple-logo-circle-mark-favicon.png',
    apple: '/images/logos/senior-simple-logo-circle-mark-favicon.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://seniorsimple.org'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://seniorsimple.org',
    siteName: 'SeniorSimple',
    title: 'SeniorSimple - Retirement Rescue™ Made Simple',
    description: 'Free retirement planning help for seniors. Get expert guidance on annuities, taxes, estate planning, reverse mortgages, and more.',
    images: [
      {
        url: '/images/webp/hero/couple-share-coffee-meeting-home-couch.webp',
        width: 1200,
        height: 630,
        alt: 'Senior couple planning retirement at home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SeniorSimple',
    creator: '@SeniorSimple',
    title: 'SeniorSimple - Retirement Rescue™ Made Simple',
    description: 'Free retirement planning help for seniors. Get expert guidance on annuities, taxes, estate planning, reverse mortgages, and more.',
    images: ['/images/webp/hero/couple-share-coffee-meeting-home-couch.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon links for better browser compatibility */}
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logos/senior-simple-logo-circle-mark-favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logos/senior-simple-logo-circle-mark-favicon.png" />
        
        {/* Critical scripts only - analytics deferred to afterInteractive */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Deferred Analytics Scripts - Load after page is interactive */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE && (
          <>
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE}');
                `
              }}
            />
            <Script
              id="ga4-loader"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE}`}
            />
          </>
        )}
        
        {/* Meta Pixel - Deferred */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              // Bot detection - only track if not a bot
              (function() {
                var isBot = false;
                if (typeof navigator !== 'undefined') {
                  var ua = navigator.userAgent || '';
                  isBot = /bot|crawler|spider|crawling|facebookexternalhit|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver/i.test(ua);
                }
                
                if (!isBot) {
                  fbq('init', '24221789587508633');
                  fbq('track', 'PageView');
                } else {
                  fbq('init', '24221789587508633');
                }
              })();
            `
          }}
        />
        <noscript>
          <img height="1" width="1" style={{display:'none'}} 
               src="https://www.facebook.com/tr?id=24221789587508633&ev=PageView&noscript=1" />
        </noscript>
        
        {/* PageTest.ai - Lazy Load */}
        <Script
          id="pagetest-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `window.ptaiParams = { team: 'iEnn6B' };`
          }}
        />
        <Script
          id="pagetest-loader"
          strategy="lazyOnload"
          src="https://app.pagetest.ai/build/snippet/ptai.js?v=1.0.5"
        />
        
        {/* Consolidata Analytics - Lazy Load */}
        <div id="consolidata-hm-script-loader" consolidata-hm-23-data-name="1241781759524463-3923"></div>
        <Script
          id="consolidata-loader"
          strategy="lazyOnload"
          src="https://ms1.consolidata.ai/analytics/script-loader/1241781759524463-3923"
        />
        
        {/* Visitoredge - Lazy Load */}
        <Script
          id="visitoredge-loader"
          strategy="lazyOnload"
          src="https://api.visitoredge.com/api/website/run-cookie-script"
        />
        
        {/* LeadID Tracking - Deferred */}
        <Script
          id="LeadiDscript"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var s = document.createElement('script');
                s.id = 'LeadiDscript_campaign';
                s.type = 'text/javascript';
                s.async = true;
                s.src = '//create.lidstatic.com/campaign/70649a2a-2d75-9934-b3c7-c2dc8d4efaa9.js?snippet_version=2';
                var LeadiDscript = document.getElementById('LeadiDscript');
                if (LeadiDscript && LeadiDscript.parentNode) {
                  LeadiDscript.parentNode.insertBefore(s, LeadiDscript);
                }
              })();
            `
          }}
        />
        <noscript>
          <img 
            src="//create.leadid.com/noscript.gif?lac=0D21F4C3-03E6-60BE-6B6C-E5A390EB0ADF&lck=70649a2a-2d75-9934-b3c7-c2dc8d4efaa9&snippet_version=2" 
            alt="" 
            style={{display: 'none'}}
          />
        </noscript>
        
        <LayoutProvider>
          <ConditionalHeader />
          <main>{children}</main>
          <ConditionalFooter />
        </LayoutProvider>
      </body>
    </html>
  );
}