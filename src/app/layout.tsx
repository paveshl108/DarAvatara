import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  title: "Метаграф",
  description: "Глубокая персональная распаковка человека и его следующего уровня",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-512.png",
  },
  appleWebApp: {
    capable: true,
    title: "Метаграф",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
