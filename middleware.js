// middleware.js — inject pathname ke header agar RootLayout bisa membacanya
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  // Jalankan di semua route kecuali asset statis dan _next
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
