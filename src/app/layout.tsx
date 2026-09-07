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
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
