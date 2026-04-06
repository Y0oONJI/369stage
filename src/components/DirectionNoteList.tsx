import { useEffect, useRef, useState } from 'react'
import { formatNoteStamp } from '../lib/formatNoteStamp'
import { STAGE_LABELS, type DirectionNoteItem, type Stage } from '../types/task'

type Props = {
  stage: Stage
  items: DirectionNoteItem[]
  readOnly: boolean
  onAdd: () => string
  onSave: (itemId: string, text: string) => void
  onRemove: (itemId: string) => void
}

export function DirectionNoteList({
  stage,
  items,
  readOnly,
  onAdd,
  onSave,
  onRemove,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editingId])

  function startEdit(item: DirectionNoteItem) {
    setEditingId(item.id)
    setDraft(item.text)
  }

  function handleSave() {
    if (!editingId) return
    onSave(editingId, draft)
    setEditingId(null)
  }

  function handleCancel() {
    setEditingId(null)
  }

  const heading = `${stage}% · ${STAGE_LABELS[stage]}`

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <p className="mb-2 text-xs font-medium text-zinc-500">디렉션 노트</p>
      <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">{heading}</p>

      {items.length === 0 && !readOnly && (
        <p className="mb-2 text-sm text-zinc-500">아직 노트가 없습니다. 아래에서 추가하세요.</p>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item, index) => {
          const stamp = formatNoteStamp(item.updatedAt)
          const isEditing = editingId === item.id

          if (readOnly) {
            return (
              <li
                key={item.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <p className="text-xs text-zinc-500">
                  디렉션 노트 {index + 1} · {stamp}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
                  {item.text.trim() ? item.text : '—'}
                </p>
              </li>
            )
          }

          if (isEditing) {
            return (
              <li
                key={item.id}
                className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20"
              >
                <div className="mb-2">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    디렉션 노트 {index + 1} · {stamp}
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  className="min-h-[100px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-md px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    취소
                  </button>
                </div>
              </li>
            )
          }

          return (
            <li
              key={item.id}
              className="flex flex-col gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  디렉션 노트 {index + 1} · {stamp}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="line-clamp-4 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                {item.text.trim() ? item.text : '내용 없음'}
              </p>
            </li>
          )
        })}
      </ul>

      {!readOnly && (
        <button
          type="button"
          onClick={() => {
            const id = onAdd()
            setEditingId(id)
            setDraft('')
          }}
          className="mt-3 w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          + 노트 추가
        </button>
      )}
    </div>
  )
}
