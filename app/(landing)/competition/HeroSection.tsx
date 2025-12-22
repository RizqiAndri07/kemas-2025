import React from "react";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-7">
      <h5 className="text-primary  bg-accent/60 py-2 px-5 rounded-full">
        🏆 5 Kompetisi Menanti
      </h5>

      <p className="body-sm text-foreground/60">
        Pilih kompetisi yang sesuai dengan bakatmu dan raih kesempatan untuk
        menjadi yang terbaik!
      </p>
    </div>
  );
};

export default HeroSection;
