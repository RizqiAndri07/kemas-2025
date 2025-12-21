import { IDataEvent } from "@/types/event.interface";
import { Calendar, Info, Sparkles, Users } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";
import React from "react";
interface EventCardProps {
  event: IDataEvent;
}
const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="bg-background rounded-2xl flex flex-col ">
      <div className=" flex-1 p-6 flex flex-col justify-center items-center h-36 md:h-60 text-center relative overflow-hidden bg-linear-to-r rounded-t-2xl from-primary/20 to-accent/20">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30" />
        <div className="text-6xl mb-3 relative z-10">{event.logo}</div>
        {/* <Image
          src={event?.logo || "/assets/competitions/to.png"}
          alt={event?.name || "Competition Logo"}
          width={200}
          height={200}
        /> */}

        <h5 className="relative z-10 text-primary">{event.name}</h5>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-2 flex flex-col justify-between">
        <p className="body-sm text-left flex-1 text-foreground/60 text-sm mb-6 ">
          {event.description}
        </p>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 ">
            <Calendar className="text-secondary" />
            <div className="body-sm  w-full text-left">
              <p className="text-foreground/60">Pendaftaran</p>
              <p className="">{event.open_registration}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="text-accent" />
            <div className="body-sm  w-full text-left">
              <p className="text-foreground/60">Biaya</p>
              <p className="">{event.prize}</p>
            </div>
          </div>
        </div>
      </div>
      {/* button */}
      <div className="grid px-6 gap-2 py-3">
        <Link
          className="bg-linear-to-br from-primary to-secondary text-primary-foreground p-3 rounded-2xl flex items-center justify-center gap-2  shadow-md "
          href={`/competition/${event.id}`}
        >
          <Users size={20} />
          Daftar Sekarang
        </Link>
        {/* <Link
          href={`/competition/${event.id}`}
          className="p-3 bg-secondary/10 rounded-2xl flex justify-center items-center gap-2 text-secondary border border-secondary"
        >
          <Info />
          Lihat Detail
        </Link> */}
      </div>
    </div>
  );
};

export default EventCard;
