import { StrictMode, Component, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n/index.jsx'
import './index.css'
import MagicNumberApp from './MagicNumberAppMain.jsx'
import LandingPage from './LandingPage.jsx'

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
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer', background: '#fff', color: '#900', border: 'none', borderRadius: 5, fontWeight: 'bold' }}>
            Reload Page
          </button>
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
