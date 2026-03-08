import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swadl - Parenting, Coordinated",
  description:
    "Swadl is a parenting coordination app that reduces cognitive load, keeps caregivers in sync, and helps you stay on top of everything. Log feeds, diapers, sleep & pumps. Share reports with your pediatrician.",
  keywords:
    "baby, parenting, tracker, feeding, diaper, sleep, pump, newborn, caregiver, coordination",
  openGraph: {
    title: "Swadl - Parenting, Coordinated",
    description:
      "Coordinate parenting duties, log feeds, diapers, sleep & pumps, and share reports with your pediatrician.",
    type: "website",
    url: "https://www.swadl.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
