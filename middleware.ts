import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. URL Legacy yang sudah tidak digunakan (HTTP 410 Gone)
  if (
    pathname === "/registrasi" ||
    pathname.startsWith("/registrasi/") ||
    pathname === "/acoustic-dance-competition" ||
    pathname.startsWith("/acoustic-dance-competition/") ||
    pathname === "/koor" ||
    pathname.startsWith("/koor/") ||
    pathname === "/tabel-futsal" ||
    pathname.startsWith("/tabel-futsal/")
  ) {
    return new NextResponse(null, { status: 410 });
  }

  // 2. Inisialisasi Response dengan sinkronisasi cookie @supabase/ssr
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 3. Verifikasi token sesi dengan server Supabase Auth (getUser)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Proteksi rute Admin Dashboard (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 5. Jika pengguna sudah login dan mengakses /login, redirect ke /dashboard
  if (pathname === "/login") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Berlaku untuk seluruh rute kecuali static files dan media image
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
