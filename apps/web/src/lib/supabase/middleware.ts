import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth/");
  const isTeamPage = pathname.startsWith("/team");
  const isSimulatorPage = pathname.startsWith("/simulator");
  const isApiRoute = pathname.startsWith("/api/");

  if (!user && !isAuthPage && !isPublicPage && !isSimulatorPage && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    const role = user.user_metadata?.role;
    url.pathname = role === "participant" ? "/team" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isTeamPage) {
    return supabaseResponse;
  }

  return supabaseResponse;
}
