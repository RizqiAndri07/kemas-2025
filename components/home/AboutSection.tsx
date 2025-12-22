"use client";
import { motion } from "motion/react";

const AboutSection = () => {
  return (
    <>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4 }}
        className="bg-background px-7 md:px-16 py-5 rounded-2xl text-center drop-shadow-xl drop-shadow-primary/20 border border-primary/20"
        id="about"
      >
        <h4 className=" text-primary ">Apa Itu Prasasti ?</h4>
        <p className="body-sm md:body-lg text-foreground/80 mt-8">
          Prasasti (Prepare with Sebelas Maret University) diprakarsai oleh
          Keluarga Mahasiswa Sukoharjo Universitas Sebelas Maret (KEMAS UNS)
          sebagai bentuk pengabdian kepada masyarakat yang diadakan setiap
          tahun. Tahun 2026 menjadi tahun ke sepuluh diselenggarakannya
          Prasasti.
        </p>
      </motion.div>
    </>
  );
};

export default AboutSection;
