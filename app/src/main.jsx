import { StrictMode, Component, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n/index.jsx'
import './index.css'
import MagicNumberApp from './MagicNumberAppMain.jsx'
import LandingPage from './LandingPage.jsx'

// ── Emergency reset: ?reset=1 clears all persisted data before React mounts ──
if (typeof window !== 'undefined') {
  var params = new URLSearchParams(window.location.search);
  if (params.get('reset') === '1') {
    try { localStorage.removeItem('manu-pro-state'); } catch (e) {}
    // L1: Also remove legacy key from usePersistedState era
    try { localStorage.removeItem('manu_pro_user_data'); } catch (e) {}
    // Remove the ?reset=1 from URL so it doesn't loop
    params.delete('reset');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', clean);
  }
  // L1: One-time cleanup of legacy key (silent, on any load)
  try { if (localStorage.getItem('manu_pro_user_data')) localStorage.removeItem('manu_pro_user_data'); } catch (e) {}
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#334155', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>:(</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 400, marginBottom: 24 }}>
            MaNu PRO encountered an unexpected error. Your data is safe. Try reloading the page, or clear your saved data if the problem persists.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
              Reload Page
            </button>
            <button onClick={() => { try { localStorage.removeItem('manu-pro-state'); } catch(e) {} window.location.reload(); }} style={{ padding: '12px 24px', cursor: 'pointer', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
              Clear Data & Reload
            </button>
          </div>
          <p style={{ marginTop: 16, fontSize: 11, color: '#94a3b8', maxWidth: 400 }}>
            "Clear Data & Reload" will erase your entered financial information but fix the crash.
            You can also add <code>?reset=1</code> to the URL.
          </p>
          <button onClick={() => this.setState({ showDetails: !this.state.showDetails })} style={{ marginTop: 20, background: 'none', border: 'none', color: '#94a3b8', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
            {this.state.showDetails ? 'Hide' : 'Show'} technical details
          </button>
          {this.state.showDetails && (
            <pre style={{ marginTop: 12, padding: 16, background: '#1e293b', color: '#f87171', borderRadius: 10, fontSize: 11, textAlign: 'left', maxWidth: 600, overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap' }}>
              {this.state.error ? this.state.error.stack : 'Unknown error'}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

function AppShell() {
  const [showApp, setShowApp] = useState(false);
  if (!showApp) return <LandingPage onEnter={() => setShowApp(true)} />;
  return (
    <I18nProvider>
      <MagicNumberApp onBack={() => setShowApp(false)} />
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  </StrictMode>,
)
