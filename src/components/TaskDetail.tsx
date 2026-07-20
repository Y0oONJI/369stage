import { useShallow } from 'zustand/react/shallow'
import { useTaskStore } from '../store/taskStore'
import { TaskDetailBody } from './TaskDetailBody'
import { TaskMetaPanel } from './TaskMetaPanel'

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
