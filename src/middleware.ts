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

  // Group 5: NFT / crypto / steampunk / lifestyle
  '/best-nft-marketplaces',
  '/how-to-create-nft-art',
  '/steampunk-sunglasses-retro-futuristic-eyewear',
  '/steampunk-goggles',
  '/cyberpunk-aesthetic',

  // Group 6: Robotics / biotech / sensors
  '/applications-of-swarm-robotics',
  '/are-robots-expensive',
  '/nao-robot-discover-programmable-humanoid-2',
  '/egrobots-a-uae-based-startup-is-advancing-mena-agriculture-with-robotics-and-ai',
  '/injectable-sensors-revolutionize-animal-health-monitoring',
  '/implantable-batteries-use-the-bodys-oxygen-for-power',
  '/the-future-of-bionic-limbs',
  '/vertiports-for-evtol',
  '/iot-for-healthcare',

  // Group 7: Tech news / analysis (off-topic)
  '/zoom-launches-ai-powered-workplace-collaboration-platform',
  '/altmans-50-billion-wager-openais-quest-for-agi-ignites-discussion',
  '/google-cyber-security',
  '/blockchain-attacks-and-their-impact',
  '/technology-for-high-capacity-optical-discs',
  '/telesign-relies-on-ai-and-ml-for-omnichannel-security',
  '/understanding-disruptive-technology',
  '/tech-companies-driving-change',
  '/how-much-do-machine-learning-engineers-earn',
  '/digital-wellbeing-apps-for-kids-and-parents',
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
