import type { Metadata } from "next";
import "./globals.css";
import ThreeColumnLayout from "./components/ThreeColumnLayout";

export const metadata: Metadata = {
  title: "Community",
  description: "Community project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        <ThreeColumnLayout>
          {children}
        </ThreeColumnLayout>
      </body>
    </html>
  );
}
