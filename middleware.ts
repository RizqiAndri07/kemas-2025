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

  const response = NextResponse.next({ request });

  // 2. Pasang cookie session tracking jika belum ada untuk rate limiting
  if (!request.cookies.has("kp_reg_session")) {
    const newSessionId = crypto.randomUUID();
    response.cookies.set("kp_reg_session", newSessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });
  }

  const authToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("kp_auth_token")?.value;

  const apiUrl =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  // Helper verifikasi token ke be-app (Better Auth session atau JWT fallback)
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      // 1. Coba verifikasi via Better Auth get-session
      const sessionRes = await fetch(`${apiUrl}/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `better-auth.session_token=${token}`,
        },
        cache: "no-store",
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData && sessionData.user) {
          return true;
        }
      }

      // 2. Fallback verifikasi via /auth/me
      const meRes = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await meRes.json();
      return meRes.ok && data.success === true;
    } catch {
      return false;
    }
  };

  // 3. Proteksi rute Admin Dashboard (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!authToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const isValid = await verifyToken(authToken);
    if (!isValid) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      url.searchParams.set("expired", "1");
      const redirectRes = NextResponse.redirect(url);
      redirectRes.cookies.set("better-auth.session_token", "", { path: "/", maxAge: 0 });
      redirectRes.cookies.set("__Secure-better-auth.session_token", "", { path: "/", maxAge: 0 });
      redirectRes.cookies.set("kp_auth_token", "", { path: "/", maxAge: 0 });
      return redirectRes;
    }
  }

  // 4. Jika pengguna sudah login dan mengakses /login
  if (pathname === "/login") {
    if (authToken) {
      const isValid = await verifyToken(authToken);
      if (isValid) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
