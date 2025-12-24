import Image from "next/image";
import fs from "fs";
import path from "path";
import React from "react";
// import { Carousel } from "@/components/ui/carousel";
import { CarouselComponents } from "./CarouselComponents";
// import { CarouselComponents } from "./CarouselComponents";
export const metadata = {
  title: "About | Prasasti 2025",
  description:
    "Prasasti 2025, KEMAS UNS Sukoharjo, Prepare with Sebelas Maret University, Event, Competition, Festival",
  authors: [
    { name: "KEMAS UNS Sukoharjo", url: "https://kemas-2025.vercel.app" },
  ],
  icons: {
    icon: "./logo.svg",
  },
  openGraph: {
    title: "About | Prasasti 2025",
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

const page = () => {
  const imagesDir = path.join(process.cwd(), "public/assets/foto-prasasti/1");
  const imagesDir2 = path.join(process.cwd(), "public/assets/foto-prasasti/2");
  const images = fs.readdirSync(imagesDir);
  const images2 = fs.readdirSync(imagesDir2);
  return (
    <div className="flex items-center justify-center mt-20 flex-col space-y-10">
      <p className="text-center body-sm  bg-accent/50 px-8 py-2 rounded-full body-lg w-xs md:w-md text-primary">
        Mengenal PRASASTI Lebih Jauh
      </p>
      <div className="bg-background rounded-2xl shadow-md w-full justify-between grid grid-cols-1 md:grid-cols-2 items-center text-center p-10 md:p-20 h-fit gap-10">
        <div className="w-full text-start">
          <h3 className="text-primary ">Sejarah Singkat PRASASTI</h3>
          <p className="text-justify text-xs">
            PRASASTI (Prepare with Sebelas Maret University) pertama kali
            diprakarsai oleh KEMAS UNS sebagai bentuk pengabdian kepada
            masyarakat sejak tahun 2017.
          </p>
        </div>
        <Image
          src={"/logo-prasasti.svg"}
          alt="Logo Prasasti"
          width={0}
          height={0}
          className="w-full"
        />
      </div>
        <h2 className="text-primary text-center mb-6">Galeri PRASASTI</h2>
      <div className="flex gap-x-14 justify-evenly w-full flex-col md:flex-row">
        <CarouselComponents  foto={images} folder="1"/>
        <CarouselComponents  foto={images2} folder="2" />
      </div>
    </div>
  );
};

export default page;
