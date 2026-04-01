export interface TestimonialProps {
  quote: string
  authorName: string
  authorRole?: string
  authorCompany?: string
  avatarUrl?: string
  context?: string
}

export function Testimonial({
  quote,
  authorName,
  authorRole,
  authorCompany,
  avatarUrl,
  context,
}: TestimonialProps) {
  return (
    <div className="testimonial">
      <div className="testimonial-quote">
        <p className="testimonial-quote-text">{quote}</p>
      </div>

      <div className="testimonial-footer">
        {avatarUrl && (
          <div className="testimonial-avatar">
            <img src={avatarUrl} alt={authorName} />
          </div>
        )}

        <div className="testimonial-author-info">
          <div className="testimonial-author-name">{authorName}</div>
          {(authorRole || authorCompany) && (
            <div className="testimonial-author-details">
              {authorRole && <span className="testimonial-author-role">{authorRole}</span>}
              {authorRole && authorCompany && <span className="testimonial-author-sep">,</span>}
              {authorCompany && <span className="testimonial-author-company">{authorCompany}</span>}
            </div>
          )}
          {context && <div className="testimonial-context-badge">{context}</div>}
        </div>
      </div>
    </div>
  )
}
