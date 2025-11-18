import { Calendar, Info, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

const EventCard = () => {
  return (
    <div className="bg-background rounded-2xl">
      <div className="p-6 text-center relative overflow-hidden bg-linear-to-r rounded-t-2xl from-primary/20 to-accent/20">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30 bg-accent" />
        <div className="text-6xl mb-3 relative z-10">📚</div>
        <h3 className="relative z-10 text-primary">Try Out</h3>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <p className="body-sm text-left text-foreground/60 text-sm mb-6 ">
          Ujian simulasi untuk persiapan masuk perguruan tinggi terbaik. Raih
          nilai terbaik dan jadilah yang teratas!
        </p>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 ">
            <Calendar className="text-secondary" />
            <div className="body-sm  w-full text-left">
              <p className="text-foreground/60">Pendaftaran</p>
              <p className="">1 - 14 Januari</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="text-accent" />
            <div className="body-sm  w-full text-left">
              <p className="text-foreground/60">Biaya</p>
              <p className="">Rp 50.000</p>
            </div>
          </div>
        </div>
      </div>
      {/* button */}
      <div className="grid px-6 gap-2 py-3">
        <Link
          className="bg-linear-to-br from-primary to-secondary text-primary-foreground p-3 rounded-2xl flex items-center justify-center gap-2  shadow-md "
          href={""}
        >
          <Users size={20} />
        Daftar Sekarang
        </Link>
        <Link
          href={""}
          className="p-3 bg-secondary/10 rounded-2xl flex justify-center items-center gap-2 text-secondary border border-secondary"
        >
          <Info />
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
