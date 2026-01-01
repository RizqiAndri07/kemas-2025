// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req) {
  if (
    req.nextUrl.pathname === "/registrasi/" ||
    req.nextUrl.pathname === "/acoustic-dance-competition/" ||
    req.nextUrl.pathname === "/koor/" ||
    req.nextUrl.pathname === "/tabel-futsal/"
  ) {
    return new NextResponse(null, { status: 410 });
  }
}
