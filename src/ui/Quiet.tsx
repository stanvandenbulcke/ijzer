import { Component, type ReactNode } from 'react'

/**
 * Error boundary for optional extras (e.g. a buddy's live line): if it ever breaks, it simply
 * disappears instead of taking the screen around it (your running workout) down.
 */
export class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
