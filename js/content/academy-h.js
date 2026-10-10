/* Ruta «desde cero» · Parte G — Agentes (M24–M26) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    sdk: { label: 'Agent SDK overview', url: 'https://code.claude.com/docs/en/agent-sdk/overview' },
    effective: { label: 'Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
    context: { label: 'Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' },
    subagents: { label: 'Skilljar · Introduction to subagents', url: 'https://anthropic.skilljar.com/introduction-to-subagents' },
    managed: { label: 'Managed Agents overview', url: 'https://platform.claude.com/docs/en/managed-agents/overview' },
    guide: { label: 'CCAR-F exam guide', url: 'https://anthropic.skilljar.com/' }
  };

  CAF.addLessons([
    {
      id: 'a24', track: 'academy', domain: 0, minutes: 15, art: 'mascot', scene: 1, exam: ['1.1', '1.3', '1.5'],
      title: T('The harness and the Agent SDK', 'El harness y el Agent SDK'),
      summary: T('A model alone only produces text. A harness is everything around it that turns text into action: the loop, the tools, context management, permissions, hooks and session state. The Agent SDK gives you Claude Code\'s harness as a Python or TypeScript library.',
                 'Un modelo por sí solo solo produce texto. Un harness es todo lo que lo rodea y convierte ese texto en acción: el bucle, las tools, la gestión del contexto, los permisos, los hooks y el estado de la sesión. El Agent SDK te da el harness de Claude Code como biblioteca de Python o TypeScript.'),
      objectives: [
        T('Name the parts of an agent harness and what each one does.', 'Nombrar las partes de un harness de agente y qué hace cada una.'),
        T('Read the agentic loop through stop_reason.', 'Leer el bucle agéntico a través de stop_reason.'),
        T('Configure an SDK agent: tools, permissions, subagents, hooks and MCP.', 'Configurar un agente del SDK: tools, permisos, subagentes, hooks y MCP.')
      ],
      docs: [D.sdk, D.subagents, D.managed],
      blocks: [
        { type: 'terms', items: [
          { term: 'Loop', en: 'Send the conversation, read stop_reason, run requested tools, append results, repeat until end_turn.', es: 'Enviar la conversación, leer stop_reason, ejecutar las tools pedidas, añadir los resultados y repetir hasta end_turn.' },
          { term: 'Tools', en: 'Built-in (files, shell, search) plus your own functions and MCP servers.', es: 'Integradas (archivos, shell, búsqueda) más tus propias funciones y servidores MCP.' },
          { term: 'Context', en: 'Compaction, subagents and memory files keep the window focused.', es: 'La compactación, los subagentes y los archivos de memoria mantienen enfocada la ventana.' },
          { term: 'Permissions', en: 'Allowed tools, permission modes and a canUseTool callback decide what may run.', es: 'Las tools permitidas, los modos de permisos y un callback canUseTool deciden qué puede ejecutarse.' },
          { term: 'Hooks', en: 'Code that runs at lifecycle points to enforce rules deterministically.', es: 'Código que se ejecuta en puntos del ciclo de vida para imponer reglas de forma determinista.' },
          { term: 'Sessions', en: 'Resume or fork a conversation by session id.', es: 'Reanudar o bifurcar una conversación por su session id.' }
        ] },
        { type: 'code', lang: 'python', title: 'agent.py', code: `
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

options = ClaudeAgentOptions(
    allowed_tools=["Read", "Grep", "Glob", "Agent"],
    permission_mode="default",
    agents={
        "reviewer": AgentDefinition(
            description="Reviews code for security issues.",
            prompt="You are a security reviewer. Report findings with file and line.",
            tools=["Read", "Grep"],
        )
    },
)

async for message in query(prompt="Audit src/auth for injection risks", options=options):
    print(message)` },
        { type: 'compare',
          bad: { title: T('Client SDK + tool runner', 'Client SDK + tool runner'), items: [
            T('You own the loop and write every tool', 'Tú controlas el bucle y escribes cada tool'),
            T('Maximum control, more code to maintain', 'Máximo control, más código que mantener')
          ] },
          good: { title: T('Agent SDK', 'Agent SDK'), items: [
            T('Claude Code\'s loop, tools and context handling', 'El bucle, las tools y la gestión de contexto de Claude Code'),
            T('Embedded in your app with a few options', 'Integrado en tu app con unas pocas opciones')
          ] } },
        { type: 'list', items: [
          T('**Subagents** run with their own fresh context. They receive only what the coordinator passes in their prompt; they do not inherit the parent\'s history.', '**Los subagentes** se ejecutan con su propio contexto nuevo. Reciben solo lo que el coordinador les pasa en el prompt; no heredan el historial del padre.'),
          T('**The Agent tool** must be in allowed tools for the coordinator to spawn subagents.', '**La tool Agent** debe estar en las tools permitidas para que el coordinador pueda lanzar subagentes.'),
          T('**Managed Agents** move the harness to Anthropic\'s infrastructure: you define an agent and an environment, open a session and stream events.', '**Managed Agents** llevan el harness a la infraestructura de Anthropic: defines un agente y un entorno, abres una sesión y recibes eventos en streaming.')
        ] },
        { type: 'trap', text: T('Stopping the loop by parsing the model\'s text ("I\'m done") or by an arbitrary iteration cap as the main mechanism is wrong. stop_reason drives the loop; caps are only a safety net.', 'Detener el bucle analizando el texto del modelo («he terminado») o con un límite arbitrario de iteraciones como mecanismo principal es incorrecto. stop_reason dirige el bucle; los límites solo son una red de seguridad.') }
      ],
      quiz: [
        { q: T('A subagent produces a poor report because it lacked facts the coordinator had found earlier. What is the root cause?', 'Un subagente entrega un informe pobre porque le faltaban datos que el coordinador había encontrado antes. ¿Cuál es la causa raíz?'),
          options: [
            opt('The coordinator did not pass those facts in the subagent prompt', 'El coordinador no pasó esos datos en el prompt del subagente', true, 'Subagents only see what they are given.', 'Los subagentes solo ven lo que se les entrega.'),
            opt('The subagent model is too small to remember shared history', 'El modelo del subagente es demasiado pequeño para recordar el historial', false, 'There is no shared history to remember.', 'No hay historial compartido que recordar.'),
            opt('The subagent needs a higher max_tokens to read the parent', 'El subagente necesita más max_tokens para leer al padre', false, 'Output limits do not grant access.', 'Los límites de salida no dan acceso.'),
            opt('Subagents should be replaced by one long single-agent loop', 'Los subagentes deberían sustituirse por un solo bucle largo', false, 'Overcorrects; fix the handoff.', 'Exagera; hay que arreglar el traspaso.')
          ] },
        { q: T('Which signal should decide whether the agent loop continues?', '¿Qué señal debe decidir si el bucle del agente continúa?'),
          options: [
            opt('stop_reason: continue on tool_use, finish on end_turn', 'stop_reason: seguir con tool_use, terminar con end_turn', true, 'The structured signal from the API.', 'La señal estructurada de la API.'),
            opt('Whether the reply text contains a phrase such as "done"', 'Si el texto de la respuesta contiene una frase como «listo»', false, 'Text parsing is fragile.', 'Analizar texto es frágil.'),
            opt('A fixed count of five iterations for every kind of task', 'Un número fijo de cinco iteraciones para cualquier tarea', false, 'Arbitrary; cuts tasks short.', 'Arbitrario; corta las tareas.'),
            opt('Whether the response took longer than ten seconds', 'Si la respuesta tardó más de diez segundos', false, 'Latency says nothing about completion.', 'La latencia no indica si terminó.')
          ] }
      ]
    },

    {
      id: 'a25', track: 'academy', domain: 0, minutes: 15, art: 'mascot', scene: 1, exam: ['1.2', '1.4', '1.6'],
      title: T('Agentic patterns: workflows and agents', 'Patrones agénticos: workflows y agentes'),
      summary: T('Not every problem needs an autonomous agent. Workflows follow paths you define in code; agents decide their own steps. Start with the simplest pattern that works and add autonomy only when the task needs it.',
                 'No todo problema necesita un agente autónomo. Los workflows siguen caminos que defines en código; los agentes deciden sus propios pasos. Empieza con el patrón más simple que funcione y añade autonomía solo cuando la tarea lo exija.'),
      objectives: [
        T('Tell workflows and agents apart.', 'Distinguir workflows de agentes.'),
        T('Recognize the five common workflow patterns.', 'Reconocer los cinco patrones de workflow habituales.'),
        T('Design a coordinator with subagents and decide what runs in parallel.', 'Diseñar un coordinador con subagentes y decidir qué se ejecuta en paralelo.')
      ],
      docs: [D.effective, D.subagents],
      blocks: [
        { type: 'table', head: [T('Pattern', 'Patrón'), T('How it works', 'Cómo funciona'), T('Use when', 'Úsalo cuando')], rows: [
          [T('Prompt chaining', 'Encadenamiento de prompts'), T('Fixed sequence; each step feeds the next, with checks between', 'Secuencia fija; cada paso alimenta al siguiente, con comprobaciones entre medias'), T('The task splits into known stages', 'La tarea se divide en etapas conocidas')],
          [T('Routing', 'Enrutamiento'), T('Classify the input, send it to a specialized path', 'Clasificar la entrada y enviarla a un camino especializado'), T('Inputs fall into distinct categories', 'Las entradas caen en categorías distintas')],
          [T('Parallelization', 'Paralelización'), T('Independent subtasks at once, or several votes on one task', 'Subtareas independientes a la vez, o varios votos sobre una tarea'), T('Speed or confidence matters', 'Importan la velocidad o la confianza')],
          [T('Orchestrator–workers', 'Orquestador–trabajadores'), T('A coordinator splits work dynamically and merges results', 'Un coordinador divide el trabajo dinámicamente y combina resultados'), T('Subtasks are not known in advance', 'Las subtareas no se conocen de antemano')],
          [T('Evaluator–optimizer', 'Evaluador–optimizador'), T('One generates, another critiques, loop until criteria pass', 'Uno genera, otro critica, y se repite hasta cumplir criterios'), T('Clear quality criteria exist', 'Existen criterios de calidad claros')]
        ] },
        { type: 'steps', items: [
          T('**Decompose**: the coordinator breaks the goal into subtasks and checks the split covers the whole scope.', '**Descompón**: el coordinador divide el objetivo en subtareas y comprueba que la división cubre todo el alcance.'),
          T('**Delegate with context**: each subagent gets the facts, constraints and output format it needs.', '**Delega con contexto**: cada subagente recibe los datos, restricciones y formato de salida que necesita.'),
          T('**Parallelize the independent**: emit several subagent calls in one turn when they do not depend on each other.', '**Paraleliza lo independiente**: emite varias llamadas a subagentes en un mismo turno cuando no dependen entre sí.'),
          T('**Merge and verify**: reconcile results, keep sources, and send gaps back for another round.', '**Combina y verifica**: concilia los resultados, conserva las fuentes y devuelve los huecos para otra ronda.')
        ] },
        { type: 'example', situation: T('A research system reports only on two of five requested regions. The subagents did their jobs well.', 'Un sistema de investigación informa solo de dos de las cinco regiones pedidas. Los subagentes hicieron bien su trabajo.'),
          answer: T('The coordinator\'s decomposition was too narrow. Fix the split, not the workers.', 'La descomposición del coordinador fue demasiado estrecha. Corrige la división, no a los trabajadores.') },
        { type: 'note', text: T('All communication should flow through the coordinator. It sees the whole picture, handles errors consistently and keeps the system observable.', 'Toda la comunicación debe pasar por el coordinador. Ve el panorama completo, gestiona los errores de forma coherente y mantiene el sistema observable.') },
        { type: 'trap', text: T('When a business rule must always hold (for example, verify identity before a refund), a prompt instruction is not enough. Enforce it in code: a prerequisite gate or a hook.', 'Cuando una regla de negocio debe cumplirse siempre (por ejemplo, verificar la identidad antes de un reembolso), una instrucción en el prompt no basta. Impónla en código: una compuerta de prerrequisitos o un hook.') }
      ],
      quiz: [
        { q: T('Support tickets are billing, technical or account questions, each handled best by a different prompt. Which pattern fits?', 'Los tickets de soporte son de facturación, técnicos o de cuenta, y cada tipo se resuelve mejor con un prompt distinto. ¿Qué patrón encaja?'),
          options: [
            opt('Routing: classify each ticket, then send it to its path', 'Enrutamiento: clasificar cada ticket y enviarlo a su camino', true, 'Distinct categories with specialized handling.', 'Categorías distintas con tratamiento especializado.'),
            opt('Evaluator–optimizer: rewrite each reply until it is perfect', 'Evaluador–optimizador: reescribir cada respuesta hasta que sea perfecta', false, 'Refines quality; does not split by type.', 'Refina la calidad; no divide por tipo.'),
            opt('A fully autonomous agent with every tool for every ticket', 'Un agente totalmente autónomo con todas las tools para todo', false, 'More autonomy than the task needs.', 'Más autonomía de la que hace falta.'),
            opt('Prompt chaining through all three prompts for each ticket', 'Encadenar los tres prompts para cada ticket', false, 'Runs irrelevant stages.', 'Ejecuta etapas irrelevantes.')
          ] },
        { q: T('Three subagents must analyze independent documents. How should the coordinator call them?', 'Tres subagentes deben analizar documentos independientes. ¿Cómo debe llamarlos el coordinador?'),
          options: [
            opt('All three calls in a single turn so they run in parallel', 'Las tres llamadas en un mismo turno para que corran en paralelo', true, 'Independent work runs concurrently.', 'El trabajo independiente se ejecuta a la vez.'),
            opt('One per turn, waiting for each before starting the next', 'Una por turno, esperando a cada una antes de la siguiente', false, 'Needlessly sequential.', 'Secuencial sin necesidad.'),
            opt('Have the subagents message each other to share the load', 'Hacer que los subagentes se escriban entre sí para repartirse', false, 'Bypasses the coordinator.', 'Se salta al coordinador.'),
            opt('Merge all documents into one prompt for a single subagent', 'Unir todos los documentos en un prompt para un solo subagente', false, 'Loses isolation and focus.', 'Pierde aislamiento y foco.')
          ] }
      ]
    },

    {
      id: 'a26', track: 'academy', domain: 0, minutes: 14, art: 'mascot', scene: 5, exam: ['5.2', '5.3', '5.6', '0'],
      title: T('Reliable agents in production, and the bridge to the exam', 'Agentes fiables en producción, y el puente al examen'),
      summary: T('Production agents fail in predictable ways: lost context, silent errors, unverified claims and decisions that needed a human. This module gathers the habits that prevent them and maps everything you learned to the five exam domains.',
                 'Los agentes en producción fallan de formas previsibles: contexto perdido, errores silenciosos, afirmaciones sin verificar y decisiones que necesitaban a una persona. Este módulo reúne los hábitos que lo evitan y conecta todo lo aprendido con los cinco dominios del examen.'),
      objectives: [
        T('Propagate errors with enough structure to recover.', 'Propagar errores con estructura suficiente para recuperarse.'),
        T('Decide when to escalate to a human.', 'Decidir cuándo escalar a una persona.'),
        T('Map the academy to the five exam domains.', 'Relacionar la academia con los cinco dominios del examen.')
      ],
      docs: [D.context, D.guide],
      blocks: [
        { type: 'list', items: [
          T('**Structured errors**: return the error type, whether it is retryable and what was attempted. Distinguish "no results found" from "the search failed".', '**Errores estructurados**: devuelve el tipo de error, si se puede reintentar y qué se intentó. Distingue «no se encontraron resultados» de «la búsqueda falló».'),
          T('**Escalation**: escalate when the customer asks for a human, when policy is unclear or when the agent cannot make progress, not on the basis of sentiment or self-rated confidence.', '**Escalado**: escala cuando el cliente pide una persona, cuando la política no es clara o cuando el agente no puede avanzar, no según el sentimiento o la confianza autoevaluada.'),
          T('**Persistent facts**: keep key facts (amounts, IDs, dates) in a structured block outside summarized history.', '**Hechos persistentes**: guarda los datos clave (importes, IDs, fechas) en un bloque estructurado fuera del historial resumido.'),
          T('**Provenance**: keep claim-to-source mappings through every step so the final answer can be audited.', '**Procedencia**: conserva el vínculo entre cada afirmación y su fuente en todos los pasos para poder auditar la respuesta final.'),
          T('**Human review**: route low-confidence or high-impact items to people, and measure accuracy per category rather than only overall.', '**Revisión humana**: deriva a personas los elementos de baja confianza o alto impacto, y mide la precisión por categoría, no solo en global.')
        ] },
        { type: 'table', head: [T('Exam domain', 'Dominio del examen'), T('Weight', 'Peso'), T('Academy modules', 'Módulos de la academia')], rows: [
          [T('1 · Agentic architecture & orchestration', '1 · Arquitectura agéntica y orquestación'), T('27%', '27%'), T('M15, M18, M24, M25', 'M15, M18, M24, M25')],
          [T('2 · Tool design & MCP integration', '2 · Diseño de tools e integración MCP'), T('18%', '18%'), T('M09, M15, M19, M20', 'M09, M15, M19, M20')],
          [T('3 · Claude Code configuration & workflows', '3 · Configuración y flujos de Claude Code'), T('20%', '20%'), T('M10, M21, M22, M23', 'M10, M21, M22, M23')],
          [T('4 · Prompt engineering & structured output', '4 · Ingeniería de prompts y salida estructurada'), T('20%', '20%'), T('M02, M03, M12, M13, M16', 'M02, M03, M12, M13, M16')],
          [T('5 · Context management & reliability', '5 · Gestión de contexto y fiabilidad'), T('15%', '15%'), T('M03, M17, M23, M26', 'M03, M17, M23, M26')]
        ] },
        { type: 'note', text: T('The exam rewards one instinct above all: prefer deterministic mechanisms (code, hooks, schemas, gates) for rules that must hold, and use prompts for judgment. Keep that in mind on every scenario.', 'El examen premia un instinto por encima de todo: preferir mecanismos deterministas (código, hooks, schemas, compuertas) para las reglas que deben cumplirse, y usar prompts para el criterio. Tenlo presente en cada escenario.') },
        { type: 'steps', items: [
          T('**Next**: the exam route starts with the exam format lesson, then 30 task statements.', '**Siguiente**: la ruta del examen empieza con la lección sobre el formato y luego 30 task statements.'),
          T('**Practice**: flashcards and labs in your language mode, then switch to EN as you gain confidence.', '**Practica**: flashcards y labs en tu modo de idioma, y pasa a EN cuando ganes confianza.'),
          T('**Simulate**: take mock exams in English and aim for 800+ before booking.', '**Simula**: haz simulacros en inglés y apunta a 800+ antes de reservar.')
        ] },
        { type: 'trap', text: T('Escalating because the customer sounds upset, or because the model rates its own confidence low, is the classic wrong answer. Escalation follows explicit triggers.', 'Escalar porque el cliente suena molesto, o porque el modelo califica baja su propia confianza, es la respuesta incorrecta clásica. El escalado sigue disparadores explícitos.') }
      ],
      quiz: [
        { q: T('A search tool fails with a timeout, but the agent tells the user "there are no matching orders". What went wrong?', 'Una tool de búsqueda falla por timeout, pero el agente le dice al usuario «no hay pedidos coincidentes». ¿Qué falló?'),
          options: [
            opt('The failure was reported like an empty result, hiding the error', 'El fallo se devolvió como un resultado vacío y ocultó el error', true, 'Access failures must be distinct from empty results.', 'Los fallos de acceso deben distinguirse de los resultados vacíos.'),
            opt('The model should have guessed the orders from earlier context', 'El modelo debió adivinar los pedidos a partir del contexto previo', false, 'Guessing invents data.', 'Adivinar inventa datos.'),
            opt('The agent should escalate every request to a human by default', 'El agente debería escalar por defecto toda petición a una persona', false, 'Overcorrection.', 'Corrección excesiva.'),
            opt('The timeout should be raised so that errors never happen', 'Debería subirse el timeout para que nunca haya errores', false, 'Errors still happen; report them.', 'Los errores seguirán ocurriendo; hay que informarlos.')
          ] },
        { q: T('Which situation is a valid trigger for escalating to a human agent?', '¿Qué situación es un disparador válido para escalar a un agente humano?'),
          options: [
            opt('The customer explicitly asks to speak with a person', 'El cliente pide explícitamente hablar con una persona', true, 'An explicit request is honored.', 'Una petición explícita se respeta.'),
            opt('The customer\'s tone sounds slightly frustrated', 'El tono del cliente suena algo frustrado', false, 'Sentiment alone is not a trigger.', 'El sentimiento por sí solo no es disparador.'),
            opt('The model rates its own confidence at six out of ten', 'El modelo califica su propia confianza con seis sobre diez', false, 'Self-rated confidence is unreliable.', 'La confianza autoevaluada no es fiable.'),
            opt('The conversation has gone past three messages', 'La conversación ha superado los tres mensajes', false, 'Length is not a trigger.', 'La longitud no es disparador.')
          ] }
      ]
    }
  ]);
})();
