type Props = { done: number; total: number }

export default function ProgressBar({ done, total }: Props) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const label = `${done} of ${total} done`

  return (
    <div className="progress">
      <p className="progress-label" aria-hidden="true">
        {label}
      </p>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Today's progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={label}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
