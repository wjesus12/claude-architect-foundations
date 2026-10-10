/* Dominio 5 — Context Management & Reliability (15 %) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const DOCS = {
    ctx: { label: 'Context windows', url: 'https://docs.claude.com/en/docs/build-with-claude/context-windows' },
    long: { label: 'Long context prompting tips', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/long-context-tips' },
    subagents: { label: 'Subagents in Claude Code', url: 'https://docs.claude.com/en/docs/claude-code/sub-agents' },
    research: { label: 'How we built our multi-agent research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system' }
  };

  CAF.addLessons([
    /* ---------------------------------------------------------- 5.1 */
    {
      id: '5.1', domain: 5, minutes: 13, docs: [DOCS.ctx, DOCS.long],
      summary: T('Long conversations lose the details that matter most (amounts, dates, order numbers) when they are summarized. Keep those facts in a persistent **case facts** block, trim verbose tool output, and put key findings where the model reads best: the beginning.',
                 'Las conversaciones largas pierden los detalles que más importan (importes, fechas, números de pedido) al resumirse. Guarda esos datos en un bloque persistente de **case facts**, recorta las salidas extensas de las tools y pon los hallazgos clave donde el modelo lee mejor: al principio.'),
      objectives: [
        T('Prevent progressive summarization from erasing transactional facts.', 'Evitar que el resumen progresivo borre los datos transaccionales.'),
        T('Mitigate "lost in the middle" with ordering and headers.', 'Mitigar el efecto «lost in the middle» con orden y encabezados.'),
        T('Trim tool results and ask upstream agents for structured, compact output.', 'Recortar los resultados de las tools y pedir a los agentes previos una salida estructurada y compacta.')
      ],
      blocks: [
        { type: 'scene', domain: 5 },
        { type: 'compare',
          bad: { title: T('Progressive summary', 'Resumen progresivo'), items: [
            T('"Customer wants a refund for a recent order"', '«El cliente quiere un reembolso por un pedido reciente»'),
            T('The $129.90, order #A-4471 and the promised "by Friday" are gone', 'Los 129,90 $, el pedido #A-4471 y el «para el viernes» prometido han desaparecido')
          ] },
          good: { title: T('Case facts block (outside the summary)', 'Bloque de case facts (fuera del resumen)'), items: [
            T('order: #A-4471 · amount: $129.90 · status: double-captured', 'pedido: #A-4471 · importe: 129,90 $ · estado: cobrado dos veces'),
            T('customer expectation: refund by Friday 2026-10-09', 'expectativa del cliente: reembolso antes del viernes 2026-10-09'),
            T('Included verbatim in every prompt', 'Incluido literalmente en cada prompt')
          ] } },
        { type: 'list', items: [
          T('**Lost in the middle**: models process the beginning and end of long inputs reliably and may skip the middle. Put a key-findings summary **first** and organize details under explicit section headers.', '**Lost in the middle**: los modelos procesan bien el principio y el final de entradas largas y pueden saltarse el medio. Pon un resumen de hallazgos clave **al principio** y organiza los detalles con encabezados explícitos.'),
          T('**Tool results bloat context**: an order lookup returns 40+ fields; a return case needs 5. Trim to the relevant fields before they accumulate.', '**Los resultados de tools inflan el contexto**: una consulta de pedido devuelve más de 40 campos; un caso de devolución necesita 5. Recorta a los campos relevantes antes de que se acumulen.'),
          T('**Multi-issue sessions**: keep a separate structured layer per issue (order ID, amount, status).', '**Sesiones con varios temas**: mantén una capa estructurada aparte por tema (ID de pedido, importe, estado).'),
          T('**Upstream agents with limited downstream budgets**: return key facts, citations and relevance scores, not verbose reasoning chains; include metadata (dates, source locations) so synthesis stays accurate.', '**Agentes previos con presupuesto limitado aguas abajo**: devuelve datos clave, citas y puntuaciones de relevancia, no cadenas de razonamiento extensas; incluye metadatos (fechas, ubicación de la fuente) para que la síntesis sea precisa.')
        ] },
        { type: 'note', text: T('The Messages API is stateless: coherent multi-turn conversations require sending the complete relevant history each request. Managing context means deciding **what** that history contains.', 'La Messages API no guarda estado: una conversación coherente de varios turnos exige enviar en cada petición todo el historial relevante. Gestionar el contexto es decidir **qué** contiene ese historial.') },
        { type: 'trap', text: T('"Use a bigger context window" does not fix lost-in-the-middle or summarization loss. Structure fixes them.', '«Usa una ventana de contexto mayor» no arregla el lost-in-the-middle ni la pérdida al resumir. La estructura sí.') }
      ],
      quiz: [
        { q: T('After 40 turns, the support agent offers the wrong refund amount; the summarized history says "a refund for the order". Best fix?', 'Tras 40 turnos, el agente de soporte ofrece un importe de reembolso equivocado; el historial resumido dice «un reembolso por el pedido». ¿Mejor arreglo?'),
          options: [
            opt('Keep a persistent case-facts block (amounts, dates, order IDs) outside the summarized history', 'Mantener un bloque persistente de case facts (importes, fechas, IDs de pedido) fuera del historial resumido', true, 'Transactional facts survive summarization.', 'Los datos transaccionales sobreviven al resumen.'),
            opt('Summarize the history more often so it always stays short and current', 'Resumir el historial más a menudo para que siempre sea corto y esté al día', false, 'Loses more detail.', 'Pierde más detalle.'),
            opt('Use a larger model', 'Usar un modelo más grande', false, 'The fact was already lost from the context.', 'El dato ya se perdió del contexto.'),
            opt('Ask the customer to repeat the amount and order number before any refund is issued', 'Pedir al cliente que repita el importe y el número de pedido antes de emitir cualquier reembolso', false, 'Bad experience; fixes nothing structurally.', 'Mala experiencia; no arregla nada en la estructura.')
          ] },
        { q: T('A synthesis prompt aggregates 30 subagent reports; findings from reports 10–20 are often omitted. Best mitigation?', 'Un prompt de síntesis agrega 30 informes de subagentes; los hallazgos de los informes 10–20 se omiten a menudo. ¿Mejor mitigación?'),
          options: [
            opt('Put a key-findings summary at the beginning and organize details with explicit section headers', 'Poner un resumen de hallazgos clave al principio y organizar los detalles con encabezados explícitos', true, 'Mitigates position effects (lost in the middle).', 'Mitiga los efectos de posición (lost in the middle).'),
            opt('Shuffle the report order on each run so that no report is always stuck in the middle', 'Barajar el orden de los informes en cada ejecución para que ninguno quede siempre atascado en medio', false, 'Moves the problem around.', 'Solo cambia el problema de sitio.'),
            opt('Remove reports 10–20', 'Eliminar los informes 10–20', false, 'Loses information.', 'Pierde información.'),
            opt('Increase max_tokens', 'Aumentar max_tokens', false, 'Output length is not the issue.', 'La longitud de la salida no es el problema.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 5.2 */
    {
      id: '5.2', domain: 5, minutes: 13, docs: [],
      summary: T('Escalate for the right reasons: the customer asks for a human, the policy has a gap or exception, or you cannot make progress. Not because the customer sounds upset, and not because the model "feels" unsure.',
                 'Escala por los motivos correctos: el cliente pide una persona, la política tiene un vacío o una excepción, o no puedes avanzar. No porque el cliente suene molesto ni porque el modelo «se sienta» inseguro.'),
      objectives: [
        T('Apply the three valid escalation triggers.', 'Aplicar los tres disparadores válidos de escalado.'),
        T('Distinguish explicit human requests from frustration on a solvable issue.', 'Distinguir una petición explícita de una persona de la frustración ante un problema que se puede resolver.'),
        T('Ask for more identifiers instead of guessing between multiple matches.', 'Pedir más identificadores en lugar de adivinar entre varias coincidencias.')
      ],
      blocks: [
        { type: 'table', head: [T('Situation', 'Situación'), T('Action', 'Acción')], rows: [
          [T('"I want to talk to a person."', '«Quiero hablar con una persona.»'), T('Escalate **immediately**; do not investigate first', 'Escala **de inmediato**; no investigues antes')],
          [T('Frustrated, but the issue is standard and solvable', 'Frustrado, pero el problema es estándar y se puede resolver'), T('Acknowledge, offer the resolution; escalate if they **reiterate** wanting a human', 'Reconoce su frustración y ofrece la solución; escala si **insiste** en querer una persona')],
          [T('Policy silent (competitor price match, policy covers only own-site)', 'La política no dice nada (igualar el precio de la competencia; la política cubre solo la propia web)'), T('Escalate: policy gap', 'Escala: vacío en la política')],
          [T('No meaningful progress possible', 'No es posible avanzar de forma significativa'), T('Escalate', 'Escala')],
          [T('get_customer returns 3 "Maria Lopez"', 'get_customer devuelve 3 «Maria Lopez»'), T('Ask for another identifier (email, order #); never pick heuristically', 'Pide otro identificador (email, n.º de pedido); nunca elijas por heurística')]
        ] },
        { type: 'compare',
          bad: { title: T('Unreliable proxies', 'Proxies poco fiables'), items: [
            T('Sentiment analysis thresholds', 'Umbrales de análisis de sentimiento'),
            T('Model self-reported confidence 1–10', 'Confianza autoinformada del modelo del 1 al 10'),
            T('A separate ML classifier before trying prompts', 'Un clasificador de ML aparte antes de probar con prompts')
          ] },
          good: { title: T('Explicit criteria', 'Criterios explícitos'), items: [
            T('Escalation rules in the system prompt', 'Reglas de escalado en el system prompt'),
            T('Few-shot examples: escalate vs resolve, with reasoning', 'Ejemplos few-shot: escalar vs resolver, con el razonamiento'),
            T('Policy-gap detection', 'Detección de vacíos en la política')
          ] } },
        { type: 'example', situation: T('First-contact resolution is 55% (target 80%). The agent escalates standard damage replacements with photos but tries to handle policy exceptions alone.', 'La resolución en el primer contacto es del 55 % (meta 80 %). El agente escala reposiciones estándar por daño con foto, pero intenta resolver solo las excepciones de política.'),
          answer: T('Add **explicit escalation criteria with few-shot examples** to the system prompt. Confidence scores fail because the agent is already confidently wrong; sentiment does not track complexity; a classifier is over-engineered before prompts are tried.', 'Añade **criterios de escalado explícitos con ejemplos few-shot** al system prompt. Las puntuaciones de confianza fallan porque el agente ya se equivoca con seguridad; el sentimiento no refleja la complejidad; un clasificador es sobreingeniería antes de probar con prompts.') },
        { type: 'trap', text: T('"Investigate first, then offer a human" when the customer **explicitly** asked for one is wrong. Honor the request immediately.', '«Investiga primero y luego ofrece una persona» cuando el cliente la pidió **explícitamente** es incorrecto. Atiende la petición de inmediato.') }
      ],
      quiz: [
        { q: T('A customer writes: "I don\'t want the bot. Get me a human now." The issue looks simple. What should the agent do?', 'Un cliente escribe: «No quiero el bot. Pásame con una persona ya.» El problema parece sencillo. ¿Qué debe hacer el agente?'),
          options: [
            opt('Escalate to a human immediately', 'Escalar a una persona de inmediato', true, 'Explicit requests are honored without investigating first.', 'Las peticiones explícitas se atienden sin investigar antes.'),
            opt('Resolve it quickly since it is simple', 'Resolverlo rápido, ya que es sencillo', false, 'Ignores an explicit request.', 'Ignora una petición explícita.'),
            opt('Investigate first so the human has context', 'Investigar primero para que la persona tenga contexto', false, 'Delays an explicit request.', 'Retrasa una petición explícita.'),
            opt('Run sentiment analysis to decide', 'Ejecutar un análisis de sentimiento para decidir', false, 'The request is explicit; no proxy needed.', 'La petición es explícita; no hace falta un proxy.')
          ] },
        { q: T('`get_customer("Ana Torres")` returns three matching accounts. Best behavior?', '`get_customer("Ana Torres")` devuelve tres cuentas que coinciden. ¿Mejor comportamiento?'),
          options: [
            opt('Ask the customer for an additional identifier such as email or order number', 'Pedir al cliente un identificador adicional, como el email o el número de pedido', true, 'Clarify instead of guessing.', 'Aclara en lugar de adivinar.'),
            opt('Pick the most recently active account, since it is most likely the caller', 'Elegir la cuenta con actividad más reciente, ya que es la que más probablemente llama', false, 'Heuristic selection risks the wrong account.', 'Elegir por heurística arriesga la cuenta equivocada.'),
            opt('Escalate immediately', 'Escalar de inmediato', false, 'Solvable with one question.', 'Se resuelve con una pregunta.'),
            opt('Process all three', 'Procesar las tres', false, 'Dangerous.', 'Peligroso.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 5.3 */
    {
      id: '5.3', domain: 5, minutes: 11, docs: [DOCS.research],
      summary: T('When a subagent fails, the coordinator needs four things: what failed, what was attempted, what partial results exist, and what alternatives remain. Hiding errors or aborting everything are both wrong.',
                 'Cuando un subagente falla, el coordinador necesita cuatro cosas: qué falló, qué se intentó, qué resultados parciales hay y qué alternativas quedan. Ocultar errores y abortarlo todo son ambos incorrectos.'),
      objectives: [
        T('Return structured error context for coordinator recovery.', 'Devolver un contexto de error estructurado para que el coordinador se recupere.'),
        T('Separate access failures from valid empty results.', 'Separar los fallos de acceso de los resultados vacíos válidos.'),
        T('Annotate synthesis with coverage gaps.', 'Anotar la síntesis con los huecos de cobertura.')
      ],
      blocks: [
        { type: 'code', lang: 'json', title: 'subagent → coordinator after a timeout', code: `
{
  "status": "partial_failure",
  "failure_type": "timeout",
  "attempted_query": "AI adoption in film post-production 2024",
  "attempts": 2,
  "partial_results": [ { "claim": "...", "source_url": "..." } ],
  "alternatives": ["narrow to VFX studios", "use trade-press sources"]
}` },
        { type: 'table', head: [T('Anti-pattern', 'Anti-patrón'), T('Why it is wrong', 'Por qué está mal')], rows: [
          [T('Generic "search unavailable" after retries', '«Búsqueda no disponible» genérico tras los reintentos'), T('Hides what was tried and what was found', 'Oculta qué se intentó y qué se encontró')],
          [T('Return empty results marked as success', 'Devolver resultados vacíos marcados como éxito'), T('Coordinator thinks the topic has no sources', 'El coordinador cree que el tema no tiene fuentes')],
          [T('Throw to a top-level handler that kills the workflow', 'Lanzar a un manejador de nivel superior que mata el flujo'), T('One failure destroys all other good work', 'Un fallo destruye todo el resto del buen trabajo')]
        ] },
        { type: 'p', text: T('Subagents recover **locally** from transient failures and propagate only what they cannot fix. The final report then carries **coverage annotations**: which findings are well supported and which areas have gaps due to unavailable sources.',
                             'Los subagentes se recuperan **localmente** de los fallos transitorios y solo propagan lo que no pueden arreglar. El informe final lleva entonces **anotaciones de cobertura**: qué hallazgos están bien respaldados y qué áreas tienen huecos por fuentes no disponibles.') },
        { type: 'trap', text: T('"Retry with exponential backoff, then return a generic status" sounds robust, but the generic status is what makes it wrong.', '«Reintenta con espera exponencial y luego devuelve un estado genérico» suena robusto, pero es justamente el estado genérico lo que lo hace incorrecto.') }
      ],
      quiz: [
        { q: T('The web-search subagent times out on a complex topic. Which propagation design best enables recovery?', 'El subagente de búsqueda web agota el tiempo en un tema complejo. ¿Qué diseño de propagación permite mejor la recuperación?'),
          options: [
            opt('Return failure type, attempted query, partial results and alternatives to the coordinator', 'Devolver al coordinador el tipo de fallo, la consulta intentada, los resultados parciales y las alternativas', true, 'Gives the coordinator what it needs to decide.', 'Da al coordinador lo que necesita para decidir.'),
            opt('Retry with backoff then return "search unavailable"', 'Reintentar con espera y luego devolver «search unavailable»', false, 'Generic status hides context.', 'El estado genérico oculta el contexto.'),
            opt('Return an empty result set marked as successful so the rest of the research run continues', 'Devolver un conjunto vacío marcado como exitoso para que continúe el resto de la investigación', false, 'Suppresses the error.', 'Suprime el error.'),
            opt('Terminate the whole research workflow', 'Terminar todo el flujo de investigación', false, 'Unnecessary; recovery could succeed.', 'Innecesario; la recuperación podría funcionar.')
          ] },
        { q: T('Two of six sources were unreachable. How should the final report reflect this?', 'Dos de seis fuentes no estaban accesibles. ¿Cómo debe reflejarlo el informe final?'),
          options: [
            opt('Coverage annotations marking well-supported findings vs areas with gaps', 'Anotaciones de cobertura que marquen los hallazgos bien respaldados frente a las áreas con huecos', true, 'Transparent about reliability.', 'Es transparente sobre la fiabilidad.'),
            opt('Omit any mention of the missing sources to keep the report clean', 'No mencionar las fuentes que faltan para que el informe quede limpio', false, 'Overstates completeness.', 'Exagera la completitud.'),
            opt('Refuse to produce a report', 'Negarse a producir el informe', false, 'Wastes valid partial work.', 'Desperdicia trabajo parcial válido.'),
            opt('Fill the gaps with general knowledge', 'Rellenar los huecos con conocimiento general', false, 'Unsourced claims.', 'Afirmaciones sin fuente.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 5.4 */
    {
      id: '5.4', domain: 5, minutes: 12, docs: [DOCS.subagents],
      summary: T('Long codebase explorations degrade: answers drift toward "typical patterns" instead of the classes you found. Delegate verbose digging to subagents, write findings to a scratchpad, summarize between phases, and `/compact` when needed.',
                 'Las exploraciones largas de un codebase se degradan: las respuestas derivan hacia «patrones típicos» en lugar de las clases que encontraste. Delega la exploración extensa a subagentes, anota los hallazgos en un scratchpad, resume entre fases y usa `/compact` cuando haga falta.'),
      objectives: [
        T('Recognize context degradation symptoms.', 'Reconocer los síntomas de degradación del contexto.'),
        T('Use subagents, scratchpad files and phase summaries.', 'Usar subagentes, archivos scratchpad y resúmenes por fase.'),
        T('Design crash recovery with state manifests.', 'Diseñar la recuperación ante caídas con manifiestos de estado.')
      ],
      blocks: [
        { type: 'note', text: T('Symptom to memorize: the agent starts giving inconsistent answers and refers to "typical patterns" rather than the specific classes it discovered earlier.', 'Síntoma para memorizar: el agente empieza a dar respuestas inconsistentes y habla de «patrones típicos» en lugar de las clases concretas que descubrió antes.') },
        { type: 'steps', items: [
          T('**Delegate**: spawn subagents for specific questions ("find all test files", "trace refund flow dependencies"); the main agent keeps the high-level map.', '**Delega**: crea subagentes para preguntas concretas («encuentra todos los archivos de test», «rastrea las dependencias del flujo de reembolso»); el agente principal conserva el mapa general.'),
          T('**Persist**: keep a scratchpad file of key findings and consult it for later questions.', '**Persiste**: mantén un archivo scratchpad con los hallazgos clave y consúltalo en preguntas posteriores.'),
          T('**Summarize between phases**: inject the summary of phase 1 into the initial context of phase 2 subagents.', '**Resume entre fases**: inyecta el resumen de la fase 1 en el contexto inicial de los subagentes de la fase 2.'),
          T('**Compact**: use `/compact` when context fills with verbose discovery output.', '**Compacta**: usa `/compact` cuando el contexto se llene de salidas de exploración extensas.')
        ] },
        { type: 'code', lang: 'json', title: 'state/manifest.json · crash recovery', code: `
{
  "run_id": "legacy-audit-07",
  "agents": {
    "dependency-mapper": { "status": "done", "state": "state/deps.json" },
    "test-finder":       { "status": "done", "state": "state/tests.json" },
    "refund-tracer":     { "status": "in_progress", "state": "state/refund.json" }
  }
}`,
          caption: T('Each agent exports its state to a known location; on resume the coordinator loads the manifest and injects that state into agent prompts.', 'Cada agente exporta su estado a una ubicación conocida; al reanudar, el coordinador carga el manifiesto e inyecta ese estado en los prompts de los agentes.') },
        { type: 'trap', text: T('"Start over from scratch after a crash" and "keep exploring in one ever-growing session" are both inferior to manifests + summaries.', '«Empezar de cero tras una caída» y «seguir explorando en una sesión cada vez más grande» son ambas peores que manifiestos + resúmenes.') }
      ],
      quiz: [
        { q: T('Two hours into exploring a legacy system, the agent starts describing "typical repository patterns" instead of the specific classes it found. Best fix?', 'Tras dos horas explorando un sistema legado, el agente empieza a describir «patrones típicos de repositorio» en lugar de las clases concretas que encontró. ¿Mejor arreglo?'),
          options: [
            opt('Persist key findings in a scratchpad file and delegate further digging to subagents', 'Guardar los hallazgos clave en un archivo scratchpad y delegar la exploración adicional a subagentes', true, 'Counteracts context degradation.', 'Contrarresta la degradación del contexto.'),
            opt('Keep going; it will recover', 'Seguir; ya se recuperará', false, 'Degradation worsens with more context.', 'La degradación empeora con más contexto.'),
            opt('Ask it to re-read the entire codebase from the start to refresh its memory', 'Pedirle que vuelva a leer todo el codebase desde el principio para refrescar su memoria', false, 'Floods the context further.', 'Inunda aún más el contexto.'),
            opt('Lower temperature', 'Bajar la temperatura', false, 'Unrelated to context degradation.', 'No tiene relación con la degradación del contexto.')
          ] },
        { q: T('A multi-agent audit crashes halfway. How should recovery work?', 'Una auditoría multiagente se cae a mitad de camino. ¿Cómo debe funcionar la recuperación?'),
          options: [
            opt('Coordinator loads a manifest of each agent\'s exported state and injects it on resume', 'El coordinador carga un manifiesto con el estado exportado de cada agente y lo inyecta al reanudar', true, 'Structured state persistence.', 'Persistencia estructurada del estado.'),
            opt('Restart every agent from zero', 'Reiniciar cada agente desde cero', false, 'Wastes completed work.', 'Desperdicia el trabajo ya hecho.'),
            opt('Resume only the coordinator and let the agents reconstruct their own progress', 'Reanudar solo el coordinador y dejar que los agentes reconstruyan su propio progreso', false, 'Agents do not inherit state.', 'Los agentes no heredan el estado.'),
            opt('Use /compact on the coordinator', 'Usar /compact en el coordinador', false, 'Does not restore agent state.', 'No restaura el estado de los agentes.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 5.5 */
    {
      id: '5.5', domain: 5, minutes: 11, docs: [],
      summary: T('"97% accurate overall" can hide a document type at 70%. Before cutting human review, measure accuracy **by document type and by field**, keep sampling high-confidence output, and route low-confidence or contradictory cases to people.',
                 '«97 % de acierto global» puede esconder un tipo de documento al 70 %. Antes de reducir la revisión humana, mide el acierto **por tipo de documento y por campo**, sigue muestreando la salida de alta confianza y envía a personas los casos de baja confianza o contradictorios.'),
      objectives: [
        T('Spot aggregate metrics masking weak segments.', 'Detectar métricas agregadas que ocultan segmentos débiles.'),
        T('Use stratified random sampling of high-confidence extractions.', 'Usar muestreo aleatorio estratificado de las extracciones de alta confianza.'),
        T('Calibrate field-level confidence with labeled validation sets.', 'Calibrar la confianza por campo con conjuntos de validación etiquetados.')
      ],
      blocks: [
        { type: 'table', head: [T('Segment', 'Segmento'), T('Volume', 'Volumen'), T('Accuracy', 'Acierto')], rows: [
          [T('Invoices', 'Facturas'), T('80%', '80 %'), T('99.1%', '99,1 %')],
          [T('Receipts', 'Recibos'), T('15%', '15 %'), T('96.0%', '96,0 %')],
          [T('Handwritten forms', 'Formularios manuscritos'), T('5%', '5 %'), T('71.0% ← hidden by the 97% average', '71,0 % ← oculto tras el 97 % de media')]
        ] },
        { type: 'list', items: [
          T('**Segment first**: verify consistent accuracy across document types and fields before automating.', '**Segmenta primero**: verifica que el acierto sea consistente por tipo de documento y por campo antes de automatizar.'),
          T('**Stratified random sampling** of high-confidence output: keeps measuring the error rate and catches **novel** error patterns.', '**Muestreo aleatorio estratificado** de la salida de alta confianza: sigue midiendo la tasa de error y detecta patrones de error **nuevos**.'),
          T('**Field-level confidence**, calibrated against a labeled validation set, sets review thresholds.', 'La **confianza por campo**, calibrada con un conjunto de validación etiquetado, fija los umbrales de revisión.'),
          T('**Prioritize limited reviewers**: low confidence, ambiguous or contradictory sources go to humans first.', '**Prioriza a los pocos revisores**: los casos de baja confianza, ambiguos o con fuentes contradictorias van primero a personas.')
        ] },
        { type: 'trap', text: T('"Accuracy is 97%, so remove human review" is the trap. Ask: 97% of what, measured how, per segment?', '«El acierto es del 97 %, así que quitemos la revisión humana» es la trampa. Pregunta: ¿97 % de qué, medido cómo y por segmento?') }
      ],
      quiz: [
        { q: T('An extraction pipeline shows 97% overall accuracy and leadership wants to stop human review. What should you do first?', 'Un pipeline de extracción muestra un 97 % de acierto global y la dirección quiere dejar la revisión humana. ¿Qué deberías hacer primero?'),
          options: [
            opt('Analyze accuracy by document type and field to verify every segment performs consistently', 'Analizar el acierto por tipo de documento y por campo para verificar que todos los segmentos rinden de forma consistente', true, 'Aggregate metrics can mask weak segments.', 'Las métricas agregadas pueden ocultar segmentos débiles.'),
            opt('Stop human review for all documents, since 97% overall is above the target', 'Dejar la revisión humana en todos los documentos, ya que el 97 % global supera la meta', false, 'Risky without segment analysis.', 'Es arriesgado sin analizar por segmento.'),
            opt('Raise the model temperature for variety', 'Subir la temperatura del modelo para tener variedad', false, 'Irrelevant.', 'Irrelevante.'),
            opt('Review only the documents the model marks as low confidence, without any calibration step', 'Revisar solo los documentos que el modelo marca como de baja confianza, sin ningún paso de calibración', false, 'Uncalibrated confidence is unreliable.', 'La confianza sin calibrar no es fiable.')
          ] },
        { q: T('How do you keep detecting new error patterns among high-confidence extractions that skip review?', '¿Cómo sigues detectando patrones de error nuevos entre las extracciones de alta confianza que no se revisan?'),
          options: [
            opt('Stratified random sampling of high-confidence output for ongoing measurement', 'Muestreo aleatorio estratificado de la salida de alta confianza para medirla de forma continua', true, 'Measures error rates and surfaces novel patterns.', 'Mide las tasas de error y saca a la luz patrones nuevos.'),
            opt('Trust them permanently', 'Confiar en ellas para siempre', false, 'Novel errors go unnoticed.', 'Los errores nuevos pasan desapercibidos.'),
            opt('Review only the first week', 'Revisar solo la primera semana', false, 'Patterns change over time.', 'Los patrones cambian con el tiempo.'),
            opt('Ask the model to double-check its confident answers in a second pass', 'Pedir al modelo que vuelva a comprobar sus respuestas seguras en una segunda pasada', false, 'Self-review is weak.', 'La autorrevisión es débil.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 5.6 */
    {
      id: '5.6', domain: 5, minutes: 12, docs: [DOCS.research],
      summary: T('Every claim must stay attached to its source through every hop. When credible sources disagree, show both with attribution; when they differ by date, record the dates so time is not mistaken for contradiction.',
                 'Cada afirmación debe seguir unida a su fuente en cada salto. Cuando fuentes fiables no coinciden, muestra ambas con su atribución; cuando difieren por fecha, registra las fechas para que el paso del tiempo no se confunda con una contradicción.'),
      objectives: [
        T('Require structured claim–source mappings that survive synthesis.', 'Exigir correspondencias estructuradas afirmación–fuente que sobrevivan a la síntesis.'),
        T('Annotate conflicts instead of picking a value arbitrarily.', 'Anotar los conflictos en lugar de elegir un valor de forma arbitraria.'),
        T('Render each content type in its natural format.', 'Presentar cada tipo de contenido en su formato natural.')
      ],
      blocks: [
        { type: 'code', lang: 'json', title: 'claim–source mapping with a conflict', code: `
{
  "claim": "Share of SMEs using generative AI in Peru",
  "values": [
    { "value": "34%", "source": "Survey A", "url": "https://example.org/a",
      "collected": "2025-03", "method": "online, n=1,200" },
    { "value": "21%", "source": "Ministry report", "url": "https://example.org/b",
      "collected": "2024-06", "method": "census sample" }
  ],
  "conflict": true,
  "note": "Different years and methods; not necessarily contradictory"
}` },
        { type: 'list', items: [
          T('**Attribution is lost in summarization** when findings are compressed without their sources. Make subagents output claim, excerpt, URL/document and date, and require synthesis to preserve and merge them.', '**La atribución se pierde al resumir** cuando los hallazgos se comprimen sin sus fuentes. Haz que los subagentes devuelvan afirmación, extracto, URL/documento y fecha, y exige a la síntesis que los conserve y los combine.'),
          T('**Conflicts**: analysis completes with both values annotated; the **coordinator** decides how to reconcile before synthesis.', '**Conflictos**: el análisis termina con ambos valores anotados; el **coordinador** decide cómo conciliarlos antes de la síntesis.'),
          T('**Structure the report**: separate well-established findings from contested ones, keeping the original characterizations and methodological context.', '**Estructura el informe**: separa los hallazgos bien establecidos de los discutidos, conservando la caracterización original y el contexto metodológico.'),
          T('**Right format per content**: financial data as tables, news as prose, technical findings as structured lists.', '**Formato adecuado para cada contenido**: datos financieros en tablas, noticias en prosa, hallazgos técnicos en listas estructuradas.')
        ] },
        { type: 'trap', text: T('"Choose the more recent / larger-sample value and drop the other" is the distractor. Annotate the conflict with attribution and let the reader (or coordinator) see both.', '«Elige el valor más reciente / con mayor muestra y descarta el otro» es el distractor. Anota el conflicto con su atribución y deja que el lector (o el coordinador) vea ambos.') }
      ],
      quiz: [
        { q: T('Two credible sources report different market-size figures. How should the synthesis handle it?', 'Dos fuentes fiables dan cifras distintas del tamaño de mercado. ¿Cómo debe manejarlo la síntesis?'),
          options: [
            opt('Include both values, annotated with their sources, dates and methods', 'Incluir ambos valores, anotados con sus fuentes, fechas y métodos', true, 'Preserves provenance and lets the reader judge.', 'Conserva la procedencia y deja que el lector juzgue.'),
            opt('Average the two values into a single figure and cite both sources for the result', 'Promediar los dos valores en una sola cifra y citar ambas fuentes del resultado', false, 'Invents a figure no source reported.', 'Inventa una cifra que ninguna fuente dio.'),
            opt('Keep the higher value, from the larger study', 'Quedarse con el valor más alto, del estudio mayor', false, 'Arbitrary selection.', 'Selección arbitraria.'),
            opt('Omit the statistic', 'Omitir el dato', false, 'Loses relevant information.', 'Pierde información relevante.')
          ] },
        { q: T('Final reports contain claims without citations, although search subagents returned URLs. Most likely cause?', 'Los informes finales contienen afirmaciones sin cita, aunque los subagentes de búsqueda devolvieron URLs. ¿Causa más probable?'),
          options: [
            opt('Claim–source mappings are not preserved through summarization/synthesis', 'Las correspondencias afirmación–fuente no se conservan durante el resumen/la síntesis', true, 'Attribution is lost when findings are compressed without sources.', 'La atribución se pierde cuando los hallazgos se comprimen sin las fuentes.'),
            opt('The search agent runs too few queries to find enough citable sources', 'El agente de búsqueda hace muy pocas consultas para encontrar suficientes fuentes citables', false, 'URLs were returned; the loss happens downstream.', 'Las URLs sí se devolvieron; la pérdida ocurre aguas abajo.'),
            opt('The report is too long', 'El informe es demasiado largo', false, 'Length does not remove citations by itself.', 'La longitud no elimina las citas por sí sola.'),
            opt('The model cannot output URLs', 'El modelo no puede escribir URLs', false, 'False.', 'Falso.')
          ] }
      ]
    }
  ]);
})();
