import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (title: string, description: string) => void
}

export function NewTaskModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCreate(title, description)
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4 backdrop-blur-[1px] dark:bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-task-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-task-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          새 작업
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">
              제목
            </label>
            <input
              autoFocus
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:bg-zinc-900/80"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 온보딩 화면 시안"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">
              설명 (선택)
            </label>
            <textarea
              className="min-h-[80px] w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:focus:border-zinc-600 dark:focus:bg-zinc-900/80"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="목표, 제약, 참고 링크 등"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
