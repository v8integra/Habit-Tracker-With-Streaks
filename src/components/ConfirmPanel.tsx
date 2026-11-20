import { useEffect, useId, useRef } from 'react'

type Props = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A confirm step before something that can't be undone (delete, replace, clear).
 * Focus starts on Cancel, the safe choice, and Escape cancels.
 */
export default function ConfirmPanel({ title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const textId = useId()

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <section
      className="confirm-panel"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={textId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
      }}
    >
      <h2 id={titleId}>{title}</h2>
      <p id={textId}>{message}</p>
      <div className="form-actions">
        <button type="button" className="button button-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button ref={cancelRef} type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  )
}
