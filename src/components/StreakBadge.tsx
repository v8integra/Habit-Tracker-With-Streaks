type Props = { days: number }

/** "🔥 12" on screen, read as "12-day streak". Hidden when there's no streak. */
export default function StreakBadge({ days }: Props) {
  if (days <= 0) return null

  return (
    <span className="streak">
      <span aria-hidden="true">🔥 {days}</span>
      <span className="sr-only">{days}-day streak</span>
    </span>
  )
}
