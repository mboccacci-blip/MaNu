import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('reportPdf wiring', function () {
  it('el PDF no consume ybYData (serie del grafico interactivo)', function () {
    var src = readFileSync(new URL('./reportPdf.js', import.meta.url), 'utf8');
    expect(src).not.toMatch(/engine\.ybYData/);
  });
});
