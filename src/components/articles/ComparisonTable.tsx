'use client'

export interface ComparisonTool {
  name: string
  logoUrl?: string
}

export interface ComparisonRow {
  criteria: string
  /** 'check' | 'x' | 'partial' | free text */
  values: string[]
}

export interface ComparisonTableProps {
  /** Table headline shown above the comparison */
  headline?: string
  tools: ComparisonTool[]
  rows: ComparisonRow[]
  /** Optional "Best For" row at the bottom — one entry per tool */
  bestFor?: string[]
  /** Optional winner column index (0-based) — highlights the column */
  winnerIndex?: number
}

function CellValue({ value, isWinner: _ }: { value: string; isWinner: boolean }) {
  switch (value.toLowerCase()) {
    case 'check':
    case 'yes':
    case '✓':
      return <span className="ct-icon ct-icon--check" aria-label="Yes">✓</span>
    case 'x':
    case 'no':
    case '✗':
      return <span className="ct-icon ct-icon--x" aria-label="No">✗</span>
    case 'partial':
    case '~':
    case '—':
      return <span className="ct-icon ct-icon--partial" aria-label="Partial">—</span>
    default:
      return <span className="ct-text-value">{value}</span>
  }
}

export function ComparisonTable({
  headline,
  tools,
  rows,
  bestFor,
  winnerIndex,
}: ComparisonTableProps) {
  const colCount = tools.length

  return (
    <div className="ct-wrapper">
      {headline && <div className="ct-headline">{headline}</div>}
      <div className="ct-scroll">
        <table className="ct-table" role="table">
          <thead>
            <tr>
              <th className="ct-corner" scope="col">
                <span className="ct-corner-label">Criteria</span>
              </th>
              {tools.map((tool, i) => (
                <th
                  key={tool.name}
                  scope="col"
                  className={`ct-tool-header ${i === winnerIndex ? 'ct-tool-header--winner' : ''}`}
                >
                  {tool.logoUrl && (
                    <img
                      src={tool.logoUrl}
                      alt=""
                      className="ct-tool-logo"
                      width={24}
                      height={24}
                    />
                  )}
                  <span className="ct-tool-name">{tool.name}</span>
                  {i === winnerIndex && (
                    <span className="ct-winner-badge">Top Pick</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'ct-row--even' : ''}>
                <td className="ct-criteria">{row.criteria}</td>
                {row.values.slice(0, colCount).map((val, ci) => (
                  <td
                    key={ci}
                    className={`ct-cell ${ci === winnerIndex ? 'ct-cell--winner' : ''}`}
                  >
                    <CellValue value={val} isWinner={ci === winnerIndex} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {bestFor && bestFor.length > 0 && (
            <tfoot>
              <tr className="ct-bestfor-row">
                <td className="ct-bestfor-label">Best For</td>
                {bestFor.slice(0, colCount).map((text, i) => (
                  <td
                    key={i}
                    className={`ct-bestfor-cell ${i === winnerIndex ? 'ct-bestfor-cell--winner' : ''}`}
                  >
                    {text}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
