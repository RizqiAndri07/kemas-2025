// middleware.ts
import { NextResponse } from "next/server";

interface NextUrl {
  pathname: string;
}

interface MiddlewareRequest {
  nextUrl: NextUrl;
}

export function middleware(req: MiddlewareRequest): NextResponse | void {
  if (
    req.nextUrl.pathname === "/registrasi/" ||
    req.nextUrl.pathname === "/acoustic-dance-competition/" ||
    req.nextUrl.pathname === "/koor/" ||
    req.nextUrl.pathname === "/tabel-futsal/"
  ) {
    return new NextResponse(null, { status: 410 });
  }
}
