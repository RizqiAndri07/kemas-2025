import React from "react";
import HeroSection from "./HeroSection";
import EventCard from "./EventCard";
import { IDataEvent } from "@/types/event.interface";
import { competitionData } from "@/data/competition";
const getCompetition = () => {
  return competitionData;
};

const page = async () => {
  const event = await getCompetition();
  console.log(event);
  return (
    <div className="text-center px-5">
      <HeroSection />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {event.map((event: IDataEvent) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default page;
