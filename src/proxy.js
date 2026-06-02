import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isPublicApi =
    path.startsWith("/api/login") ||
    path.startsWith("/api/register") ||
    path.startsWith("/api/logout") ||
    path.startsWith("/api/forgot-password") ||
    path.startsWith("/api/reset-password") ||
    path.startsWith("/api/artist-profile") ||
    path.startsWith("/api/push") ||
    path.startsWith("/api/me");

  const isProtected =
    path.startsWith("/dashboard") ||
    (path.startsWith("/api") && !isPublicApi);

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  proxy: ["/dashboard/:path*", "/api/:path*"],
};