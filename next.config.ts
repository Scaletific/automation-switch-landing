import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' }
    ]
  },

  async redirects() {
    return [
      // Group 5: AI/Chatbot → hub article (301)
      { source: '/creative-chatbot-startups',   destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/twitch-chatbot',               destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/what-is-a-chatbot-builder',    destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/virtual-ai-friend-apps',       destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/eva-chatbot',                  destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/chatbot-case-studies',          destination: '/articles/best-automation-tools-small-businesses', permanent: true },

      // Group 6: AI tools / creative → design systems article (301)
      { source: '/midjourney-aspect-ratio-keyword-midjourney',  destination: '/articles/google-stitch-claude-design-systems', permanent: true },
      { source: '/stable-diffusion-setup-on-runpoud-cloud',     destination: '/articles/google-stitch-claude-design-systems', permanent: true },
      { source: '/reimagine-home-ai-interior-design-generator', destination: '/articles/google-stitch-claude-design-systems', permanent: true },

      // Trailing-slash variants for all of the above
      { source: '/creative-chatbot-startups/',   destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/twitch-chatbot/',               destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/what-is-a-chatbot-builder/',    destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/virtual-ai-friend-apps/',       destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/eva-chatbot/',                  destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/chatbot-case-studies/',          destination: '/articles/best-automation-tools-small-businesses', permanent: true },
      { source: '/midjourney-aspect-ratio-keyword-midjourney/',  destination: '/articles/google-stitch-claude-design-systems', permanent: true },
      { source: '/stable-diffusion-setup-on-runpoud-cloud/',     destination: '/articles/google-stitch-claude-design-systems', permanent: true },
      { source: '/reimagine-home-ai-interior-design-generator/', destination: '/articles/google-stitch-claude-design-systems', permanent: true },
    ]
  },
}

export default nextConfig
