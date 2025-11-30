import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-6  ">
        <div className="relative flex flex-col items-center">
          <h1 className=" bg-linear-to-r from-primary  to-accent bg-clip-text text-transparent text-shadow-2xl">
            Selamat datang di
          </h1>
          <Image alt="logo" src={"/logo.png"} width={200} height={100} />
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
