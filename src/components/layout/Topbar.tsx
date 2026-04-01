'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const CORE_PILLARS = [
  {
    slug: 'workflow-automation',
    label: 'Workflow Automation',
    desc: 'Platforms, flows, and operational cleanup',
  },
  {
    slug: 'ai-workflows',
    label: 'AI Workflows',
    desc: 'Agentic automation and AI-powered systems',
  },
  {
    slug: 'tool-comparisons',
    label: 'Tool Comparisons',
    desc: 'Side-by-side breakdowns and buying guides',
  },
  {
    slug: 'automation-audits',
    label: 'Automation Audits',
    desc: 'Frameworks, reviews, and diagnostic guides',
  },
]

const SECONDARY_PILLARS = [
  { slug: 'hyperautomation',      label: 'Hyperautomation' },
  { slug: 'production-readiness', label: 'Production Readiness' },
]

export function Topbar() {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [topicsOpen, setTopicsOpen]   = useState(false)  // mobile sub-menu
  const [dropdownOpen, setDropdownOpen] = useState(false) // desktop hover state
  const dropdownRef  = useRef<HTMLDivElement>(null)
  const closeTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setTopicsOpen(false) }, [pathname])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 900) { setMenuOpen(false); setTopicsOpen(false) }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close dropdown on outside click (keyboard / mouse)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Cleanup close timer on unmount
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  function openDropdown() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setDropdownOpen(true)
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 180)
  }

  function close() { setMenuOpen(false); setTopicsOpen(false) }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-mark">
            <svg width="32" height="32" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="56" height="56" fill="none" stroke="#c8861a" strokeWidth="2.5"/>
              <rect x="11" y="11" width="15" height="34" fill="#c8861a"/>
              <rect x="30" y="11" width="17" height="17" fill="#1e1a14" opacity="0.25"/>
              <rect x="30" y="31" width="17" height="14" fill="#c8861a" opacity="0.45"/>
            </svg>
          </div>
          <Link href="/" className="logo-text" onClick={close}>AUTOMATION<span>SWITCH</span></Link>
        </div>

        <nav className="topbar-right">
          {/* Articles with pillar dropdown */}
          <div
            className={`nav-dropdown-wrap${dropdownOpen ? ' nav-dropdown-wrap--open' : ''}`}
            ref={dropdownRef}
            onMouseEnter={openDropdown}
            onMouseLeave={scheduleClose}
          >
            <button
              className="nav-link nav-link--btn"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen(o => !o)}
            >
              Articles
              <span className="nav-chevron" aria-hidden="true">▾</span>
            </button>

            <div className="nav-dropdown" role="menu" aria-label="Browse by topic" onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
              <div className="nav-dropdown-header">Browse by topic</div>

              <div className="nav-dropdown-core">
                {CORE_PILLARS.map(p => (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="nav-dropdown-label">{p.label}</span>
                    <span className="nav-dropdown-desc">{p.desc}</span>
                  </Link>
                ))}
              </div>

              <div className="nav-dropdown-divider" />

              <div className="nav-dropdown-secondary">
                {SECONDARY_PILLARS.map(p => (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="nav-dropdown-secondary-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    {p.label}
                  </Link>
                ))}
                <Link
                  href="/articles"
                  className="nav-dropdown-all"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  All articles →
                </Link>
              </div>
            </div>
          </div>

          <Link href="/tools"   className="nav-link">Tools</Link>
          <Link href="/skills"  className="nav-link">Skills Hub</Link>
          <Link href="/audits"  className="nav-link">Audits</Link>
          <Link href="/about"   className="nav-link">About</Link>

          <div className="topbar-social">
            <a href="https://x.com/automationswitch" className="social-link" aria-label="X / Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/automationswitch" className="social-link" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://linkedin.com/company/automationswitch" className="social-link" aria-label="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://youtube.com/@automationswitch" className="social-link" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>

          <Link href="/#subscribe" className="nav-cta">Subscribe</Link>
        </nav>

        {/* Mobile controls */}
        <div className="topbar-mobile-controls">
          <button
            className={`burger-btn${menuOpen ? ' burger-btn--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Navigation menu">
          <nav className="mobile-menu-nav">
            {/* Articles — expandable topics sub-list */}
            <button
              className={`mobile-nav-link mobile-nav-link--expandable${topicsOpen ? ' mobile-nav-link--expanded' : ''}`}
              onClick={() => setTopicsOpen(o => !o)}
              aria-expanded={topicsOpen}
            >
              Articles
              <span className="mobile-nav-chevron" aria-hidden="true">{topicsOpen ? '−' : '+'}</span>
            </button>

            {topicsOpen && (
              <div className="mobile-topics-panel">
                {CORE_PILLARS.map(p => (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="mobile-topic-link"
                    onClick={close}
                  >
                    <span className="mobile-topic-label">{p.label}</span>
                    <span className="mobile-topic-desc">{p.desc}</span>
                  </Link>
                ))}
                <div className="mobile-topics-divider" />
                {SECONDARY_PILLARS.map(p => (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    className="mobile-topic-link mobile-topic-link--secondary"
                    onClick={close}
                  >
                    {p.label}
                  </Link>
                ))}
                <Link href="/articles" className="mobile-topic-link mobile-topic-link--all" onClick={close}>
                  All articles →
                </Link>
              </div>
            )}

            <Link href="/tools"          className="mobile-nav-link" onClick={close}>Tools</Link>
            <Link href="/skills"         className="mobile-nav-link" onClick={close}>Skills Hub</Link>
            <Link href="/audits"         className="mobile-nav-link" onClick={close}>Audits</Link>
            <Link href="/about"          className="mobile-nav-link" onClick={close}>About</Link>
            <Link href="/contact"        className="mobile-nav-link" onClick={close}>Contact</Link>
            <Link href="/#subscribe"     className="mobile-nav-link mobile-nav-link--cta" onClick={close}>Subscribe. It&apos;s Free.</Link>
          </nav>
          <div className="mobile-menu-social">
            <a href="https://x.com/automationswitch" className="social-link" aria-label="X / Twitter" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/automationswitch" className="social-link" aria-label="Instagram" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://linkedin.com/company/automationswitch" className="social-link" aria-label="LinkedIn" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://youtube.com/@automationswitch" className="social-link" aria-label="YouTube" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      )}
    </>
  )
}
