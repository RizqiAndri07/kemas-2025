import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "@/app/globals.css";
import localFont from "next/font/local";
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const BiscuitGlitch = localFont({
  src: "../../public/fonts/Biscuit Glitch.ttf",
  variable: "--font-biscuit-glitch",
});
export const metadata: Metadata = {
  title: "Kemas Prasasti 2026",
  description: "Kemas Prasasti UNS Sukoharjo",
  keywords: [
    "Prasasti",
    "Prasasti 2026",
    "KEMAS UNS Sukoharjo",
    "Kompetisi",
    "Lomba",
    "Event",
    "Acara",
    "Mahasiswa",
    "Universitas Sebelas Maret",
    "Futsal",
    "MLBB",
    "Esports",
    "ADC",
    "Acoustics",
    "Dance",
    "Try Out",
    
  ],
  verification: {
    google: "i9HroOm7gYxL3RyPQNfAWMGMFzjh7d2Gjt_-MXAECyU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${BiscuitGlitch.variable} antialiased bg-linear-to-b from-accent/40 to-secondary/20 font-poppins`}
      >
        <main className="min-h-screen scroll-smooth">{children}</main>
      </body>
    </html>
  );
}
