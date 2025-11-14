import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import qs from 'node:querystring';

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith("/help")) {
    console.log(`Middleware attivato per ${url.pathname}`);

    const rawQuery = url.search.slice(1);

    const params = qs.parse(rawQuery, '&', '=', {
      decodeURIComponent: (s) => decodeURIComponent(s), // keep %2F, %20, etc.
    });

    console.log('\n Received searchParams: ' + url.searchParams.toString() + '\n');

    const ordered = Object.keys(params)
      .filter((key) => key !== 'signature')
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('');

    console.log('Ordered params for HMAC: ' + ordered + '\n');

    const expectedHmac = crypto
      .createHmac("sha256", process.env.SHOPIFY_SECRET!)
      .update(ordered)
      .digest("hex");

    if (params.signature !== expectedHmac) {
      // Non valido → blocca con 401
      console.log(`HMAC not valid: Expected: ${expectedHmac}, Received: ${params.signature}`);
      return NextResponse.json({ message: "Unauthorized: Invalid signature" }, { status: 200 });
    }

    console.log(`Valid HMAC: proxying to chatbase.co.`);
    // HMAC valido → continua verso rewrite (Chatbase)
    return NextResponse.next();
    
  }

  // Per tutte le altre route → ignora
  return NextResponse.next();
}

// Applica il middleware solo alle route /help/*
export const config = {
  matcher: ['/help', '/help/:path*'],
};
