export const competitionFormSchema = {
  1: {
    // Try Out
    fields: [
      {
        name: "fullName",
        label: "Nama Lengkap",
        type: "text",
        required: true,
      },
      {
        name: "school",
        label: "Asal Sekolah",
        type: "text",
        required: true,
      },
      {
        name: "phone",
        label: "No HP",
        type: "tel",
        required: true,
      },
    ],
  },

  2: {
    // Futsal
    fields: [
      {
        name: "teamName",
        label: "Nama Tim",
        type: "text",
        required: true,
      },
      {
        name: "namaKapten",
        label: "Nama Kapten",
        type: "text",
        required: true,
      },
      {
        name: "namaSekolah",
        label: "Nama Sekolah",
        type: "text",
        required: true,
      },
      {
        name: "contactNumber",
        label: "No HP",
        type: "number",
        required: true,
        min: 5,
        max: 7,
      },
      {
        name: "logoSekolah",
        label: "Logo Sekolah",
        type: "file",
        required: true,
      },
    ],
  },

  4: {
    // MLBB
    fields: [
      {
        name: "teamName",
        label: "Nama Tim",
        type: "text",
        required: true,
      },
      {
        name: "leaderNickname",
        label: "Nickname Leader",
        type: "text",
        required: true,
      },
      {
        name: "leaderId",
        label: "ID MLBB",
        type: "text",
        required: true,
      },
    ],
  },
};
