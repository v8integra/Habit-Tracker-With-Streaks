type Props = { onAddFirst: () => void }

export default function EmptyState({ onAddFirst }: Props) {
  return (
    <div className="empty-state">
      <p className="empty-title">No habits yet</p>
      <p className="empty-text">
        Add one small thing you want to do every day, and start your first streak.
      </p>
      <button type="button" className="button button-primary" onClick={onAddFirst}>
        Add your first habit
      </button>
    </div>
  )
}
