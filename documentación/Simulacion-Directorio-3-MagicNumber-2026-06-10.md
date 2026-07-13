# Simulación de Reunión de Directorio №3 — Magic Number PRO

**Fecha:** 10 de junio de 2026 · **Duración simulada:** 90 minutos
**Objeto:** Evaluación crítica del estado de pre-lanzamiento y de la estrategia de salida al mercado.

**Mesa:** un ángel inversor (ANGEL), el fundador de un unicornio LATAM (FUNDADOR), el CEO y el CTO globales de la principal empresa tecno-financiera (CEO-FT y CTO-FT), el director de marketing de Apple (CMO), un economista conductual (ECONOMISTA), un director de Growth de un SaaS exitoso en LATAM (GROWTH), la directora de una red de asesores financieros independientes en LATAM (ASESORES) y una especialista en privacidad y regulación de datos (PRIVACIDAD).

**Data room entregado a la mesa:** auditorías técnicas del 10-Jun (v1 y v2), ROADMAP, todo.md, repositorio en commit `4a4f702`. Personajes y debate son simulados; **todos los hechos citados sobre el producto están verificados en el código.**

---

## Acta del debate

### Bloque 1 — La primera falla la encontró la mesa en el brief

**GROWTH:** Antes de empezar: el brief que nos mandaron dice "freemium $14.99 lifetime". El repositorio dice $3.99 en los cuatro puntos de venta, y el acta de decisiones (D2/W17) también. Si ni el documento que convoca a este directorio tiene el precio correcto, tenemos un problema de gobernanza de mensaje antes que de producto. ¿Qué le están diciendo hoy los founders a un asesor, a un inversor, a un usuario?

**ANGEL:** Lo señalo porque es patrón, no anécdota: la landing todavía dice "10 minutos" cuando el flujo real toma 3, y promete módulos que el MVP encapsuló. Tres versiones de la verdad conviven: la del código, la de los documentos y la de la landing. En pre-lanzamiento eso es barato de arreglar; después de la primera nota de prensa, no.

**CEO-FT:** Coincido y agrego el dato que más me incomoda del data room: **Revenue $0, Users 0, Leads 2 (de prueba), y el botón de pago es un `alert()` que dice "próximamente"**. Esto no está en fase final de pre-lanzamiento: está en fase final de pre-*cobranza*. No existe hoy un camino técnico para que un usuario les dé dinero. Toda proyección de "autofinanciar CAC con $3.99" es hipótesis sin testear.

### Bloque 2 — El negocio real es B2B, y el activo legal no existe

**PRIVACIDAD:** Voy directo a lo que considero el riesgo de cierre de empresa. El modelo declara que el margen real es vender leads calificados a $75–150 a consultoras. Ese lead incluye nombre, teléfono, email, ingresos, deudas, patrimonio y score financiero. La auditoría verificó que el modal de captura **no tiene checkbox de consentimiento, la tabla `leads` no tiene columna de consentimiento, y los Términos y Condiciones no existen** (Trust Layer 3/10 en el propio roadmap). Bajo la Ley 25.326 argentina —y cualquier marco serio de la región— la cesión onerosa de datos personales financieros a terceros sin consentimiento informado, expreso y registrable no es una zona gris: es ilegal. Cada lead vendido hoy sería un pasivo. Y el comprador sofisticado lo sabe: una consultora seria va a pedir evidencia de consentimiento antes de pagar.

**ASESORES:** Confirmo desde el lado comprador. Mi red no puede tocar un lead sin trazabilidad de consentimiento; el riesgo reputacional es nuestro, no de ustedes. Y agrego la segunda debilidad del modelo B2B que nadie midió: **calidad y exclusividad**. La tabla acepta inserciones anónimas sin throttling del lado del servidor — cualquiera con la clave pública puede inyectar leads basura en un pipeline donde cada fila vale $75. ¿El lead se vende a una consultora o a las tres? ¿Con qué SLA de contacto? ¿Qué pasa si el usuario era curioso y no inversor? Sin definición de lead calificado, el precio de $75–150 es una expresión de deseo.

**FUNDADOR:** Esto me lleva a la pregunta estructural: están operando dos negocios con un equipo que no llega a uno entero. Un B2C de micro-pago y un B2B de data brokerage tienen métricas, ciclos de venta y riesgos regulatorios distintos. El pivote a 3 pestañas fue la decisión correcta — la disciplina de matar 13 tabs la aplaudo —, pero el foco comercial sigue partido al medio.

### Bloque 3 — Un producto para Ohio con interfaz para Buenos Aires

**ECONOMISTA:** Mi objeción central es de coherencia psicológica del producto. La aplicación habla voseo rioplatense, el placeholder de teléfono es +54, la decisión D2 apunta a Argentina… y el motor compara al usuario contra **percentiles de patrimonio de hogares estadounidenses** (`BENCH_NW` en constants.js), le recomienda CDs con seguro FDIC y bonos del Tesoro americano, y asume 2.5% de inflación anual. Para un argentino que vivió 100%+ de inflación, ver "inflación 2.5%" en el disclaimer no es un detalle técnico: **destruye la credibilidad en el segundo exacto en que el producto necesita generarla**. Y la paradoja es que el motor es honesto —términos reales, impuestos, 40 tests—, pero su honestidad calibrada para otro país se percibe como mentira aquí.

**ECONOMISTA (cont.):** Segunda observación conductual: el embudo está diseñado como transacción única — calculá, pagá $3.99, recibí un PDF, adiós. La arquitectura "stateless, sin cuentas" es excelente para la fricción de entrada y pésima para el valor de vida del usuario. Un número de retiro es un compromiso a 30 años entregado en una interacción de 3 minutos, sin ningún mecanismo de re-engagement: ni recordatorio anual, ni seguimiento del progreso, ni hábito. El PDF es un callejón sin salida conductual.

**CMO:** Tomo eso y lo llevo a la marca. Lo mejor que tiene este producto es un momento: **el reveal del número**. Eso es teatro bien hecho — el rango borroso, el desbloqueo, la cifra grande. Pero la landing no vende ese momento: vende una lista de features ("15+ categorías"). Y el segundo activo emocional —la pestaña Costo de Inacción, "esperar te cuesta $X"— es la mejor pieza de copy que tienen y **no aparece en la landing**; lo verificó la auditoría. Tienen el anuncio perfecto escrito dentro del producto y lo esconden detrás del login que no existe. Tercer punto: "MaNu PRO" como marca no resiste; Magic Number es memorable, MaNu suena a apodo interno que se filtró a producción.

### Bloque 4 — La máquina sin canal de distribución

**GROWTH:** Hagamos los números que el plan no hace. $3.99 por Stripe deja ~$3.28 netos; por los rieles de pago locales, menos. Eso "liquida CAC" solo si el CAC es orgánico, es decir, cero. ¿Y cuál es el plan orgánico? No hay blog, no hay SEO, no hay contenido, no hay partnership de distribución en el repo ni en el roadmap. La instrumentación recién se cableó esta semana — bien ahí, los eventos críticos ya disparan — pero **medir un embudo sin tráfico es mirar un velocímetro con el auto apagado**. La pregunta incómoda: ¿de dónde sale el primer millar de usuarios? Hasta que esa diapositiva exista, el modelo financiero es una hoja de cálculo de supuestos encadenados.

**CTO-FT:** Cierro la ronda de fallas con lo técnico, que es donde menos me preocupa el fondo y más la forma. Lo bueno es genuino: motor financiero puro con 40 tests, arquitectura adelgazada a un router de 180 líneas, build en 5 segundos, headers de seguridad correctos, RLS bien planteado para lectura. Tres señales de alarma operativa: primero, **el working tree local lleva días corrupto** —archivos truncados con NULs, package.json cortado a la mitad— mientras se siguen apilando commits desde buffers; el repo sano vive solo en GitHub. Eso es un síntoma de proceso, no un bug. Segundo, el gating de tiers es 100% client-side; el día que conecten Stripe, si la autorización no pasa al servidor, el paywall es decorativo. Tercero, **bus factor igual a uno**: una sola máquina, un solo operador, y la única copia íntegra del producto es un remote. Para un producto que aspira a custodiar la confianza financiera de la gente, la resiliencia operativa propia es parte del producto.

---

## Síntesis del directorio — Fallas críticas (por consenso, en orden)

1. **Ilegalidad latente del negocio B2B** — venta de leads con PII financiera sin consentimiento registrable ni T&C. Bloqueante absoluto de lanzamiento. (PRIVACIDAD, ASESORES — unánime)
2. **No existe mecanismo de cobro** — el botón de pago es un stub; el modelo de autofinanciación es hipótesis. (CEO-FT)
3. **Incoherencia de mercado** — benchmarks, instrumentos e inflación de EE.UU. servidos a una audiencia argentina; mata la confianza en el momento de máxima vulnerabilidad. (ECONOMISTA)
4. **Ausencia de plan de distribución** — unit economics que solo cierran con CAC cero y sin estrategia orgánica documentada. (GROWTH)
5. **Mensaje fragmentado** — tres precios/promesas conviviendo entre brief, landing y código; el mejor hook (Costo de Inacción) ausente del marketing. (CMO, ANGEL)
6. **Producto de un solo uso** — arquitectura stateless sin re-engagement; LTV estructuralmente igual a la primera transacción. (ECONOMISTA)
7. **Fragilidad operativa** — working tree corrupto persistente, bus factor 1, gating client-side pre-Stripe. (CTO-FT)

---

## La propuesta out-of-the-box — "Vender la máquina, no los leads"

**FUNDADOR:** Ahora lo constructivo, porque acá hay un activo real escondido. Ustedes construyeron, sin darse cuenta, **la mejor herramienta de captación de clientes que un asesor financiero independiente de LATAM podría tener**: una calculadora con teatro de reveal, motor riguroso testeado, captura de perfil financiero completo y modal de "esto verá tu asesor". Y la están usando para venderle PDFs de $3.99 a curiosos y leads sueltos a tres consultoras. Inviertan el embudo: **el cliente no es el usuario final ni el comprador de leads — es el asesor. El producto es la máquina misma, en marca blanca.**

La mecánica: cada asesor o consultora obtiene su instancia de Magic Number con su logo y su link (`magicnumber.app/martinez-asesores`), la distribuye a su propia audiencia —sus redes, sus charlas, su WhatsApp— y cada lead que se genera es **suyo, con consentimiento directo del usuario hacia ese asesor**. Magic Number cobra suscripción mensual por asiento (USD 49–99/mes) en lugar de $75 por lead único.

**ASESORES:** Compro, y explico por qué resuelve cada falla de la lista: el problema legal se disuelve —el consentimiento es directo entre usuario y asesor identificado, no una cesión a terceros—; el problema de calidad de leads desaparece —el asesor genera sus propios leads de su propia audiencia—; y el problema de distribución se invierte: **cada asesor suscripto trae su tráfico**. En mi red hay 400 asesores independientes que hoy pagan entre $100 y $300 mensuales por CRMs que no les generan ni un cliente. Una herramienta que les *captura* clientes se vende sola en ese canal.

**GROWTH:** Los números cambian de categoría: 50 asesores × $79/mes = $47.400 anuales recurrentes con churn bajo (la herramienta que te trae clientes no se cancela), contra un negocio de leads que requiere generar 500+ leads vendibles al año para lo mismo, con riesgo legal y disputa de calidad en cada factura. Y el B2C actual no se tira: **la instancia propia de magic-number.app pasa a ser la demo viva y el generador de casos de éxito para venderle a los asesores** — el embudo B2C se convierte en el marketing del SaaS B2B.

**CMO:** Y la versión LATAM-nativa deja de ser un costo de localización para volverse el foso competitivo: la calculadora que entiende inflación real y planificación en dólares, distribuida por WhatsApp —donde vive el cliente financiero latinoamericano—, con la marca del asesor de confianza local. Nadie está sirviendo eso. *"La infraestructura de captación para el asesor financiero independiente de habla hispana"* es una historia de empresa; *"PDF por $3.99"* es una historia de fin de semana.

**ECONOMISTA:** Apunte final conductual: en el modelo white-label, el re-engagement deja de ser problema de Magic Number — el asesor tiene el incentivo y la relación para hacer el seguimiento anual del número. La debilidad №6 se transfiere a quien tiene el músculo para resolverla.

---

## Resoluciones del directorio

El directorio condiciona cualquier lanzamiento público a: **(1)** implementar consentimiento registrable (checkbox + texto versionado + timestamp en la tabla) y publicar T&C antes de capturar el primer lead real; **(2)** integrar el cobro de $3.99 de punta a punta —pago, PDF, entrega— o retirar el botón; **(3)** unificar el mensaje (un precio, una promesa, una landing que lidere con Costo de Inacción); **(4)** localizar benchmarks e inflación para el mercado objetivo o declarar explícitamente "planificación en USD"; **(5)** sanear el entorno operativo local (restaurar el working tree, segunda máquina o entorno reproducible); y **(6)** ejecutar en 30 días una validación de la tesis white-label: 10 entrevistas con asesores independientes y 2 pilotos con instancia marcada, antes de comprometer más desarrollo al embudo de venta de leads.

*Documento de simulación estratégica. Los personajes son ficticios; los hechos sobre el producto provienen de las auditorías técnicas del 10-Jun-2026 verificadas sobre el commit `4a4f702`.*
