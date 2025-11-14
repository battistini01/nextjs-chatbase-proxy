import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();

  console.log('PATH: ' + url.pathname)

  // Applica solo a /help e sue subroute
  if (url.pathname.startsWith("/help")) {
    console.log(`Middleware attivato per ${url.pathname}`);
    const hmac = req.headers.get("hmac"); // esempio header custom

    // Calcola HMAC atteso
    const secret = process.env.SHOPIFY_SECRET || "";
    const expectedHmac = crypto
      .createHmac("sha256", secret)
      .update(url.searchParams.toString())
      .digest("hex");

    if (hmac !== expectedHmac) {
      // Non valido → blocca con 401
      console.log(`HMAC non valido per ${url.pathname}. Atteso: ${expectedHmac}, Ricevuto: ${hmac}`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 200 });
    }

    console.log(`HMAC valido per ${url.pathname}.`);
    // HMAC valido → continua verso rewrite (Chatbase)
    return NextResponse.next();
    
  }

  console.log(`Accesso a ${url.pathname} consentito dal middleware.`);

  // Per tutte le altre route → ignora
  return NextResponse.next();
}

// Applica il middleware solo alle route /help/*
export const config = {
  matcher: ['/help', '/help/:path*'],
};
