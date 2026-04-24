import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const { fallback } = this.props;
    if (fallback) return fallback(this.state.error, this.handleReload);

    return (
      <div
        role="alert"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          gap: '1rem',
          textAlign: 'center',
          color: 'var(--color-text, #e5e7eb)',
          background: 'var(--color-bg, #0b0b12)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Something went wrong</h2>
        <p style={{ opacity: 0.7, maxWidth: 480 }}>
          An unexpected error occurred while rendering this view. You can try reloading the page.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
