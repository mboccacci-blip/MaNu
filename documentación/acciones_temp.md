__PLAN DE ACCI├ôN ÔÇö MAGIC NUMBER APP__

Acciones concretas extra├¡das de la revisi├│n de audio del 29 de marzo de 2026

__Para: __Tincho \(CTO\)     __De: __Revisi├│n de producto     __Total acciones: 30     __Alta: 8  |  Media: 14  |  Baja: 8

__1\. SECCI├ôN: TU N├ÜMERO M├üGICO ÔÇö Datos esenciales__

__\#__

__Secci├│n__

__Acci├│n requerida__

__Texto actual__

__Texto propuesto__

__Prior\.__

__Notas__

__1__

Header

Modificar texto introductorio principal

*"y llegar a cero"*

__"y llegara al cero o el monto deseado de herencia en tu ├║ltimo a├▒o planificado"__

__MEDIA__

Reflejar que el objetivo puede ser cero o una herencia deseada

__2__

Inputs

Tooltip de edad de jubilaci├│n: texto m├ís claro

*"Cu├índo planas dejar de trabajar"*

__"┬┐A qu├® edad quer├®s jubilarte?"__

__BAJA__

Redacci├│n m├ís directa y regional \(voseo\)

__3__

Inputs

Renombrar campo 'A├▒os en jubilaci├│n'

*"A├▒os en jubilaci├│n"*

__"┬┐Cu├íntos a├▒os estar├ís jubilado?"__

__MEDIA__

Formato pregunta, m├ís intuitivo

__4__

Tooltip

Simplificar tooltip de a├▒os en jubilaci├│n

*"Cu├ínto tiempo\.\.\. Ej: 25\-35 es com├║n"*

__"┬┐Cu├ínto tiempo tiene que durar tu dinero una vez que te jubiles?" \(sin ejemplo\)__

__BAJA__

Eliminar el ejemplo num├®rico 25\-35

__5__

Inputs

Renombrar campo 'Ingreso deseado'

*"Ingreso deseado"*

__"Ingreso mensual deseado en tu jubilaci├│n"__

__ALTA__

Debe quedar claro que es mensual y en contexto jubilatorio

__6__

Tooltip

Simplificar tooltip de ingreso

*Menciona "gasto mensual"*

__Solo: "En d├│lares de hoy"__

__MEDIA__

Evitar confusi├│n entre 'gasto' e 'ingreso'

__7__

Inputs

Renombrar 'Otro ingreso jubilatorio'

*"Otro ingreso jubilatorio"*

__"Ingreso adicional proyectado en tu jubilaci├│n" o "┬┐Qu├® ingreso adicional tendr├ís?"__

__ALTA__

Agregar subt├¡tulo: d├│lares por mes al jubilarte

__8__

L├│gica

Unificar moneda: todo en d├│lares de hoy

*Ingreso deseado en USD hoy, otro ingreso en USD futuros*

__Ambos campos en d├│lares de hoy__

__ALTA__

BUG: La diferencia de base genera c├ílculos incorrectos \(ej: muestra $8\.872 en vez de $7\.000\)

__9__

Tooltip

Adaptar tooltip de ahorros actuales a Argentina

*"401K, IRA, corretaje, etc\."*

__"Cuentas de inversi├│n, ahorros, plazos fijos, FCI, etc\."__

__ALTA__

Terminolog├¡a estadounidense no aplica al mercado argentino

__10__

Inputs

Renombrar 'Ahorro mensual estimado'

*"Ahorro mensual estimado"*

__"Ahorro mensual actual y hasta la jubilaci├│n \(estimado\)"__

__MEDIA__

Que se entienda: cu├ínto ahorrar├ís por mes desde hoy hasta jubilarte

__11__

Tooltip

Corregir tooltip de ahorro mensual

*"Reemplazada cuando completes ingresos y gastos"*

__Actualizar: esa funcionalidad no est├í activa \(ya no cambia autom├íticamente\)__

__ALTA__

BUG: el tooltip promete algo que no funciona

__12__

Inputs

Mejorar campo de herencia

*"Capital que deseas dejar a tus heredados"*

__Agregar: "a tus herederos o para donaciones"__

__BAJA__

Suavizar el texto; incluir filantrop├¡a como opci├│n

__13__

Tooltip

Agregar tooltip a impuesto anual sobre activos

*\(sin tooltip\)*

__"Ingres├í el impuesto para calcular la acumulaci├│n neta \(ej: bienes personales\)\. A mayor impuesto, mayor tu n├║mero m├ígico\."__

__MEDIA__

No hay explicaci├│n de para qu├® sirve este campo

__2\. NAMING & BRANDING ÔÇö Consistencia de t├®rminos__

__\#__

__Secci├│n__

__Acci├│n requerida__

__Texto actual__

__Texto propuesto__

__Prior\.__

__Notas__

__14__

Global

Unificar 'Magic Number' vs 'N├║mero M├ígico'

*Mezclados: tab dice MN, t├¡tulo dice N├║mero M├ígico*

__Elegir UNO y usarlo en toda la app\. Sugerencia: 'Magic Number' \(coincide con URL/marca MN\)__

__ALTA__

Inconsistencia cr├¡tica de marca\. Definir y aplicar en todos los textos, tabs y tooltips

__15__

Costo

Renombrar 'datos tomados de tu n├║mero m├ígico'

*"Datos tomados de tu n├║mero m├ígico"*

__"Datos tomados de la secci├│n Tu N├║mero M├ígico"__

__BAJA__

Que quede claro que es una referencia a la pesta├▒a/secci├│n

__3\. SECCI├ôN: ┬┐CU├üNDO ME PUEDO JUBILAR?__

__\#__

__Secci├│n__

__Acci├│n requerida__

__Texto actual__

__Texto propuesto__

__Prior\.__

__Notas__

__16__

Inputs

Igualar nombres de campos con la secci├│n 1

*"Ingreso deseado" \(distinto a secci├│n 1\)*

__Usar los mismos labels: "Ingreso mensual deseado en tu jubilaci├│n", etc\.__

__ALTA__

Los mismos campos tienen nombres distintos en distintas secciones

__17__

Inputs

Renombrar 'Retorno de acumulaci├│n real'

*"Retorno de acumulaci├│n real"*

__"Retorno sobre tus activos \(en t├®rminos reales\)"__

__MEDIA__

T├®rmino actual es muy t├®cnico para el usuario promedio

__18__

Productos

Renombrar 'Inversor efectivo' en opciones de inversi├│n

*"Inversor efectivo"*

__"Money Market" o "Fondos de corto plazo" o nombre de bancos locales \(ej: FCI rescate inmediato\)__

__MEDIA__

Investigar c├│mo llaman los bancos AR a estos fondos

__19__

Productos

Renombrar 'Efectivo guardado'

*"Efectivo guardado"*

__"Efectivo / colch├│n" o simplemente "Efectivo"__

__BAJA__

Unificar con la met├ífora del colch├│n usada en la secci├│n de costo

__20__

UI/Bug

Fix: texto en amarillo ilegible sobre fondo claro

*Herencia \+ Impuesto en amarillo, invisible*

__Cambiar color de texto a uno legible sobre fondo blanco__

__ALTA__

BUG VISUAL: informaci├│n cr├¡tica que el usuario no puede leer

__21__

Bug

Fix: Ingreso jubilatorio muestra $0 peso \+ dato incorrecto

*"Ingreso jubilatorio: $0 por mes futuro = $3\.051 de hoy"*

__Corregir la l├│gica de conversi├│n y el formato de moneda__

__ALTA__

BUG: n├║meros incorrectos y formato peso/d├│lar mezclado

__22__

Texto

Renombrar 'Ahorros entonces'

*"Ahorros entonces"*

__"Ahorro al momento de jubilaci├│n"__

__MEDIA__

Texto ambiguo, no queda claro a qu├® momento refiere

__4\. SECCI├ôN: COSTO DE NO ACTUAR__

__\#__

__Secci├│n__

__Acci├│n requerida__

__Texto actual__

__Texto propuesto__

__Prior\.__

__Notas__

__23__

Global

Unificar nombres de campos con secci├│n 1

*Nombres inconsistentes entre secciones*

__"Ahorros actuales", "Ahorro mensual" ÔåÆ mismos nombres en toda la app__

__MEDIA__

Coherencia global de terminolog├¡a

__24__

Gr├íficos

Clarificar qu├® muestra el primer n├║mero

*"Efectivo guardado en 20 a├▒os: $530\.000"*

__"$530\.000 USD de hoy dentro de 20 a├▒os" ÔÇö especificar que son USD de hoy__

__MEDIA__

No queda claro si es nominal o real ni de d├│nde sale

__25__

Gr├íficos

Mejorar texto de comparaci├│n 'perdido X'

*"$834\.000 ÔÇö perdido $304\.000"*

__"Qued├índote en efectivo tendr├¡as $304\.000 USD menos que si invirtieras en \[producto\]"__

__MEDIA__

Que la frase explique la comparaci├│n sin ambig├╝edad

__26__

Gr├íficos

Fix: color gris inconsistente en barras

*En algunos gr├íficos la parte de 'efectivo guardado' es gris y en otros no*

__Que la barra de efectivo guardado sea siempre del mismo color \(gris\) en todos los gr├íficos__

__BAJA__

Inconsistencia visual menor pero confusa

__27__

Ejes

Cambiar etiquetas de eje: 10a, 20a ÔåÆ a├▒os

*"10a, 20a, 30a"*

__"10 a├▒os, 20 a├▒os, 30 a├▒os"__

__BAJA__

Las abreviaturas no son intuitivas

__28__

Texto

Mejorar redacci├│n de 'precio de esperar'

*"Cada a├▒o que esperas cuesta crecimiento compuesto que nunca se puede recuperar"*

__"Cada a├▒o que esper├ís te cuesta dinero que no podr├ís recuperar por la p├®rdida del inter├®s compuesto"__

__MEDIA__

El concepto clave es 'inter├®s compuesto', debe aparecer expl├¡citamente

__29__

Tabla

Agregar contexto a tabla de espera

*"Esperar 1 a├▒o: ÔêÆ$88K \(5,1%\)"*

__"Por esperar 1 a├▒o perder├¡as $88K \(5,1%\)"__

__BAJA__

Aunque puede ser obvio, la frase completa es m├ís clara

__5\. GENERAL ÔÇö Otros temas__

__\#__

__Secci├│n__

__Acci├│n requerida__

__Texto actual__

__Texto propuesto__

__Prior\.__

__Notas__

__30__

Gu├¡a

Renombrar secci├│n 'Gu├¡a' y hacerla m├ís visible

*"Gu├¡a" \(poco visible\)*

__"Gu├¡a de T├®rminos" \+ agregar referencia desde las secciones: "Si ten├®s dudas, consult├í la Gu├¡a de T├®rminos"__

__MEDIA__

Sin la gu├¡a, t├®rminos como 60/40, 80/20 no se entienden\. Alternativa: renombrar a '60% acciones / 40% bonos'

__RESUMEN DE BUGS CR├ìTICOS__

Estos 4 items requieren atenci├│n inmediata porque afectan c├ílculos, legibilidad o prometen funcionalidad inexistente\.

__\#__

__Bug__

__Impacto__

__Acci├│n__

__8__

__D├│lares de hoy vs futuros mezclados__

Los c├ílculos del magic number son incorrectos\. Ejemplo: muestra $8\.872 donde deber├¡a mostrar ~$7\.000\.

Unificar TODOS los inputs a d├│lares de hoy\. Revisar f├│rmulas del backend\.

__11__

__Tooltip promete sync que no existe__

El tooltip de ahorro mensual dice que se actualiza al completar ingresos/gastos, pero eso no funciona\.

Actualizar el tooltip o implementar la funcionalidad\.

__20__

__Texto amarillo ilegible__

Los campos 'Herencia' e 'Impuesto' muestran texto amarillo sobre fondo claro ÔåÆ invisible\.

Cambiar a color legible \(gris oscuro o negro\)\.

__21__

__Ingreso jubilatorio: $0 \+ conversi├│n err├│nea__

Muestra '$0 pesos por mes futuro = $3\.051 de hoy' ÔÇö ambos datos parecen incorrectos\.

Debuggear la l├│gica de conversi├│n nominal/real y el formato de moneda\.

__DECISIONES PENDIENTES \(requieren respuesta\)__

__\#__

__Pregunta__

__Contexto__

__A__

__┬┐Usamos 'Magic Number' o 'N├║mero M├ígico' en toda la app?__

Hoy est├ín mezclados\. La URL y marca usan MN\. Hay que elegir uno y aplicar globalmente\.

__B__

__┬┐El informe PDF del email es el informe completo o uno resumido?__

Se mencion├│ que 'es un informe chiquitito'\. Definir alcance del PDF autom├ítico\.

__C__

__┬┐Realmente no compartimos el email del usuario?__

El disclaimer dice 'no compartimos tu email, sin spam nunca'\. Verificar si es cierto antes de publicar\.

__D__

__┬┐C├│mo llamar a los fondos de corto plazo para Argentina?__

Opciones: Money Market, FCI rescate inmediato, fondos de liquidez\. Investigar qu├® usan los bancos locales\.

__E__

__┬┐Los productos de inversi├│n se renombran a formato expl├¡cito?__

Ej: '60/40' ÔåÆ '60% acciones / 40% bonos', '80/20' ÔåÆ '80% acciones / 20% bonos'\. M├ís claro pero m├ís largo\.

