import { useState, type ReactNode } from 'react'
import { getCategoryTitle } from '../data/qaStructured'
import { formatDueDateLabel } from '../lib/formatDueDate'
import type { TaskStore } from '../store/taskStore'
import type { Task } from '../types/task'

/** 제목·본문·날짜 로컬 state — 타이핑 시 이 패널만 리렌더(스크롤 영역은 본문과 동일) */
export function TaskMetaPanel({
  task,
  updateTask,
  deleteTask,
  children,
}: {
  task: Task
  updateTask: TaskStore['updateTask']
  deleteTask: TaskStore['deleteTask']
  children: ReactNode
}) {
  const [editingMeta, setEditingMeta] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDesc, setDraftDesc] = useState('')
  const [draftDueDate, setDraftDueDate] = useState('')

  const isDone = task.status === 'done'
  const editable = !isDone

  function startMetaEdit() {
    setDraftTitle(task.title)
    setDraftDesc(task.description)
    setDraftDueDate(task.dueDate)
    setEditingMeta(true)
  }
  function saveMeta() {
    updateTask(task.id, {
      title: draftTitle,
      description: draftDesc,
      dueDate: draftDueDate,
    })
    setEditingMeta(false)
  }

  function cancelMetaEdit() {
    setEditingMeta(false)
  }

  function handleDelete() {
    if (!confirm('이 작업을 삭제할까요?')) return
    deleteTask(task.id)
  }

  const dueLabel = formatDueDateLabel(task.dueDate)

  return (
    <>
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800/80">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editingMeta && editable ? (
              <input
                autoFocus
                className="w-full border-none bg-transparent text-lg font-semibold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="제목"
              />
            ) : (
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {task.title}
              </h1>
            )}
            {isDone && (
              <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-500/90">완료됨</p>
            )}
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              QA 카테고리:{' '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {getCategoryTitle(task.categoryId)}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {editable && !editingMeta && (
              <button
                type="button"
                onClick={startMetaEdit}
                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                제목·본문·날짜 수정
              </button>
            )}
            {editable && editingMeta && (
              <>
                <button
                  type="button"
                  onClick={saveMeta}
                  className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={cancelMetaEdit}
                  className="rounded-md px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  취소
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            >
              삭제
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-4">
          {editingMeta && editable ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                  목표일
                </label>
                <input
                  type="date"
                  className="w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600"
                  value={draftDueDate}
                  onChange={(e) => setDraftDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                  본문
                </label>
                <textarea
                  className="min-h-[120px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  placeholder="맥락이나 기준을 적어두세요."
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">목표일</p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {dueLabel || '미정'}
                </p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">본문</p>
                <div className="min-h-[2rem] whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {task.description.trim() ? task.description : (
                    <span className="text-zinc-400 dark:text-zinc-500">본문 없음</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {children}
      </div>
    </>
  )
}
