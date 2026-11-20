import { useEffect, useId, useRef } from 'react'

type Props = { habitName: string; onConfirm: () => void; onCancel: () => void }

/** The confirm step before deleting. Focus starts on Cancel, the safe choice. */
export default function DeleteConfirm({ habitName, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const textId = useId()

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <section
      className="delete-confirm"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={textId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
      }}
    >
      <h2 id={titleId}>Delete “{habitName}”?</h2>
      <p id={textId}>This removes the habit and all of its history. This can’t be undone.</p>
      <div className="form-actions">
        <button type="button" className="button button-danger" onClick={onConfirm}>
          Delete
        </button>
        <button ref={cancelRef} type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  )
}
