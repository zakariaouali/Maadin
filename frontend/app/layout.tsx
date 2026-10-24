import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Martisana",
  description: "Authentic Moroccan artisan marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}