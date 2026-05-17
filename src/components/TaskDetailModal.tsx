import { TaskDetail } from './TaskDetail'

type Props = {
  taskId: string
  onClose: () => void
}

export function TaskDetailModal({ taskId, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-zinc-50 shadow-2xl dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="text-xs text-zinc-500">작업 상세</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <TaskDetail taskId={taskId} />
      </div>
    </div>
  )
}
