import { IDataEvent } from "@/types/event.interface";
import { Calendar, Sparkles, Users } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";
interface EventCardProps {
  event: IDataEvent;
}
const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="bg-background rounded-2xl flex flex-col ">
      <div className=" flex-1 p-6 flex flex-col justify-center items-center h-36 md:h-60 text-center relative overflow-hidden bg-linear-to-r rounded-t-2xl from-primary/20 to-accent/20">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30" />
        <div className="text-6xl mb-3 relative z-10">{event.logo}</div>

        <h5 className="relative z-10 text-primary">{event.name}</h5>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-2 flex flex-col justify-between">
        <p className="body-sm font-poppins text-left flex-1 line-clamp-3 text-foreground/60 mb-6 ">
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
              {event.prize instanceof Object ? (
                Object.entries(event.prize).map(([key, value]) => (
                  <div key={key} className="flex w-full justify-between">
                    <p className="">{key}</p>
                    <p className="min-w-[100px]">
                      {" "}
                      Rp {value.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="">Rp {event.prize.toLocaleString("id-ID")}</p>
              )}
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
      </div>
    </div>
  );
};

export default EventCard;
