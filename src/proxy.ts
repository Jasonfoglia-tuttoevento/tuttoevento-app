import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ✅ CAMBIA: da 'middleware' a 'proxy'
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const publicRoutes = [
    "/login", "/register", "/forgot-password", "/reset-password",
    "/", "/artisti", "/locali", "/chi-siamo", "/pricing"
  ];

  const isPublicRoute = publicRoutes.some(route => 
    path === route || 
    path.startsWith('/api/login') || 
    path.startsWith('/api/register') ||
    path.startsWith('/api/forgot-password') ||
    path.startsWith('/api/reset-password') ||
    path.startsWith('/api/artist-profile') ||
    path.startsWith('/api/push') ||
    path.startsWith('/api/me')
  );

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// ✅ La config rimane invariata
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};