import { useState } from 'react'
import { isStageComplete } from '../lib/gates'
import { useTaskStore } from '../store/taskStore'
import type { Stage, Task } from '../types/task'
import { StageStepper } from './StageStepper'

type Props = {
  task: Task
}

export function TaskDetail({ task }: Props) {
  const advanceStage = useTaskStore((s) => s.advanceStage)
  const markDone = useTaskStore((s) => s.markDone)
  const updateTask = useTaskStore((s) => s.updateTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const addChecklistItem = useTaskStore((s) => s.addChecklistItem)
  const updateChecklistItem = useTaskStore((s) => s.updateChecklistItem)
  const removeChecklistItem = useTaskStore((s) => s.removeChecklistItem)

  const [viewStage, setViewStage] = useState<Stage>(() => task.currentStage)
  const [draftTitle, setDraftTitle] = useState(() => task.title)
  const [draftDesc, setDraftDesc] = useState(() => task.description)
  const [newItem, setNewItem] = useState('')

  const isDone = task.status === 'done'
  const editable = !isDone
  const items = task.checklist
  const gateOk = isStageComplete(items)

  const atFinalGate = task.currentStage === 90
  const canEditChecklist = editable && atFinalGate && viewStage === 90

  const canAdvance =
    editable && viewStage === task.currentStage && task.currentStage !== 90

  const canMarkDone =
    editable &&
    viewStage === task.currentStage &&
    atFinalGate &&
    gateOk

  const showGateHint =
    editable && atFinalGate && viewStage === 90 && !gateOk && items.length > 0

  const showEmptyHint =
    editable && atFinalGate && viewStage === 90 && items.length === 0

  const showChecklistPanel =
    (isDone && items.length > 0) || (editable && atFinalGate && viewStage === 90)

  function handleDelete() {
    if (!confirm('이 작업을 삭제할까요?')) return
    deleteTask(task.id)
  }

  function handleBlurSave() {
    if (!editable) return
    if (draftTitle !== task.title || draftDesc !== task.description) {
      updateTask(task.id, { title: draftTitle, description: draftDesc })
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-zinc-800/80 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <input
              className="w-full border-none bg-transparent text-lg font-semibold tracking-tight text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleBlurSave}
              disabled={!editable}
              placeholder="제목"
            />
            {isDone && (
              <p className="mt-1 text-xs font-medium text-emerald-500/90">완료됨</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
          >
            삭제
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            설명
          </label>
          <textarea
            className="min-h-[88px] w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
            value={draftDesc}
            onChange={(e) => setDraftDesc(e.target.value)}
            onBlur={handleBlurSave}
            disabled={!editable}
            placeholder="맥락이나 기준을 적어두세요."
          />
        </div>

        <StageStepper
          currentStage={task.currentStage}
          viewStage={viewStage}
          onSelectStage={setViewStage}
          disabled={false}
        />

        {!isDone && viewStage !== 90 && viewStage === task.currentStage && (
          <p className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-500">
            이 단계는 체크리스트 없이 진행합니다. 방향·구조를 점검한 뒤 다음 단계로 이동하세요.
          </p>
        )}

        {!isDone && viewStage === 90 && task.currentStage < 90 && (
          <p className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-500">
            최종 체크리스트는 90% 단계에 도달한 뒤에 진행됩니다.
          </p>
        )}

        {!isDone && viewStage < task.currentStage && viewStage !== 90 && (
          <p className="text-[11px] text-zinc-600">이전 단계 (체크리스트 없음)</p>
        )}

        {showChecklistPanel && (
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium text-zinc-200">
                {isDone ? '완료 전 최종 확인 (90% → 100%)' : '최종 체크리스트 (90% → 100%)'}
              </h2>
              {isDone && <span className="text-[11px] text-zinc-500">읽기 전용</span>}
            </div>

            {showEmptyHint && (
              <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-500">
                항목을 추가한 뒤 모두 체크해야 작업을 완료할 수 있습니다.
              </p>
            )}

            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-2 py-2"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={!canEditChecklist}
                    onChange={() =>
                      updateChecklistItem(task.id, item.id, {
                        checked: !item.checked,
                      })
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900 accent-indigo-500 disabled:opacity-50"
                  />
                  <input
                    type="text"
                    value={item.text}
                    disabled={!canEditChecklist}
                    onChange={(e) =>
                      updateChecklistItem(task.id, item.id, {
                        text: e.target.value,
                      })
                    }
                    className="min-w-0 flex-1 border-none bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-80"
                    placeholder="항목"
                  />
                  {canEditChecklist && (
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(task.id, item.id)}
                      className="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 opacity-0 hover:text-zinc-300 group-hover:opacity-100"
                    >
                      제거
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {canEditChecklist && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  addChecklistItem(task.id, newItem)
                  setNewItem('')
                }}
              >
                <input
                  className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="새 체크리스트 항목"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-700"
                >
                  추가
                </button>
              </form>
            )}

            {showGateHint && (
              <p className="text-xs text-zinc-500">
                작업을 완료하려면 위 항목을 모두 체크하세요.
              </p>
            )}
          </section>
        )}

        {isDone && items.length === 0 && (
          <p className="text-sm text-zinc-500">저장된 최종 체크리스트 항목이 없습니다.</p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-zinc-800/80 pt-4">
          {canAdvance && (
            <button
              type="button"
              onClick={() => advanceStage(task.id)}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              다음 단계로
            </button>
          )}
          {canMarkDone && (
            <button
              type="button"
              onClick={() => markDone(task.id)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              작업 완료 (100%)
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
