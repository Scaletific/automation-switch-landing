'use client'

import { useState } from 'react'

export interface CodeBlockProps {
  language?: string
  code: string
  filename?: string
}

export function CodeBlock({ language, code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        {filename && <span className="code-block-filename">{filename}</span>}
        <div className="code-block-header-right">
          {language && <span className="code-block-lang">{language}</span>}
          <button
            className="code-block-copy"
            onClick={handleCopy}
            aria-label="Copy code"
            aria-live="polite"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="code-block-pre"><code className="code-block-code">{code}</code></pre>
    </div>
  )
}
