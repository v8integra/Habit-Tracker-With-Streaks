type Props = { label: string; value: string }

export default function StatTile({ label, value }: Props) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
