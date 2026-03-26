# Magic Number PRO — Q&A de Decisiones Estratégicas

Este documento centraliza todas las decisiones abiertas del proyecto, presentadas en formato *multiple-choice* para facilitar su definición y priorización. Marcá tu elección con una `x` entre los corchetes `[x]`, o agregá una nueva opción si ninguna te convence.

---

## 1. Producto y Roadmap

### 1.1. Primera prioridad de desarrollo (Sprint 1)
¿Qué bloque técnico debemos atacar primero antes de salir a producción?
- [ ] **A) Modularización + Paywall + Stripe.** Refactorizar el código actual para poder cobrar.
- [ ] **B) Internacionalización (i18n).** Traducir todo a español y parametrizar la inflación por país antes de meter el paywall.
- [ ] **C) Captura de Leads (B2B)**. Armar el CRM y el envío de leads a asesores primero, manteniendo la app gratis por ahora.

### 1.2. El "PRO Report" (PDF exportable detallado)
Originalmente planteado a $49.99, incluye Monte Carlo, optimizador de deudas, etc.
- [ ] **A) Posponer.** No desarrollarlo para el lanzamiento inicial. Validar primero si los usuarios compran el "Basic" y evaluar la demanda.
- [ ] **B) Desarrollarlo para el lanzamiento.** Es necesario tener de entrada un high-ticket ($49.99+) para maximizar el revenue de los early adopters.
- [ ] **C) Venderlo como un servicio "Done-for-You".** En vez de un PDF automatizado, que sea una sesión real (humana) vendida a través de la app.

### 1.3. Captura del Email del Usuario
¿En qué momento exacto le pedimos el email a la persona?
- [ ] **A) Antes de revelarle su Magic Number.** (Alto riesgo de caída de conversión, pero maximiza la base de datos).
- [ ] **B) Para desbloquear el Magic Number (Paso 2).** Se le muestra el número y el veredicto gratis, pero ingresar el email es el password.
- [ ] **C) Al final del embudo.** Solo a quienes deciden comprar el plan Basic o hacer click en "Hablar con un asesor" (Menos emails en total, pero de altísima intención).

---

## 2. Monetización y Pricing (B2C)

### 2.1. Precio del plan "Basic" (acceso total a la app)
La propuesta de valor es planificar un objetivo de +$1M. ¿Cuál debería ser el ticket único (lifetime)?
- [ ] **A) $9.99.** Precio de impulso absoluto, maximiza volumen de usuarios pagos.
- [ ] **B) $14.99.** El punto medio propuesto; sigue siendo imperceptible en comparación al problema que resuelve.
- [ ] **C) $19.99.** Posicionamiento más premium, requiere menos volumen para escalar financieramente.
- [ ] **D) A/B Testing.** Lanzar con precios rotativos y dejar que los datos determinen la mejor conversión.

### 2.2. Precios en LATAM vs USA
¿Cómo manejamos la disparidad de poder adquisitivo y el rechazo al pago en dólares?
- [ ] **A) Tarifa plana global en USD.** (Ej: $14.99 en todo el mundo usando Stripe). Simple de implementar, pero fricción alta en LATAM.
- [ ] **B) Regionalización total (Mercado Pago).** USD para USA, ARS para Argentina, MXN para México, cobrando localmente.
- [ ] **C) Enfoque Iterativo.** USD fijo global para lanzamiento rápido vía Stripe; sumar pasarelas locales (Mercado Pago) en la Fase 2 si vemos buena tracción en LATAM.

---

## 3. Adquisición y Estrategia B2B (Asesores)

### 3.1. Outreach a Asesores (El piloto)
Necesitamos validar que el modelo B2B funciona. ¿Cómo conseguimos a los primeros 5 asesores clientes?
- [ ] **A) Contacto cálido (Red propia).** Hablar con conocidos en el rubro financiero (Argentina/Latam/España) y ofrecerles leads gratis al principio para validar la calidad.
- [ ] **B) Outreach frío (LinkedIn/Email).** Armar una lista de Asesores / Planificadores independientes y mandarles un pitch ofreciendo "Tus primeros 5 leads bonificados".
- [ ] **C) Pasivo (Esperar tráfico).** No buscar asesores activamente hasta tener un flujo constante de leads orgánicos cayendo en nuestra DB.

### 3.2. Estrategia de Contenido (TikTok / Reels)
El canal principal de adquisición gratuita será el contenido vertical basado en el *insight* del MN.
- [ ] **A) Creación in-house.** Nosotros grabando los videos en primera persona ("Descubrí mi número mágico y me asusté...").
- [ ] **B) Co-creación con influencers.** Asociarse/patrocinar cuentas de finanzas personales hispanas existentes para que muestren la app.
- [ ] **C) Mixta.** Grabar los primeros ~10 propios para calibrar el mensaje que funciona, y luego inyectar ese script en creadores terceros.

---

## 4. Estructura Legal y Fricciones (Trust)

### 4.1. Estructura Jurídica
Recibiremos cobros internacionales y datos financieros (anonimizados pero sensibles).
- [ ] **A) LLC en Estados Unidos.** Ideal para usar Stripe de forma nativa global y dar un halo de credibilidad fuerte, pero con costos de setup.
- [ ] **B) Sociedad Local (ej. SAS en Argentina).**
- [ ] **C) Persona Física (Modo MVP).** Lanzar "en negro" / como monotributista temporalmente hasta probar product-market-fit y cruzar los primeros $1K USD/mes.

### 4.2. Términos y Privacidad (Trust Layer)
El usuario hispano desconfía mucho de las herramientas financieras.
- [ ] **A) Abogado especializado.** Contratar uno para redactar T&C blindados y ley de protección de datos antes de salir en vivo.
- [ ] **B) Generadores legales.** Usar Termly / Iubenda para crear templates legales estándar internacionales.
- [ ] **C) Copy-paste adaptado.** Tomar los T&C y Privacy Policy de referentes (ej. Welfi en Argentina, SmartAsset en USA) y adaptarlos a nuestro rubro.
