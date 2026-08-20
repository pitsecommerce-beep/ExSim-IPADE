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
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/acceso";
  const isPublicPage = pathname === "/" || pathname.startsWith("/auth/");
  const isApiRoute = pathname.startsWith("/api/");
  const isTeamPage = pathname.startsWith("/team");
  const isSimulatorPage = pathname.startsWith("/simulator");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isPendingPage = pathname === "/pendiente";

  const role = user?.user_metadata?.role as string | undefined;
  const isParticipant = role === "participant";
  const isAdmin = role === "admin";
  const isProfessor = role === "professor";

  const email = user?.email?.toLowerCase() ?? "";
  const isSuperAdmin = email === "ftallabs@ipade.mx";
  const approved = user?.user_metadata?.approved === true || isAdmin || isSuperAdmin;

  if (!user && !isAuthPage && !isPublicPage && !isApiRoute && !isPendingPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isProfessor && !approved && !isPendingPage && !isAuthPage && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/pendiente";
    return NextResponse.redirect(url);
  }

  if (user && approved && isPendingPage) {
    const url = request.nextUrl.clone();
    url.pathname = isParticipant ? "/team" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    if (isParticipant) {
      url.pathname = "/team";
    } else if (isProfessor && !approved) {
      url.pathname = "/pendiente";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  if (user && isParticipant && (isDashboardPage || isSimulatorPage)) {
    const url = request.nextUrl.clone();
    url.pathname = "/team";
    return NextResponse.redirect(url);
  }

  if (user && !isParticipant && isTeamPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
