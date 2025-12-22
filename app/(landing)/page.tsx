import AboutSection from "@/components/home/AboutSection";
import HeroSection from "@/components/home/HeroSection";
import Join from "@/components/home/Join";
import Timeline from "@/components/home/Timeline";
import WhatsNew from "@/components/home/WhatsNew";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Prasasti 2025",
  description:
    "Prasasti 2025, KEMAS UNS Sukoharjo, Prepare with Sebelas Maret University, Event, Competition, Festival",
  authors: [
    { name: "KEMAS UNS Sukoharjo", url: "https://kemas-2025.vercel.app" },
  ],
  icons: {
    icon: "./logo.svg",
  },
  openGraph: {
    title: "Home | Prasasti 2025",
    description:
      "Prasasti 2025, KEMAS UNS Sukoharjo, Prepare with Sebelas Maret University, Event, Competition, Festival",
    images: [
      {
        url: "./logo.svg",
        width: 800,
        height: 600,
        alt: "Prasasti 2025",
      },
    ],
  },
};
export default function Home() {
  return (
    <div className="space-y-20">
      <HeroSection />
      <AboutSection />
      <WhatsNew />
      <Timeline />
      <Join />
    </div>
  );
}
