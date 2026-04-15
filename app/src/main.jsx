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
    // Remove the ?reset=1 from URL so it doesn't loop
    params.delete('reset');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', clean);
  }
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'white', background: '#900', fontFamily: 'monospace', height: '100vh', overflow: 'auto' }}>
          <h1>Magic Number Error:</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error ? this.state.error.stack : 'Unknown error'}</pre>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer', background: '#fff', color: '#900', border: 'none', borderRadius: 5, fontWeight: 'bold' }}>
              Reload Page
            </button>
            <button onClick={() => { try { localStorage.removeItem('manu-pro-state'); } catch(e) {} window.location.reload(); }} style={{ padding: '10px 20px', cursor: 'pointer', background: '#ff0', color: '#900', border: 'none', borderRadius: 5, fontWeight: 'bold' }}>
              ⚠ Clear Data & Reload
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: '#faa' }}>
            If the error persists after "Reload", click "Clear Data & Reload" to reset your saved data. 
            This will erase your entered financial information but fix the crash.
          </p>
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
