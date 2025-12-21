import { Mail, MapPin, Phone, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-background px-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 py-20">
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
            <a
              target="_blank"
              href="https://maps.app.goo.gl/UBTfdvVJikmBMf9VA"
              className="body text-foreground/60"
            >
              Sukoharajo, Jawa Tengah
            </a>
          </li>
          <li className="flex gap-2">
            <Mail className="text-accent" />
            <a
              href="mailto:kemasunsprasasti@gmail.com"
              className="body text-foreground/60"
            >
              kemasunsprasasti@gmail.com
            </a>
          </li>
          <li className="flex gap-2">
            <Phone className="text-accent" />
            <a href="tel:+628822791142" className="body text-foreground/60">
              08822791142
            </a>
          </li>
        </ul>
      </div>
      <div className="sosial-media">
        <p className="body-lg my-4 text-primary">Follow Us</p>
        <ul className="flex gap-5 text-secondary">
          <li className="bg-secondary/20 p-3 rounded-2xl border border-secondary">
            <a href="http://instagram.com/kemasprasasti">
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
            <a href="https://www.tiktok.com/@kemasprasasti?_r=1&_t=ZS-92Bo7cyD4B0">
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="0 0 32 32"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                className="text-secondary"
              >
                <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"></path>
              </svg>
            </a>
          </li>
          <li className="bg-secondary/20 p-3 rounded-2xl border border-secondary">
            <a href="http://www.youtube.com/@kemasuns177">
              <Youtube />
            </a>
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
