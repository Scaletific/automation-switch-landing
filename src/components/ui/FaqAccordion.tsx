'use client'

import type { FaqItem } from '@/lib/types'

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="article-faq">
      <div className="faq-label">Frequently asked questions</div>
      {items.map(item => (
        <div
          key={item._key}
          className="faq-item"
          onClick={e => {
            (e.currentTarget as HTMLElement).classList.toggle('open')
          }}
        >
          <button className="faq-question">
            <span className="faq-question-text">{item.question}</span>
            <span className="faq-chevron">+</span>
          </button>
          <div className="faq-answer">{item.answer}</div>
        </div>
      ))}
    </div>
  )
}
