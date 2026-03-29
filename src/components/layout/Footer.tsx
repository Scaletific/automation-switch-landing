import Link from 'next/link'

export function Footer() {
  return (
    <footer className="footer-dark">
      <div className="footer-dark-inner">
        <div className="footer-dark-brand">
          <div className="footer-logo-mark">
            <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="56" height="56" fill="none" stroke="#c8861a" strokeWidth="2.5"/>
              <rect x="11" y="11" width="15" height="34" fill="#c8861a"/>
              <rect x="30" y="11" width="17" height="17" fill="#f0ebe0" opacity="0.08"/>
              <rect x="30" y="31" width="17" height="14" fill="#c8861a" opacity="0.45"/>
            </svg>
          </div>
          <div>
            <div className="footer-dark-name">AUTOMATION<span>SWITCH</span></div>
            <div className="footer-dark-tagline">Tools, insights, and automation infrastructure.</div>
          </div>
        </div>

        <div className="footer-dark-cols">
          <div className="footer-dark-col">
            <div className="footer-col-label">Content</div>
            <Link href="/articles">Articles</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/skills">Skills Hub</Link>
          </div>
          <div className="footer-dark-col">
            <div className="footer-col-label">Company</div>
            <Link href="/about">About</Link>
            <Link href="/#subscribe">Newsletter</Link>
          </div>
          <div className="footer-dark-col">
            <div className="footer-col-label">Follow</div>
            <a href="https://x.com/automationswitch" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            <a href="https://linkedin.com/company/automationswitch" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://youtube.com/@automationswitch" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </div>

      <div className="footer-dark-bottom">
        <span>© 2026 Automation Switch</span>
        <div className="footer-dark-social">
          <a href="https://x.com/automationswitch" className="social-link" aria-label="X / Twitter">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://linkedin.com/company/automationswitch" className="social-link" aria-label="LinkedIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://youtube.com/@automationswitch" className="social-link" aria-label="YouTube">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
