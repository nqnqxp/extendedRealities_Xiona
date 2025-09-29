// This is the root layout component for our Next.js application
// It wraps around all pages and provides global structure and styling

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Font configuration using Next.js built-in font optimization
// These fonts will be automatically optimized and loaded by Next.js
const geistSans = Geist({
  variable: "--font-geist-sans", // Creates a CSS custom property for the font
  subsets: ["latin"], // Only load Latin characters to reduce bundle size
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", // Monospace font for code display
  subsets: ["latin"],
});

// Load the provided local OTF font from the public folder and expose a CSS variable
const pfPixel = localFont({
  src: "../public/PFPixelscriptPro-subset.otf",
  variable: "--font-pf",
  display: "swap",
});

// Metadata for SEO and browser tab display
// This information appears in search results and when sharing links
export const metadata: Metadata = {
  title: "Next.js React Three Fiber Tutorial",
  description: "Learn 3D web development with React Three Fiber and Next.js",
};

// Root Layout Component - this wraps every page in our application
// The 'children' prop represents the page content that will be rendered inside this layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // TypeScript type for any valid React content
}>) {
  return (
    // The html element with language attribute for accessibility
    <html lang="en">
      <body
        // Apply our custom fonts using CSS variables and add antialiasing for smooth text
        className={`${geistSans.variable} ${geistMono.variable} ${pfPixel.variable} antialiased`}
      >
        {/* This is where page content gets rendered */}
        {children}
      </body>
    </html>
  );
}
