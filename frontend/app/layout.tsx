import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Filipino Sign Language Translator",
  description:
    "AI-powered Filipino Sign Language translator using real-time webcam detection, MediaPipe pose estimation, and deep learning.",
  keywords: [
    "FSL",
    "Filipino Sign Language",
    "translator",
    "sign language",
    "AI",
    "machine learning",
    "MediaPipe",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
