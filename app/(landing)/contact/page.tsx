import { contactPerson } from "@/data/contactPerson";
import { Instagram, Mail, Youtube } from "lucide-react";
import Image from "next/image";
import React from "react";

const ContactPerson = () => {
  return contactPerson;
};

const page = async () => {
  const cp = await ContactPerson();
  return (
    <div className="text-center space-y-10">
      <div className="head">
        <h3 className="text-primary">Informasi Narahubung</h3>
        <p className="body-sm">
          Jangan ragu untuk menghubungi kami melalui kontak di bawah ini jika
          ada pertanyaan.
        </p>
      </div>
      <div className="flex gap-10 flex-col md:flex-row justify-between">
        <div className="bg-background basis-2/5 p-10 md:p-20 rounded-2xl shadow-md space-y-10">
          <div className="content">
            <h4 className="text-primary">Jam Operasional</h4>
            <table className="body-sm">
              <tbody>
                <tr>
                  <td className="text-left pr-10">Senin - Jumat</td>
                  <td className="text-right">08.00 - 16.00 WIB</td>
                </tr>
                <tr>
                  <td className="text-left pr-10">Sabtu - Minggu</td>
                  <td className="text-right">09.00 - 14.00 WIB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="content">
            <h4 className="text-primary">Media Sosial</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center ">
                <Instagram
                  size={16}
                  className="bg-secondary/30 p-1 size-8 text-secondary rounded-md inline-block mr-2"
                />
                <div className="usn text-start">
                  <p className="body-lg font-medium">Instagram</p>
                  <p className="body-sm font-light text-foreground/70">
                    @kemasprasasti
                  </p>
                </div>
              </div>
              <div className="flex items-center ">
                <Youtube
                  size={16}
                  className="bg-secondary/30 p-1 size-8 text-secondary rounded-md inline-block mr-2"
                />
                <div className="usn text-start">
                  <p className="body-lg font-medium">Youtube</p>
                  <p className="body-sm font-light text-foreground/70">
                    @kemasprasasti
                  </p>
                </div>
              </div>
              <div className="flex items-center ">
                <Image
                  width={16}
                  height={16}
                  className="bg-accent/30 p-1 size-8 text-accent rounded-md inline-block mr-2"
                  src={"/tiktok.svg"}
                  alt="tiktokicon"
                />
                <div className="usn text-start">
                  <p className="body-lg font-medium">TikTok</p>
                  <p className="body-sm font-light text-foreground/70">
                    @kemasprasasti
                  </p>
                </div>
              </div>
              <div className="flex items-center ">
                <Mail
                  width={16}
                  height={16}
                  className="bg-accent/30 p-1 size-8 text-accent rounded-md inline-block mr-2"
                />
                <div className="usn text-start">
                  <p className="body-lg font-medium">Gmail</p>
                  <p className="body-sm font-light text-foreground/70">
                    @kemasprasasti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wa w-full space-y-6">
          {cp.map((person) => (
            <div
              key={person.id}
              className="bg-background rounded-2xl w-full items-center justify-between shadow-md p-6 flex "
            >
              <div className="text-start">
                <h5 className="text-primary">{person.event}</h5>
                <p className="body-lg font-medium ">{person.name}</p>
                <p className="body-lg text-foreground/60">{person.phone}</p>
              </div>
              <a
                href={person.wa_link}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-accent/20 transition text-background min-w-30 body-sm justify-center"
              >
                Chat Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
