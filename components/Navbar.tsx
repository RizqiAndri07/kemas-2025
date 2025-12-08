"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname(); // 👈 ambil path sekarang

  const links = [
    { href: "/", label: "Home" },
    { href: "/competition", label: "Competition" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <div className="bg-background/90 backdrop-blur-md rounded-b-2xl py-4 px-8 flex justify-between items-center fixed top-0 shadow-sm z-20 w-full">
        <Image src="/logo.png" width={100} alt="logo" height={60} />

        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden transition-transform duration-300 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        >
          {open ? <X /> : <Menu />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-1 rounded-md transition relative",
                pathname === link.href
                  ? "text-purple-700 font-semibold after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-linear-to-r after:from-primary after:to-secondary"
                  : "hover:text-purple-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        <div
          className={clsx(
            "md:hidden flex flex-col gap-2 font-medium bg-background shadow-md w-full py-6 fixed left-0 top-16 transition-all duration-300 rounded-b-2xl",
            open
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-5 pointer-events-none"
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                setTimeout(() => {
                  setOpen(false);
                }, 800);
              }}
              className={clsx(
                "px-3 py-2 rounded-xl transition mx-3",
                pathname === link.href
                  ? "bg-linear-to-r text-background from-primary to-secondary  font-semibold"
                  : "hover:text-purple-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
