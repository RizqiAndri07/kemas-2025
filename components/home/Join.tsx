import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Join = () => {
  return (
    <div className="bg-linear-to-br from-primary to-secondary p-5 m-5 rounded-2xl text-background flex flex-col items-center justify-center">
      <h5>Siap bergabung?</h5>
      <p className="body my-5 text-center">
        Daftarkan dirimu sekarang dan jadilah bagian dari Prasasti 10!
      </p>
      <Link
        href={"/competition"}
        className="text-primary text-sm bg-background w-56 flex border justify-center items-center rounded-xl py-2 "
      >
        Lihat Semua Kompetisi <ArrowRight />
      </Link>
    </div>
  );
};

export default Join;
