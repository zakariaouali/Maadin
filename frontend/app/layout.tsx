import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marrakech Maadine",
  description: "Authentic Moroccan artisan marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}