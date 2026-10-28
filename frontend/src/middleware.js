import { NextResponse } from "next/server";

/**
 * Next.js Middleware for Multi-Link Hosting on Vercel
 *
 * Supports two deployment patterns:
 * 1. Two separate Vercel projects from the same GitHub repo:
 *    - Main Website project with NEXT_PUBLIC_APP_MODE=public (or unset)
 *    - Admin Portal project with NEXT_PUBLIC_APP_MODE=admin
 *
 * 2. Single Vercel project with two domains / subdomains:
 *    - Main domain: e.g. "studio-frangipani.vercel.app" or "mywebsite.com"
 *    - Admin domain: e.g. "studio-frangipani-admin.vercel.app" or "admin.mywebsite.com"
 */
export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const hostname = (request.headers.get("host") || "").toLowerCase();

  // 1. Skip Next.js internal files, static assets, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Determine if the incoming request is targeting the Admin platform
  const isAdminDomain =
    process.env.NEXT_PUBLIC_APP_MODE === "admin" ||
    hostname.startsWith("admin.") ||
    hostname.includes("-admin.") ||
    hostname.includes("admin-") ||
    hostname.endsWith("-admin.vercel.app") ||
    url.searchParams.get("mode") === "admin";

  // --------------------------------------------------------------------------
  // ADMIN PLATFORM ROUTING
  // --------------------------------------------------------------------------
  if (isAdminDomain) {
    // When visiting the root "/" on the admin link, rewrite internally to "/admin"
    if (pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }

    // Direct route shortcuts without needing the "/admin" prefix
    const adminDirectRoutes = [
      "inventory",
      "props",
      "categories",
      "customers",
      "calendar",
      "analytics",
      "settings",
      "enquiries",
      "rental-requests",
    ];

    const firstSegment = pathname.split("/")[1];
    if (adminDirectRoutes.includes(firstSegment)) {
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // --------------------------------------------------------------------------
  // PUBLIC WEBSITE ROUTING
  // --------------------------------------------------------------------------
  // If an external admin URL is configured (e.g. NEXT_PUBLIC_ADMIN_URL=https://admin.site.com),
  // redirect any access to /admin on the public domain over to the dedicated admin link.
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (adminUrl && pathname.startsWith("/admin")) {
    try {
      const targetBase = adminUrl.startsWith("http") ? adminUrl : `https://${adminUrl}`;
      const target = new URL(pathname, targetBase);
      return NextResponse.redirect(target);
    } catch {
      // Fallback: continue normally
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files with extensions (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
