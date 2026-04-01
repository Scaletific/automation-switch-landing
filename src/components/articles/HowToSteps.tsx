export interface HowToStepItem {
  _key: string
  title: string
  description: string
}

export interface HowToStepsProps {
  title?: string
  steps: HowToStepItem[]
}

export function HowToSteps({ title, steps }: HowToStepsProps) {
  return (
    <div className="how-to">
      {title && <div className="how-to-title">{title}</div>}
      <ol className="how-to-list">
        {steps.map((step, i) => (
          <li key={step._key} className="how-to-step">
            <div className="how-to-step-number">{String(i + 1).padStart(2, '0')}</div>
            <div className="how-to-step-content">
              <div className="how-to-step-title">{step.title}</div>
              <p className="how-to-step-desc">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
