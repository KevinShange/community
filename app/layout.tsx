import type { Metadata } from "next";
import "./globals.css";
import { PostStoreProvider } from "@/store/usePostStore";
import { UserStoreProvider } from "@/store/useUserStore";

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
        <UserStoreProvider>
          <PostStoreProvider>
            {children}
          </PostStoreProvider>
        </UserStoreProvider>
      </body>
    </html>
  );
}
