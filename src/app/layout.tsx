import "./globals.css";
import { ReactNode } from "react";
import Providers from "@/components/Providers";

export const metadata = {
  title: "PetFinder",
  description: "Find and report lost or found pets",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300 bg-white text-black dark:bg-gray-900 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}