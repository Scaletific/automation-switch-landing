export interface ProConListProps {
  title?: string
  pros: string[]
  cons: string[]
}

export function ProConList({ title, pros, cons }: ProConListProps) {
  return (
    <div className="pro-con">
      {title && <div className="pro-con-title">{title}</div>}
      <div className="pro-con-grid">
        <div className="pro-con-col pro-con-col--pros" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pro-con-col-header">Pros</div>
          <ul className="pro-con-list" style={{ flex: 1 }}>
            {pros.map((item, i) => (
              <li key={i} className="pro-con-item pro-con-item--pro">
                <span className="pro-con-icon" aria-hidden="true">&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pro-con-col pro-con-col--cons" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pro-con-col-header">Cons</div>
          <ul className="pro-con-list" style={{ flex: 1 }}>
            {cons.map((item, i) => (
              <li key={i} className="pro-con-item pro-con-item--con">
                <span className="pro-con-icon" aria-hidden="true">&#10007;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
