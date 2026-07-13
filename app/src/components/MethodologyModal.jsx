import Icon from './Icon.jsx';
import { pct } from '../utils/formatters.js';

/**
 * MethodologyModal — "Cómo calculamos" (W46)
 * Transparencia metodológica del motor financiero. Único ítem pendiente
 * del audit externo. Pensado para usuarios exigentes y asesores.
 */
export default function MethodologyModal({ show, onClose, lang, profiles, inflation }) {
  if (!show) return null;

  var es = lang !== 'en';
  var S = {
    title: es ? 'Cómo calculamos' : 'How we calculate',
    subtitle: es ? 'Transparencia total: estas son las matemáticas detrás de cada número que ves.' : 'Full transparency: this is the math behind every number you see.',
    close: es ? 'Cerrar' : 'Close',
    sections: [
      {
        icon: 'crosshair',
        t: es ? 'Tu Magic Number' : 'Your Magic Number',
        b: es
          ? 'Es el valor presente de una renta mensual: el capital que, invertido durante tu retiro, te permite retirar cada mes tu ingreso necesario (neto de jubilación u otros ingresos) durante los años que planificaste, más lo que quieras dejar como herencia. La fórmula es la de valor presente de anualidad con capitalización mensual: PV = PMT × (1 − (1+i)⁻ⁿ) / i, donde i es la tasa mensual real e n la cantidad de meses de retiro. La herencia se descuenta a valor presente y se suma.'
          : 'It is the present value of a monthly annuity: the capital that, invested through retirement, lets you withdraw your required monthly income (net of pension or other income) for the years you planned, plus any legacy. The formula is the present value of an annuity with monthly compounding: PV = PMT × (1 − (1+i)⁻ⁿ) / i, where i is the monthly real rate and n the number of retirement months. The legacy is discounted to present value and added.',
      },
      {
        icon: 'trend-up',
        t: es ? 'Retornos reales, en dólares de hoy' : 'Real returns, in today’s dollars',
        b: es
          ? 'Todos los cálculos usan retornos REALES: al retorno nominal histórico de cada perfil le restamos la inflación esperada (' + pct(inflation) + ' anual por defecto, configurable). Todos los montos están en dólares constantes de hoy, así mantienen su poder de compra. No inflamos números para que se vean mejor.'
          : 'All calculations use REAL returns: we subtract expected inflation (' + pct(inflation) + '/yr by default, configurable) from each profile’s historical nominal return. All amounts are in constant (today) dollars, preserving purchasing power. We don’t inflate numbers to look better.',
      },
      {
        icon: 'scales',
        t: es ? 'Perfiles de inversión' : 'Investment profiles',
        b: es
          ? 'Seis perfiles, de efectivo a 100% acciones, con retornos nominales históricos de largo plazo. Si configurás un impuesto anual a los activos, lo restamos del retorno (drag fiscal) en los cálculos — el retorno que se muestra en las etiquetas es siempre el canónico sin impuesto.'
          : 'Six profiles, from cash to 100% equities, using long-term historical nominal returns. If you set an annual asset tax, we subtract it from the return (tax drag) in calculations — labels always show the canonical pre-tax return.',
        table: true,
      },
      {
        icon: 'chart-line-up',
        t: es ? 'Ahorro proyectado' : 'Projected savings',
        b: es
          ? 'Capitalizamos mes a mes: cada mes tu saldo rinde la tasa mensual real y se le suma tu ahorro mensual. Si tenés deudas con fecha de fin (hipoteca, auto), cuando terminan de pagarse esa cuota se suma automáticamente a tu ahorro mensual.'
          : 'We compound monthly: each month your balance earns the monthly real rate and your monthly savings are added. If you have debts with an end date (mortgage, car), once paid off that payment is automatically added to your monthly savings.',
      },
      {
        icon: 'umbrella',
        t: es ? 'Años de cobertura (drawdown)' : 'Years of coverage (drawdown)',
        b: es
          ? 'Simulamos tu retiro año a año: el capital rinde al retorno del perfil de retiro y se le descuenta tu gasto anual. Contamos cuántos años completos dura antes de agotarse (tope: 60 años). "Cubierto" significa que dura al menos los años de retiro que planificaste.'
          : 'We simulate retirement year by year: capital earns the retirement profile’s return and your annual spending is withdrawn. We count how many full years it lasts before depletion (capped at 60). "Covered" means it lasts at least your planned retirement years.',
      },
      {
        icon: 'lock',
        t: es ? 'Rango del plan gratuito' : 'Free tier range',
        b: es
          ? 'En el plan gratuito mostramos tu Magic Number como un rango de −20% a +20% del valor exacto, redondeado a los $25.000 más cercanos. El número exacto se desbloquea con tu email o con el Perfil Full.'
          : 'On the free tier we show your Magic Number as a range from −20% to +20% of the exact value, rounded to the nearest $25,000. The exact number unlocks with your email or the Full Profile.',
      },
      {
        icon: 'warning',
        t: es ? 'Límites del modelo' : 'Model limitations',
        b: es
          ? 'El modelo no contempla impuestos locales específicos de tu país, secuencia de retornos (la volatilidad año a año puede cambiar el resultado aunque el promedio se cumpla), ni cambios futuros en tus ingresos o gastos. Los retornos históricos no garantizan retornos futuros. Es una herramienta educativa de planificación — no es asesoramiento financiero.'
          : 'The model does not account for your country’s specific taxes, sequence-of-returns risk (year-to-year volatility can change outcomes even if the average holds), or future changes in your income or expenses. Historical returns don’t guarantee future returns. This is an educational planning tool — not financial advice.',
      },
    ],
    colProfile: es ? 'Perfil' : 'Profile',
    colNom: es ? 'Nominal' : 'Nominal',
    colReal: es ? 'Real' : 'Real',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 18, padding: '28px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', position: 'relative', maxHeight: '88vh', overflowY: 'auto' }} onClick={function (e) { e.stopPropagation(); }}>
        <button onClick={onClose} aria-label={S.close} style={{ position: 'sticky', top: 0, float: 'right', background: 'rgba(15,23,42,0.05)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#64748b', fontSize: 14, fontWeight: 700 }}>×</button>
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Icon name="calculator" size={24} weight="regular" color="#3b82f6" />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 21, fontWeight: 800, color: '#0f172a' }}>{S.title}</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{S.subtitle}</div>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {S.sections.map(function (sec, i) {
            return (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon name={sec.icon} size={16} weight="regular" color="#3b82f6" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit,sans-serif' }}>{sec.t}</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.7 }}>{sec.b}</div>
                {sec.table && profiles && (
                  <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '4px 8px', fontWeight: 600 }}>{S.colProfile}</th>
                        <th style={{ padding: '4px 8px', fontWeight: 600, textAlign: 'right' }}>{S.colNom}</th>
                        <th style={{ padding: '4px 8px', fontWeight: 600, textAlign: 'right' }}>{S.colReal}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map(function (p) {
                        return (
                          <tr key={p.id} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <td style={{ padding: '5px 8px', color: '#0f172a', fontWeight: 600 }}><Icon name={p.icon} size={12} weight="regular" color={p.color} /> {p.name}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#64748b' }}>{pct(p.nomReturn)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>{pct(p.realReturn)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
