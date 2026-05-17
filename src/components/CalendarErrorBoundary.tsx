import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: string | null }

export class CalendarErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(e: unknown): State {
    return { error: e instanceof Error ? e.message + '\n' + (e as Error).stack : String(e) }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#fee', color: '#900', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', flex: 1 }}>
          <strong>캘린더 에러:</strong>{'\n'}{this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}
