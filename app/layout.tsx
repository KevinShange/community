import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./components/Providers";

export const metadata: Metadata = {
  title: "Community",
  description: "Community project",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="bg-gray-950">
      <body className="antialiased bg-gray-950 text-gray-100 min-h-screen w-full overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
