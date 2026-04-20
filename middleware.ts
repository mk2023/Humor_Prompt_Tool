import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: any }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let data: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"] = { user: null };
  try {
    const result = await supabase.auth.getUser();
    data = result.data;
  } catch {
    data = { user: null };
  }

  if (!data?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    const redirectRes = NextResponse.redirect(url);
    // Clear stale Supabase auth cookies that can trigger refresh token errors.
    req.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        redirectRes.cookies.delete(cookie.name);
      }
    });
    return redirectRes;
  }

  return res;
}

export const config = {
matcher: ["/admin", "/admin/:path*"],
};
