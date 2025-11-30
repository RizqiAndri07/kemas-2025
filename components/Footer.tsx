import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-background mt-10 px-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 py-20 rounded-t-2xl border">
      <div>
        <Image alt="logo" src={"/logo.png"} width={100} height={50} />
        <p className="body text-foreground/60 my-4">
          Event tahunan multi-kompetisi terbesar untuk anak muda Indonesia. Mari
          bergabung dan tunjukkan bakatmu!
        </p>
      </div>
      <div className="my-4">
        <p className="body-lg text-primary my-3 ">Quick Links</p>
        <ul className="flex flex-col gap-2 text-foreground/60">
          <li>
            <Link
              href=""
              className="hover:text-secondary transition-colors duration-100"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href=""
              className="hover:text-secondary transition-colors duration-100"
            >
              Competition
            </Link>
          </li>
          <li>
            <Link
              href=""
              className="hover:text-secondary transition-colors duration-100"
            >
              Timeline
            </Link>
          </li>
          <li>
            <Link
              href=""
              className="hover:text-secondary transition-colors duration-100"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href=""
              className="hover:text-secondary transition-colors duration-100"
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
      <div className="kontak-info">
        <p className="body-lg text-primary my-4">Contact Info</p>
        <ul className="flex flex-col gap-3">
          <li className="flex gap-2">
            <MapPin className="text-accent " />
            <p className="body text-foreground/60">Sukohrajo, Jawa Tengah</p>
          </li>
          <li className="flex gap-2">
            <Mail className="text-accent" />
            <p className="body text-foreground/60">kemassukoharjo@gmail.com</p>
          </li>
          <li className="flex gap-2">
            <Phone className="text-accent" />
            <p className="body text-foreground/60">0987654</p>
          </li>
        </ul>
      </div>
      <div className="sosial-media">
        <p className="body-lg my-4 text-primary">Follow Us</p>
        <ul className="flex gap-5 text-secondary">
          <li className="bg-secondary/20 p-3 rounded-2xl border border-secondary">
            <a href="https://instagram.com">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-instagram-icon lucide-instagram"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </li>
          <li className="bg-secondary/20 p-3 rounded-2xl border border-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-facebook-icon lucide-facebook"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </li>
          <li className="bg-secondary/20 p-3 rounded-2xl border border-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-twitter-icon lucide-twitter"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </li>
          <li className="bg-secondary/20 p-3 rounded-2xl border border-secondary">
            <Mail />
          </li>
        </ul>
        <p className="body-sm text-foreground/60 my-3">
          Ikuti media sosial kami untuk update terbaru
        </p>
      </div>
    </div>
  );
};

export default Footer;
