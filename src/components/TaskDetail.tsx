import { memo, useLayoutEffect, useState, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { checklistUiMode, getCategoryTitle } from '../data/qaStructured'
import { formatDueDateLabel } from '../lib/formatDueDate'
import { isStageComplete } from '../lib/gates'
import { useTaskStore } from '../store/taskStore'
import type { TaskStore } from '../store/taskStore'
import type { ChecklistItem, Stage, Task } from '../types/task'
import { DirectionNoteList } from './DirectionNoteList'
import { StageStepper } from './StageStepper'

function groupChecklistBySection(
  checklist: ChecklistItem[],
): { sectionTitle: string; items: ChecklistItem[] }[] {
  const order: string[] = []
  const map = new Map<string, ChecklistItem[]>()
  for (const it of checklist) {
    const key = it.sectionTitle ?? '기타'
    if (!map.has(key)) {
      order.push(key)
      map.set(key, [])
    }
    map.get(key)!.push(it)
  }
  return order.map((sectionTitle) => ({
    sectionTitle,
    items: map.get(sectionTitle)!,
  }))
}

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
        if (draft === item.text) return
        const next = draft
        /** blur 직후 동기 스토어 갱신은 다음 포커스 대상까지 리렌더를 끌어와 지연을 유발 — 한 틱 뒤 커밋 */
        window.setTimeout(() => onCommit(next), 0)
      }}
      className="min-w-0 flex-1 border-none bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-80 dark:text-zinc-200 dark:placeholder:text-zinc-600"
      placeholder="항목"
    />
  )
}

/** 제목·본문·날짜 로컬 state — 타이핑 시 이 패널만 리렌더(스크롤 영역은 본문과 동일) */
function TaskMetaPanel({
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

type BodyProps = {
  task: Task
  taskId: string
  advanceStage: TaskStore['advanceStage']
  markDone: TaskStore['markDone']
  addChecklistItem: TaskStore['addChecklistItem']
  updateChecklistItem: TaskStore['updateChecklistItem']
  removeChecklistItem: TaskStore['removeChecklistItem']
  addDirectionNoteItem: TaskStore['addDirectionNoteItem']
  saveDirectionNoteItem: TaskStore['saveDirectionNoteItem']
  removeDirectionNoteItem: TaskStore['removeDirectionNoteItem']
}

/** 단계·디렉션·체크리스트 로컬 state — 타이핑 시 헤더와 분리된 리렌더 */
const TaskDetailBody = memo(function TaskDetailBody({
  task: cur,
  taskId,
  advanceStage,
  markDone,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  addDirectionNoteItem,
  saveDirectionNoteItem,
  removeDirectionNoteItem,
}: BodyProps) {
  const [viewStage, setViewStage] = useState<Stage>(() => {
    return (
      useTaskStore.getState().tasks.find((x) => x.id === taskId)?.currentStage ??
      30
    )
  })

  const [newItem, setNewItem] = useState('')

  const isDone = cur.status === 'done'
  const editable = !isDone
  const items = cur.checklist
  const gateOk = isStageComplete(items)

  const atFinalGate = cur.currentStage === 90
  const canEditChecklist = editable && atFinalGate && viewStage === 90

  const checklistMode = checklistUiMode(cur.categoryId, items)

  useLayoutEffect(() => {
    if (cur.currentStage !== 90 || cur.checklist.length > 0) return
    useTaskStore.getState().ensureCategoryChecklistAt90(cur.id)
  }, [cur.currentStage, cur.id, cur.checklist.length])

  const canAdvance =
    editable && viewStage === cur.currentStage && cur.currentStage !== 90

  const canMarkDone =
    editable &&
    viewStage === cur.currentStage &&
    atFinalGate &&
    gateOk

  const showGateHint =
    editable && atFinalGate && viewStage === 90 && !gateOk && items.length > 0

  const showEmptyHint =
    editable &&
    atFinalGate &&
    viewStage === 90 &&
    items.length === 0 &&
    checklistMode === 'legacy'

  const showChecklistPanel =
    viewStage === 90 &&
    ((isDone && items.length > 0) || (editable && atFinalGate))

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <StageStepper
        currentStage={cur.currentStage}
        viewStage={viewStage}
        onSelectStage={setViewStage}
        disabled={false}
      />

      <p className="text-[11px] text-zinc-500">
        위에서 단계를 바꾸면 그 단계의 디렉션 목록만 보입니다. 90%를 선택하면 디렉션과 최종 체크리스트가 함께 보입니다.
      </p>

      <DirectionNoteList
        key={`${cur.id}-${viewStage}`}
        stage={viewStage}
        items={cur.directionNotes[viewStage]}
        readOnly={isDone}
        onAdd={() => addDirectionNoteItem(cur.id, viewStage)}
        onSave={(itemId, text) =>
          saveDirectionNoteItem(cur.id, viewStage, itemId, text)
        }
        onRemove={(itemId) =>
          removeDirectionNoteItem(cur.id, viewStage, itemId)
        }
      />

      {!isDone && viewStage !== 90 && viewStage === cur.currentStage && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-500">
          이 단계는 체크리스트 없이 진행합니다. 방향·구조를 점검한 뒤 다음 단계로 이동하세요.
        </p>
      )}

      {!isDone && viewStage === 90 && cur.currentStage < 90 && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-500">
          최종 체크리스트는 90% 단계에 도달한 뒤에 진행됩니다.
        </p>
      )}

      {!isDone && viewStage < cur.currentStage && viewStage !== 90 && (
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

          {checklistMode === 'structured' ? (
            <div className="flex flex-col gap-4">
              {groupChecklistBySection(items).map(({ sectionTitle, items: groupItems }) => (
                <div key={sectionTitle}>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    {sectionTitle}
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {groupItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/40"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          disabled={!canEditChecklist}
                          onChange={() =>
                            updateChecklistItem(cur.id, item.id, {
                              checked: !item.checked,
                            })
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 bg-white accent-indigo-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            {item.displayCode != null ? `${item.displayCode} · ` : ''}
                            {item.label ?? '항목'}
                          </p>
                          <p className="text-sm leading-snug text-zinc-800 dark:text-zinc-200">
                            {item.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
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
                        updateChecklistItem(cur.id, item.id, {
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
                        updateChecklistItem(cur.id, item.id, { text })
                      }
                    />
                    {canEditChecklist && (
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(cur.id, item.id)}
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
                    addChecklistItem(cur.id, newItem)
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
            </>
          )}

          {showGateHint && (
            <p className="text-xs text-zinc-500">
              작업을 완료하려면 위 항목을 모두 체크하세요.
            </p>
          )}
        </section>
      )}

      {isDone && viewStage === 90 && items.length === 0 && (
        <p className="text-sm text-zinc-500">저장된 최종 체크리스트 항목이 없습니다.</p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800/80">
        {canAdvance && (
          <button
            type="button"
            onClick={() => advanceStage(cur.id)}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            다음 단계로
          </button>
        )}
        {canMarkDone && (
          <button
            type="button"
            onClick={() => markDone(cur.id)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            작업 완료 (100%)
          </button>
        )}
      </div>
    </div>
  )
})

type Props = {
  taskId: string
}

export function TaskDetail({ taskId }: Props) {
  const {
    task,
    advanceStage,
    markDone,
    updateTask,
    deleteTask,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    addDirectionNoteItem,
    saveDirectionNoteItem,
    removeDirectionNoteItem,
  } = useTaskStore(
    useShallow((s) => {
      const t = s.tasks.find((x) => x.id === taskId)
      return {
        task: t,
        advanceStage: s.advanceStage,
        markDone: s.markDone,
        updateTask: s.updateTask,
        deleteTask: s.deleteTask,
        addChecklistItem: s.addChecklistItem,
        updateChecklistItem: s.updateChecklistItem,
        removeChecklistItem: s.removeChecklistItem,
        addDirectionNoteItem: s.addDirectionNoteItem,
        saveDirectionNoteItem: s.saveDirectionNoteItem,
        removeDirectionNoteItem: s.removeDirectionNoteItem,
      }
    }),
  )

  if (!task) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">작업을 찾을 수 없습니다.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <TaskMetaPanel task={task} updateTask={updateTask} deleteTask={deleteTask}>
        <TaskDetailBody
          task={task}
          taskId={taskId}
          advanceStage={advanceStage}
          markDone={markDone}
          addChecklistItem={addChecklistItem}
          updateChecklistItem={updateChecklistItem}
          removeChecklistItem={removeChecklistItem}
          addDirectionNoteItem={addDirectionNoteItem}
          saveDirectionNoteItem={saveDirectionNoteItem}
          removeDirectionNoteItem={removeDirectionNoteItem}
        />
      </TaskMetaPanel>
    </main>
  )
}
