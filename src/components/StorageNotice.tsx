import type { StorageNotice as Notice } from '../hooks/useAppData.ts'

const MESSAGES: Record<Notice, string> = {
  corrupt:
    "Your saved data couldn't be read, so the app started fresh. A copy of the old data was kept as a backup.",
  unavailable:
    "This browser is blocking storage, so your habits won't be saved after you close the page.",
  'save-failed': "Your last change couldn't be saved. Browser storage may be full or blocked.",
}

type Props = { notice: Notice; onDismiss: () => void }

export default function StorageNotice({ notice, onDismiss }: Props) {
  return (
    <div className="notice" role="status">
      <p>{MESSAGES[notice]}</p>
      <button type="button" className="button button-small" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  )
}
