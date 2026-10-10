/* Dominio 1 — Agentic Architecture & Orchestration (27 %) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const DOCS = {
    tooluse: { label: 'Tool use · Claude API docs', url: 'https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview' },
    sdk: { label: 'Claude Agent SDK · overview', url: 'https://docs.claude.com/en/docs/agent-sdk/overview' },
    subagents: { label: 'Subagents in the Agent SDK', url: 'https://docs.claude.com/en/docs/agent-sdk/subagents' },
    hooks: { label: 'Hooks · Claude Code / Agent SDK', url: 'https://docs.claude.com/en/docs/claude-code/hooks' },
    sessions: { label: 'Session management · Agent SDK', url: 'https://docs.claude.com/en/docs/agent-sdk/sessions' }
  };

  CAF.addLessons([
    /* ---------------------------------------------------------- 1.1 */
    {
      id: '1.1', domain: 1, minutes: 14, docs: [DOCS.tooluse, DOCS.sdk],
      summary: T('An agent is a loop: call Claude, read `stop_reason`, run the tools it asked for, append the results, repeat. The loop ends when Claude says so (`end_turn`), not when your code guesses.',
                 'Un agente es un bucle: llamas a Claude, lees `stop_reason`, ejecutas las tools que pidió, añades los resultados y repites. El bucle termina cuando Claude lo dice (`end_turn`), no cuando tu código lo adivina.'),
      objectives: [
        T('Drive the loop with `stop_reason` ("tool_use" → continue, "end_turn" → stop).', 'Controlar el bucle con `stop_reason` ("tool_use" → seguir, "end_turn" → parar).'),
        T('Append every `tool_result` to the history so the next turn can reason over it.', 'Añadir cada `tool_result` al historial para que el siguiente turno razone con él.'),
        T('Avoid the three termination anti-patterns named in the guide.', 'Evitar los tres anti-patrones de terminación que nombra la guía.')
      ],
      blocks: [
        { type: 'scene', domain: 1 },
        { type: 'h', text: T('The loop, step by step', 'El bucle, paso a paso') },
        { type: 'steps', items: [
          T('Send `messages` + `tools` (+ `system`) to the Messages API.', 'Envía `messages` + `tools` (+ `system`) a la Messages API.'),
          T('Append the assistant response **as-is** to `messages` (including its `tool_use` blocks).', 'Añade la respuesta del asistente **tal cual** a `messages` (incluidos sus bloques `tool_use`).'),
          T('If `stop_reason == "tool_use"`, run each requested tool and send back a `user` message with one `tool_result` per `tool_use_id`.', 'Si `stop_reason == "tool_use"`, ejecuta cada tool pedida y devuelve un mensaje `user` con un `tool_result` por cada `tool_use_id`.'),
          T('Repeat. When `stop_reason == "end_turn"`, the model has finished: show the final answer.', 'Repite. Cuando `stop_reason == "end_turn"`, el modelo terminó: muestra la respuesta final.')
        ] },
        { type: 'code', lang: 'python', title: 'agent_loop.py', code: `
messages = [{"role": "user", "content": user_request}]

while True:
    resp = client.messages.create(
        model=MODEL, max_tokens=4096,
        system=SYSTEM_PROMPT, tools=TOOLS, messages=messages,
    )
    messages.append({"role": "assistant", "content": resp.content})

    if resp.stop_reason != "tool_use":      # "end_turn" (or max_tokens…)
        break

    results = []
    for block in resp.content:
        if block.type == "tool_use":
            output = run_tool(block.name, block.input)
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,     # pairs result with request
                "content": output,
            })
    messages.append({"role": "user", "content": results})`,
          caption: T('Model-driven: Claude decides which tool comes next based on what the previous results revealed.', 'Dirigido por el modelo: Claude decide qué tool sigue según lo que revelaron los resultados anteriores.') },
        { type: 'h', text: T('Model-driven vs pre-configured', 'Dirigido por el modelo vs preconfigurado') },
        { type: 'p', text: T('In an agentic loop the **model** chooses the next action from the context. A fixed decision tree or hard-coded tool sequence is a workflow, not an agent: predictable, but blind to what each step discovers. Use fixed sequences only where you need guaranteed ordering (that is what hooks and gates are for, see 1.4).',
                             'En un bucle agéntico el **modelo** elige la siguiente acción a partir del contexto. Un árbol de decisión fijo o una secuencia de tools programada es un workflow, no un agente: predecible, pero ciego a lo que descubre cada paso. Usa secuencias fijas solo donde necesitas un orden garantizado (para eso están los hooks y las compuertas, ver 1.4).') },
        { type: 'compare',
          bad: { title: T('Termination anti-patterns', 'Anti-patrones de terminación'), items: [
            T('Parsing the text for "I\'m done" or "task complete"', 'Buscar en el texto «I\'m done» o «task complete»'),
            T('Using an iteration cap as the **primary** stop condition', 'Usar un tope de iteraciones como condición de parada **principal**'),
            T('Stopping as soon as the response contains any text block', 'Parar en cuanto la respuesta contiene algún bloque de texto')
          ] },
          good: { title: T('Correct control flow', 'Control de flujo correcto'), items: [
            T('Continue while `stop_reason == "tool_use"`', 'Continuar mientras `stop_reason == "tool_use"`'),
            T('Stop on `"end_turn"`', 'Parar con `"end_turn"`'),
            T('Keep a max-turns limit only as a **safety net**, not as the logic', 'Mantener un límite de turnos solo como **red de seguridad**, no como lógica')
          ] } },
        { type: 'trap', text: T('A response can contain **both** text and `tool_use` blocks ("Let me look that up…" + a tool call). Checking "is there text?" to decide completion stops the agent mid-task.',
                                'Una respuesta puede contener **a la vez** texto y bloques `tool_use` («Déjame buscarlo…» + una llamada a tool). Mirar «¿hay texto?» para decidir si terminó detiene al agente a mitad de la tarea.') },
        { type: 'terms', items: [
          { term: 'stop_reason: "tool_use"', en: 'Claude wants one or more tools executed. Run them and continue.', es: 'Claude quiere que se ejecuten una o más tools. Ejecútalas y continúa.' },
          { term: 'stop_reason: "end_turn"', en: 'Claude finished its turn naturally. Exit the loop.', es: 'Claude terminó su turno con normalidad. Sal del bucle.' },
          { term: 'stop_reason: "max_tokens"', en: 'Output was cut off by your `max_tokens`. Not a completion signal: raise the limit or continue.', es: 'La salida se cortó por tu `max_tokens`. No indica que terminó: sube el límite o continúa.' },
          { term: 'tool_use_id', en: 'Links each `tool_result` to the `tool_use` block that requested it.', es: 'Vincula cada `tool_result` con el bloque `tool_use` que lo pidió.' }
        ] }
      ],
      quiz: [
        { q: T('Your agent sometimes stops right after writing "Let me check the order status for you." without calling any tool result back. The loop checks `if any(b.type == "text" for b in resp.content): break`. What is the fix?',
               'Tu agente a veces se detiene justo después de escribir «Let me check the order status for you.» sin devolver ningún resultado de tool. El bucle comprueba `if any(b.type == "text" for b in resp.content): break`. ¿Cuál es el arreglo?'),
          options: [
            opt('Continue the loop while `stop_reason == "tool_use"` and stop on `"end_turn"`', 'Continuar el bucle mientras `stop_reason == "tool_use"` y parar con `"end_turn"`', true,
                'The response had text AND a tool_use block; stop_reason is the reliable signal.', 'La respuesta tenía texto Y un bloque tool_use; stop_reason es la señal fiable.'),
            opt('Tell the model in the system prompt never to write text before calling a tool', 'Decirle al modelo en el system prompt que nunca escriba texto antes de llamar a una tool', false,
                'Treats a control-flow bug as a prompt problem; the loop logic is wrong.', 'Trata un error de control de flujo como si fuera un problema de prompt; la lógica del bucle está mal.'),
            opt('Add a maximum of 10 iterations and stop when it is reached', 'Añadir un máximo de 10 iteraciones y parar al alcanzarlo', false,
                'An iteration cap as the primary stop is an explicit anti-pattern.', 'Un tope de iteraciones como parada principal es un anti-patrón explícito.'),
            opt('Search the text for phrases like "done" before breaking', 'Buscar en el texto frases como «done» antes de salir', false,
                'Parsing natural language to end the loop is an anti-pattern.', 'Interpretar lenguaje natural para terminar el bucle es un anti-patrón.')
          ] },
        { q: T('After running a tool, what must happen before the next API call?', 'Tras ejecutar una tool, ¿qué debe ocurrir antes de la siguiente llamada a la API?'),
          options: [
            opt('Append a user message containing a `tool_result` with the matching `tool_use_id`', 'Añadir un mensaje user con un `tool_result` que lleve el `tool_use_id` correspondiente', true,
                'This is how the model sees the result and reasons about the next step.', 'Así es como el modelo ve el resultado y razona el siguiente paso.'),
            opt('Replace the conversation with only the latest tool output to save tokens', 'Sustituir la conversación por solo la última salida de tool para ahorrar tokens', false,
                'The model needs the history to stay coherent; dropping it breaks reasoning.', 'El modelo necesita el historial para seguir siendo coherente; quitarlo rompe el razonamiento.'),
            opt('Put the tool output into the system prompt', 'Poner la salida de la tool en el system prompt', false,
                'Tool results belong in the conversation as tool_result blocks.', 'Los resultados de tools van en la conversación como bloques tool_result.'),
            opt('Nothing; the API remembers tool results between calls', 'Nada; la API recuerda los resultados entre llamadas', false,
                'The Messages API is stateless: you send the full history every time.', 'La Messages API no guarda estado: envías el historial completo cada vez.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 1.2 */
    {
      id: '1.2', domain: 1, minutes: 14, docs: [DOCS.subagents],
      summary: T('In a hub-and-spoke system the coordinator owns everything between agents: decomposition, delegation, routing, error handling and aggregation. Subagents never talk to each other, and they start with an empty context.',
                 'En un sistema de hub-and-spoke el coordinador es dueño de todo lo que ocurre entre agentes: descomposición, delegación, enrutado, manejo de errores y agregación. Los subagentes nunca hablan entre sí y empiezan con el contexto vacío.'),
      objectives: [
        T('Explain hub-and-spoke and why all traffic goes through the coordinator.', 'Explicar el hub-and-spoke y por qué todo el tráfico pasa por el coordinador.'),
        T('Diagnose overly narrow task decomposition.', 'Diagnosticar una descomposición de tareas demasiado estrecha.'),
        T('Design iterative refinement: evaluate synthesis, re-delegate gaps, re-synthesize.', 'Diseñar refinamiento iterativo: evaluar la síntesis, volver a delegar los huecos y re-sintetizar.')
      ],
      blocks: [
        { type: 'h', text: T('Why hub-and-spoke', 'Por qué hub-and-spoke') },
        { type: 'list', items: [
          T('**Observability**: one place to log every delegation and result.', '**Observabilidad**: un único lugar para registrar cada delegación y cada resultado.'),
          T('**Consistent error handling**: the coordinator decides retry, alternative or partial result.', '**Manejo de errores consistente**: el coordinador decide reintentar, buscar alternativa o aceptar un resultado parcial.'),
          T('**Controlled information flow**: each subagent receives exactly what it needs.', '**Flujo de información controlado**: cada subagente recibe exactamente lo que necesita.')
        ] },
        { type: 'note', text: T('Subagents operate with **isolated context**. They do not see the coordinator\'s conversation history unless the coordinator puts it in their prompt.',
                                'Los subagentes trabajan con **contexto aislado**. No ven el historial del coordinador salvo que el coordinador lo ponga en su prompt.') },
        { type: 'h', text: T('Decomposition: the most common root cause', 'Descomposición: la causa raíz más común') },
        { type: 'example', situation: T('Topic: "impact of AI on creative industries". Every subagent succeeds, but the report only covers visual arts. The coordinator log shows three subtasks: digital art, graphic design, photography.',
                                        'Tema: «impacto de la IA en las industrias creativas». Todos los subagentes terminan bien, pero el informe solo cubre artes visuales. El log del coordinador muestra tres subtareas: arte digital, diseño gráfico y fotografía.'),
          answer: T('The **coordinator\'s decomposition is too narrow** (music, writing and film were never assigned). The subagents did exactly their job, so blaming search queries or synthesis instructions misses the cause.',
                    'La **descomposición del coordinador es demasiado estrecha** (música, escritura y cine nunca se asignaron). Los subagentes hicieron justo su trabajo, así que culpar a las búsquedas o a la síntesis no apunta a la causa.') },
        { type: 'h', text: T('Coordinator design moves', 'Decisiones de diseño del coordinador') },
        { type: 'list', items: [
          T('**Dynamic selection**: analyze the query and invoke only the subagents it needs, instead of always running the full pipeline.', '**Selección dinámica**: analizar la consulta e invocar solo los subagentes necesarios, en lugar de ejecutar siempre todo el pipeline.'),
          T('**Partition scope** to avoid duplication: distinct subtopics or source types per subagent.', '**Particionar el alcance** para evitar duplicados: subtemas o tipos de fuente distintos por subagente.'),
          T('**Iterative refinement loop**: evaluate the synthesis for gaps → re-delegate targeted queries → re-synthesize until coverage is sufficient.', '**Bucle de refinamiento iterativo**: evaluar la síntesis buscando huecos → volver a delegar consultas dirigidas → re-sintetizar hasta que la cobertura sea suficiente.')
        ] },
        { type: 'compare',
          bad: { title: T('Anti-patterns', 'Anti-patrones'), items: [
            T('Subagents calling each other directly', 'Subagentes que se llaman entre sí directamente'),
            T('Always routing every query through all subagents', 'Pasar siempre todas las consultas por todos los subagentes'),
            T('Fixing a coverage gap by tuning the search agent when the plan was the problem', 'Arreglar un hueco de cobertura ajustando al buscador cuando el problema era el plan')
          ] },
          good: { title: T('Patterns', 'Patrones'), items: [
            T('Coordinator routes all inter-agent communication', 'El coordinador enruta toda la comunicación entre agentes'),
            T('Coordinator picks subagents by query complexity', 'El coordinador elige subagentes según la complejidad de la consulta'),
            T('Coordinator checks coverage and re-delegates', 'El coordinador comprueba la cobertura y vuelve a delegar')
          ] } },
        { type: 'trap', text: T('When all subagents "work correctly" but the output is incomplete, look **upstream** at what they were assigned.',
                                'Cuando todos los subagentes «funcionan bien» pero el resultado está incompleto, mira **hacia arriba**: qué se les asignó.') }
      ],
      quiz: [
        { q: T('A research system always runs search, analysis, synthesis and report agents, even for simple factual questions, wasting latency. What should change?',
               'Un sistema de investigación siempre ejecuta los agentes de búsqueda, análisis, síntesis e informe, incluso para preguntas factuales simples, desperdiciando latencia. ¿Qué debería cambiar?'),
          options: [
            opt('Have the coordinator analyze each query and invoke only the subagents it requires', 'Que el coordinador analice cada consulta e invoque solo los subagentes necesarios', true,
                'Dynamic subagent selection based on query complexity is the documented coordinator role.', 'La selección dinámica según la complejidad es el rol documentado del coordinador.'),
            opt('Let subagents call each other directly to skip the coordinator', 'Dejar que los subagentes se llamen entre sí para saltarse al coordinador', false,
                'Breaks hub-and-spoke: loses observability and consistent error handling.', 'Rompe el hub-and-spoke: se pierde observabilidad y manejo de errores consistente.'),
            opt('Merge all subagents into one agent with every tool', 'Fusionar todos los subagentes en uno con todas las tools', false,
                'Too many tools degrade selection, and specialization is lost.', 'Demasiadas tools degradan la selección y se pierde la especialización.'),
            opt('Run the four agents in parallel instead of sequentially so simple questions return faster', 'Ejecutar los cuatro agentes en paralelo en vez de en secuencia para que las preguntas simples respondan antes', false,
                'Still runs unnecessary work, and synthesis depends on earlier results.', 'Sigue haciendo trabajo innecesario, y la síntesis depende de resultados anteriores.')
          ] },
        { q: T('Why must subagent communication be routed through the coordinator?', '¿Por qué la comunicación de los subagentes debe pasar por el coordinador?'),
          options: [
            opt('For observability, consistent error handling and controlled information flow', 'Por observabilidad, manejo de errores consistente y flujo de información controlado', true,
                'These are exactly the three reasons the guide gives.', 'Son exactamente las tres razones que da la guía.'),
            opt('Because subagents cannot produce text output', 'Porque los subagentes no pueden producir texto', false, 'They can; that is not the reason.', 'Sí pueden; ese no es el motivo.'),
            opt('Because the API forbids more than two agents', 'Porque la API prohíbe más de dos agentes', false, 'No such limit exists.', 'No existe tal límite.'),
            opt('So the coordinator can share its full conversation history with every subagent automatically', 'Para que el coordinador comparta automáticamente todo su historial con cada subagente', false,
                'Nothing is shared automatically; context must be passed explicitly.', 'No se comparte nada automáticamente; el contexto se pasa de forma explícita.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 1.3 */
    {
      id: '1.3', domain: 1, minutes: 15, docs: [DOCS.subagents, DOCS.sdk],
      summary: T('Subagents are spawned with the **Task** tool and configured with an `AgentDefinition`. They inherit nothing: the coordinator must put findings, metadata and goals directly into the prompt.',
                 'Los subagentes se crean con la tool **Task** y se configuran con un `AgentDefinition`. No heredan nada: el coordinador debe poner hallazgos, metadatos y objetivos directamente en el prompt.'),
      objectives: [
        T('Configure `allowedTools` to include "Task" and define subagents with description, prompt and tools.', 'Configurar `allowedTools` con "Task" y definir subagentes con descripción, prompt y tools.'),
        T('Pass complete prior findings in structured form, keeping source metadata.', 'Pasar los hallazgos previos completos y estructurados, conservando los metadatos de las fuentes.'),
        T('Spawn subagents in parallel by emitting several Task calls in one response.', 'Crear subagentes en paralelo emitiendo varias llamadas Task en una sola respuesta.')
      ],
      blocks: [
        { type: 'code', lang: 'python', title: 'coordinator.py · Claude Agent SDK', code: `
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

options = ClaudeAgentOptions(
    allowed_tools=["Task", "Read"],          # without "Task" no subagents
    agents={
        "web-searcher": AgentDefinition(
            description="Finds recent, credible web sources for ONE subtopic. "
                        "Use for news, statistics and public reports.",
            prompt="You are a search specialist. Return findings as JSON: "
                   "claim, excerpt, source_url, published_date.",
            tools=["WebSearch", "WebFetch"],
        ),
        "synthesizer": AgentDefinition(
            description="Merges findings into a cited report section.",
            prompt="Preserve every claim-source mapping you receive.",
            tools=["Read"],                    # no web tools: least privilege
        ),
    },
)`,
          caption: T('The `description` is what the coordinator reads to decide which subagent to call, so write it like a tool description.', 'La `description` es lo que lee el coordinador para decidir a qué subagente llamar, así que escríbela como la descripción de una tool.') },
        { type: 'h', text: T('Context passing: explicit, complete, structured', 'Paso de contexto: explícito, completo y estructurado') },
        { type: 'p', text: T('A subagent invocation starts fresh and does not share memory with previous invocations. If the synthesizer needs the search results and the document analysis, both go **in its prompt**. Use a structured format that separates content from metadata (URL, document name, page) so attribution survives.',
                             'Cada invocación de un subagente empieza de cero y no comparte memoria con las anteriores. Si el sintetizador necesita los resultados de búsqueda y el análisis de documentos, ambos van **en su prompt**. Usa un formato estructurado que separe contenido y metadatos (URL, nombre del documento, página) para que la atribución sobreviva.') },
        { type: 'code', lang: 'json', title: 'payload passed to the synthesizer', code: `
{
  "goal": "Section on AI in music production, 2023-2025",
  "quality_criteria": ["every claim cited", "flag conflicting stats"],
  "findings": [
    { "claim": "41% of producers use AI mastering tools",
      "excerpt": "...41 percent of surveyed producers...",
      "source_url": "https://example.org/survey-2024",
      "published_date": "2024-11-02" }
  ]
}` },
        { type: 'h', text: T('Parallel spawning', 'Creación en paralelo') },
        { type: 'p', text: T('To run subagents concurrently, the coordinator emits **several Task tool calls in a single response**. Spreading them across separate turns makes them sequential and adds latency.',
                             'Para ejecutar subagentes a la vez, el coordinador emite **varias llamadas a la tool Task en una sola respuesta**. Repartirlas en turnos distintos las vuelve secuenciales y añade latencia.') },
        { type: 'h', text: T('Goals, not procedures', 'Objetivos, no procedimientos') },
        { type: 'p', text: T('Coordinator prompts should state the **research goal and quality criteria**, not step-by-step instructions. Subagents adapt better when they know what "good" looks like.',
                             'Los prompts del coordinador deben indicar el **objetivo de investigación y los criterios de calidad**, no instrucciones paso a paso. Los subagentes se adaptan mejor cuando saben cómo es un buen resultado.') },
        { type: 'note', text: T('Fork-based sessions (`fork_session`) let you branch from a shared analysis baseline to explore divergent approaches. More in 1.7.',
                                'Las sesiones con fork (`fork_session`) permiten ramificar desde un análisis base compartido para explorar enfoques distintos. Más en 1.7.') },
        { type: 'trap', text: T('"The synthesis agent ignores earlier findings" → it never received them. The fix is putting the findings in its prompt, not telling it to "remember" or "check the history".',
                                '«El agente de síntesis ignora los hallazgos anteriores» → nunca los recibió. El arreglo es ponerlos en su prompt, no pedirle que «recuerde» o «revise el historial».') }
      ],
      quiz: [
        { q: T('A coordinator built with the Agent SDK never delegates; it tries to do everything itself. Its options list `allowed_tools=["Read", "WebSearch"]` and two agents are defined. Most likely cause?',
               'Un coordinador hecho con el Agent SDK nunca delega; intenta hacerlo todo él mismo. Sus opciones tienen `allowed_tools=["Read", "WebSearch"]` y hay dos agentes definidos. ¿Causa más probable?'),
          options: [
            opt('"Task" is missing from allowedTools, so it cannot spawn subagents', 'Falta "Task" en allowedTools, así que no puede crear subagentes', true,
                'Subagents are invoked through the Task tool; it must be allowed.', 'Los subagentes se invocan con la tool Task; debe estar permitida.'),
            opt('Subagent descriptions are too long', 'Las descripciones de los subagentes son demasiado largas', false,
                'Long descriptions do not prevent delegation; a missing tool does.', 'Las descripciones largas no impiden delegar; la falta de la tool sí.'),
            opt('The model needs extended thinking enabled before it is able to plan delegation', 'El modelo necesita tener activado el extended thinking para poder planificar la delegación', false, 'Not required for delegation.', 'No hace falta para delegar.'),
            opt('Subagents must be defined in CLAUDE.md', 'Los subagentes deben definirse en CLAUDE.md', false,
                'In the SDK they are defined via AgentDefinition in the options.', 'En el SDK se definen con AgentDefinition en las opciones.')
          ] },
        { q: T('Search and document-analysis subagents ran in separate coordinator turns, doubling latency. How do you run them in parallel?',
               'Los subagentes de búsqueda y de análisis se ejecutaron en turnos distintos del coordinador, duplicando la latencia. ¿Cómo los ejecutas en paralelo?'),
          options: [
            opt('Have the coordinator emit both Task calls in a single response', 'Que el coordinador emita ambas llamadas Task en una sola respuesta', true,
                'Multiple tool calls in one response run concurrently.', 'Varias llamadas a tools en una respuesta se ejecutan a la vez.'),
            opt('Give one subagent the other\'s tools so it does both jobs', 'Dar a un subagente las tools del otro para que haga ambos trabajos', false,
                'Removes specialization and is not parallelism.', 'Elimina la especialización y no es paralelismo.'),
            opt('Use the Message Batches API for the subagents', 'Usar la Message Batches API para los subagentes', false,
                'Batches have up to 24h latency and no multi-turn tool use.', 'Los batches tienen hasta 24 h de latencia y no admiten tools en varios turnos.'),
            opt('Ask each subagent to spawn the next one', 'Pedir a cada subagente que cree el siguiente', false,
                'Still sequential and breaks hub-and-spoke.', 'Sigue siendo secuencial y rompe el hub-and-spoke.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 1.4 */
    {
      id: '1.4', domain: 1, minutes: 13, docs: [DOCS.hooks],
      summary: T('Prompts guide; code enforces. When an order of steps is mandatory (verify identity before a refund), a prompt instruction still fails some percentage of the time. A programmatic gate fails zero times.',
                 'Los prompts orientan; el código obliga. Cuando un orden de pasos es obligatorio (verificar la identidad antes de un reembolso), una instrucción en el prompt sigue fallando un porcentaje de veces. Una compuerta programática falla cero veces.'),
      objectives: [
        T('Choose programmatic enforcement over prompt guidance when compliance must be guaranteed.', 'Elegir enforcement programático frente a guía en el prompt cuando el cumplimiento debe estar garantizado.'),
        T('Decompose multi-concern requests and resolve them in one unified answer.', 'Descomponer peticiones con varios temas y resolverlas en una respuesta unificada.'),
        T('Write structured handoff summaries for humans who cannot see the transcript.', 'Escribir resúmenes de traspaso estructurados para personas que no ven la conversación.')
      ],
      blocks: [
        { type: 'compare',
          bad: { title: T('Prompt-based (probabilistic)', 'Basado en prompt (probabilístico)'), items: [
            T('"You MUST call get_customer before any refund."', '«DEBES llamar a get_customer antes de cualquier reembolso.»'),
            T('Few-shot examples showing the right order', 'Ejemplos few-shot con el orden correcto'),
            T('Works most of the time; fails silently sometimes', 'Funciona casi siempre; falla en silencio a veces')
          ] },
          good: { title: T('Programmatic (deterministic)', 'Programático (determinista)'), items: [
            T('A gate blocks `process_refund` until `get_customer` returned a verified ID', 'Una compuerta bloquea `process_refund` hasta que `get_customer` devolvió un ID verificado'),
            T('A hook rejects the call and tells the model why', 'Un hook rechaza la llamada y le dice al modelo por qué'),
            T('Guaranteed ordering for financial or identity steps', 'Orden garantizado para pasos financieros o de identidad')
          ] } },
        { type: 'code', lang: 'python', title: 'prerequisite gate (inside run_tool)', code: `
verified = {}   # session_id -> customer_id

def run_tool(session_id, name, args):
    if name == "get_customer":
        result = crm.get_customer(**args)
        if result.get("verified"):
            verified[session_id] = result["customer_id"]
        return result

    if name in ("lookup_order", "process_refund"):
        if session_id not in verified:
            return {"isError": True, "errorCategory": "validation",
                    "isRetryable": True,
                    "message": "Verify the customer with get_customer first."}
    return TOOLS[name](**args)` },
        { type: 'h', text: T('Multi-concern requests', 'Peticiones con varios temas') },
        { type: 'p', text: T('"My order arrived damaged **and** I was charged twice." Split into distinct items, investigate each (in parallel where possible) using shared context such as the verified customer ID, then synthesize **one** coherent resolution.',
                             '«Mi pedido llegó dañado **y** me cobraron dos veces.» Sepáralo en temas distintos, investiga cada uno (en paralelo cuando se pueda) usando el contexto compartido, como el ID de cliente verificado, y luego sintetiza **una** resolución coherente.') },
        { type: 'h', text: T('Structured handoff to humans', 'Traspaso estructurado a personas') },
        { type: 'p', text: T('The human agent usually **cannot see the conversation**. The escalation must carry everything needed to act without re-asking the customer.',
                             'El agente humano normalmente **no ve la conversación**. La escalación debe llevar todo lo necesario para actuar sin volver a preguntar al cliente.') },
        { type: 'code', lang: 'json', title: 'escalate_to_human payload', code: `
{
  "customer_id": "C-88213",
  "issue_summary": "Double charge on order #A-4471",
  "root_cause": "Payment retried after gateway timeout; both captures settled",
  "amount": 129.90,
  "actions_taken": ["verified identity", "confirmed two captures"],
  "recommended_action": "Refund duplicate capture of $129.90",
  "reason_for_escalation": "Refund exceeds agent limit ($100)"
}` },
        { type: 'trap', text: T('If the option says "make the system prompt say it is mandatory" and the stakes are financial, it is almost certainly the distractor. "Mandatory" in a prompt is still probabilistic.',
                                'Si la opción dice «que el system prompt diga que es obligatorio» y hay dinero en juego, casi seguro es el distractor. «Obligatorio» en un prompt sigue siendo probabilístico.') }
      ],
      quiz: [
        { q: T('An agent occasionally issues refunds before verifying identity (about 3% of cases). Leadership wants zero. Best change?',
               'Un agente de vez en cuando emite reembolsos antes de verificar la identidad (en torno al 3 % de los casos). La dirección quiere cero. ¿Mejor cambio?'),
          options: [
            opt('Block process_refund programmatically until get_customer returns a verified ID', 'Bloquear process_refund por código hasta que get_customer devuelva un ID verificado', true,
                'Only a programmatic gate guarantees zero.', 'Solo una compuerta programática garantiza cero.'),
            opt('Rewrite the system prompt in capitals: ALWAYS VERIFY IDENTITY FIRST', 'Reescribir el system prompt en mayúsculas: VERIFICA SIEMPRE LA IDENTIDAD PRIMERO', false, 'Still probabilistic.', 'Sigue siendo probabilístico.'),
            opt('Add ten few-shot examples that show verification before every refund', 'Añadir diez ejemplos few-shot que muestren la verificación antes de cada reembolso', false, 'Reduces, never eliminates, the failure rate.', 'Reduce la tasa de fallo, pero nunca la elimina.'),
            opt('Lower temperature to 0', 'Bajar la temperatura a 0', false, 'Does not guarantee ordering.', 'No garantiza el orden.')
          ] },
        { q: T('Escalated tickets keep bouncing back because human agents ask customers to repeat everything. What fixes it?',
               'Los tickets escalados vuelven una y otra vez porque los agentes humanos piden a los clientes que repitan todo. ¿Qué lo arregla?'),
          options: [
            opt('Include a structured handoff: customer ID, root cause, amounts, actions taken, recommended action', 'Incluir un traspaso estructurado: ID de cliente, causa raíz, importes, acciones realizadas y acción recomendada', true,
                'Humans lack the transcript; the summary must stand alone.', 'Las personas no tienen la conversación; el resumen debe valerse por sí mismo.'),
            opt('Escalate earlier, before investigating', 'Escalar antes, sin investigar', false, 'Produces even less context for the human.', 'Da aún menos contexto a la persona.'),
            opt('Forward the raw tool logs', 'Reenviar los logs crudos de las tools', false, 'Verbose and unstructured; humans need the conclusions.', 'Es extenso y no está estructurado; las personas necesitan las conclusiones.'),
            opt('Ask the customer to write a short summary of their issue that is forwarded to the human agent', 'Pedir al cliente que escriba un breve resumen de su problema que se reenvíe al agente humano', false, 'Pushes the work back onto the customer.', 'Devuelve el trabajo al cliente.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 1.5 */
    {
      id: '1.5', domain: 1, minutes: 14, docs: [DOCS.hooks, DOCS.sdk],
      summary: T('Hooks are code that runs at fixed points of the agent lifecycle. **PreToolUse** can block or redirect a call before it happens; **PostToolUse** can transform a result before the model sees it. Both are deterministic.',
                 'Los hooks son código que se ejecuta en puntos fijos del ciclo del agente. **PreToolUse** puede bloquear o redirigir una llamada antes de que ocurra; **PostToolUse** puede transformar un resultado antes de que lo vea el modelo. Ambos son deterministas.'),
      objectives: [
        T('Use interception hooks to block policy-violating calls and redirect to escalation.', 'Usar hooks de intercepción para bloquear llamadas que violan la política y redirigir a la escalación.'),
        T('Use PostToolUse to normalize heterogeneous formats from different MCP tools.', 'Usar PostToolUse para normalizar formatos heterogéneos de distintas tools MCP.'),
        T('Pick hooks over prompts when the business rule needs guaranteed compliance.', 'Elegir hooks antes que prompts cuando la regla de negocio exige cumplimiento garantizado.')
      ],
      blocks: [
        { type: 'code', lang: 'python', title: 'PreToolUse · block refunds over $500', code: `
from claude_agent_sdk import ClaudeAgentOptions, HookMatcher

async def refund_limit(input_data, tool_use_id, context):
    amount = input_data["tool_input"].get("amount", 0)
    if amount > 500:
        return {"hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason":
                "Refunds above $500 need a human. Call escalate_to_human "
                "with the case summary instead.",
        }}
    return {}

options = ClaudeAgentOptions(hooks={
    "PreToolUse": [HookMatcher(matcher="mcp__billing__process_refund",
                               hooks=[refund_limit])],
})`,
          caption: T('The deny reason goes back to the model, so it can take the alternative path (escalation) instead of retrying.', 'El motivo del rechazo vuelve al modelo, que puede tomar el camino alternativo (escalar) en lugar de reintentar.') },
        { type: 'h', text: T('PostToolUse: normalize before the model reasons', 'PostToolUse: normalizar antes de que el modelo razone') },
        { type: 'p', text: T('Different MCP servers return dates as Unix timestamps, ISO 8601 or "05/10/26", and statuses as `3` or `"SHIPPED"`. A PostToolUse hook converts everything to one format, so the model never has to guess and never mixes formats in its answer.',
                             'Distintos servidores MCP devuelven fechas como timestamps Unix, ISO 8601 o «05/10/26», y estados como `3` o `"SHIPPED"`. Un hook PostToolUse convierte todo a un formato único, así el modelo nunca tiene que adivinar ni mezcla formatos en su respuesta.') },
        { type: 'code', lang: 'python', title: 'PostToolUse · normalize dates and status codes', code: `
STATUS = {1: "pending", 2: "paid", 3: "shipped", 4: "refunded"}

async def normalize(input_data, tool_use_id, context):
    data = parse(input_data["tool_response"])
    if "created" in data:
        data["created"] = to_iso8601(data["created"])   # 1717171717 -> 2024-05-31
    if isinstance(data.get("status"), int):
        data["status"] = STATUS[data["status"]]
    return {"hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "updatedMCPToolOutput": data,
    }}` },
        { type: 'table', head: [T('Need', 'Necesidad'), T('Use', 'Usa')], rows: [
          [T('Rule must hold 100% (limits, identity, compliance)', 'La regla debe cumplirse al 100 % (límites, identidad, cumplimiento)'), T('Hook / programmatic gate', 'Hook / compuerta programática')],
          [T('Judgment, tone, when to escalate', 'Criterio, tono, cuándo escalar'), T('Prompt + few-shot examples', 'Prompt + ejemplos few-shot')],
          [T('Clean inconsistent tool data', 'Limpiar datos inconsistentes de tools'), T('PostToolUse hook', 'Hook PostToolUse')]
        ] },
        { type: 'trap', text: T('Hooks are not for teaching judgment. "Escalate when the customer seems frustrated" is a prompt/criteria problem, while "never refund above $500 without a human" is a hook.',
                                'Los hooks no sirven para enseñar criterio. «Escala cuando el cliente parezca frustrado» es un problema de prompt/criterios, mientras que «nunca reembolses más de 500 $ sin una persona» es un hook.') }
      ],
      quiz: [
        { q: T('Three MCP tools return order dates as Unix seconds, ISO strings and "DD/MM/YY". The agent sometimes compares them wrongly. Best fix?',
               'Tres tools MCP devuelven fechas de pedido como segundos Unix, cadenas ISO y «DD/MM/AA». El agente a veces las compara mal. ¿Mejor arreglo?'),
          options: [
            opt('A PostToolUse hook that normalizes all dates to ISO 8601 before the model sees them', 'Un hook PostToolUse que normalice todas las fechas a ISO 8601 antes de que el modelo las vea', true,
                'Deterministic normalization at the boundary removes the ambiguity.', 'La normalización determinista en la frontera elimina la ambigüedad.'),
            opt('Instruct the model in the system prompt to convert every date carefully before comparing', 'Indicar al modelo en el system prompt que convierta con cuidado cada fecha antes de comparar', false, 'Probabilistic and wasteful.', 'Es probabilístico y desperdicia esfuerzo.'),
            opt('Remove two of the three tools', 'Eliminar dos de las tres tools', false, 'Loses capability instead of fixing format.', 'Pierde capacidad en lugar de arreglar el formato.'),
            opt('Ask users to always state dates in ISO', 'Pedir a los usuarios que siempre escriban las fechas en ISO', false, 'The inconsistency is in tool outputs, not user input.', 'La inconsistencia está en las salidas de las tools, no en lo que escribe el usuario.')
          ] },
        { q: T('Policy: refunds over $500 always go to a human. What enforces this most reliably?', 'Política: los reembolsos de más de 500 $ siempre van a una persona. ¿Qué lo impone de forma más fiable?'),
          options: [
            opt('A PreToolUse hook that denies the call above $500 and points to escalate_to_human', 'Un hook PreToolUse que rechace la llamada por encima de 500 $ y apunte a escalate_to_human', true,
                'Interception guarantees the rule and redirects the workflow.', 'La intercepción garantiza la regla y redirige el flujo.'),
            opt('A system prompt rule with an example', 'Una regla en el system prompt con un ejemplo', false, 'Non-zero failure rate.', 'Tasa de fallo distinta de cero.'),
            opt('Sentiment analysis to detect risky cases', 'Análisis de sentimiento para detectar casos de riesgo', false, 'Sentiment is unrelated to amount.', 'El sentimiento no tiene relación con el importe.'),
            opt('Have the model self-report its confidence before each refund and block low scores', 'Que el modelo informe su confianza antes de cada reembolso y bloquear las puntuaciones bajas', false, 'Self-confidence is poorly calibrated.', 'La autoconfianza está mal calibrada.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 1.6 */
    {
      id: '1.6', domain: 1, minutes: 12, docs: [DOCS.sdk],
      summary: T('Predictable work → fixed prompt chain. Open-ended work → adaptive decomposition that plans the next subtasks from what was just discovered.',
                 'Trabajo predecible → cadena de prompts fija. Trabajo abierto → descomposición adaptativa que planifica las siguientes subtareas según lo que se acaba de descubrir.'),
      objectives: [
        T('Choose prompt chaining vs dynamic decomposition for a given workflow.', 'Elegir entre prompt chaining y descomposición dinámica según el flujo.'),
        T('Split large reviews into per-file passes plus a cross-file integration pass.', 'Dividir revisiones grandes en pasadas por archivo más una pasada de integración entre archivos.'),
        T('Decompose open-ended tasks: map, prioritize, adapt.', 'Descomponer tareas abiertas: mapear, priorizar y adaptar.')
      ],
      blocks: [
        { type: 'table', head: [T('Pattern', 'Patrón'), T('When', 'Cuándo'), T('Example', 'Ejemplo')], rows: [
          [T('Prompt chaining (fixed)', 'Prompt chaining (fijo)'), T('Steps are known in advance', 'Los pasos se conocen de antemano'), T('Review each file → integration pass → summary', 'Revisar cada archivo → pasada de integración → resumen')],
          [T('Dynamic decomposition', 'Descomposición dinámica'), T('Next step depends on findings', 'El siguiente paso depende de lo que se encuentre'), T('"Add tests to a legacy codebase"', '«Añadir tests a un codebase legado»')]
        ] },
        { type: 'h', text: T('Attention dilution and multi-pass review', 'Dilución de la atención y revisión multipasada') },
        { type: 'p', text: T('Reviewing 14 files in one pass gives deep comments on some, shallow ones on others, and even contradictory verdicts on identical code. Split into **per-file local passes** (consistent depth) plus **one integration pass** for cross-file data flow.',
                             'Revisar 14 archivos en una pasada produce comentarios profundos en unos, superficiales en otros e incluso veredictos contradictorios sobre código idéntico. Divídelo en **pasadas locales por archivo** (profundidad constante) más **una pasada de integración** para el flujo de datos entre archivos.') },
        { type: 'h', text: T('Open-ended tasks', 'Tareas abiertas') },
        { type: 'steps', items: [
          T('**Map** the structure first (entry points, modules, existing tests).', '**Mapea** primero la estructura (puntos de entrada, módulos, tests existentes).'),
          T('**Identify high-impact areas** (critical paths, untested code that changes often).', '**Identifica las zonas de mayor impacto** (rutas críticas, código sin tests que cambia a menudo).'),
          T('**Create a prioritized plan**, and let it **adapt** as dependencies are discovered.', '**Crea un plan priorizado** y deja que se **adapte** según descubras dependencias.')
        ] },
        { type: 'trap', text: T('"Use a model with a bigger context window to review all files at once" is a classic distractor: more context does not fix attention quality.',
                                '«Usa un modelo con una ventana de contexto mayor para revisar todos los archivos a la vez» es un distractor clásico: más contexto no arregla la calidad de la atención.') },
        { type: 'trap', text: T('"Run three passes and keep only issues found twice" suppresses real bugs that are caught intermittently. Consensus is not precision.',
                                '«Haz tres pasadas y quédate solo con lo que aparezca dos veces» suprime bugs reales que se detectan de forma intermitente. El consenso no es precisión.') }
      ],
      quiz: [
        { q: T('A 14-file PR review gives contradictory feedback on identical code in different files. Best restructuring?', 'La revisión de un PR de 14 archivos da feedback contradictorio sobre código idéntico en archivos distintos. ¿Mejor reestructuración?'),
          options: [
            opt('Per-file local passes plus a separate cross-file integration pass', 'Pasadas locales por archivo más una pasada separada de integración entre archivos', true, 'Addresses attention dilution directly.', 'Ataca directamente la dilución de la atención.'),
            opt('Force developers to submit PRs of 3–4 files', 'Obligar a los desarrolladores a enviar PRs de 3–4 archivos', false, 'Shifts burden without fixing the system.', 'Traslada la carga sin arreglar el sistema.'),
            opt('Use a larger-context model', 'Usar un modelo con más contexto', false, 'Context size is not attention quality.', 'El tamaño del contexto no equivale a calidad de la atención.'),
            opt('Run three full reviews and keep only the findings that most runs agree on', 'Hacer tres revisiones completas y quedarse solo con lo que coincida en la mayoría', false, 'Suppresses intermittently detected real bugs.', 'Suprime bugs reales que se detectan de forma intermitente.')
          ] },
        { q: T('"Add comprehensive tests to this legacy codebase." Which decomposition fits?', '«Añade tests completos a este codebase legado.» ¿Qué descomposición encaja?'),
          options: [
            opt('Map structure, find high-impact areas, build a prioritized plan that adapts as dependencies appear', 'Mapear la estructura, encontrar las zonas de mayor impacto y crear un plan priorizado que se adapte según aparezcan dependencias', true, 'Open-ended → adaptive decomposition.', 'Tarea abierta → descomposición adaptativa.'),
            opt('A fixed chain: one test file per source file, in alphabetical order, until all are covered', 'Una cadena fija: un archivo de test por archivo fuente, en orden alfabético, hasta cubrirlos todos', false, 'Ignores impact and discovered dependencies.', 'Ignora el impacto y las dependencias que se descubran.'),
            opt('Read every file upfront, then write all tests in one response', 'Leer todos los archivos al principio y escribir todos los tests en una respuesta', false, 'Wastes context and dilutes attention.', 'Desperdicia contexto y diluye la atención.'),
            opt('Generate tests only for files changed in the last commit', 'Generar tests solo para los archivos cambiados en el último commit', false, 'Not "comprehensive" and ignores priorities.', 'No es «completo» e ignora las prioridades.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 1.7 */
    {
      id: '1.7', domain: 1, minutes: 12, docs: [DOCS.sessions],
      summary: T('Resume when prior context is still valid; start fresh with a summary when tool results are stale; fork when you want to compare two approaches from the same baseline.',
                 'Reanuda cuando el contexto previo sigue siendo válido; empieza de cero con un resumen cuando los resultados de las tools están obsoletos; haz fork cuando quieras comparar dos enfoques desde la misma base.'),
      objectives: [
        T('Use `--resume <session-name>` to continue a named investigation.', 'Usar `--resume <session-name>` para continuar una investigación con nombre.'),
        T('Use `fork_session` to branch from a shared analysis.', 'Usar `fork_session` para ramificar desde un análisis compartido.'),
        T('Decide between resuming and a fresh session with an injected summary.', 'Decidir entre reanudar o empezar una sesión nueva con un resumen inyectado.')
      ],
      blocks: [
        { type: 'code', lang: 'bash', title: 'Claude Code CLI', code: `
# continue a named investigation tomorrow
claude --resume refund-flow-audit

# SDK: branch two strategies from the same baseline
# options = ClaudeAgentOptions(resume=session_id, fork_session=True)` },
        { type: 'table', head: [T('Situation', 'Situación'), T('Do', 'Haz')], rows: [
          [T('Same files, picking up where you left off', 'Mismos archivos, retomas donde lo dejaste'), T('Resume the named session', 'Reanuda la sesión con nombre')],
          [T('Files changed since; old tool results no longer match', 'Los archivos cambiaron; los resultados viejos ya no coinciden'), T('Fresh session + structured summary, or resume and **tell it exactly which files changed**', 'Sesión nueva + resumen estructurado, o reanuda y **dile exactamente qué archivos cambiaron**')],
          [T('Compare two refactoring or testing strategies', 'Comparar dos estrategias de refactorización o de tests'), T('fork_session from the shared analysis', 'fork_session desde el análisis compartido')]
        ] },
        { type: 'note', text: T('Stale tool results are dangerous because the model trusts them. A fresh session seeded with an accurate summary is more reliable than resuming with outdated reads.',
                                'Los resultados de tools obsoletos son peligrosos porque el modelo confía en ellos. Una sesión nueva con un resumen preciso es más fiable que reanudar con lecturas desactualizadas.') },
        { type: 'p', text: T('When you do resume after edits, name the changed files ("auth/session.py and auth/tokens.py were refactored; re-read them") so the agent re-analyzes those targets instead of re-exploring everything.',
                             'Si reanudas después de editar, nombra los archivos cambiados («se refactorizaron auth/session.py y auth/tokens.py; vuelve a leerlos») para que el agente reanalice esos archivos en lugar de explorar todo de nuevo.') },
        { type: 'trap', text: T('Forking is for **divergent exploration**, not for "saving progress". Resuming is for **continuation**. Do not confuse them in options.',
                                'El fork sirve para **explorar en paralelo**, no para «guardar el progreso». Reanudar sirve para **continuar**. No los confundas en las opciones.') }
      ],
      quiz: [
        { q: T('After a day of refactoring, you resume yesterday\'s analysis session and the agent cites functions that no longer exist. Best approach?',
               'Tras un día refactorizando, reanudas la sesión de análisis de ayer y el agente cita funciones que ya no existen. ¿Mejor enfoque?'),
          options: [
            opt('Start a new session with a structured summary, or tell the resumed session which files changed', 'Empezar una sesión nueva con un resumen estructurado, o decirle a la sesión reanudada qué archivos cambiaron', true, 'Prior tool results are stale; inject accurate state.', 'Los resultados anteriores están obsoletos; inyecta el estado real.'),
            opt('Keep resuming the same session and ask it to be careful about outdated function names', 'Seguir reanudando la misma sesión y pedirle que tenga cuidado con los nombres de funciones obsoletos', false, 'It will keep trusting stale reads.', 'Seguirá confiando en lecturas obsoletas.'),
            opt('Fork the session to fix the staleness', 'Hacer fork de la sesión para arreglar lo obsoleto', false, 'A fork inherits the same stale context.', 'Un fork hereda el mismo contexto obsoleto.'),
            opt('Run /compact on the resumed session so it forgets the old tool results', 'Ejecutar /compact en la sesión reanudada para que olvide los resultados viejos de las tools', false, 'Compaction summarizes; it may keep stale facts.', 'Compactar resume, pero puede conservar datos obsoletos.')
          ] },
        { q: T('You want to compare two testing strategies starting from the same codebase analysis. What should you use?', 'Quieres comparar dos estrategias de tests partiendo del mismo análisis del codebase. ¿Qué deberías usar?'),
          options: [
            opt('fork_session to create two independent branches', 'fork_session para crear dos ramas independientes', true, 'Forking branches from a shared baseline.', 'El fork ramifica desde una base compartida.'),
            opt('--resume the same session twice in sequence', '--resume de la misma sesión dos veces seguidas', false, 'The second run would see the first strategy\'s work.', 'La segunda ejecución vería el trabajo de la primera estrategia.'),
            opt('Two brand-new sessions with no context', 'Dos sesiones nuevas sin contexto', false, 'Loses the shared analysis.', 'Pierde el análisis compartido.'),
            opt('One session that alternates strategies each turn', 'Una sesión que alterne estrategias en cada turno', false, 'Contaminates both strategies.', 'Contamina ambas estrategias.')
          ] }
      ]
    }
  ]);
})();
