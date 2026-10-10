/* Dominio 4 — Prompt Engineering & Structured Output (20 %) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const DOCS = {
    pe: { label: 'Prompt engineering overview', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview' },
    multishot: { label: 'Use examples (multishot prompting)', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting' },
    json: { label: 'Tool use for JSON output', url: 'https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use#json-mode' },
    batch: { label: 'Message Batches API', url: 'https://docs.claude.com/en/docs/build-with-claude/batch-processing' }
  };

  CAF.addLessons([
    /* ---------------------------------------------------------- 4.1 */
    {
      id: '4.1', domain: 4, minutes: 12, docs: [DOCS.pe],
      summary: T('"Be conservative" and "only report high-confidence issues" do not raise precision. Saying exactly **what to report and what to skip**, with examples per severity, does.',
                 '«Sé conservador» y «reporta solo problemas de alta confianza» no mejoran la precisión. Lo que la mejora es decir exactamente **qué reportar y qué omitir**, con ejemplos por nivel de severidad.'),
      objectives: [
        T('Replace vague instructions with categorical criteria.', 'Sustituir instrucciones vagas por criterios categóricos.'),
        T('Understand how false positives erode trust in accurate findings.', 'Entender cómo los falsos positivos erosionan la confianza en los hallazgos correctos.'),
        T('Define severity with concrete code examples.', 'Definir la severidad con ejemplos concretos de código.')
      ],
      blocks: [
        { type: 'compare',
          bad: { title: T('Vague', 'Vago'), items: [
            T('"Check that comments are accurate."', '«Comprueba que los comentarios sean correctos.»'),
            T('"Be conservative."', '«Sé conservador.»'),
            T('"Only report high-confidence findings."', '«Reporta solo hallazgos de alta confianza.»')
          ] },
          good: { title: T('Explicit', 'Explícito'), items: [
            T('"Flag a comment **only when** its claimed behavior contradicts what the code does."', '«Señala un comentario **solo cuando** el comportamiento que describe contradice lo que hace el código.»'),
            T('"Report: bugs, security issues. Skip: style, naming, patterns used consistently in this repo."', '«Reporta: bugs y problemas de seguridad. Omite: estilo, nombres y patrones usados de forma consistente en este repo.»'),
            T('Severity levels each illustrated with a code example', 'Cada nivel de severidad ilustrado con un ejemplo de código')
          ] } },
        { type: 'p', text: T('False positives are not just noise. When one category is wrong half the time, developers stop trusting **every** category, including the accurate ones. A valid tactic is to **temporarily disable** the high false-positive category while you improve its prompt.',
                             'Los falsos positivos no son solo ruido. Cuando una categoría se equivoca la mitad de las veces, los desarrolladores dejan de confiar en **todas** las categorías, incluidas las correctas. Una táctica válida es **desactivar temporalmente** la categoría con muchos falsos positivos mientras mejoras su prompt.') },
        { type: 'code', lang: 'md', title: 'review criteria (system prompt excerpt)', code: `
## Severity
critical: exploitable or data-losing. e.g. SQL built with string concatenation of user input.
major: wrong behavior in a normal path. e.g. off-by-one that skips the last invoice.
minor: wrong only in a rare edge. e.g. missing timezone on a log timestamp.

## Do not report
- Formatting, naming, import order
- Patterns that appear consistently elsewhere in this repository` },
        { type: 'trap', text: T('An option that adds "only flag issues you are very confident about" is the classic precision distractor. It changes nothing measurable.', 'Una opción que añade «señala solo problemas de los que estés muy seguro» es el distractor clásico de precisión. No cambia nada medible.') }
      ],
      quiz: [
        { q: T('The automated reviewer flags 40% false positives in "comment accuracy", and developers now ignore all its findings. Best immediate move?', 'El revisor automático tiene un 40 % de falsos positivos en «exactitud de comentarios», y los desarrolladores ya ignoran todos sus hallazgos. ¿Mejor movimiento inmediato?'),
          options: [
            opt('Temporarily disable that category and rewrite its criterion: flag only when the comment contradicts code behavior', 'Desactivar temporalmente esa categoría y reescribir su criterio: señalar solo cuando el comentario contradiga lo que hace el código', true, 'Restores trust while fixing precision with explicit criteria.', 'Recupera la confianza mientras se arregla la precisión con criterios explícitos.'),
            opt('Add "be conservative and only report issues you are sure about" to the review prompt', 'Añadir «sé conservador y reporta solo lo que tengas seguro» al prompt de revisión', false, 'Vague; does not improve precision.', 'Es vago; no mejora la precisión.'),
            opt('Only show findings whose self-reported model confidence is above 0.9, and hide every other finding from developers', 'Mostrar solo los hallazgos con confianza autoinformada superior a 0,9 y ocultar todos los demás a los desarrolladores', false, 'Confidence filtering is not a substitute for criteria.', 'Filtrar por confianza no sustituye a los criterios.'),
            opt('Switch to a larger model', 'Cambiar a un modelo más grande', false, 'Does not define what to report.', 'No define qué reportar.')
          ] },
        { q: T('Reviews classify the same issue as "major" in one PR and "minor" in another. What creates consistency?', 'Las revisiones clasifican el mismo problema como «major» en un PR y como «minor» en otro. ¿Qué aporta consistencia?'),
          options: [
            opt('Explicit severity definitions with a concrete code example for each level', 'Definiciones explícitas de severidad con un ejemplo concreto de código por nivel', true, 'Concrete anchors produce consistent classification.', 'Los anclajes concretos producen una clasificación consistente.'),
            opt('Asking the model to think harder', 'Pedir al modelo que piense más', false, 'Not a definition.', 'No es una definición.'),
            opt('Removing severity from the output', 'Quitar la severidad de la salida', false, 'Loses needed information.', 'Pierde información necesaria.'),
            opt('Run three reviews per PR and average their severity labels into one', 'Hacer tres revisiones por PR y promediar sus etiquetas de severidad en una', false, 'Does not fix the missing definitions.', 'No arregla la falta de definiciones.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 4.2 */
    {
      id: '4.2', domain: 4, minutes: 12, docs: [DOCS.multishot],
      summary: T('When detailed instructions still give inconsistent output, few-shot examples are the most effective lever, especially 2–4 targeted examples of the **ambiguous** cases that explain **why** one choice beats the plausible alternative.',
                 'Cuando instrucciones detalladas siguen dando una salida inconsistente, los ejemplos few-shot son la palanca más eficaz, sobre todo 2–4 ejemplos dirigidos a los casos **ambiguos** que expliquen **por qué** una opción gana a la alternativa plausible.'),
      objectives: [
        T('Write targeted few-shot examples for ambiguous scenarios, with reasoning.', 'Escribir ejemplos few-shot dirigidos a escenarios ambiguos, con su razonamiento.'),
        T('Use examples to fix output format and reduce false positives.', 'Usar ejemplos para fijar el formato de salida y reducir falsos positivos.'),
        T('Use examples to handle varied document structures in extraction.', 'Usar ejemplos para manejar estructuras de documento variadas en la extracción.')
      ],
      blocks: [
        { type: 'code', lang: 'md', title: 'few-shot · ambiguous escalation case with reasoning', code: `
<example>
Customer: "This is the third time I'm asking. Just refund it."
Order: damaged item, photo attached, $34, within policy.
Action: resolve (issue refund), acknowledge frustration.
Why: the case is standard and within policy. Frustration alone is not
an escalation trigger. Escalate only if they ask for a human again.
</example>

<example>
Customer: "Can you match the price I saw at CompetitorMart?"
Policy: covers price adjustments on our own site only.
Action: escalate_to_human.
Why: policy is silent on competitor matching, a policy gap.
</example>` },
        { type: 'list', items: [
          T('**Show reasoning**, not just the label: the model generalizes the judgment to new cases.', '**Muestra el razonamiento**, no solo la etiqueta: el modelo generaliza el criterio a casos nuevos.'),
          T('**Format by example**: one finding shown as location, issue, severity, suggested fix gives consistent structure.', '**Formato con ejemplos**: un hallazgo mostrado como ubicación, problema, severidad y arreglo sugerido da una estructura consistente.'),
          T('**Acceptable vs issue**: pair an acceptable pattern with a genuine bug to cut false positives.', '**Aceptable vs problema**: empareja un patrón aceptable con un bug real para reducir falsos positivos.'),
          T('**Varied documents**: inline citations vs bibliography, methodology section vs details scattered in the text, informal measurements ("a couple of cups").', '**Documentos variados**: citas en línea vs bibliografía, sección de metodología vs detalles repartidos en el texto, medidas informales («un par de tazas»).')
        ] },
        { type: 'note', text: T('Required fields extracted as empty or null although the data is in the document? Add few-shot examples showing correct extraction from those different formats.', '¿Campos obligatorios que salen vacíos o nulos aunque el dato está en el documento? Añade ejemplos few-shot que muestren la extracción correcta en esos formatos distintos.') },
        { type: 'trap', text: T('Few-shot is not the first fix for **tool misrouting caused by minimal descriptions** (that is 2.1). Know which problem each technique solves.', 'El few-shot no es el primer arreglo para un **mal enrutado de tools causado por descripciones mínimas** (eso es 2.1). Debes saber qué problema resuelve cada técnica.') }
      ],
      quiz: [
        { q: T('Extraction leaves `methodology` empty for papers that describe methods inside the results section instead of a dedicated heading. Most effective fix?', 'La extracción deja `methodology` vacío en los papers que describen los métodos dentro de los resultados en lugar de en una sección propia. ¿Arreglo más eficaz?'),
          options: [
            opt('Add few-shot examples showing correct extraction from documents with embedded methodology', 'Añadir ejemplos few-shot que muestren la extracción correcta en documentos con la metodología integrada en el texto', true, 'Examples teach handling of varied structures.', 'Los ejemplos enseñan a manejar estructuras variadas.'),
            opt('Make methodology an optional field', 'Hacer opcional el campo methodology', false, 'The data exists; this would hide the miss.', 'El dato existe; esto ocultaría el fallo.'),
            opt('Retry the extraction three times', 'Reintentar la extracción tres veces', false, 'Same prompt, same miss.', 'Mismo prompt, mismo fallo.'),
            opt('Instruct the extractor to "look carefully for methodology anywhere in the paper"', 'Indicar al extractor que «busque con cuidado la metodología en cualquier parte del paper»', false, 'Vague; examples are more effective.', 'Es vago; los ejemplos son más eficaces.')
          ] },
        { q: T('What makes a few-shot example most useful for ambiguous decisions?', '¿Qué hace más útil un ejemplo few-shot para decisiones ambiguas?'),
          options: [
            opt('It explains why the chosen action beats a plausible alternative', 'Explica por qué la acción elegida gana a una alternativa plausible', true, 'Reasoning enables generalization to novel cases.', 'El razonamiento permite generalizar a casos nuevos.'),
            opt('It is as long as possible', 'Es lo más largo posible', false, 'Length is not the lever.', 'La longitud no es la palanca.'),
            opt('It repeats the obvious cases many times', 'Repite muchas veces los casos obvios', false, 'Targeted ambiguous cases are what help.', 'Lo que ayuda son los casos ambiguos y dirigidos.'),
            opt('It shows only the final label, without context, to keep prompts short', 'Muestra solo la etiqueta final, sin contexto, para que el prompt sea corto', false, 'Limits generalization.', 'Limita la generalización.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 4.3 */
    {
      id: '4.3', domain: 4, minutes: 15, docs: [DOCS.json],
      summary: T('Defining an extraction tool with a JSON schema and reading the `tool_use` input is the most reliable way to get schema-compliant output: no syntax errors. But a valid schema does not mean correct values; semantics still need checking.',
                 'Definir una tool de extracción con un JSON schema y leer el input del `tool_use` es la forma más fiable de obtener una salida que cumpla el schema: sin errores de sintaxis. Pero un schema válido no significa valores correctos; la semántica hay que comprobarla aparte.'),
      objectives: [
        T('Extract structured data through tool_use with a JSON schema.', 'Extraer datos estructurados mediante tool_use con un JSON schema.'),
        T('Choose tool_choice auto / any / forced for extraction.', 'Elegir tool_choice auto / any / forzado para extraer.'),
        T('Design schemas: nullable fields, "unclear", "other" + detail.', 'Diseñar schemas: campos nullable, "unclear", "other" + detalle.')
      ],
      blocks: [
        { type: 'code', lang: 'json', title: 'extraction tool · schema design', code: `
{
  "name": "record_invoice",
  "description": "Record the fields of ONE invoice exactly as stated.",
  "input_schema": {
    "type": "object",
    "properties": {
      "invoice_id":  { "type": "string" },
      "stated_total": { "type": "number" },
      "currency":    { "type": "string", "enum": ["PEN", "USD", "EUR", "unclear"] },
      "due_date":    { "type": ["string", "null"], "description": "ISO 8601, or null if absent" },
      "category":    { "type": "string", "enum": ["software", "hardware", "services", "other"] },
      "category_detail": { "type": ["string", "null"], "description": "Required when category is other" }
    },
    "required": ["invoice_id", "stated_total", "currency", "due_date", "category"]
  }
}`,
          caption: T('`due_date` may be null: if the field were a required string, the model would be pushed to **invent** a date.', '`due_date` puede ser null: si el campo fuera un string obligatorio, el modelo se vería empujado a **inventar** una fecha.') },
        { type: 'code', lang: 'python', title: 'reading the structured result', code: `
resp = client.messages.create(
    model=MODEL, max_tokens=1024, tools=[record_invoice],
    tool_choice={"type": "tool", "name": "record_invoice"},
    messages=[{"role": "user", "content": doc_text}],
)
data = next(b.input for b in resp.content if b.type == "tool_use")` },
        { type: 'table', head: [T('Schema guarantees', 'El schema garantiza'), T('Schema does NOT guarantee', 'El schema NO garantiza')], rows: [
          [T('Valid JSON, right types, required keys present', 'JSON válido, tipos correctos, claves obligatorias presentes'), T('Line items summing to the total', 'Que las líneas sumen el total')],
          [T('Enum values from the list', 'Valores de enum de la lista'), T('Values placed in the right field', 'Que los valores estén en el campo correcto')]
        ] },
        { type: 'list', items: [
          T('`tool_choice: "any"` when there are several extraction schemas and the document type is unknown.', '`tool_choice: "any"` cuando hay varios schemas de extracción y no se sabe el tipo de documento.'),
          T('Forced `{"type": "tool", "name": "extract_metadata"}` when a particular extraction must run before enrichment.', 'Forzado `{"type": "tool", "name": "extract_metadata"}` cuando una extracción concreta debe ejecutarse antes del enriquecimiento.'),
          T('Add **format normalization rules** in the prompt (dates to ISO, amounts without thousands separators) alongside the strict schema.', 'Añade **reglas de normalización de formato** en el prompt (fechas a ISO, importes sin separador de miles) junto al schema estricto.')
        ] },
        { type: 'trap', text: T('"Ask for JSON in the prompt and parse it" is less reliable than tool use with a schema. And "make every field required" increases hallucination when data can be missing.', '«Pide JSON en el prompt y parséalo» es menos fiable que tool use con schema. Y «haz obligatorios todos los campos» aumenta las invenciones cuando el dato puede faltar.') }
      ],
      quiz: [
        { q: T('Contracts sometimes lack a renewal date, and the extractor then invents plausible dates. Best schema change?', 'Algunos contratos no tienen fecha de renovación, y entonces el extractor inventa fechas plausibles. ¿Mejor cambio de schema?'),
          options: [
            opt('Make renewal_date nullable so the model can return null when absent', 'Hacer renewal_date nullable para que el modelo pueda devolver null si no existe', true, 'Removes the pressure to fabricate.', 'Elimina la presión por inventar.'),
            opt('Keep the field required and add "do not invent dates" to the prompt', 'Mantener el campo obligatorio y añadir «no inventes fechas» al prompt', false, 'The schema still demands a value.', 'El schema sigue exigiendo un valor.'),
            opt('Remove the field entirely', 'Quitar el campo por completo', false, 'Loses data when it exists.', 'Pierde el dato cuando sí existe.'),
            opt('Retry until a date is found', 'Reintentar hasta encontrar una fecha', false, 'Retries cannot find absent information.', 'Los reintentos no encuentran información que no existe.')
          ] },
        { q: T('Every extraction passes JSON schema validation, yet some invoices have line items that do not add up to the total. Why?', 'Todas las extracciones pasan la validación del JSON schema, pero algunas facturas tienen líneas que no suman el total. ¿Por qué?'),
          options: [
            opt('Schemas eliminate syntax errors but not semantic errors', 'Los schemas eliminan errores de sintaxis pero no errores semánticos', true, 'Sum consistency needs separate validation.', 'La coherencia de las sumas necesita una validación aparte.'),
            opt('tool_choice should be "auto"', 'tool_choice debería ser "auto"', false, 'Would make output less reliable.', 'Haría la salida menos fiable.'),
            opt('The schema is missing required fields for each line item', 'Al schema le faltan campos obligatorios en cada línea', false, 'The issue is value consistency, not presence.', 'El problema es la coherencia de los valores, no su presencia.'),
            opt('JSON cannot represent decimals', 'JSON no puede representar decimales', false, 'False.', 'Falso.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 4.4 */
    {
      id: '4.4', domain: 4, minutes: 12, docs: [DOCS.json],
      summary: T('Retry with specifics: send the original document, the failed extraction and the exact validation errors. Retries fix format and structure; they cannot conjure information that is not in the source.',
                 'Reintenta con detalle: envía el documento original, la extracción fallida y los errores de validación exactos. Los reintentos arreglan formato y estructura; no pueden sacar información que no está en la fuente.'),
      objectives: [
        T('Build retry-with-error-feedback requests.', 'Construir peticiones de reintento con feedback del error.'),
        T('Recognize when retries will not help.', 'Reconocer cuándo los reintentos no van a ayudar.'),
        T('Design self-correcting outputs (calculated vs stated totals, conflict flags, detected_pattern).', 'Diseñar salidas que se autocorrigen (total calculado vs declarado, indicadores de conflicto, detected_pattern).')
      ],
      blocks: [
        { type: 'code', lang: 'python', title: 'retry with error feedback', code: `
errors = validate(extraction)          # e.g. Pydantic
if errors:
    retry_msg = (
        f"<document>{doc}</document>\\n"
        f"<previous_extraction>{json.dumps(extraction)}</previous_extraction>\\n"
        f"<validation_errors>{errors}</validation_errors>\\n"
        "Fix only the fields listed in the errors."
    )` },
        { type: 'table', head: [T('Failure', 'Fallo'), T('Retry helps?', '¿Ayuda reintentar?')], rows: [
          [T('Date in "05/10/26" instead of ISO', 'Fecha en «05/10/26» en lugar de ISO'), T('Yes, format mismatch', 'Sí, error de formato')],
          [T('Nested object flattened wrongly', 'Objeto anidado aplanado mal'), T('Yes, structural error', 'Sí, error estructural')],
          [T('Field only exists in an annex not provided', 'El campo solo existe en un anexo no proporcionado'), T('No, information is absent', 'No, la información no está')]
        ] },
        { type: 'code', lang: 'json', title: 'self-correction fields', code: `
{
  "stated_total": 1280.50,
  "calculated_total": 1208.50,
  "conflict_detected": true,
  "line_items": [ ... ]
}`,
          caption: T('Extracting both totals lets code flag discrepancies instead of trusting either number silently.', 'Extraer ambos totales permite que el código marque las discrepancias en lugar de confiar en silencio en uno de los dos números.') },
        { type: 'p', text: T('In code review, add a `detected_pattern` field to each finding (e.g. "unchecked-null-return"). When developers dismiss findings, you can analyze **which patterns** cause false positives and fix them systematically.',
                             'En revisión de código, añade un campo `detected_pattern` a cada hallazgo (p. ej. «unchecked-null-return»). Cuando los desarrolladores descarten hallazgos, podrás analizar **qué patrones** causan falsos positivos y corregirlos de forma sistemática.') },
        { type: 'trap', text: T('"Increase retries to 5" for data that lives in an external document nobody provided is always wrong.', '«Sube los reintentos a 5» para un dato que vive en un documento externo que nadie proporcionó siempre es incorrecto.') }
      ],
      quiz: [
        { q: T('Validation fails because `po_number` is missing. The PO number appears only in a separate purchase-order PDF that is not sent to the model. What should you do?', 'La validación falla porque falta `po_number`. El número de orden de compra solo aparece en un PDF aparte que no se envía al modelo. ¿Qué deberías hacer?'),
          options: [
            opt('Recognize retries will not help; provide the PO document or mark the field null/needs-review', 'Reconocer que reintentar no ayudará; proporcionar el documento de la orden de compra o marcar el campo como null/pendiente de revisión', true, 'The information is absent from the source.', 'La información no está en la fuente.'),
            opt('Retry with the validation error appended so the model searches harder for the number', 'Reintentar añadiendo el error de validación para que el modelo busque mejor el número', false, 'Works for format errors, not missing information.', 'Sirve para errores de formato, no para información que falta.'),
            opt('Retry five times with higher temperature', 'Reintentar cinco veces con más temperatura', false, 'Encourages fabrication.', 'Fomenta que invente.'),
            opt('Make po_number a required field', 'Hacer obligatorio po_number', false, 'Pushes the model to invent one.', 'Empuja al modelo a inventar uno.')
          ] },
        { q: T('An effective retry request should include…', 'Una petición de reintento eficaz debe incluir…'),
          options: [
            opt('The original document, the failed extraction and the specific validation errors', 'El documento original, la extracción fallida y los errores de validación concretos', true, 'Gives the model everything it needs to self-correct.', 'Da al modelo todo lo necesario para autocorregirse.'),
            opt('Only "try again, that was wrong"', 'Solo «inténtalo otra vez, eso estaba mal»', false, 'No actionable feedback.', 'Sin feedback accionable.'),
            opt('Only the list of specific validation errors, to keep the retry prompt short', 'Solo la lista de errores de validación concretos, para que el prompt de reintento sea corto', false, 'The model needs the source and its previous output too.', 'El modelo también necesita la fuente y su salida anterior.'),
            opt('A different, shorter document', 'Un documento distinto y más corto', false, 'Changes the task.', 'Cambia la tarea.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 4.5 */
    {
      id: '4.5', domain: 4, minutes: 13, docs: [DOCS.batch],
      summary: T('Message Batches: **50% cheaper**, results within **up to 24 hours**, **no latency SLA**, and **no multi-turn tool calling** inside a request. Great for overnight work, wrong for anything someone is waiting on.',
                 'Message Batches: **50 % más barato**, resultados en **hasta 24 horas**, **sin SLA de latencia** y **sin llamadas a tools en varios turnos** dentro de una petición. Ideal para trabajo nocturno, inadecuado para todo lo que alguien está esperando.'),
      objectives: [
        T('Match synchronous vs batch API to latency requirements.', 'Ajustar la API síncrona o batch a los requisitos de latencia.'),
        T('Calculate submission frequency against an SLA.', 'Calcular la frecuencia de envío según un SLA.'),
        T('Handle failures by custom_id and refine prompts on a sample first.', 'Manejar los fallos por custom_id y refinar los prompts primero con una muestra.')
      ],
      blocks: [
        { type: 'table', head: [T('Workload', 'Carga'), T('API', 'API')], rows: [
          [T('Blocking pre-merge check', 'Check bloqueante previo al merge'), T('Synchronous', 'Síncrona')],
          [T('Overnight tech-debt report', 'Informe nocturno de deuda técnica'), T('Batch', 'Batch')],
          [T('Weekly audit, nightly test generation', 'Auditoría semanal, generación nocturna de tests'), T('Batch', 'Batch')],
          [T('Agent that must call tools mid-task', 'Agente que debe llamar tools a mitad de la tarea'), T('Synchronous (batch cannot run tools mid-request)', 'Síncrona (batch no puede ejecutar tools a mitad de la petición)')]
        ] },
        { type: 'code', lang: 'json', title: 'one batch request', code: `
{
  "custom_id": "invoice-2026-10-0042",
  "params": {
    "model": "MODEL",
    "max_tokens": 1024,
    "messages": [{ "role": "user", "content": "..." }]
  }
}`,
          caption: T('`custom_id` correlates each result with its request. Results are not guaranteed to come back in submission order.', '`custom_id` relaciona cada resultado con su petición. No se garantiza que los resultados vuelvan en el orden de envío.') },
        { type: 'h', text: T('SLA arithmetic', 'Aritmética del SLA') },
        { type: 'example', situation: T('Documents must be processed within **30 hours** of arrival. Batches take up to **24 hours**. How often must you submit?', 'Los documentos deben procesarse en las **30 horas** siguientes a su llegada. Los batches tardan hasta **24 horas**. ¿Cada cuánto debes enviar?'),
          answer: T('Worst case = wait for the next submission + 24 h ≤ 30 h, so the wait window must be ≤ 6 h. The guide\'s example uses **4-hour windows**, keeping a safety margin.', 'Peor caso = esperar al siguiente envío + 24 h ≤ 30 h, así que la ventana de espera debe ser ≤ 6 h. El ejemplo de la guía usa **ventanas de 4 horas**, con margen de seguridad.') },
        { type: 'list', items: [
          T('**Failures**: resubmit **only** the failed `custom_id`s, with modifications (e.g. chunk documents that exceeded the context limit).', '**Fallos**: reenvía **solo** los `custom_id` que fallaron, con cambios (p. ej. dividir los documentos que excedieron el límite de contexto).'),
          T('**Refine first**: tune the prompt on a sample set before batch-processing thousands, to maximize first-pass success.', '**Refina primero**: ajusta el prompt con una muestra antes de procesar miles en batch, para maximizar el acierto a la primera.')
        ] },
        { type: 'trap', text: T('"Switch both workflows to batch with polling" or "with a timeout fallback" are distractors: blocking workflows need guaranteed latency. And result ordering is not a reason to avoid batch: `custom_id` solves it.', '«Pasa ambos flujos a batch con polling» o «con un fallback por timeout» son distractores: los flujos bloqueantes necesitan latencia garantizada. Y el orden de los resultados no es motivo para evitar batch: `custom_id` lo resuelve.') }
      ],
      quiz: [
        { q: T('Your manager proposes moving both the blocking pre-merge check and the overnight debt report to the Batches API for 50% savings. Evaluation?', 'Tu jefe propone pasar a la Batches API tanto el check bloqueante previo al merge como el informe nocturno de deuda, para ahorrar un 50 %. ¿Evaluación?'),
          options: [
            opt('Batch only the overnight report; keep the pre-merge check synchronous', 'Pasar a batch solo el informe nocturno y mantener síncrono el check previo al merge', true, 'Match each workload to its latency needs.', 'Ajusta cada carga a sus necesidades de latencia.'),
            opt('Batch both with status polling', 'Pasar ambos a batch con consulta de estado', false, 'No latency SLA for a blocking workflow.', 'No hay SLA de latencia para un flujo bloqueante.'),
            opt('Keep both synchronous because batch results arrive out of order', 'Mantener ambos síncronos porque los resultados batch llegan desordenados', false, 'custom_id handles correlation.', 'custom_id resuelve la correlación.'),
            opt('Batch both with a fallback to real-time on timeout', 'Pasar ambos a batch con fallback a tiempo real si hay timeout', false, 'Unnecessary complexity.', 'Complejidad innecesaria.')
          ] },
        { q: T('120 of 5,000 batch requests failed because their documents exceeded the context limit. Next step?', '120 de 5.000 peticiones batch fallaron porque sus documentos excedían el límite de contexto. ¿Siguiente paso?'),
          options: [
            opt('Resubmit only those custom_ids, with the documents chunked', 'Reenviar solo esos custom_id, con los documentos divididos', true, 'Targeted resubmission with a fix.', 'Reenvío dirigido con el arreglo.'),
            opt('Resubmit the whole batch', 'Reenviar todo el batch', false, 'Wastes cost on 4,880 successful requests.', 'Gasta dinero en 4.880 peticiones que ya salieron bien.'),
            opt('Resubmit the 120 unchanged', 'Reenviar las 120 sin cambios', false, 'They will fail again.', 'Volverán a fallar.'),
            opt('Switch all 5,000 requests to synchronous calls instead', 'Pasar las 5.000 peticiones a llamadas síncronas', false, 'Loses savings; the issue is document size.', 'Se pierde el ahorro; el problema es el tamaño del documento.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 4.6 */
    {
      id: '4.6', domain: 4, minutes: 11, docs: [DOCS.pe],
      summary: T('A model reviewing its own work in the same session keeps its reasoning and rarely questions it. An **independent** instance, without that context, catches more. For big reviews, split into per-file passes plus an integration pass.',
                 'Un modelo que revisa su propio trabajo en la misma sesión conserva su razonamiento y rara vez lo cuestiona. Una instancia **independiente**, sin ese contexto, detecta más. Para revisiones grandes, divide en pasadas por archivo más una pasada de integración.'),
      objectives: [
        T('Use a second independent instance to review generated code.', 'Usar una segunda instancia independiente para revisar el código generado.'),
        T('Design multi-pass reviews to avoid attention dilution.', 'Diseñar revisiones multipasada para evitar la dilución de la atención.'),
        T('Use per-finding confidence to route review attention.', 'Usar la confianza por hallazgo para dirigir la atención de la revisión.')
      ],
      blocks: [
        { type: 'compare',
          bad: { title: T('Weak review', 'Revisión débil'), items: [
            T('"Now review your code" in the same session', '«Ahora revisa tu código» en la misma sesión'),
            T('Relying on extended thinking to self-critique', 'Confiar en el extended thinking para autocriticarse'),
            T('One pass over 14 files', 'Una pasada sobre 14 archivos')
          ] },
          good: { title: T('Strong review', 'Revisión sólida'), items: [
            T('Fresh instance with only the code and criteria', 'Instancia nueva solo con el código y los criterios'),
            T('Per-file local passes', 'Pasadas locales por archivo'),
            T('Separate cross-file integration pass', 'Pasada de integración separada entre archivos')
          ] } },
        { type: 'p', text: T('A verification pass can ask the reviewer to attach a confidence level to **each finding**. That does not replace criteria; it lets you **route** reviewer attention (low-confidence findings to a human first) once you have calibrated what those levels mean.',
                             'Una pasada de verificación puede pedir al revisor que adjunte un nivel de confianza a **cada hallazgo**. Eso no sustituye a los criterios; te permite **dirigir** la atención de los revisores (los hallazgos de baja confianza, primero a una persona) una vez calibrado qué significan esos niveles.') },
        { type: 'note', text: T('Same idea as 3.6: generator and reviewer should be different contexts. Isolation is the feature.', 'La misma idea que en 3.6: el generador y el revisor deben ser contextos distintos. El aislamiento es justamente la ventaja.') },
        { type: 'trap', text: T('Self-reported confidence is fine as a routing signal **per finding** after calibration; it is unreliable as the **sole** trigger for escalation decisions (see 5.2). Read the context of the option.', 'La confianza autoinformada vale como señal de enrutado **por hallazgo** tras calibrarla; no es fiable como **único** disparador de escalado (ver 5.2). Lee el contexto de la opción.') }
      ],
      quiz: [
        { q: T('Code generated by Claude passes self-review in the same session but humans find subtle bugs. Most effective improvement?', 'El código generado por Claude pasa la autorrevisión en la misma sesión, pero las personas encuentran bugs sutiles. ¿Mejora más eficaz?'),
          options: [
            opt('Review with a second, independent Claude instance without the generator\'s reasoning context', 'Revisar con una segunda instancia de Claude, independiente, sin el contexto de razonamiento del generador', true, 'Independent reviewers question decisions the generator rationalized.', 'Los revisores independientes cuestionan las decisiones que el generador dio por buenas.'),
            opt('Tell the same session to be much more critical and skeptical when reviewing its own code', 'Pedir a la misma sesión que sea mucho más crítica y escéptica al revisar su propio código', false, 'It retains its reasoning bias.', 'Mantiene su sesgo de razonamiento.'),
            opt('Enable extended thinking in the same session', 'Activar extended thinking en la misma sesión', false, 'Less effective than an independent instance.', 'Menos eficaz que una instancia independiente.'),
            opt('Run the same self-review twice', 'Hacer la misma autorrevisión dos veces', false, 'Same blind spots.', 'Los mismos puntos ciegos.')
          ] },
        { q: T('How can per-finding confidence scores be used appropriately?', '¿Cómo se pueden usar adecuadamente las puntuaciones de confianza por hallazgo?'),
          options: [
            opt('To route reviewer attention after calibrating against labeled data', 'Para dirigir la atención de los revisores tras calibrarlas con datos etiquetados', true, 'Calibrated routing is the documented use.', 'El enrutado calibrado es el uso documentado.'),
            opt('As the only filter that decides which findings get reported', 'Como único filtro que decide qué hallazgos se reportan', false, 'Not a substitute for explicit criteria.', 'No sustituye a los criterios explícitos.'),
            opt('As proof a finding is correct', 'Como prueba de que un hallazgo es correcto', false, 'Confidence is not correctness.', 'Confianza no es exactitud.'),
            opt('To decide when to escalate customers', 'Para decidir cuándo escalar a los clientes', false, 'Unreliable proxy for case complexity.', 'Es un proxy poco fiable de la complejidad del caso.')
          ] }
      ]
    }
  ]);
})();
