import type { Metadata } from "next";
import "./globals.css";
import { ThemeStyle } from "@/components/ThemeStyle";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { org } from "@/org";

export const metadata: Metadata = {
  title: org.name,
  description: org.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeStyle />
      </head>
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
