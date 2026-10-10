import { retryStorage, useStorageIssue } from '../lib/store.js'
import { Button } from './ui/index.jsx'

export function StorageRecovery({ onRecovered, focusAfterRecovery }) {
  const issue = useStorageIssue()
  if (!issue || !['read', 'corrupt', 'conflict'].includes(issue.kind)) return null

  function recover(event) {
    const submit = event.currentTarget.closest('form')?.querySelector('button[type="submit"]')
    if (!retryStorage()) return
    onRecovered?.()
    if (focusAfterRecovery) focusAfterRecovery()
    else submit?.focus()
  }

  return <Button type="button" variant="ghost" className="mt-3" onClick={recover}>Reler dados salvos</Button>
}

export default function StorageNotice() {
  const issue = useStorageIssue()
  if (!issue) return null
  return (
    <div className="mb-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-white">
      <p role="status" className="text-sm leading-relaxed">{issue.message}</p>
      <StorageRecovery />
    </div>
  )
}
