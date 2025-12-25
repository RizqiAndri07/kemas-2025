import { IDataEvent } from "@/types/event.interface";

export const competitionData: IDataEvent[] = [
  {
    id: 1,
    name: "Try Out",
    logo: "📖",
    typography: "/assets/Typography/TO.png",
    maskot: {
      mas: "/assets/Maskot/Mas-TO.png",
      mbak: "/assets/Maskot/Mbak-TO.png",
    },
    date: ["Minggu, 18 Januari 2026"],
    location: "SMA Negeri 1 Sukoharjo",
    description:
      "Kegiatan Try Out Event PRASASTI#10 2026 KEMAS UNS merupakan rangkaian acara PRASASTI#10 2026 yang bertujuan untuk membantu siswa SMA/MK/MA dan siswa Gap Year yang akan masuk Perguruan Tinggi Negeri. Try Out Event PRASASTI#10 2026 diselenggarakan pada hari Minggu, 18 Januari 2026 di SMA Negeri 1 Sukoharjo secara offline dengan pengerjaan online berbasis SIP NF. Memiliki beberapa rangkaian acara seperti Pengerjaan Soal, Expo Kampus, Food Bazaar, Parade Universitas, Parade Fakultas, Pembahasan Soal, Games, Awarding dan Penampilan Guest Star.",
    open_registration: "14 Desember 2025 - 13 Januari 2026",
    link_registration: "https://uns.id/TRYOUTSNBTPRASASTI10",
    prize: 30000,
    pamflet: "/pamflet/tryout.png",
    contact: {
      Amifa: "+62882003533360",
      Izzah: "+62882005012121",
    },
    berkas: {
      "Tata Cara": "/TryOut/Tata-Cara-TO.png",
    },
  },
  {
    id: 2,
    name: "Futsal Competition",
    logo: "⚽",
    typography: "/assets/Typography/Futsal.png",
    maskot: {
      mas: "/assets/Maskot/Mas-Futsal.png",
      mbak: "/assets/Maskot/Mbak-Futsal.png",
    },
    date: ["Sabtu, 24 Januari 2026", "Minggu, 25 Januari 2026"],
    location: "GOR Bung Karno Sukoharjo",
    description:
      "Futsal Competition PRASASTI#10 2026 KEMAS UNS merupakan tournament futsal antar SMA/SMK/MA sederajat se-Solo Raya yang bertujuan untuk mengembangkan minat bakat serta menumbuhkan semangat kompetitif dan jiwa sportivitas generasi muda sekarang.",
    open_registration: "25 Desember 2025 - 12 Januari 2026",
    link_registration: "http://uns.id/FutsalCompetitionPRASASTI10",
    prize: 450000,
    pamflet: "/pamflet/futsal.png",
    contact: {
      Cayla: "+6289620621746",
      Cagra: "+6288216534905",
    },
    berkas: {
      "Guide Book ": "/Futsal/Guide-Book.pdf",
      "MOU Pemain": "/Futsal/MOU-Pemain.pdf",
      "MOU Supporter": "/Futsal/MOU-Supporter.pdf",
      "Formulir Pendaftaran": "/Futsal/Formulir-Pendaftaran.pdf",
    },
  },
  {
    id: 3,
    name: "MLBB Competition",
    logo: "🎮",
    typography: "/assets/Typography/MLBB.png",
    date: [
      "Sabtu, 27 Januari 2026 (Online)",
      "Sabtu, 31 Januari 2026 (Offline)",
    ],
    location: "Lokananta",
    description:
      "Mobile Legends Competition PRASASTI#10 2026 KEMAS UNS merupakan sebuah tournament games yang akan dilaksanakan secara online dan offline, yang bertujuan sebagai ajang pembuktian kemampuan tim-tim lokal di tingkat regional, sekaligus membuka peluang menuju kompetisi yang lebih besar. Tournament ini akan memperebutkan juara 1, 2, dan 3 serta penghargaan Most Valuable Player (MVP)",
    open_registration: "25 Desember 2025 - 20 Januari 2026",
    link_registration: "https://forms.gle/9Tk9RhSy4AgrU7k69",
    prize: {
      "Presale 1": 60000
    },
    pamflet: "/pamflet/mlbb_competition.png",
    contact: {
      Saskia: "+62895363433664",
      Nasywa: "+6281327644181",
    },
    berkas: {
      "Surat Pernyataan": "/MLBB/Surat-Pernyataan.pdf",
      "Guide Book": "/MLBB/Guide-Book.pdf",
    },
  },
  {
    id: 4,
    name: "Accoustic And Dance Competition",
    logo: "🎸💃",
    typography: "/assets/Typography/ADC.png",
    maskot: {
      mas: "/assets/Maskot/Mas-ADC.png",
      mbak: "/assets/Maskot/Mbak-ADC.png",
    },
    date: ["Sabtu, 7 Februari 2026"],
    location: "Atrium NEO Solo Grand Mall",
    description:
      "Kegiatan Acoustic and Dance Competition PRASASTI#10 2026 KEMAS UNS merupakan suatu ajang kompetisi acoustic dan dance yang diperuntukkan bagi masyarakat umum berusia antara 15–25 tahun se-Eks Karesidenan Surakarta, dengan tujuan untuk menunjukkan potensi mereka dalam bidang seni musik dan seni tari",
    open_registration: "25 Desember 2025 - 25 Januari 2026",
    link_registration: "http://uns.id/PendafataranADCPRASASTI10",
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
      "Guide Book Accoustic": "/ADC/Buku-Panduan-Accoustic.pdf",
      "Guide Book Dance": "/ADC/Buku-Panduan-Dance.pdf",
      "Formulir Pendaftaran": "/ADC/Formulir-Pendaftaran-ADC.docx",
      "Surat Pernyataan": "/ADC/Surat-Pernyataan-ADC.doc",
    },
    note: "Apabila jumlah personil melebihi ketentuan, maka dikenakan registrasi tambahan sebesar Rp15.000,00 / personil.",
  },
  {
    id: 5,
    name: "Prasasti Festival",
    logo: "🎭",
    // typography: "",
    date: ["Minggu, 8 Februari 2026"],
    location: "Neo Solo Grand Mall",
    description:
      "Kegiatan Prasasti Festival ini merupakan puncak dari seluruh rangkaian acara yang ada ( penutup) yang akan disi dengan berbagai penampilan menarik serta akan diselenggarakan secara offline dan untuk masyarakat umum. Tujuannya untuk memperkenalkan Keluarga Mahasiswa Sukoharjo UNS kepada seluruh masyarakat yang telah tergabung dalam acara. ",
    // open_registration: "1 Maret 2024 - 31 Maret 2024",
    venue: "https://maps.app.goo.gl/MmzQPpnCnSVhSLks7",
    prize: "Free Entry",
    pamflet: "/pamflet/prasasti_festival.png",
  },
];
