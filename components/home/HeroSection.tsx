import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-6 px-4 ">
        <div className="relative flex flex-col items-center">
          <h1 className=" bg-linear-to-r from-primary  to-accent bg-clip-text text-transparent text-shadow-2xl">
            Selamat datang di
          </h1>
          <Image alt="logo" src={"/logo.png"} width={200} height={100} />
        </div>
        <p className="body text-foreground/80">
          Event Tahunan Multi Kompetisi tinkat SMA/SMK Terbesar di Sukoharjo.
          Tunjukkan bakan dan raih prestasimu !
        </p>
        <Button variant={"gradient"} size={"lg"} className="rounded-xl">
          Lihat Kompetisi <ArrowRight />
        </Button>
      </div>
    </>
  );
};

export default HeroSection;
