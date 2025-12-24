"use client";

import { Clock } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

const timelineEvents = [
  {
    id: 1,
    title: "Try Out",
    date: "18 Januari 2026",
    description:
      "Ujian TO berbasis CBT bagi siswa SMA/SMK/MA dan gap year, se Solo Raya",
    // icon: "/assets/Typography/TO.png",
    icon: "/assets/Maskot/Mas-TO.png",
  },
  {
    id: 2,
    title: "Futsal Competition",
    date: "24 - 25 Januari 2026",
    description: "Turnamen futsal antar SMA/SMK/MA Sederajat se Solo Raya",
    // icon: "/assets/Typography/Futsal.png",
    icon: "/assets/Maskot/Mas-Futsal.png",
  },
  {
    id: 3,
    title: "MLBB Competition",
    date: "27 Januari 2026 (Online), 31 Januari 2026 (Offline)",
    description:
      "Deskripsi bawahnya: Tournament MLBB se Jateng dan DIY yang dilaksanakan secara online dan offline",
    // icon: "/assets/Typography/MLBB.png",
    icon: "/assets/Maskot/Mbak-TO.png",
  },
  {
    id: 4,
    title: "ADC Competition",
    date: "7 Februari 2026",
    description:
      " Lomba Acoustic & Dance dengan kategori umur 15-25 tahun se eks-Surakarta",
    // icon: "/assets/Typography/ADC.png",
    icon: "/assets/Maskot/Mas-ADC.png",
  },
  {
    id: 5,
    title: "Prasasti Festival",
    date: "8 Februari 2026",
    description: "Puncak dari seluruh rangkaian acara PRASASTI#10",
    icon: "/assets/Maskot/Mbak-ADC.png",
  },
];
const Timeline = () => {
  return (
    <section className="container mx-auto px-4 lg:px-8 mb-20 font-poppins">
      <div className="text-center mb-12">
        <h2 className="mb-4 text-[#6A1B9A]">Timeline Event 📅</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Catat tanggalnya dan jangan sampai ketinggalan!
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Vertical Line */}
        <div
          className="
            absolute left-8 md:left-1/2 top-0 bottom-0 w-1
            md:-translate-x-1/2
            bg-linear-to-b from-[#6A1B9A] via-[#FF7688] to-[#B1E1FF]
            shadow-[0_0_20px_rgba(106,27,154,0.3)]
          "
        />

        {timelineEvents.map((event, index) => (
          <div
            key={event.id}
            className={`relative mb-12 flex items-center ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Mobile connector */}
            <div className="md:hidden absolute left-15 w-8 h-0.5 bg-[#FF7688]" />

            {/* Card with Motion */}
            <div
              className={`w-full md:w-5/12 ${
                index % 2 === 0
                  ? "md:pr-8 pl-20 md:pl-0"
                  : "md:pl-8 pl-20 md:pr-0"
              }`}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4 }}
                className=" pt-32
                  p-6 rounded-2xl origin-center
                  bg-white/70 backdrop-blur-xl
                  border border-[#B1E1FF]/30
                  shadow-[0_4px_20px_rgba(177,225,255,0.2)] relative
                "
              >
                {event.icon && (
                  <Image
                    src={event.icon}
                    alt={event.title}
                    width={120}
                    height={120}
                    className=" absolute -top-10 "
                  />
                )}

                <h4 className="text-secondary mb-2 font-medium">
                  {event.title}
                </h4>

                <div className="flex items-center gap-2 text-sm text-[#FF7688] mb-3">
                  <Clock className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>

                <p className="text-gray-600 text-sm">{event.description}</p>
              </motion.div>
            </div>

            {/* Node */}
            <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2">
              <div
                className="
                  w-12 h-12 rounded-full flex items-center justify-center
                  bg-white border-4 border-[#FF7688]
                  shadow-[0_0_20px_rgba(255,118,136,0.5)]
                "
              >
                <div
                  className="
                    w-6 h-6 rounded-full
                    bg-linear-to-br from-[#6A1B9A] to-[#FF7688]
                  "
                />
              </div>
            </div>

            <div className="hidden md:block w-5/12" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;
