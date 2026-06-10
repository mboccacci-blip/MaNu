import { createContext, useContext } from 'react';

/**
 * EngineContext provides computed financial engine results + navigation helpers
 * to all tab components, eliminating prop-drilling through MagicNumberAppMain.
 * 
 * The engine is computed ONCE in Main and provided via this context.
 * Individual tabs read their own store fields directly via useAppStore().
 */
var EngineContext = createContext(null);

export function EngineProvider({ value, children }) {
  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export function useEngine() {
  var ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be used within EngineProvider');
  return ctx;
}

export default EngineContext;
