import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import localfont from "next/font/local";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const BiscuitGlitch = localfont({
  src: "../../public/fonts/Biscuit Glitch.ttf",
  variable: "--font-biscuit-glitch",
});
// TODO: font Biscuit Glitch
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
    "Accoustics",
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
        className={` ${BiscuitGlitch.variable} ${poppins.variable} antialiased bg-linear-to-b from-accent/40 to-secondary/20`}
      >
        <Navbar />
        <main className="min-h-screen scroll-smooth px-4 md:px-22 lg:px-38">
          {children}
        </main>
        <div className="relative">
          <div className="absolute h-screen bg-linear-to-t from-primary/20 to-primary/10 w-full blur-2xl -top-[500px] -z-40"></div>
          <Image
            src={"/Vector.svg"}
            alt="Vector"
            className="w-full "
            width={0}
            height={0}
          />
        </div>
        <Footer />
      </body>
    </html>
  );
}
