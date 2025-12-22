"use client";
// import { Button } from "../ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const HeroSection = () => {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-6 relative h-screen justify-center ">
        <div className="w-full h-[50dvh] blur-3xl rounded-full bg-primary/20 absolute top-0 -z-40"></div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="relative flex flex-col items-center "
        >
          <h1 className=" text-primary display">PRASASTI 10</h1>
          {/* <Image alt="logo" src={"/logo.png"} width={200} height={100} /> */}
        </motion.div>
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="body text-foreground/60 md:w-[80dvh]"
        >
          Event Tahunan Multi Kompetisi tinkat SMA/SMK Terbesar di Sukoharjo.
          Tunjukkan bakan dan raih prestasimu !
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href={"/competition"}
            className="rounded-xl bg-linear-to-r from-primary to-secondary flex text-primary-foreground px-9 py-3 md:px-16 md:py-5 gap-x-3"
          >
            Lihat Kompetisi <ArrowRight />
          </Link>
          <button
            type="button"
            onClick={() => {
              const element = document.getElementById("about");
              if (element) {
                const target =
                  element.getBoundingClientRect().top +
                  window.pageYOffset -
                  150;
                window.scrollTo({ top: target, behavior: "smooth" });
              }
            }}
          >
            <ChevronDown
              className="animate-bounce mt-10 mx-auto text-foreground/60"
              size={40}
            />
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default HeroSection;
