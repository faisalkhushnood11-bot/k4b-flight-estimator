import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K4B Flight Estimator",
  description: "Compare total flight costs for your team offsite — by KAYAK for Business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
