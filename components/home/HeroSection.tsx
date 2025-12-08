import React from "react";
// import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";

import { GravityStarsBackground } from "../animate-ui/components/backgrounds/gravity-stars";

const HeroSection = () => {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-6 relative h-[50dvh] justify-center ">
        <div className="w-full h-[50dvh] blur-3xl rounded-full bg-primary/20 absolute -top-20 -z-40"></div>
        {/* <GravityStarsBackground
          className="absolute -z-30"
          movementSpeed={0.1}
          starsCount={5}
        /> */}
        <div className="relative flex flex-col items-center ">
          <h1 className=" text-primary display">PRASASTI 10</h1>
          {/* <Image alt="logo" src={"/logo.png"} width={200} height={100} /> */}
        </div>
        <p className="body text-foreground/80 md:w-[80dvh]">
          Event Tahunan Multi Kompetisi tinkat SMA/SMK Terbesar di Sukoharjo.
          Tunjukkan bakan dan raih prestasimu !
        </p>
        <Link
          href={"/competition"}
          className="rounded-xl bg-linear-to-r from-primary to-secondary flex text-primary-foreground px-9 py-3 md:px-16 md:py-5 gap-x-3"
        >
          Lihat Kompetisi <ArrowRight />
        </Link>
      </div>
    </>
  );
};

export default HeroSection;
