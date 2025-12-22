"use client";
import { Sparkles, Trophy, Users } from "lucide-react";
import React from "react";
import { motion } from "motion/react";
const WhatsNew = () => {
  return (
    <>
      <div className="text-center mx-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          <h4 className="text-primary ">Whats New di Prasasti 10? </h4>
          <p className="body text-foreground/80 mb-3">
            Tahun ini lebih spesial! Berbagai inovasi dan peningkatan untuk
            pengalaman terbaik.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-background w-full flex flex-col items-center justify-center p-6 rounded-2xl gap-3"
          >
            <div className="bg-primary/15 rounded-2xl p-3 text-primary">
              <Trophy size={48} />
            </div>
            <p className="body-lg text-primary">Hadiah Lebih Besar</p>
            <p className="body text-foreground/60">
              Total hadiah mencapai 10 juta rupiah !
            </p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-background w-full flex flex-col items-center justify-center p-6 rounded-2xl gap-3"
          >
            <div className="bg-secondary/15 rounded-2xl p-3 text-secondary">
              <Users size={48} />
            </div>
            <p className="body-lg text-secondary">Lebih Banyak Peserta</p>
            <p className="body text-foreground/60">
              Terbuka untuk seluruh Indonesia!
            </p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-background w-full flex flex-col items-center justify-center p-6 rounded-2xl gap-3"
          >
            <div className="bg-accent/15 rounded-2xl p-3 text-accent">
              <Sparkles size={48} />
            </div>
            <p className="body-lg text-accent">Kompetisi Baru</p>
            <p className="body text-foreground/60">
              Menghadirkan E-Sports Mobile Legends: Bang Bang
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default WhatsNew;
