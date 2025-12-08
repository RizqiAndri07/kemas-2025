import { CalendarCheck, CircleStar, Users } from "lucide-react";
import React from "react";

const AboutSection = () => {
  return (
    <>
      <div className="bg-background px-7 md:p-20 lg:p-36 py-5 rounded-2xl text-center drop-shadow-xl drop-shadow-primary/20 border border-primary/20">
        <h4 className=" text-primary ">Apa Itu Prasasti ?</h4>
        <p className="body-sm md:body-lg text-foreground/80 mt-8">
          Prasasti (Prepare with Sebelas Maret University) diprakarsai oleh
          Keluarga Mahasiswa Sukoharjo Universitas Sebelas Maret (KEMAS UNS)
          sebagai bentuk pengabdian kepada masyarakat yang diadakan setiap
          tahun. Tahun 2026 menjadi tahun ke sepuluh diselenggarakannya
          Prasasti.
        </p>
        {/* <div className="card grid grid-cols-1 md:grid-cols-3 items-center justify-center mt-5 gap-5">
          <div className="flex flex-col items-center justify-center  ">
            <Users
              size={40}
              className="text-primary p-3  w-fit h-fit bg-primary/20 rounded-xl border border-primary"
            />
            <h3 className=" text-secondary">10.000 +</h3>
            <p className="text-sm text-foreground/80">Peserta</p>
          </div>
          <div className="flex flex-col items-center justify-center  ">
            <CircleStar
              size={40}
              className="text-accent p-3 w-fit h-fit bg-accent/20 rounded-xl border border-accent"
            />
            <h3 className=" text-primary">5</h3>
            <p className="text-sm text-foreground/80">Event</p>
          </div>
          <div className="flex flex-col items-center justify-center  ">
            <CalendarCheck
              size={40}
              className="text-secondary p-3 w-fit h-fit bg-secondary/20 rounded-xl border border-secondary"
            />
            <h3 className=" text-primary">10</h3>
            <p className="text-sm text-foreground/80">Tahun Berjalan</p>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default AboutSection;
