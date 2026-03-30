import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Groups 1–4: legacy off-topic pages — return 410 Gone
const gone410 = new Set([
  // Group 1: Futuristic lifestyle
  '/futuristic-rolls-royce',
  '/futuristic-travel',
  '/futuristic-sneakers',
  '/futuristic-buildings',
  '/futuristic-houses',
  '/futuristic-shoes',
  '/futuristic-hotels-that-will-inspire-you',
  '/futuristic-umbrellas',
  '/futuristic-glasses-vision-wearable-technology',
  '/7-sizzling-futuristic-cars-to-drool-over',
  '/10-futuristic-gadgets',
  '/a-futuristic-world',

  // Group 2: Finance / how-to
  '/how-to-delete-betterment-account',
  '/robinhood-account-not-approved',

  // Group 3: Bionic / health tech
  '/how-do-bionic-arms-work',
  '/bionic-lenses',

  // Group 4: IoT / robotaxis / wearables
  '/iot-in-warehouse-management',
  '/what-are-robotaxis',
  '/how-will-robotaxis-impact-urban-mobility',
  '/wearable-technology-in-sports',
])

export function middleware(request: NextRequest) {
  // Normalise: strip trailing slash for matching
  const path = request.nextUrl.pathname.replace(/\/$/, '') || '/'

  if (gone410.has(path)) {
    return new NextResponse(
      '<!doctype html><html><head><title>410 Gone</title></head><body><h1>410 Gone</h1><p>This page has been permanently removed. Visit <a href="/">Automation Switch</a> for our latest content on AI agents and workflow automation.</p></body></html>',
      { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|sitemap.xml|robots.txt|studio|.*\\..*).)'],
}
