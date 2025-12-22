import { IDataEvent } from "@/types/event.interface";

export const competitionData: IDataEvent[] = [
  {
    id: 1,
    name: "Try Out",
    logo: "📖",
    maskot: "/assets/competitions/to.png",
    date: "10 Februari 2024",
    location: "SMA Negeri 1 Sukoharjo",
    description:
      "Kegiatan Try Out Event PRASASTI#10 2026 KEMAS UNS merupakan rangkaian acara PRASASTI#10 2026 yang bertujuan untuk membantu siswa SMA/MK/MA dan siswa Gap Year yang akan masuk Perguruan Tinggi Negeri. Try Out Event PRASASTI#10 2026 diselenggarakan pada hari Minggu, 18 Januari 2026 di SMA Negeri 1 Sukoharjo secara offline dengan pengerjaan sistem CBT. Memiliki beberapa rangkaian acara seperti Pengerjaan Soal, Expo Kampus, Food Bazaar, Parade Universitas, Parade Fakultas, Pembahasan Soal, Games, Awarding dan Penampilan Guest Star.",
    open_registration: "1 Januari 2024 - 31 Januari 2024",
    link_registration: "https://taplink.cc/tryoutprasasti10",
    prize: 30000,
    pamflet: "/pamflet/tryout.png",
    contact: {
      Amifa: "+62882003533360",
    },
    berkas: {
      "Guide Book": "/path",
    },
  },
  {
    id: 2,
    name: "Futsal Competition",
    logo: "⚽",
    maskot: "/assets/competitions/futsal.jpg",
    date: "24 - 25 Januari 2026",
    location: "GOR Bung Karno Sukoharjo",
    description:
      "Futsal Competition PRASASTI#10 2026 KEMAS UNS merupakan turnamenfutsal antar SMA/SMK/MA Sederajat se solo raya yangbertujuan untuk mengembangkan minatbakatdanmenumbuhkansemangatkompetitif serta jiwa sportivitas generasimuda sekarang",
    open_registration: "1 Februari 2024 - 28 Februari 2024",
    prize: 400000,
    pamflet: "/pamflet/futsal.png",
    contact: { Cahyo: "+6288216534905" },
    berkas: {
      "Guide Book ": "path",
      "MOU Pemain": "path",
      "MOU Supporter": "path",
      "Formulir Pendaftaran": "path",
    },
  },
  {
    id: 3,
    name: "MLBB Competition",
    logo: "🎮",
    maskot: "/assets/competitions/game.jpg",
    date: "Sabtu, 31 Januari 2026",
    location: "Lokananta",
    description:
      "ML Competition PRASASTI#10 2026 KEMAS UNS merupakan sebuah tournament games yang akan dilaksanakan secara online dan offline, yang bertujuan sebagai ajang pembuktian kemampuan tim-tim lokal di tingkat regional, sekaligus membuka peluang menuju kompetisi yang lebih besar. Tournament ini akan memperebutkan juara 1, 2, dan 3 serta Most Valuable Player (MVP)",
    open_registration: "1 Maret 2024 - 31 Maret 2024",
    prize: {
      "Presale 1": 60000,
      "Presale 2": 70000,
    },
    pamflet: "/pamflet/mlbb_competition.png",
    contact: {
      Saskia: "+62895363433664",
      Nasywa: "+6281327644181",
    },
    berkas: {
      "Surat Pernyataan": "path",
      "Link Pendaftaran": "path",
    },
  },
  {
    id: 4,
    name: "Accoustic And Dance Competition",
    logo: "🎸💃",
    maskot: "/assets/competitions/adc.jpg",
    date: "Sabtu, 7 Februari 2026",
    location: "Atrium NEO Solo Grand Mall",
    description:
      "Kegiatan Acoustic and Dance Competition PRASASTI#10 2026 KEMAS UNS merupakan suatu ajang kompetisi acoustic dan dance yang diperuntukkan bagi masyarakat umum berusia antara 15-25 tahun se-Eks Karesidenan Surakarta dengan tujuan untuk menunjukkan potensi mereka dalam bidang seni musik dan seni tari",
    open_registration: "1 Maret 2024 - 31 Maret 2024",
    prize: {
      Acoustic: 110000,
      Dance: 125000,
    },
    pamflet: "/pamflet/accoustic_dance.png",
    contact: {
      Yunib: "+6285747264162",
      Aurel: "+6285740693174",
    },
    berkas: {
      "Guide Book Accoustic": "path",
      "Guide Book Dance": "path",
      "Formulir Pendaftaran": "path",
      "Surat Pernyataan": "path",
    },
  },
  {
    id: 5,
    name: "Prasasti Festival",
    logo: "🎭",
    maskot: "",
    date: "Minggu, 8 Februari 2026",
    location: "Neo Solo Grand Mall",
    description:
      "Kegiatan Prasasti Festival ini merupakan puncak dari seluruh rangkaian acara yang ada ( penutup) yang akan disi dengan berbagai penampilan menarik serta akan diselenggarakan secara offline dan untuk masyarakat umum. Tujuannya untuk memperkenalkan Keluarga Mahasiswa Sukoharjo UNS kepada seluruh masyarakat yang telah tergabung dalam acara. ",
    open_registration: "1 Maret 2024 - 31 Maret 2024",
    prize: "Free",
    pamflet: "/pamflet/prasasti_festival.png",
  },
];
