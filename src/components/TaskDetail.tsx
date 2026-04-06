import { useState } from 'react'
import { formatDueDateLabel } from '../lib/formatDueDate'
import { isStageComplete } from '../lib/gates'
import { useTaskStore } from '../store/taskStore'
import { STAGES, STAGE_LABELS, type ChecklistItem, type Stage, type Task } from '../types/task'
import { StageStepper } from './StageStepper'

/** 체크리스트 문구는 타이핑마다 스토어를 갱신하지 않고 blur 시에만 반영 (입력 지연 완화) */
function ChecklistItemTextInput({
  item,
  disabled,
  onCommit,
}: {
  item: ChecklistItem
  disabled: boolean
  onCommit: (text: string) => void
}) {
  const [draft, setDraft] = useState(item.text)

  return (
    <input
      type="text"
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== item.text) onCommit(draft)
      }}
      className="min-w-0 flex-1 border-none bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-80 dark:text-zinc-200 dark:placeholder:text-zinc-600"
      placeholder="항목"
    />
  )
}

/** 디렉션은 타이핑마다 스토어 갱신하지 않고 blur 시 반영 */
function DirectionBlurField({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string
  value: string
  disabled: boolean
  onCommit: (text: string) => void
}) {
  const [draft, setDraft] = useState(value)

  if (disabled) {
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-500">{label}</p>
        <div className="min-h-[3rem] whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
          {value.trim() ? value : '—'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</label>
      <textarea
        className="min-h-[80px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
        value={draft}
        placeholder="이 단계에서의 방향·기준·메모"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) onCommit(draft)
        }}
      />
    </div>
  )
}

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
  const setDirectionNote = useTaskStore((s) => s.setDirectionNote)

  const [viewStage, setViewStage] = useState<Stage>(() => task.currentStage)
  const [newItem, setNewItem] = useState('')

  const [editingMeta, setEditingMeta] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDesc, setDraftDesc] = useState('')
  const [draftDueDate, setDraftDueDate] = useState('')

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
    <main className="flex min-h-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800/80">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editingMeta && editable ? (
              <input
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

        <StageStepper
          currentStage={task.currentStage}
          viewStage={viewStage}
          onSelectStage={setViewStage}
          disabled={false}
        />

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">단계별 디렉션</h2>
          <p className="text-[11px] text-zinc-500">
            30·60·90 각 단계의 메모입니다. 최종 체크리스트(90%→100%)와는 별도입니다.
          </p>
          {STAGES.map((stage) => (
            <DirectionBlurField
              key={`${stage}-${task.directionNotes[stage]}`}
              label={`${stage}% · ${STAGE_LABELS[stage]}`}
              value={task.directionNotes[stage]}
              disabled={isDone}
              onCommit={(text) => setDirectionNote(task.id, stage, text)}
            />
          ))}
        </section>

        {!isDone && viewStage !== 90 && viewStage === task.currentStage && (
          <p className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-500">
            이 단계는 체크리스트 없이 진행합니다. 방향·구조를 점검한 뒤 다음 단계로 이동하세요.
          </p>
        )}

        {!isDone && viewStage === 90 && task.currentStage < 90 && (
          <p className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-500">
            최종 체크리스트는 90% 단계에 도달한 뒤에 진행됩니다.
          </p>
        )}

        {!isDone && viewStage < task.currentStage && viewStage !== 90 && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-600">이전 단계 (체크리스트 없음)</p>
        )}

        {showChecklistPanel && (
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {isDone ? '완료 전 최종 확인 (90% → 100%)' : '최종 체크리스트 (90% → 100%)'}
              </h2>
              {isDone && <span className="text-[11px] text-zinc-500">읽기 전용</span>}
            </div>

            {showEmptyHint && (
              <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-500">
                항목을 추가한 뒤 모두 체크해야 작업을 완료할 수 있습니다.
              </p>
            )}

            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/40"
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
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 bg-white accent-indigo-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900"
                  />
                  <ChecklistItemTextInput
                    key={`${item.id}-${item.text}`}
                    item={item}
                    disabled={!canEditChecklist}
                    onCommit={(text) =>
                      updateChecklistItem(task.id, item.id, { text })
                    }
                  />
                  {canEditChecklist && (
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(task.id, item.id)}
                      className="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 opacity-0 hover:text-zinc-800 group-hover:opacity-100 dark:hover:text-zinc-300"
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
                  className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="새 체크리스트 항목"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
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

        <div className="mt-auto flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800/80">
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
