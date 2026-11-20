import { useId } from 'react'
import { HABIT_COLORS } from '../lib/colors.ts'

type Props = { value: string; onChange: (colorId: string) => void }

/** A radio group of the 8 preset colors. Arrow keys move between them. */
export default function ColorPicker({ value, onChange }: Props) {
  const name = useId()

  return (
    <fieldset className="color-picker">
      <legend>Color</legend>
      <div className="swatches">
        {HABIT_COLORS.map((color) => (
          <label key={color.id} className="swatch" title={color.name}>
            <input
              type="radio"
              name={name}
              value={color.id}
              checked={value === color.id}
              onChange={() => onChange(color.id)}
              aria-label={color.name}
            />
            <span className="swatch-color" style={{ backgroundColor: color.value }} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
