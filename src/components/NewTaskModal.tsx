import { useState } from 'react'
import { getCategorySelectOptions } from '../data/qaStructured'
import type { QaCategoryId } from '../types/task'

type Props = {
  open: boolean
  onClose: () => void
  defaultStartDate?: string
  onCreate: (
    title: string,
    description: string,
    startDate: string,
    dueDate: string,
    categoryId: QaCategoryId,
  ) => void
}

const categoryOptions = getCategorySelectOptions()

export function NewTaskModal({ open, onClose, defaultStartDate, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(defaultStartDate ?? '')
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState<QaCategoryId>('common')

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCreate(title, description, startDate, dueDate, categoryId)
    setTitle('')
    setDescription('')
    setStartDate('')
    setDueDate('')
    setCategoryId('common')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 dark:bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-task-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-task-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          새 작업
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">제목</label>
            <input
              autoFocus
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 온보딩 화면 시안"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">본문</label>
            <textarea
              className="min-h-[100px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:focus:border-zinc-600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="목표, 제약, 참고 링크 등"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500">시작일</label>
              <input
                type="date"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500">목표일</label>
              <input
                type="date"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">QA 카테고리</label>
            <p className="mb-1.5 text-[11px] text-zinc-500">
              90% 최종 체크리스트가 이 카테고리에 맞춰 채워집니다. 만든 뒤에는 바꿀 수 없습니다.
            </p>
            <select
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as QaCategoryId)}
            >
              {categoryOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
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
