import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Reachability de campos persistidos', () => {
  it('todo campo persistido y leido por el motor debe ser escribible desde el UI del MVP', () => {
    // 1. Extraer PERSISTED_FIELDS de useAppStore.js
    const storeSrc = readFileSync(join(__dirname, 'useAppStore.js'), 'utf8');
    const persistedMatch = storeSrc.match(/const PERSISTED_FIELDS = \[([\s\S]*?)\];/);
    const persistedFields = persistedMatch[1]
      .replace(/\s|\n/g, '')
      .split(',')
      .map(s => s.replace(/'/g, ''))
      .filter(Boolean);

    // 2. Extraer campos leidos por el motor
    const engineSrc = readFileSync(join(__dirname, '../hooks/useFinancialEngine.js'), 'utf8');
    const engineMatch = engineSrc.match(/const\s*\{\s*([\s\S]*?)\s*\}\s*=\s*store;/);
    const engineFields = engineMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const targetFields = persistedFields.filter(f => engineFields.includes(f));

    // 3. Buscar escritores en tabs/*.jsx
    const tabsDir = join(__dirname, '../tabs');
    const tabFiles = readdirSync(tabsDir).filter(f => f.endsWith('.jsx'));
    
    const unreachables = [];

    for (const field of targetFields) {
      let isReachable = false;
      
      for (const file of tabFiles) {
        const src = readFileSync(join(tabsDir, file), 'utf8');
        
        // Caso A: definicion de un setter const setCampo = ... sf('campo' ...)
        const setterRegex = new RegExp(`const\\s+(\\w+)\\s*=\\s*(?:function\\s*\\(.*?\\)|\\([^)]*\\)\\s*=>)\\s*\\{.*?sf\\('${field}'`);
        const match = src.match(setterRegex);
        
        if (match) {
          const setterName = match[1];
          // Validar que se invoca (aparece > 1 vez)
          const occurrences = src.match(new RegExp(`\\b${setterName}\\b`, 'g')) || [];
          if (occurrences.length > 1) {
            isReachable = true;
            break;
          }
        } else {
          // Caso B: uso directo sf('campo' en el componente
          const inlineMatch = src.match(new RegExp(`sf\\('${field}'`));
          if (inlineMatch) {
            isReachable = true;
            break;
          }
        }
      }

      if (!isReachable) {
        unreachables.push(field);
      }
    }

    expect(unreachables).toEqual([]);
  });
});
