import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pup Finder - Find Your Perfect Dog",
  description:
    "AI-powered dog matching to help you find your perfect furry companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-pattern min-h-screen">{children}</body>
    </html>
  );
}
