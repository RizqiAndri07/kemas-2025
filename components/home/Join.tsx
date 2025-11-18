import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const Join = () => {
  return (
    <div className="bg-linear-to-br from-primary to-secondary px-16 py-16   m-5 rounded-2xl text-background text-center">
      <h5>Siap bergabung?</h5>
      <p className="body my-5">
        Daftarkan dirimu sekarang dan jadilah bagian dari Prasasti 10!
      </p>
      <Button variant={"outline"} size={"lg"} className="text-foreground">
        Lihat Semua Kompetisi <ArrowRight />
      </Button>
    </div>
  );
};

export default Join;
