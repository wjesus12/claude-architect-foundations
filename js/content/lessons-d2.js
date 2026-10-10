/* Dominio 2 — Tool Design & MCP Integration (18 %) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const DOCS = {
    tooldef: { label: 'Define tools · Claude API docs', url: 'https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use' },
    mcp: { label: 'Model Context Protocol · spec', url: 'https://modelcontextprotocol.io/' },
    ccmcp: { label: 'MCP in Claude Code', url: 'https://docs.claude.com/en/docs/claude-code/mcp' },
    tools: { label: 'Claude Code tools reference', url: 'https://docs.claude.com/en/docs/claude-code/settings#tools-available-to-claude' }
  };

  CAF.addLessons([
    /* ---------------------------------------------------------- 2.1 */
    {
      id: '2.1', domain: 2, minutes: 13, docs: [DOCS.tooldef],
      summary: T('The description is the main signal Claude uses to pick a tool. Minimal or overlapping descriptions cause misrouting; the fix is to say what the tool does, what it accepts, when to use it, and when to use the other one instead.',
                 'La descripción es la señal principal que usa Claude para elegir una tool. Las descripciones mínimas o solapadas causan mal enrutado; el arreglo es decir qué hace la tool, qué acepta, cuándo usarla y cuándo usar la otra en su lugar.'),
      objectives: [
        T('Write descriptions with input formats, example queries, edge cases and boundaries.', 'Escribir descripciones con formatos de entrada, consultas de ejemplo, casos límite y fronteras.'),
        T('Rename or split tools to remove functional overlap.', 'Renombrar o dividir tools para eliminar solapamientos.'),
        T('Spot system-prompt keywords that override good descriptions.', 'Detectar palabras clave del system prompt que anulan buenas descripciones.')
      ],
      blocks: [
        { type: 'compare',
          bad: { title: T('Minimal (misroutes)', 'Mínima (enruta mal)'), items: [
            T('`get_customer`: "Retrieves customer information"', '`get_customer`: «Retrieves customer information»'),
            T('`lookup_order`: "Retrieves order details"', '`lookup_order`: «Retrieves order details»'),
            T('Both accept "an identifier", so the model guesses', 'Ambas aceptan «un identificador», así que el modelo adivina')
          ] },
          good: { title: T('Differentiated', 'Diferenciada'), items: [
            T('States the input format (`#12345` order vs email/phone)', 'Indica el formato de entrada (pedido `#12345` vs email/teléfono)'),
            T('Gives example queries ("where is my order #…")', 'Da consultas de ejemplo («dónde está mi pedido #…»)'),
            T('Says when to use the **other** tool instead', 'Dice cuándo usar la **otra** tool en su lugar')
          ] } },
        { type: 'code', lang: 'json', title: 'tools[] · a description that routes correctly', code: `
{
  "name": "lookup_order",
  "description": "Fetch ONE order by its order number. Use when the user mentions an order number (format: '#' followed by 5-6 digits, e.g. #12345) or asks about shipping, delivery, items or order status. Do NOT use to identify a customer: use get_customer for names, emails or phone numbers. Returns status, items, totals and tracking. Returns found=false (not an error) when the number does not exist.",
  "input_schema": {
    "type": "object",
    "properties": {
      "order_number": { "type": "string", "pattern": "^#?\\\\d{5,6}$" }
    },
    "required": ["order_number"]
  }
}` },
        { type: 'h', text: T('Remove overlap: rename or split', 'Elimina el solapamiento: renombra o divide') },
        { type: 'list', items: [
          T('**Rename** near-duplicates: `analyze_content` vs `analyze_document` → `extract_web_results` (web-specific description) vs `analyze_document`.', '**Renombra** casi duplicados: `analyze_content` vs `analyze_document` → `extract_web_results` (descripción específica para web) vs `analyze_document`.'),
          T('**Split** a generic tool into purpose-specific ones with clear contracts: `analyze_document` → `extract_data_points`, `summarize_content`, `verify_claim_against_source`.', '**Divide** una tool genérica en tools con propósito y contrato claros: `analyze_document` → `extract_data_points`, `summarize_content`, `verify_claim_against_source`.')
        ] },
        { type: 'h', text: T('The system prompt can sabotage routing', 'El system prompt puede sabotear el enrutado') },
        { type: 'p', text: T('An instruction like "whenever the user says *find*, search the knowledge base" creates a keyword association that overrides an excellent `lookup_order` description ("find my order #12345"). Review system prompts for keyword-sensitive instructions.',
                             'Una instrucción como «cuando el usuario diga *find*, busca en la base de conocimiento» crea una asociación por palabra clave que anula una excelente descripción de `lookup_order` («find my order #12345»). Revisa los system prompts en busca de instrucciones sensibles a palabras clave.') },
        { type: 'trap', text: T('For misrouting between two tools with minimal descriptions, the **first step** is better descriptions. Few-shot examples add tokens without fixing the cause; a keyword router bypasses the model\'s understanding; consolidating tools is valid but more effort than a first step.',
                                'Ante un mal enrutado entre dos tools con descripciones mínimas, el **primer paso** es mejorar las descripciones. Los ejemplos few-shot añaden tokens sin arreglar la causa; un router por palabras clave se salta la comprensión del modelo; consolidar tools es válido, pero cuesta más que un primer paso.') }
      ],
      quiz: [
        { q: T('Logs show the agent calls `get_customer` for "check my order #12345". Both tools have one-line descriptions. Most effective first step?',
               'Los logs muestran que el agente llama a `get_customer` para «check my order #12345». Ambas tools tienen descripciones de una línea. ¿Primer paso más eficaz?'),
          options: [
            opt('Expand both descriptions with input formats, example queries, edge cases and when to use each', 'Ampliar ambas descripciones con formatos de entrada, consultas de ejemplo, casos límite y cuándo usar cada una', true, 'Descriptions are the primary selection signal; this fixes the root cause cheaply.', 'Las descripciones son la señal principal de selección; esto arregla la causa raíz con poco esfuerzo.'),
            opt('Add 5–8 few-shot examples to the system prompt showing order queries routed to lookup_order', 'Añadir 5–8 ejemplos few-shot al system prompt con consultas de pedidos enviadas a lookup_order', false, 'Token overhead without fixing the descriptions.', 'Añade tokens sin arreglar las descripciones.'),
            opt('Build a keyword-based routing layer', 'Construir una capa de enrutado por palabras clave', false, 'Over-engineered; bypasses language understanding.', 'Es sobreingeniería; se salta la comprensión del lenguaje.'),
            opt('Merge both into one lookup_entity tool', 'Fusionar ambas en una tool lookup_entity', false, 'Valid architecture, but more effort than a first step.', 'Es una arquitectura válida, pero cuesta más que un primer paso.')
          ] },
        { q: T('Descriptions are now excellent, yet "find my order" still goes to the knowledge-base search. What should you check?', 'Las descripciones ya son excelentes, pero «find my order» sigue yendo a la búsqueda en la base de conocimiento. ¿Qué deberías revisar?'),
          options: [
            opt('The system prompt for keyword-sensitive instructions such as "when users say find, search the KB"', 'El system prompt en busca de instrucciones sensibles a palabras clave como «cuando digan find, busca en la KB»', true, 'Keyword instructions can override well-written descriptions.', 'Las instrucciones por palabra clave pueden anular descripciones bien escritas.'),
            opt('The model temperature', 'La temperatura del modelo', false, 'Not a routing root cause.', 'No es la causa raíz del enrutado.'),
            opt('The max_tokens value', 'El valor de max_tokens', false, 'Unrelated to tool choice.', 'No tiene relación con la elección de tool.'),
            opt('Whether the knowledge-base tool exposes more parameters than lookup_order, which makes the model prefer it', 'Si la tool de la base de conocimiento expone más parámetros que lookup_order, lo que hace que el modelo la prefiera', false, 'Parameter count does not drive selection here.', 'El número de parámetros no decide la selección aquí.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 2.2 */
    {
      id: '2.2', domain: 2, minutes: 13, docs: [DOCS.mcp],
      summary: T('When a tool fails, tell the agent **what kind** of failure it was and whether retrying makes sense. "Operation failed" leaves it guessing; structured metadata lets it retry, explain, or escalate correctly.',
                 'Cuando una tool falla, dile al agente **qué tipo** de fallo fue y si tiene sentido reintentar. «Operation failed» lo deja adivinando; los metadatos estructurados le permiten reintentar, explicar o escalar correctamente.'),
      objectives: [
        T('Use the MCP `isError` flag with structured metadata (errorCategory, isRetryable, message).', 'Usar el indicador `isError` de MCP con metadatos estructurados (errorCategory, isRetryable, message).'),
        T('Distinguish transient, validation, business and permission errors.', 'Distinguir errores transitorios, de validación, de negocio y de permisos.'),
        T('Separate access failures from valid empty results.', 'Separar los fallos de acceso de los resultados vacíos válidos.')
      ],
      blocks: [
        { type: 'table', head: [T('Category', 'Categoría'), T('Example', 'Ejemplo'), T('Retry?', '¿Reintentar?'), T('Agent should…', 'El agente debe…')], rows: [
          [T('transient', 'transitorio'), T('timeout, 503', 'timeout, 503'), T('yes', 'sí'), T('retry (with backoff) or try later', 'reintentar (con espera) o probar más tarde')],
          [T('validation', 'validación'), T('bad order number format', 'formato de pedido incorrecto'), T('after fixing input', 'tras corregir la entrada'), T('fix the input or ask the user', 'corregir la entrada o preguntar al usuario')],
          [T('business', 'negocio'), T('refund window expired', 'plazo de reembolso vencido'), T('no', 'no'), T('explain the policy kindly / escalate', 'explicar la política con amabilidad / escalar')],
          [T('permission', 'permiso'), T('no access to account', 'sin acceso a la cuenta'), T('no', 'no'), T('stop, escalate or request access', 'parar, escalar o pedir acceso')]
        ] },
        { type: 'code', lang: 'json', title: 'MCP CallToolResult · business error', code: `
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\\"errorCategory\\": \\"business\\", \\"isRetryable\\": false, \\"message\\": \\"Order #48121 is outside the 30-day refund window (delivered 2026-08-02).\\", \\"customerMessage\\": \\"This order is past our 30-day return period, but I can check other options for you.\\"}"
  }]
}`,
          caption: T('`isRetryable: false` prevents wasted retries; `customerMessage` lets the agent communicate the rule appropriately.', '`isRetryable: false` evita reintentos inútiles; `customerMessage` permite al agente comunicar la regla de forma adecuada.') },
        { type: 'h', text: T('Empty is not an error', 'Vacío no es un error') },
        { type: 'p', text: T('"No orders found for this email" is a **successful query with no matches**. A timeout is an **access failure**. If both look the same, the agent either retries pointless empty searches or tells a customer "you have no orders" when the database was simply down.',
                             '«No se encontraron pedidos para este email» es una **consulta exitosa sin coincidencias**. Un timeout es un **fallo de acceso**. Si ambos se ven igual, el agente o reintenta búsquedas vacías sin sentido o le dice al cliente «no tienes pedidos» cuando la base de datos simplemente estaba caída.') },
        { type: 'h', text: T('Recover locally, propagate the rest', 'Recupera localmente, propaga lo demás') },
        { type: 'p', text: T('A subagent should handle transient failures itself (retry once or twice). Only errors it cannot resolve go up to the coordinator, together with **partial results and what was attempted**.',
                             'Un subagente debe manejar él mismo los fallos transitorios (reintentar una o dos veces). Solo los errores que no puede resolver suben al coordinador, junto con **los resultados parciales y lo que se intentó**.') },
        { type: 'trap', text: T('Uniform errors ("Operation failed") are always a wrong answer when the question is about recovery decisions.', 'Los errores uniformes («Operation failed») siempre son la respuesta equivocada cuando la pregunta trata de decisiones de recuperación.') }
      ],
      quiz: [
        { q: T('Your agent keeps retrying `process_refund` five times when the refund is outside policy, then gives a vague apology. What change helps most?',
               'Tu agente reintenta `process_refund` cinco veces cuando el reembolso está fuera de política y luego da una disculpa vaga. ¿Qué cambio ayuda más?'),
          options: [
            opt('Return isError with errorCategory "business", isRetryable false and a customer-friendly explanation', 'Devolver isError con errorCategory "business", isRetryable false y una explicación comprensible para el cliente', true, 'Tells the agent not to retry and how to communicate the rule.', 'Le dice al agente que no reintente y cómo comunicar la regla.'),
            opt('Limit retries for process_refund to two attempts, then apologize and close', 'Limitar los reintentos de process_refund a dos intentos y luego disculparse y cerrar', false, 'Still wastes retries on a non-retryable error.', 'Sigue desperdiciando reintentos en un error que no se puede reintentar.'),
            opt('Return "Operation failed" faster', 'Devolver «Operation failed» más rápido', false, 'Generic errors are the problem.', 'Los errores genéricos son el problema.'),
            opt('Remove process_refund from the agent entirely and route every refund request to a human agent', 'Quitar process_refund al agente por completo y enviar toda petición de reembolso a un agente humano', false, 'Removes capability for valid refunds.', 'Elimina la capacidad de hacer reembolsos válidos.')
          ] },
        { q: T('A customer lookup returns zero rows. How should the tool report it?', 'Una búsqueda de cliente devuelve cero filas. ¿Cómo debe informarlo la tool?'),
          options: [
            opt('As a successful result with no matches, not as an error', 'Como un resultado exitoso sin coincidencias, no como un error', true, 'A valid empty result is different from an access failure.', 'Un resultado vacío válido es distinto de un fallo de acceso.'),
            opt('As a transient error so the agent retries', 'Como un error transitorio para que el agente reintente', false, 'Causes pointless retries.', 'Provoca reintentos sin sentido.'),
            opt('As a permission error', 'Como un error de permisos', false, 'Misleading category.', 'Es una categoría engañosa.'),
            opt('By throwing an exception that ends the session and logs the empty lookup', 'Lanzando una excepción que termine la sesión y registre la consulta vacía', false, 'Ends the workflow for a normal outcome.', 'Termina el flujo por un resultado normal.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 2.3 */
    {
      id: '2.3', domain: 2, minutes: 12, docs: [DOCS.tooldef],
      summary: T('Fewer, role-specific tools mean better choices. Give each agent 4–5 tools for its job, add a narrow cross-role tool for frequent needs, and use `tool_choice` when a call must happen.',
                 'Menos tools y específicas para el rol significan mejores decisiones. Da a cada agente 4–5 tools para su trabajo, añade una tool acotada para necesidades frecuentes de otro rol y usa `tool_choice` cuando una llamada debe ocurrir sí o sí.'),
      objectives: [
        T('Explain why 18 tools degrade selection versus 4–5.', 'Explicar por qué 18 tools degradan la selección frente a 4–5.'),
        T('Scope tools by role and replace generic tools with constrained ones.', 'Acotar tools por rol y sustituir tools genéricas por otras restringidas.'),
        T('Use `tool_choice`: "auto", "any", or a forced tool.', 'Usar `tool_choice`: "auto", "any" o una tool forzada.')
      ],
      blocks: [
        { type: 'list', items: [
          T('**Too many tools** → more decision complexity → worse selection.', '**Demasiadas tools** → más complejidad de decisión → peor selección.'),
          T('**Out-of-role tools get misused**: a synthesis agent with web search starts searching instead of synthesizing.', '**Las tools fuera de rol se usan mal**: un agente de síntesis con búsqueda web se pone a buscar en lugar de sintetizar.'),
          T('**Constrained beats generic**: replace `fetch_url` with `load_document` that validates document URLs.', '**Restringido gana a genérico**: sustituye `fetch_url` por `load_document`, que valida URLs de documentos.'),
          T('**Scoped cross-role tool**: give the synthesizer `verify_fact` for the 85% simple checks; route complex verifications through the coordinator.', '**Tool acotada de otro rol**: da al sintetizador `verify_fact` para el 85 % de comprobaciones simples; enruta las verificaciones complejas por el coordinador.')
        ] },
        { type: 'table', head: [T('tool_choice', 'tool_choice'), T('Behavior', 'Comportamiento'), T('Use when', 'Úsalo cuando')], rows: [
          [T('{"type": "auto"}', '{"type": "auto"}'), T('Model may answer in text or call a tool', 'El modelo puede responder con texto o llamar a una tool'), T('Default conversational agents', 'Agentes conversacionales por defecto')],
          [T('{"type": "any"}', '{"type": "any"}'), T('Must call **a** tool, any of them', 'Debe llamar a **una** tool, cualquiera'), T('You need structured output and the right schema is unknown', 'Necesitas salida estructurada y no sabes qué schema toca')],
          [T('{"type": "tool", "name": "extract_metadata"}', '{"type": "tool", "name": "extract_metadata"}'), T('Must call **that** tool', 'Debe llamar a **esa** tool'), T('A specific step must run first', 'Un paso concreto debe ejecutarse primero')]
        ] },
        { type: 'code', lang: 'python', title: 'force a first step, then let the model continue', code: `
first = client.messages.create(
    model=MODEL, max_tokens=1024, tools=TOOLS, messages=msgs,
    tool_choice={"type": "tool", "name": "extract_metadata"},
)
# ...append tool_result, then follow-up turns with tool_choice "auto"
# so enrichment tools can be chosen based on the metadata` },
        { type: 'trap', text: T('Giving an agent **all** tools "so it never needs a round trip" is the over-provisioning distractor. Least privilege plus one scoped tool for the frequent case is the pattern.',
                                'Dar a un agente **todas** las tools «para que nunca necesite un viaje de ida y vuelta» es el distractor del exceso de permisos. El patrón es mínimo privilegio más una tool acotada para el caso frecuente.') }
      ],
      quiz: [
        { q: T('85% of the synthesis agent\'s verification needs are simple fact checks, and each currently costs 2–3 round trips via the coordinator. Best fix?',
               'El 85 % de las verificaciones que necesita el agente de síntesis son comprobaciones simples, y cada una cuesta hoy 2–3 viajes por el coordinador. ¿Mejor arreglo?'),
          options: [
            opt('Give the synthesis agent a scoped verify_fact tool; keep complex checks routed via the coordinator', 'Dar al agente de síntesis una tool acotada verify_fact; seguir enrutando las comprobaciones complejas por el coordinador', true, 'Least privilege for the common case, coordination for the rest.', 'Mínimo privilegio para el caso común y coordinación para el resto.'),
            opt('Give the synthesis agent all of the web search tools so it never needs a round trip through the coordinator', 'Dar al agente de síntesis todas las tools de búsqueda web para que nunca necesite pasar por el coordinador', false, 'Over-provisioning; violates separation of concerns.', 'Exceso de permisos; rompe la separación de responsabilidades.'),
            opt('Batch all verifications to the end of synthesis', 'Agrupar todas las verificaciones al final de la síntesis', false, 'Later synthesis steps may depend on verified facts.', 'Los pasos posteriores de la síntesis pueden depender de hechos ya verificados.'),
            opt('Have the search agent pre-cache extra context', 'Que el agente de búsqueda guarde contexto extra por adelantado', false, 'Speculative; cannot predict what will need verifying.', 'Es especulativo; no puede predecir qué habrá que verificar.')
          ] },
        { q: T('You must guarantee the model returns structured data via one of three extraction tools, but the document type is unknown. Which tool_choice?',
               'Debes garantizar que el modelo devuelva datos estructurados con una de tres tools de extracción, pero no conoces el tipo de documento. ¿Qué tool_choice?'),
          options: [
            opt('{"type": "any"}', '{"type": "any"}', true, 'Forces a tool call while letting the model pick the right schema.', 'Obliga a llamar a una tool y deja que el modelo elija el schema correcto.'),
            opt('{"type": "auto"}', '{"type": "auto"}', false, 'The model may reply with text instead.', 'El modelo puede responder con texto.'),
            opt('Force one specific extraction tool', 'Forzar una tool de extracción concreta', false, 'Wrong schema for two of three document types.', 'Sería el schema equivocado para dos de los tres tipos de documento.'),
            opt('Remove tools and ask for JSON in the prompt', 'Quitar las tools y pedir JSON en el prompt', false, 'Less reliable than tool use with schemas.', 'Es menos fiable que tool use con schemas.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 2.4 */
    {
      id: '2.4', domain: 2, minutes: 13, docs: [DOCS.ccmcp, DOCS.mcp],
      summary: T('Team servers go in the project\'s `.mcp.json` (committed, with `${ENV_VAR}` for secrets); personal or experimental ones go in `~/.claude.json`. All configured servers connect together and their tools are available at the same time.',
                 'Los servidores del equipo van en el `.mcp.json` del proyecto (versionado, con `${ENV_VAR}` para los secretos); los personales o experimentales van en `~/.claude.json`. Todos los servidores configurados se conectan a la vez y sus tools están disponibles simultáneamente.'),
      objectives: [
        T('Configure project-scoped servers with environment variable expansion.', 'Configurar servidores del proyecto con expansión de variables de entorno.'),
        T('Use MCP resources to expose content catalogs.', 'Usar recursos MCP para exponer catálogos de contenido.'),
        T('Prefer community servers for standard integrations; improve descriptions so MCP tools beat built-ins.', 'Preferir servidores de la comunidad para integraciones estándar y mejorar las descripciones para que las tools MCP ganen a las integradas.')
      ],
      blocks: [
        { type: 'code', lang: 'json', title: '.mcp.json (project root, committed)', code: `
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "\${GITHUB_TOKEN}" }
    },
    "jira": {
      "type": "http",
      "url": "https://mcp.example.com/jira",
      "headers": { "Authorization": "Bearer \${JIRA_TOKEN}" }
    }
  }
}`,
          caption: T('The file is shared through version control; each developer provides the token in their own environment. No secret is committed.', 'El archivo se comparte por control de versiones; cada desarrollador pone el token en su propio entorno. No se versiona ningún secreto.') },
        { type: 'table', head: [T('Scope', 'Alcance'), T('Where', 'Dónde'), T('For', 'Para')], rows: [
          [T('Project', 'Proyecto'), T('`.mcp.json` in the repo', '`.mcp.json` en el repo'), T('Shared team tooling', 'Herramientas compartidas del equipo')],
          [T('User', 'Usuario'), T('`~/.claude.json`', '`~/.claude.json`'), T('Personal / experimental servers', 'Servidores personales / experimentales')]
        ] },
        { type: 'h', text: T('Tools vs resources', 'Tools vs recursos') },
        { type: 'p', text: T('**Tools** perform actions. **Resources** expose content the agent can read: issue summaries, documentation trees, database schemas. A resource catalog gives the agent visibility into what exists **without exploratory tool calls**.',
                             'Las **tools** ejecutan acciones. Los **recursos** exponen contenido que el agente puede leer: resúmenes de issues, árboles de documentación, esquemas de base de datos. Un catálogo de recursos le da al agente visibilidad de lo que existe **sin llamadas exploratorias**.') },
        { type: 'list', items: [
          T('**Community first**: for standard systems (Jira, GitHub) use an existing MCP server; build custom only for team-specific workflows.', '**Primero la comunidad**: para sistemas estándar (Jira, GitHub) usa un servidor MCP existente; construye uno propio solo para flujos específicos del equipo.'),
          T('**Describe MCP tools richly**: if the agent keeps using `Grep` instead of your more capable code-search MCP tool, the MCP description is not explaining its capabilities and outputs.', '**Describe bien las tools MCP**: si el agente sigue usando `Grep` en lugar de tu tool MCP de búsqueda, más capaz, la descripción MCP no explica sus capacidades y salidas.')
        ] },
        { type: 'trap', text: T('A new teammate does not get a server you configured → it is in **your** `~/.claude.json`, not the project `.mcp.json`. Same logic as CLAUDE.md levels in 3.1.',
                                'Un compañero nuevo no recibe un servidor que configuraste → está en **tu** `~/.claude.json`, no en el `.mcp.json` del proyecto. La misma lógica que los niveles de CLAUDE.md en 3.1.') },
        { type: 'trap', text: T('Hard-coding a token in `.mcp.json` "because it is a private repo" is wrong. Use `${VAR}` expansion.', 'Escribir un token directamente en `.mcp.json` «porque es un repo privado» es incorrecto. Usa expansión `${VAR}`.') }
      ],
      quiz: [
        { q: T('Your team wants a shared GitHub MCP server for everyone who clones the repo, without committing tokens. What do you do?', 'Tu equipo quiere un servidor MCP de GitHub compartido para todos los que clonen el repo, sin versionar tokens. ¿Qué haces?'),
          options: [
            opt('Add it to the project .mcp.json using ${GITHUB_TOKEN} expansion', 'Añadirlo al .mcp.json del proyecto usando expansión ${GITHUB_TOKEN}', true, 'Project scope + env expansion = shared config, private secrets.', 'Alcance de proyecto + expansión de variables = configuración compartida y secretos privados.'),
            opt('Add it to each developer\'s ~/.claude.json with their own token', 'Añadirlo al ~/.claude.json de cada desarrollador con su propio token', false, 'Not shared via version control; drifts per person.', 'No se comparte por control de versiones y cada persona acaba con algo distinto.'),
            opt('Commit the token in .mcp.json', 'Versionar el token en .mcp.json', false, 'Leaks a secret.', 'Filtra un secreto.'),
            opt('Describe the server in CLAUDE.md', 'Describir el servidor en CLAUDE.md', false, 'CLAUDE.md does not configure MCP servers.', 'CLAUDE.md no configura servidores MCP.')
          ] },
        { q: T('The agent makes many exploratory calls just to learn which documentation pages exist. What MCP feature reduces this?', 'El agente hace muchas llamadas exploratorias solo para saber qué páginas de documentación existen. ¿Qué función de MCP reduce esto?'),
          options: [
            opt('Expose the documentation hierarchy as MCP resources', 'Exponer la jerarquía de documentación como recursos MCP', true, 'Resources give visibility into available content without exploration.', 'Los recursos dan visibilidad del contenido disponible sin explorar.'),
            opt('Add more search tools so it finds pages faster', 'Añadir más tools de búsqueda para encontrar páginas más rápido', false, 'More tools, more exploration.', 'Más tools, más exploración.'),
            opt('Increase max_tokens', 'Aumentar max_tokens', false, 'Unrelated.', 'No tiene relación.'),
            opt('Use the Batches API', 'Usar la Batches API', false, 'Unrelated to discovery.', 'No tiene que ver con descubrir contenido.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 2.5 */
    {
      id: '2.5', domain: 2, minutes: 11, docs: [DOCS.tools],
      summary: T('Grep searches **inside** files; Glob finds files **by name**. Read/Write handle whole files; Edit changes a unique snippet. Explore incrementally: Grep for entry points, Read to follow the flow.',
                 'Grep busca **dentro** de los archivos; Glob encuentra archivos **por su nombre**. Read/Write manejan archivos completos; Edit cambia un fragmento único. Explora de forma incremental: Grep para los puntos de entrada, Read para seguir el flujo.'),
      objectives: [
        T('Pick Grep vs Glob correctly.', 'Elegir correctamente entre Grep y Glob.'),
        T('Fall back to Read + Write when Edit cannot find a unique anchor.', 'Recurrir a Read + Write cuando Edit no encuentra un ancla única.'),
        T('Build codebase understanding incrementally and trace usage through wrappers.', 'Construir la comprensión del codebase de forma incremental y rastrear usos a través de wrappers.')
      ],
      blocks: [
        { type: 'table', head: [T('Tool', 'Tool'), T('Searches / does', 'Busca / hace'), T('Example', 'Ejemplo')], rows: [
          [T('Grep', 'Grep'), T('File **contents** by pattern', '**Contenido** de archivos por patrón'), T('all callers of `processRefund(`, an error message', 'todas las llamadas a `processRefund(`, un mensaje de error')],
          [T('Glob', 'Glob'), T('File **paths** by pattern', '**Rutas** de archivos por patrón'), T('`**/*.test.tsx`', '`**/*.test.tsx`')],
          [T('Read', 'Read'), T('Load a whole file', 'Cargar un archivo completo'), T('follow imports', 'seguir importaciones')],
          [T('Write', 'Write'), T('Write a whole file', 'Escribir un archivo completo'), T('new file / full rewrite', 'archivo nuevo / reescritura completa')],
          [T('Edit', 'Edit'), T('Replace a **unique** text match', 'Reemplazar una coincidencia **única** de texto'), T('targeted change', 'cambio puntual')],
          [T('Bash', 'Bash'), T('Run commands', 'Ejecutar comandos'), T('tests, build, git', 'tests, build, git')]
        ] },
        { type: 'note', text: T('Edit fails when its anchor text appears more than once. The reliable fallback is **Read** the full file, then **Write** the modified version.',
                                'Edit falla cuando su texto ancla aparece más de una vez. La alternativa fiable es **Read** del archivo completo y luego **Write** de la versión modificada.') },
        { type: 'compare',
          bad: { title: T('Wasteful exploration', 'Exploración derrochadora'), items: [
            T('Read every file upfront', 'Leer todos los archivos al principio'),
            T('Grep for a file name pattern', 'Usar Grep para un patrón de nombre de archivo'),
            T('Search only the wrapper\'s module name', 'Buscar solo el nombre del módulo wrapper')
          ] },
          good: { title: T('Incremental exploration', 'Exploración incremental'), items: [
            T('Grep to find entry points, then Read to trace the flow', 'Grep para encontrar los puntos de entrada y luego Read para seguir el flujo'),
            T('Glob for name patterns', 'Glob para patrones de nombre'),
            T('List all names a wrapper exports, then Grep each one', 'Listar todos los nombres que exporta un wrapper y luego hacer Grep de cada uno')
          ] } },
        { type: 'trap', text: T('"Find all test files" is **Glob**. "Find where this error message is raised" is **Grep**. The exam swaps them on purpose.', '«Encuentra todos los archivos de test» es **Glob**. «Encuentra dónde se lanza este mensaje de error» es **Grep**. El examen los intercambia a propósito.') }
      ],
      quiz: [
        { q: T('You need every place that calls `calculateTax(` across the codebase. Which tool?', 'Necesitas todos los lugares que llaman a `calculateTax(` en el codebase. ¿Qué tool?'),
          options: [
            opt('Grep', 'Grep', true, 'Searching file contents for a pattern.', 'Busca un patrón en el contenido de los archivos.'),
            opt('Glob', 'Glob', false, 'Glob matches file paths, not contents.', 'Glob busca rutas de archivos, no contenido.'),
            opt('Read every file', 'Read de todos los archivos', false, 'Wasteful upfront reading.', 'Lectura inicial derrochadora.'),
            opt('Edit', 'Edit', false, 'Edit modifies, it does not search.', 'Edit modifica; no busca.')
          ] },
        { q: T('Edit fails because the snippet `return null;` appears 9 times in the file. What now?', 'Edit falla porque el fragmento `return null;` aparece 9 veces en el archivo. ¿Y ahora?'),
          options: [
            opt('Read the full file, then Write the modified version', 'Hacer Read del archivo completo y luego Write de la versión modificada', true, 'The documented fallback when no unique anchor exists.', 'Es la alternativa documentada cuando no hay un ancla única.'),
            opt('Retry Edit with the same snippet until it succeeds', 'Reintentar Edit con el mismo fragmento hasta que funcione', false, 'It will fail again.', 'Volverá a fallar.'),
            opt('Use Glob to locate the line', 'Usar Glob para localizar la línea', false, 'Glob finds files, not lines.', 'Glob encuentra archivos, no líneas.'),
            opt('Delete the file and recreate it from memory', 'Borrar el archivo y recrearlo de memoria', false, 'Risky; the content must be read first.', 'Es arriesgado; primero hay que leer el contenido.')
          ] }
      ]
    }
  ]);
})();
