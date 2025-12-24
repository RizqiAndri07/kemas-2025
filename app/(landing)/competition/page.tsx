import React from "react";
import HeroSection from "./HeroSection";
import EventCard from "./EventCard";
// import { IDataEvent } from "@/types/event.interface";
import { competitionData } from "@/data/competition";
import { icons } from "lucide-react";
const getCompetition = () => {
  return competitionData;
};
export const metadata = {
  title: "Competition | Prasasti 2025",
  description:
    "Prasasti 2025, KEMAS UNS Sukoharjo, Prepare with Sebelas Maret University, Event, Competition, Festival",
  authors: [
    { name: "KEMAS UNS Sukoharjo", url: "https://kemas-2025.vercel.app" },
  ],
  icons: {
    icon: "./logo.svg",
  },
  keywords: [
    "competition",
    "event",
    "prasasti",
    "kemas uns",
    "festival",
    "prasasti 2025",
    "futsal prasasti",
    "tryout prasasti",
    "mlbb prasasti",
    "accoustic prasasti",
    "dance prasasti",
    "prasasti festival",
  ],
  openGraph: {
    title: "Competition | Prasasti 2025",
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
const page = async () => {
  const event = await getCompetition();
  return (
    <div className="text-center py-20">
      <HeroSection />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {event.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default page;
