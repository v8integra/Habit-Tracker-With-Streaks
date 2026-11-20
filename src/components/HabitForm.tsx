import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { validateHabitName } from '../lib/habits.ts'
import { NAME_MAX_LENGTH } from '../lib/storage.ts'
import ColorPicker from './ColorPicker.tsx'

type Props = {
  title: string
  submitLabel: string
  initialName?: string
  initialColor: string
  onSubmit: (input: { name: string; color: string }) => void
  onCancel: () => void
}

/** Name + color form, used both to add a habit and to edit one. */
export default function HabitForm({
  title,
  submitLabel,
  initialName = '',
  initialColor,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const nameId = useId()
  const errorId = useId()

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = validateHabitName(name)
    if (problem !== null) {
      setError(problem)
      nameRef.current?.focus()
      return
    }
    onSubmit({ name, color })
  }

  return (
    <form
      className="habit-form"
      aria-labelledby={titleId}
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
      }}
      noValidate
    >
      <h2 id={titleId} className="habit-form-title">
        {title}
      </h2>
      <div className="field">
        <label htmlFor={nameId}>Name</label>
        <input
          ref={nameRef}
          id={nameId}
          type="text"
          value={name}
          maxLength={NAME_MAX_LENGTH}
          placeholder="e.g. Read 10 pages"
          autoComplete="off"
          aria-invalid={error !== null}
          aria-describedby={error !== null ? errorId : undefined}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
        />
        {error !== null && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <ColorPicker value={color} onChange={setColor} />
      <div className="form-actions">
        <button type="submit" className="button button-primary">
          {submitLabel}
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
