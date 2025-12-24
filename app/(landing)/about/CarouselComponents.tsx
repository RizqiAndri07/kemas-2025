import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export function CarouselComponents({ foto,folder }: { foto?: string[]; folder?: string }) {
  return (
    <Carousel className="relative w-full">
      <CarouselPrevious
        className="
      absolute 
      left-4 
      top-1/2 
      -translate-y-1/2 
      z-50 
      bg-black/60 
      text-white
    "
      />

      <CarouselContent className="relative">
        {foto?.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Image
                src={`/assets/foto-prasasti/${folder}/${image}`}
                alt={`Foto PRASASTI ${index + 1}`}
                width={500}
                height={200}
                className="w-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselNext
        className="
      absolute 
      right-10 
      top-1/2 
      -translate-y-1/2 
      z-50 
      bg-black/60 
      text-white
    "
      />
    </Carousel>
  );
}
