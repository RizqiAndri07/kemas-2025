import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { registrationRateLimiter } from "@/lib/rate-limiter";

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

  // 2. Proteksi Rate Limiting Pendaftaran (Maksimal 3x per menit per IP / Session)
  const isRegistrationSubmission =
    request.method === "POST" &&
    (pathname.includes("/register") ||
      pathname.startsWith("/api/registrations") ||
      pathname.includes("/pendaftaran"));

  if (isRegistrationSubmission) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const sessionId = request.cookies.get("kp_reg_session")?.value || "anon";
    const rateLimitKey = `reg_${ip}_${sessionId}`;

    const check = registrationRateLimiter.check(rateLimitKey);
    if (!check.success) {
      return new NextResponse(
        JSON.stringify({
          error: `Terlalu banyak permintaan pendaftaran dari perangkat/IP Anda. Batas maksimal adalah 3 pendaftaran per menit. Silakan coba lagi dalam ${check.retryAfterSeconds} detik.`,
          retryAfterSeconds: check.retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(check.retryAfterSeconds),
            "X-RateLimit-Limit": String(check.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // 3. Inisialisasi Response dengan sinkronisasi cookie @supabase/ssr
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Pasang cookie session tracking jika belum ada untuk akurasi rate limiting
  if (!request.cookies.has("kp_reg_session")) {
    const newSessionId = crypto.randomUUID();
    supabaseResponse.cookies.set("kp_reg_session", newSessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });
  }

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
