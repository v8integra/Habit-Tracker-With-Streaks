import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { nextUnusedColor } from '../lib/colors.ts'
import { validateHabitName } from '../lib/habits.ts'
import { NAME_MAX_LENGTH } from '../lib/storage.ts'
import ColorPicker from './ColorPicker.tsx'

type Props = {
  usedColors: string[]
  onAdd: (input: { name: string; color: string }) => void
  onCancel: () => void
}

export default function AddHabitForm({ usedColors, onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(() => nextUnusedColor(usedColors).id)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
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
    onAdd({ name, color })
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} noValidate>
      <h2 className="add-form-title">New habit</h2>
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
          onKeyDown={(event) => {
            if (event.key === 'Escape') onCancel()
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
          Add
        </button>
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
