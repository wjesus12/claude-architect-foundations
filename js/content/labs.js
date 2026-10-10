/* 25 labs de diagnóstico bilingües. bug = índices (0-based) de las líneas con el fallo. */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const QFIX = T('Which change fixes the problem you found?', '¿Qué cambio arregla el problema que encontraste?');

  CAF.LABS = [
    /* ================= D1 ================= */
    {
      id: 'lab01', domain: 1, ts: '1.1', level: 'basic', kind: 'code', file: 'support_agent/loop.py',
      title: T('The agent quits mid-task', 'El agente abandona a mitad de tarea'),
      context: T('Customers report that the support agent says "Let me look up your order…" and then never answers. Find the line that ends the loop too early.',
                 'Los clientes cuentan que el agente de soporte dice «Déjame buscar tu pedido…» y luego nunca responde. Encuentra la línea que termina el bucle demasiado pronto.'),
      lines: [
        'messages = [{"role": "user", "content": request}]',
        'while True:',
        '    resp = client.messages.create(model=MODEL, max_tokens=2048,',
        '                                  tools=TOOLS, messages=messages)',
        '    messages.append({"role": "assistant", "content": resp.content})',
        '    if any(b.type == "text" for b in resp.content):',
        '        break',
        '    results = [run(b) for b in resp.content if b.type == "tool_use"]',
        '    messages.append({"role": "user", "content": results})'
      ],
      bug: [5],
      question: QFIX,
      options: [
        opt('`if resp.stop_reason != "tool_use": break`', '`if resp.stop_reason != "tool_use": break`', true, 'stop_reason is the control signal: continue on "tool_use", stop on "end_turn".', 'stop_reason es la señal de control: continuar con "tool_use", parar con "end_turn".'),
        opt('`if "done" in resp.content[0].text.lower(): break`', '`if "done" in resp.content[0].text.lower(): break`', false, 'Parsing natural language to stop is an anti-pattern.', 'Interpretar lenguaje natural para parar es un anti-patrón.'),
        opt('Keep the check but add `max_iterations = 5`', 'Mantener la comprobación pero añadir `max_iterations = 5`', false, 'An iteration cap does not fix the wrong termination test.', 'Un tope de iteraciones no arregla la condición de parada equivocada.'),
        opt('Tell the model never to write text before a tool call', 'Pedir al modelo que nunca escriba texto antes de llamar a una tool', false, 'A prompt cannot fix broken control flow.', 'Un prompt no arregla un control de flujo roto.')
      ],
      explain: T('A response can contain text **and** tool_use blocks at the same time. Only `stop_reason` tells you whether Claude is waiting for tool results.', 'Una respuesta puede contener texto **y** bloques tool_use a la vez. Solo `stop_reason` te dice si Claude espera resultados de tools.'),
      hint: T('Which field does the API give you specifically to drive the loop?', '¿Qué campo te da la API precisamente para controlar el bucle?'),
      fixed: ['    if resp.stop_reason != "tool_use":   # "end_turn" → done', '        break']
    },
    {
      id: 'lab02', domain: 1, ts: '1.1', level: 'mid', kind: 'code', file: 'support_agent/tools.py',
      title: T('API error: tool result not matched', 'Error de la API: resultado de tool sin emparejar'),
      context: T('After the first tool call, every request fails with a 400 error saying a tool_use block has no corresponding tool_result.',
                 'Tras la primera llamada a una tool, todas las peticiones fallan con un error 400 que dice que un bloque tool_use no tiene su tool_result correspondiente.'),
      lines: [
        'def run_tools(resp):',
        '    results = []',
        '    for block in resp.content:',
        '        if block.type == "tool_use":',
        '            output = TOOLS[block.name](**block.input)',
        '            results.append({',
        '                "type": "tool_result",',
        '                "content": json.dumps(output),',
        '            })',
        '    return {"role": "user", "content": results}'
      ],
      bug: [6, 7],
      question: QFIX,
      options: [
        opt('Add `"tool_use_id": block.id` to each tool_result', 'Añadir `"tool_use_id": block.id` a cada tool_result', true, 'Each tool_result must reference the tool_use it answers.', 'Cada tool_result debe referenciar el tool_use al que responde.'),
        opt('Send the tool results back with role "assistant" instead of "user"', 'Devolver los resultados de las tools con rol "assistant" en lugar de "user"', false, 'Tool results go in a user message.', 'Los resultados de tools van en un mensaje user.'),
        opt('Move the tool output into the system prompt for the next call', 'Mover la salida de la tool al system prompt de la siguiente llamada', false, 'Tool results belong in the conversation as tool_result blocks.', 'Los resultados van en la conversación como bloques tool_result.'),
        opt('Remove json.dumps', 'Quitar json.dumps', false, 'Serialization is not the cause of the missing pairing.', 'La serialización no es la causa del emparejamiento que falta.')
      ],
      explain: T('`tool_use_id` pairs each result with the request that produced it, which matters most when Claude calls several tools in one turn.', '`tool_use_id` empareja cada resultado con la petición que lo produjo, algo crucial cuando Claude llama a varias tools en un turno.'),
      fixed: ['            results.append({', '                "type": "tool_result",', '                "tool_use_id": block.id,', '                "content": json.dumps(output),', '            })']
    },
    {
      id: 'lab03', domain: 1, ts: '1.3', level: 'basic', kind: 'code', file: 'research/coordinator.py',
      title: T('The coordinator never delegates', 'El coordinador nunca delega'),
      context: T('Two subagents are defined, yet the coordinator always does the research itself and the subagents never run.',
                 'Hay dos subagentes definidos, pero el coordinador siempre investiga él mismo y los subagentes nunca se ejecutan.'),
      lines: [
        'options = ClaudeAgentOptions(',
        '    allowed_tools=["Read", "WebSearch"],',
        '    agents={',
        '        "web-searcher": AgentDefinition(',
        '            description="Finds credible sources for one subtopic.",',
        '            prompt="Return claim, excerpt, source_url, date.",',
        '            tools=["WebSearch", "WebFetch"]),',
        '        "synthesizer": AgentDefinition(',
        '            description="Merges findings into a cited section.",',
        '            prompt="Preserve every claim-source mapping.",',
        '            tools=["Read"]),',
        '    },',
        ')'
      ],
      bug: [1],
      question: QFIX,
      options: [
        opt('Add "Task" to allowed_tools (and drop WebSearch from the coordinator)', 'Añadir "Task" a allowed_tools (y quitar WebSearch al coordinador)', true, 'Subagents are spawned through the Task tool; without it the coordinator cannot delegate.', 'Los subagentes se crean con la tool Task; sin ella el coordinador no puede delegar.'),
        opt('Make the descriptions longer', 'Alargar las descripciones', false, 'Descriptions guide selection, but the spawning tool is missing.', 'Las descripciones guían la selección, pero falta la tool para crear subagentes.'),
        opt('Move the agent definitions into CLAUDE.md so the coordinator can find them', 'Mover las definiciones de agentes a CLAUDE.md para que el coordinador las encuentre', false, 'In the SDK they are configured in the options.', 'En el SDK se configuran en las opciones.'),
        opt('Give each subagent the "Task" tool so they can start themselves when needed', 'Dar a cada subagente la tool "Task" para que se inicien solos cuando haga falta', false, 'The coordinator is the one that must spawn.', 'Es el coordinador quien debe crearlos.')
      ],
      explain: T('`allowedTools` must include "Task" for a coordinator to invoke subagents. Removing WebSearch from it also stops it from doing the subagents\' job itself.', '`allowedTools` debe incluir "Task" para que un coordinador invoque subagentes. Quitarle WebSearch además evita que haga él mismo el trabajo de los subagentes.'),
      fixed: ['    allowed_tools=["Task", "Read"],']
    },
    {
      id: 'lab04', domain: 1, ts: '1.3', level: 'mid', kind: 'prompt', file: 'coordinator → Task(synthesizer)',
      title: T('The synthesizer invents sources', 'El sintetizador inventa fuentes'),
      context: T('The search subagent returned 14 findings with URLs. The synthesis section that comes back has generic claims and no citations. This is the Task prompt the coordinator sent.',
                 'El subagente de búsqueda devolvió 14 hallazgos con URLs. La sección de síntesis que vuelve tiene afirmaciones genéricas y sin citas. Este es el prompt de Task que envió el coordinador.'),
      lines: [
        'subagent: synthesizer',
        'prompt: |',
        '  Write the section "AI in music production (2023-2025)".',
        '  Use the findings the web-searcher gathered earlier.',
        '  Quality criteria: every claim cited; flag conflicting stats.'
      ],
      bug: [3],
      question: QFIX,
      options: [
        opt('Paste the complete findings (claim, excerpt, URL, date) as structured data into the prompt', 'Pegar los hallazgos completos (afirmación, extracto, URL, fecha) como datos estructurados en el prompt', true, 'Subagents inherit nothing; the findings must be in their prompt.', 'Los subagentes no heredan nada; los hallazgos deben estar en su prompt.'),
        opt('Tell it in the prompt to "check the conversation history for the earlier findings"', 'Decirle en el prompt que «revise el historial de la conversación para ver los hallazgos anteriores»', false, 'It has no access to the coordinator\'s history.', 'No tiene acceso al historial del coordinador.'),
        opt('Give the synthesizer WebSearch and WebFetch so it can re-find and cite the sources itself', 'Dar al sintetizador WebSearch y WebFetch para que vuelva a encontrar y citar él mismo las fuentes', false, 'Duplicates work and breaks role scoping.', 'Duplica trabajo y rompe el acotado por roles.'),
        opt('Use fork_session so it shares memory', 'Usar fork_session para que comparta memoria', false, 'Forking is for divergent exploration, not passing context to subagents.', 'El fork es para explorar enfoques distintos, no para pasar contexto a subagentes.')
      ],
      explain: T('"The findings gathered earlier" do not exist for the synthesizer: each invocation starts empty. Pass them explicitly and keep metadata separate so attribution survives.', '«Los hallazgos de antes» no existen para el sintetizador: cada invocación empieza vacía. Pásalos explícitamente y separa los metadatos para que la atribución sobreviva.'),
      fixed: ['  Findings (JSON):', '  [{"claim": "...", "excerpt": "...", "source_url": "...", "published": "2024-11-02"}, ...]']
    },
    {
      id: 'lab05', domain: 1, ts: '1.5', level: 'mid', kind: 'code', file: 'billing/hooks.py',
      title: T('The $500 limit is "enforced" too late', 'El límite de 500 $ se «aplica» demasiado tarde'),
      context: T('Refunds above $500 must go to a human. Audit logs show large refunds still being issued, followed by an apology message.',
                 'Los reembolsos de más de 500 $ deben ir a una persona. Los logs de auditoría muestran que se siguen emitiendo reembolsos grandes, seguidos de un mensaje de disculpa.'),
      lines: [
        'async def refund_limit(input_data, tool_use_id, context):',
        '    if input_data["tool_input"]["amount"] > 500:',
        '        return {"hookSpecificOutput": {',
        '            "hookEventName": "PostToolUse",',
        '            "additionalContext": "Refund exceeded limit; apologize."}}',
        '    return {}',
        '',
        'options = ClaudeAgentOptions(hooks={',
        '    "PostToolUse": [HookMatcher(matcher="mcp__billing__process_refund",',
        '                                hooks=[refund_limit])]})'
      ],
      bug: [3, 8],
      question: QFIX,
      options: [
        opt('Register it as PreToolUse and return permissionDecision "deny" with a reason pointing to escalate_to_human', 'Registrarlo como PreToolUse y devolver permissionDecision "deny" con un motivo que apunte a escalate_to_human', true, 'Only interception before execution can block the refund.', 'Solo interceptar antes de ejecutar puede bloquear el reembolso.'),
        opt('Lower the threshold to $400 to be safe', 'Bajar el umbral a 400 $ por seguridad', false, 'Still runs after the refund happened.', 'Sigue ejecutándose después del reembolso.'),
        opt('Keep the PostToolUse hook and also add the $500 rule to the system prompt as a second safeguard', 'Mantener el hook PostToolUse y añadir también la regla de 500 $ al system prompt como segunda salvaguarda', false, 'Probabilistic; the hook still fires too late.', 'Es probabilístico; el hook sigue llegando tarde.'),
        opt('Make the PostToolUse hook raise an exception for large refunds so the conversation stops immediately', 'Hacer que el hook PostToolUse lance una excepción con los reembolsos grandes para que la conversación se detenga ya', false, 'Still post-execution, and kills the conversation.', 'Sigue siendo posterior a la ejecución y mata la conversación.')
      ],
      explain: T('PostToolUse runs **after** the tool executed: the money already moved. Compliance rules that must prevent an action belong in PreToolUse interception.', 'PostToolUse se ejecuta **después** de la tool: el dinero ya se movió. Las reglas que deben impedir una acción van en una intercepción PreToolUse.'),
      fixed: ['            "hookEventName": "PreToolUse",', '            "permissionDecision": "deny",', '            "permissionDecisionReason": "Over $500: call escalate_to_human."}}', '    "PreToolUse": [HookMatcher(matcher="mcp__billing__process_refund",']
    },
    {
      id: 'lab06', domain: 1, ts: '1.4', level: 'basic', kind: 'json', file: 'escalate_to_human · payload',
      title: T('Humans keep re-asking customers', 'Las personas vuelven a preguntar a los clientes'),
      context: T('Escalated tickets take 3× longer because human agents must ask customers to explain everything again. This is what the agent sends.',
                 'Los tickets escalados tardan el triple porque los agentes humanos tienen que pedir a los clientes que expliquen todo otra vez. Esto es lo que envía el agente.'),
      lines: [
        '{',
        '  "priority": "high",',
        '  "message": "Customer is upset about a refund. Please help.",',
        '  "channel": "chat"',
        '}'
      ],
      bug: [2],
      question: QFIX,
      options: [
        opt('Send a structured handoff: customer_id, root_cause, amount, actions_taken, recommended_action', 'Enviar un traspaso estructurado: customer_id, root_cause, amount, actions_taken, recommended_action', true, 'Humans cannot see the transcript; the payload must stand alone.', 'Las personas no ven la conversación; el contenido debe valerse por sí mismo.'),
        opt('Attach the full raw transcript of the conversation so the human can read everything that happened', 'Adjuntar la conversación cruda completa para que la persona pueda leer todo lo que pasó', false, 'Verbose; humans need conclusions, not a log to read.', 'Es extenso; las personas necesitan conclusiones, no un log para leer.'),
        opt('Escalate earlier, before investigating, so the human gets the case while it is still simple', 'Escalar antes, sin investigar, para que la persona reciba el caso mientras aún es sencillo', false, 'Even less context for the human.', 'Aún menos contexto para la persona.'),
        opt('Raise priority to "urgent"', 'Subir la prioridad a «urgent»', false, 'Priority is not the missing information.', 'La prioridad no es la información que falta.')
      ],
      explain: T('A good handoff lets the human act immediately: who the customer is, what went wrong, the amount, what was already tried, and what the agent recommends.', 'Un buen traspaso permite actuar de inmediato: quién es el cliente, qué falló, el importe, qué se intentó y qué recomienda el agente.'),
      fixed: ['{', '  "customer_id": "C-88213",', '  "root_cause": "duplicate capture after gateway timeout",', '  "amount": 129.90,', '  "actions_taken": ["verified identity", "confirmed two captures"],', '  "recommended_action": "refund duplicate capture",', '  "reason_for_escalation": "amount above agent limit"', '}']
    },

    /* ================= D2 ================= */
    {
      id: 'lab07', domain: 2, ts: '2.1', level: 'basic', kind: 'schema', file: 'mcp/support_tools.json',
      title: T('Order questions go to the wrong tool', 'Las preguntas de pedidos van a la tool equivocada'),
      context: T('"Where is my order #48121?" frequently triggers get_customer instead of lookup_order. Select the two lines responsible.',
                 '«¿Dónde está mi pedido #48121?» dispara a menudo get_customer en lugar de lookup_order. Señala las dos líneas responsables.'),
      lines: [
        '[',
        '  { "name": "get_customer",',
        '    "description": "Retrieves customer information",',
        '    "input_schema": { "type": "object", "properties": { "id": { "type": "string" } } } },',
        '  { "name": "lookup_order",',
        '    "description": "Retrieves order details",',
        '    "input_schema": { "type": "object", "properties": { "id": { "type": "string" } } } }',
        ']'
      ],
      bug: [2, 5],
      question: QFIX,
      options: [
        opt('Rewrite both descriptions with input formats, example queries and when to use each vs the other', 'Reescribir ambas descripciones con formatos de entrada, consultas de ejemplo y cuándo usar cada una frente a la otra', true, 'Descriptions are the primary selection signal.', 'Las descripciones son la señal principal de selección.'),
        opt('Add a keyword router that sends any message containing "#" or "order" to lookup_order', 'Añadir un router por palabras clave que envíe a lookup_order cualquier mensaje con «#» o «order»', false, 'Over-engineered first step; bypasses the model.', 'Primer paso sobrediseñado; se salta al modelo.'),
        opt('Merge both tools into lookup_entity', 'Fusionar ambas tools en lookup_entity', false, 'Valid later, but more effort than fixing descriptions.', 'Válido más adelante, pero cuesta más que arreglar las descripciones.'),
        opt('Rename the parameter "id" to "identifier"', 'Renombrar el parámetro «id» a «identifier»', false, 'Still ambiguous between the two tools.', 'Sigue siendo ambiguo entre las dos tools.')
      ],
      explain: T('Two near-identical descriptions plus identical inputs leave the model guessing. Differentiate purpose, inputs and boundaries.', 'Dos descripciones casi idénticas con entradas idénticas dejan al modelo adivinando. Diferencia el propósito, las entradas y los límites.'),
      fixed: ['    "description": "Identify ONE customer by email, phone or full name. Not for order numbers: use lookup_order.",', '    "description": "Fetch ONE order by its number (#12345). Use for status, shipping, items. Not for identifying customers.",']
    },
    {
      id: 'lab08', domain: 2, ts: '2.2', level: 'basic', kind: 'json', file: 'mcp/refund_server · CallToolResult',
      title: T('Five retries on a policy violation', 'Cinco reintentos ante una violación de política'),
      context: T('When an order is outside the 30-day window, the agent retries process_refund five times, then gives a vague apology.',
                 'Cuando un pedido está fuera del plazo de 30 días, el agente reintenta process_refund cinco veces y luego da una disculpa vaga.'),
      lines: [
        '{',
        '  "isError": true,',
        '  "content": [',
        '    { "type": "text", "text": "Operation failed" }',
        '  ]',
        '}'
      ],
      bug: [3],
      question: QFIX,
      options: [
        opt('Return structured metadata: errorCategory "business", isRetryable false, and a customer-friendly explanation', 'Devolver metadatos estructurados: errorCategory "business", isRetryable false y una explicación comprensible para el cliente', true, 'The agent learns not to retry and how to explain the rule.', 'El agente sabe que no debe reintentar y cómo explicar la regla.'),
        opt('Set isError to false for policy violations so the agent stops retrying and moves on', 'Poner isError en false para las violaciones de política, para que el agente deje de reintentar y siga', false, 'Hides a real failure as success.', 'Oculta un fallo real como si fuera un éxito.'),
        opt('Cap retries at 2 in the agent loop so that policy errors stop looping after the second failed attempt', 'Limitar los reintentos a 2 en el bucle del agente para que los errores de política paren tras el segundo intento fallido', false, 'Still retries a non-retryable error.', 'Sigue reintentando un error que no se puede reintentar.'),
        opt('Return HTTP 500 instead', 'Devolver un HTTP 500 en su lugar', false, 'Generic, and suggests a transient failure.', 'Es genérico y sugiere un fallo transitorio.')
      ],
      explain: T('Uniform errors prevent good recovery decisions. Categorize (transient / validation / business / permission) and say whether retrying can help.', 'Los errores uniformes impiden buenas decisiones de recuperación. Categoriza (transitorio / validación / negocio / permiso) y di si reintentar puede ayudar.'),
      fixed: ['    { "type": "text", "text": "{\\"errorCategory\\": \\"business\\", \\"isRetryable\\": false, \\"message\\": \\"Order delivered 2026-08-02 is outside the 30-day window.\\"}" }']
    },
    {
      id: 'lab09', domain: 2, ts: '2.2', level: 'mid', kind: 'code', file: 'mcp/crm_server.py',
      title: T('"Search unavailable" for customers with no orders', '«Búsqueda no disponible» para clientes sin pedidos'),
      context: T('The agent tells customers "our system is down, try later" whenever they simply have no orders, and keeps retrying.',
                 'El agente les dice a los clientes «el sistema está caído, inténtalo más tarde» cada vez que simplemente no tienen pedidos, y sigue reintentando.'),
      lines: [
        '@server.tool()',
        'async def list_orders(email: str):',
        '    try:',
        '        rows = await db.orders_by_email(email)',
        '    except TimeoutError:',
        '        return error("transient", retryable=True, msg="DB timeout")',
        '    if not rows:',
        '        return error("transient", retryable=True, msg="No data")',
        '    return ok({"orders": rows})'
      ],
      bug: [7],
      question: QFIX,
      options: [
        opt('Return a successful result with an empty list: `ok({"orders": [], "found": 0})`', 'Devolver un resultado exitoso con la lista vacía: `ok({"orders": [], "found": 0})`', true, 'A valid empty result is not an access failure.', 'Un resultado vacío válido no es un fallo de acceso.'),
        opt('Mark it as a permission error', 'Marcarlo como error de permisos', false, 'Wrong category; still an error.', 'Categoría equivocada; sigue siendo un error.'),
        opt('Raise TimeoutError for empty results so they are handled by the same retry logic above', 'Lanzar TimeoutError ante resultados vacíos para que los maneje la misma lógica de reintento de arriba', false, 'Pretends a successful query timed out.', 'Finge que una consulta exitosa agotó el tiempo.'),
        opt('Remove the timeout handler', 'Quitar el manejador del timeout', false, 'The timeout branch is correct.', 'La rama del timeout está bien.')
      ],
      explain: T('Distinguish access failures (retry decisions) from valid empty results (a successful answer: "no orders"). Mixing them causes wasted retries and wrong messages to customers.', 'Distingue los fallos de acceso (decidir si reintentar) de los resultados vacíos válidos (una respuesta exitosa: «sin pedidos»). Mezclarlos provoca reintentos inútiles y mensajes equivocados a los clientes.'),
      fixed: ['    if not rows:', '        return ok({"orders": [], "found": 0})   # valid, not an error']
    },
    {
      id: 'lab10', domain: 2, ts: '2.3', level: 'mid', kind: 'code', file: 'extract/pipeline.py',
      title: T('Sometimes we get prose instead of JSON', 'A veces llega prosa en lugar de JSON'),
      context: T('Three extraction tools exist (invoice, receipt, contract). About 4% of documents come back as a text summary with no tool call, breaking the pipeline.',
                 'Hay tres tools de extracción (factura, recibo, contrato). Cerca del 4 % de los documentos vuelve como un resumen en texto sin llamada a tool, y eso rompe el pipeline.'),
      lines: [
        'resp = client.messages.create(',
        '    model=MODEL, max_tokens=2048,',
        '    tools=[extract_invoice, extract_receipt, extract_contract],',
        '    tool_choice={"type": "auto"},',
        '    messages=[{"role": "user", "content": document}],',
        ')',
        'data = next(b.input for b in resp.content if b.type == "tool_use")'
      ],
      bug: [3],
      question: QFIX,
      options: [
        opt('`tool_choice={"type": "any"}`', '`tool_choice={"type": "any"}`', true, 'Guarantees a tool call while letting the model choose the right schema.', 'Garantiza una llamada a tool y deja que el modelo elija el schema correcto.'),
        opt('Force `extract_invoice` for every document', 'Forzar `extract_invoice` en todos los documentos', false, 'Wrong schema for receipts and contracts.', 'Schema equivocado para recibos y contratos.'),
        opt('Add "always use a tool" to the prompt', 'Añadir «usa siempre una tool» al prompt', false, 'Probabilistic; tool_choice is deterministic.', 'Es probabilístico; tool_choice es determinista.'),
        opt('Parse JSON out of the text when no tool is called', 'Extraer el JSON del texto cuando no se llame a una tool', false, 'Fragile workaround.', 'Es un parche frágil.')
      ],
      explain: T('"auto" lets the model answer in text. "any" requires a tool call but keeps the choice among the three schemas.', '"auto" permite al modelo responder con texto. "any" exige una llamada a tool pero mantiene la elección entre los tres schemas.'),
      fixed: ['    tool_choice={"type": "any"},']
    },
    {
      id: 'lab11', domain: 2, ts: '2.4', level: 'basic', kind: 'json', file: '.mcp.json',
      title: T('Security review flags our MCP config', 'La revisión de seguridad señala nuestra config MCP'),
      context: T('This file is committed so every developer gets the GitHub MCP server. Security has flagged it.', 'Este archivo está versionado para que todos los desarrolladores tengan el servidor MCP de GitHub. Seguridad lo ha señalado.'),
      lines: [
        '{',
        '  "mcpServers": {',
        '    "github": {',
        '      "command": "npx",',
        '      "args": ["-y", "@modelcontextprotocol/server-github"],',
        '      "env": { "GITHUB_TOKEN": "ghp_9fK2xQ7mA1bC3dE5fG7hJ9kL" }',
        '    }',
        '  }',
        '}'
      ],
      bug: [5],
      question: QFIX,
      options: [
        opt('Use environment variable expansion: `"GITHUB_TOKEN": "${GITHUB_TOKEN}"`', 'Usar expansión de variables de entorno: `"GITHUB_TOKEN": "${GITHUB_TOKEN}"`', true, 'Shared config, secret stays in each developer\'s environment.', 'Configuración compartida; el secreto se queda en el entorno de cada desarrollador.'),
        opt('Move the whole server definition to each developer\'s ~/.claude.json', 'Mover toda la definición del servidor al ~/.claude.json de cada desarrollador', false, 'Loses the shared team configuration.', 'Se pierde la configuración compartida del equipo.'),
        opt('Keep it; the repository is private', 'Dejarlo; el repositorio es privado', false, 'Committed secrets leak through clones and history.', 'Los secretos versionados se filtran por los clones y el historial.'),
        opt('Base64-encode the token', 'Codificar el token en base64', false, 'Encoding is not secrecy.', 'Codificar no es ocultar.')
      ],
      explain: T('`.mcp.json` supports `${VAR}` expansion exactly so teams can share server definitions without committing credentials.', '`.mcp.json` admite expansión `${VAR}` justo para que los equipos compartan definiciones de servidores sin versionar credenciales.'),
      fixed: ['      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }']
    },
    {
      id: 'lab12', domain: 2, ts: '2.5', level: 'basic', kind: 'code', file: 'agent trace · tool calls',
      title: T('Zero callers found (there are 23)', 'Cero llamadas encontradas (hay 23)'),
      context: T('The developer-productivity agent was asked "Where is processRefund called?" and concluded the function is dead code. Here is its tool trace.',
                 'Al agente de productividad se le preguntó «¿Dónde se llama a processRefund?» y concluyó que la función es código muerto. Esta es su traza de tools.'),
      lines: [
        '1. Glob(pattern="src/**/*.ts")            -> 412 files',
        '2. Glob(pattern="**/processRefund(*")     -> 0 files',
        '3. Answer: "processRefund appears unused; safe to delete."'
      ],
      lang: 'bash',
      bug: [1],
      question: QFIX,
      options: [
        opt('Use Grep for the content pattern `processRefund(`', 'Usar Grep para el patrón de contenido `processRefund(`', true, 'Grep searches inside files; Glob only matches file paths.', 'Grep busca dentro de los archivos; Glob solo compara rutas.'),
        opt('Read all 412 files', 'Leer los 412 archivos', false, 'Wasteful upfront reading.', 'Lectura inicial derrochadora.'),
        opt('Use Glob with the pattern `**/*processRefund*` instead', 'Usar Glob con el patrón `**/*processRefund*`', false, 'Still matches file names, not call sites.', 'Sigue buscando nombres de archivo, no llamadas.'),
        opt('Use Edit to search for the text across files', 'Usar Edit para buscar el texto en los archivos', false, 'Edit modifies; it does not search.', 'Edit modifica; no busca.')
      ],
      explain: T('Glob finds files by name; Grep finds content. Callers of a function are content, so Glob returned nothing and the agent drew a dangerous conclusion.', 'Glob encuentra archivos por nombre; Grep encuentra contenido. Las llamadas a una función son contenido, así que Glob no devolvió nada y el agente sacó una conclusión peligrosa.'),
      fixed: ['2. Grep(pattern="processRefund\\\\(", path="src")  -> 23 matches in 9 files']
    },

    /* ================= D3 ================= */
    {
      id: 'lab13', domain: 3, ts: '3.1', level: 'basic', kind: 'tree', file: 'where the instructions live',
      title: T('New hires don\'t get our conventions', 'Las personas nuevas no reciben nuestras convenciones'),
      context: T('Claude follows the team\'s API conventions for the tech lead, but not for the two developers who joined this week.', 'Claude sigue las convenciones de API del equipo con el líder técnico, pero no con los dos desarrolladores que entraron esta semana.'),
      lines: [
        '~/.claude/CLAUDE.md          # tech lead: API conventions, error format',
        'repo/',
        '├── CLAUDE.md                # "Run pnpm test before committing"',
        '├── .claude/commands/review.md',
        '└── src/'
      ],
      bug: [0],
      question: QFIX,
      options: [
        opt('Move the API conventions into the project CLAUDE.md (or a .claude/rules/ file) and commit', 'Mover las convenciones de API al CLAUDE.md del proyecto (o a un archivo en .claude/rules/) y versionarlo', true, 'Project-level memory is shared through version control.', 'La memoria de proyecto se comparte por control de versiones.'),
        opt('Ask the new hires to copy the tech lead\'s ~/.claude/CLAUDE.md onto their own machines', 'Pedir a las personas nuevas que copien el ~/.claude/CLAUDE.md del líder técnico en sus máquinas', false, 'Manual, drifts, not versioned.', 'Es manual, se desincroniza y no se versiona.'),
        opt('Create a /conventions skill', 'Crear una skill /conventions', false, 'Skills are on demand; conventions must apply always.', 'Las skills son bajo demanda; las convenciones deben aplicarse siempre.'),
        opt('Run /memory on the new machines', 'Ejecutar /memory en las máquinas nuevas', false, '/memory diagnoses; it does not share files.', '/memory diagnostica; no comparte archivos.')
      ],
      explain: T('User-level instructions apply only to that user. Team standards belong at project level.', 'Las instrucciones de nivel usuario solo aplican a ese usuario. Los estándares del equipo van a nivel de proyecto.'),
      fixed: ['repo/', '├── CLAUDE.md                # test command + @docs/api-conventions.md', '├── .claude/rules/api.md     # paths: ["src/api/**/*"]']
    },
    {
      id: 'lab14', domain: 3, ts: '3.2', level: 'mid', kind: 'config', file: '.claude/skills/map-module/SKILL.md',
      title: T('An "analysis" skill deleted files', 'Una skill de «análisis» borró archivos'),
      context: T('This skill should only explore a module and summarize it. Yesterday it "cleaned up" two files and its 300-line output buried the main conversation.',
                 'Esta skill solo debía explorar un módulo y resumirlo. Ayer «limpió» dos archivos y sus 300 líneas de salida taparon la conversación principal.'),
      lines: [
        '---',
        'name: map-module',
        'description: Maps a module and returns an architecture summary.',
        'allowed-tools: Read, Grep, Glob, Bash, Write, Edit',
        'argument-hint: <module path>',
        '---',
        'Explore $ARGUMENTS and summarize entry points and data flow.'
      ],
      bug: [3],
      question: T('Which frontmatter change addresses both problems?', '¿Qué cambio de frontmatter resuelve ambos problemas?'),
      options: [
        opt('`allowed-tools: Read, Grep, Glob` and add `context: fork`', '`allowed-tools: Read, Grep, Glob` y añadir `context: fork`', true, 'Read-only tools prevent destructive actions; fork isolates the verbose output.', 'Las tools de solo lectura evitan acciones destructivas; el fork aísla la salida extensa.'),
        opt('Remove argument-hint', 'Quitar argument-hint', false, 'Unrelated to either problem.', 'No tiene relación con ninguno de los dos problemas.'),
        opt('Move the skill into CLAUDE.md', 'Mover la skill a CLAUDE.md', false, 'Always-loaded, still unrestricted.', 'Se cargaría siempre y seguiría sin restricciones.'),
        opt('Add "never modify or delete files" at the top of the skill body', 'Añadir «nunca modifiques ni borres archivos» al principio del cuerpo de la skill', false, 'Probabilistic; allowed-tools is the enforcement.', 'Es probabilístico; allowed-tools es lo que lo impone.')
      ],
      explain: T('`allowed-tools` restricts what a skill can do; `context: fork` runs it in an isolated sub-agent so only its summary returns.', '`allowed-tools` limita lo que puede hacer una skill; `context: fork` la ejecuta en un subagente aislado para que solo vuelva su resumen.'),
      fixed: ['allowed-tools: Read, Grep, Glob', 'context: fork']
    },
    {
      id: 'lab15', domain: 3, ts: '3.3', level: 'mid', kind: 'config', file: '.claude/rules/testing.md',
      title: T('Test conventions only work in one folder', 'Las convenciones de tests solo funcionan en una carpeta'),
      context: T('Tests live next to their components all over `src/`. The rules below are applied only when editing files in `src/components/`.', 'Los tests viven junto a sus componentes por todo `src/`. Las reglas de abajo solo se aplican al editar archivos de `src/components/`.'),
      lines: [
        '---',
        'paths: ["src/components/**/*"]',
        '---',
        '- Query by role, never by test id.',
        '- One behavior per test.'
      ],
      bug: [1],
      question: QFIX,
      options: [
        opt('`paths: ["**/*.test.tsx", "**/*.test.ts"]`', '`paths: ["**/*.test.tsx", "**/*.test.ts"]`', true, 'Glob by file type, regardless of directory.', 'Glob por tipo de archivo, sin importar el directorio.'),
        opt('Add a CLAUDE.md to every folder with tests', 'Añadir un CLAUDE.md en cada carpeta con tests', false, 'Duplicated and directory-bound.', 'Duplicado y atado a cada directorio.'),
        opt('Remove the frontmatter so it always loads', 'Quitar el frontmatter para que se cargue siempre', false, 'Loads test rules when editing everything.', 'Cargaría reglas de tests al editar cualquier cosa.'),
        opt('`paths: "src/"`', '`paths: "src/"`', false, 'Too broad and not test-specific.', 'Demasiado amplio y no es específico de tests.')
      ],
      explain: T('Path rules shine for conventions spread across the tree: match the file pattern, not a folder.', 'Las reglas por ruta destacan con convenciones repartidas por el árbol: coincide con el patrón de archivo, no con una carpeta.'),
      fixed: ['paths: ["**/*.test.tsx", "**/*.test.ts"]']
    },
    {
      id: 'lab16', domain: 3, ts: '3.6', level: 'basic', kind: 'config', lang: 'yaml', file: '.github/workflows/review.yml',
      title: T('The review job hangs for 6 hours', 'El job de revisión se cuelga 6 horas'),
      context: T('The CI job never finishes until it times out. Logs show Claude Code waiting for input.', 'El job de CI nunca termina hasta agotar el tiempo. Los logs muestran a Claude Code esperando una entrada.'),
      lines: [
        '- name: AI review',
        '  run: |',
        '    claude "Review pr.diff for bugs and security issues" > review.txt',
        '    python post_comments.py review.txt'
      ],
      bug: [2],
      question: QFIX,
      options: [
        opt('`claude -p "Review pr.diff …"`', '`claude -p "Review pr.diff …"`', true, '-p (--print) is the documented non-interactive mode.', '-p (--print) es el modo no interactivo documentado.'),
        opt('Set `CLAUDE_HEADLESS=true` first', 'Definir antes `CLAUDE_HEADLESS=true`', false, 'No such variable.', 'Esa variable no existe.'),
        opt('Add `--batch`', 'Añadir `--batch`', false, 'No such flag.', 'Ese flag no existe.'),
        opt('Append `< /dev/null`', 'Añadir `< /dev/null`', false, 'Unix workaround, not the documented approach.', 'Parche de Unix, no el enfoque documentado.')
      ],
      explain: T('Without -p, Claude Code starts an interactive session and waits forever in CI.', 'Sin -p, Claude Code abre una sesión interactiva y en CI se queda esperando para siempre.'),
      fixed: ['    claude -p "Review pr.diff for bugs and security issues" > review.txt']
    },
    {
      id: 'lab17', domain: 3, ts: '3.6', level: 'mid', kind: 'config', lang: 'yaml', file: '.github/workflows/review.yml',
      title: T('Comment bot breaks on every format change', 'El bot de comentarios se rompe con cada cambio de formato'),
      context: T('The job works, but post_comments.py parses free text with regexes and breaks whenever the wording changes. Inline PR comments need file, line and severity.', 'El job funciona, pero post_comments.py interpreta texto libre con regex y se rompe cada vez que cambia la redacción. Los comentarios en línea del PR necesitan archivo, línea y severidad.'),
      lines: [
        '- name: AI review',
        '  run: |',
        '    claude -p "Review pr.diff. List each issue as: FILE:LINE - text" > review.txt',
        '    python post_comments.py review.txt   # regex parsing'
      ],
      bug: [2],
      question: QFIX,
      options: [
        opt('Add `--output-format json --json-schema "$(cat schema.json)"` and parse JSON', 'Añadir `--output-format json --json-schema "$(cat schema.json)"` y parsear JSON', true, 'Machine-parseable, schema-enforced findings.', 'Hallazgos legibles por máquina y validados por schema.'),
        opt('Make the format instructions longer and stricter so every line matches the regex', 'Alargar y endurecer las instrucciones de formato para que cada línea encaje con la regex', false, 'Still free text.', 'Sigue siendo texto libre.'),
        opt('Use the Batches API', 'Usar la Batches API', false, 'Latency; unrelated to output format.', 'Añade latencia y no tiene que ver con el formato de salida.'),
        opt('Run the review twice and only post lines that appear in both outputs', 'Hacer la revisión dos veces y publicar solo las líneas que aparezcan en ambas salidas', false, 'Does not create structure.', 'No crea estructura.')
      ],
      explain: T('`--output-format json` with `--json-schema` gives structured findings you can post as inline comments reliably.', '`--output-format json` con `--json-schema` da hallazgos estructurados que se pueden publicar como comentarios en línea de forma fiable.'),
      fixed: ['    claude -p "Review pr.diff" --output-format json --json-schema "$(cat schema.json)" > findings.json', '    python post_comments.py findings.json']
    },
    {
      id: 'lab18', domain: 3, ts: '3.2', level: 'basic', kind: 'tree', file: 'where /review is defined',
      title: T('"/review: command not found"', '«/review: comando no encontrado»'),
      context: T('The team agreed everyone should run /review before opening a PR. It works for the author of the command only.', 'El equipo acordó que todos ejecuten /review antes de abrir un PR. Solo le funciona a quien creó el comando.'),
      lines: [
        '~/.claude/commands/review.md     # team review checklist',
        'repo/',
        '├── CLAUDE.md',
        '└── .claude/settings.json'
      ],
      bug: [0],
      question: QFIX,
      options: [
        opt('Move it to `repo/.claude/commands/review.md` and commit', 'Moverlo a `repo/.claude/commands/review.md` y versionarlo', true, 'Project-scoped commands are shared via version control.', 'Los comandos del proyecto se comparten por control de versiones.'),
        opt('Add a "commands" array with review.md to .claude/settings.json', 'Añadir un array «commands» con review.md a .claude/settings.json', false, 'That is not how commands are defined.', 'Así no se definen los comandos.'),
        opt('Paste the checklist into CLAUDE.md', 'Pegar la checklist en CLAUDE.md', false, 'Instructions, not a slash command.', 'Son instrucciones, no un slash command.'),
        opt('Ask everyone to create their own copy', 'Pedir a cada uno que cree su propia copia', false, 'Drifts; not shared.', 'Se desincroniza; no se comparte.')
      ],
      explain: T('`~/.claude/commands/` is personal; `.claude/commands/` in the repo is for the team.', '`~/.claude/commands/` es personal; `.claude/commands/` en el repo es para el equipo.'),
      fixed: ['repo/', '├── .claude/commands/review.md   # shared via git']
    },

    /* ================= D4 ================= */
    {
      id: 'lab19', domain: 4, ts: '4.3', level: 'mid', kind: 'schema', file: 'tools/record_contract.json',
      title: T('Renewal dates that never existed', 'Fechas de renovación que nunca existieron'),
      context: T('About a third of contracts have no renewal clause, yet every extraction includes a plausible renewal date.', 'Cerca de un tercio de los contratos no tiene cláusula de renovación, pero todas las extracciones incluyen una fecha de renovación plausible.'),
      lines: [
        '{ "name": "record_contract",',
        '  "input_schema": { "type": "object",',
        '    "properties": {',
        '      "party_a": { "type": "string" },',
        '      "party_b": { "type": "string" },',
        '      "renewal_date": { "type": "string", "format": "date" }',
        '    },',
        '    "required": ["party_a", "party_b", "renewal_date"] } }'
      ],
      bug: [5],
      question: QFIX,
      options: [
        opt('Make renewal_date nullable: `"type": ["string", "null"]` and say "null if absent"', 'Hacer renewal_date nullable: `"type": ["string", "null"]` e indicar «null si no existe»', true, 'Removes the pressure to fabricate a required value.', 'Elimina la presión por inventar un valor obligatorio.'),
        opt('Add "never invent renewal dates" to the prompt and keep the schema exactly as it is', 'Añadir «nunca inventes fechas de renovación» al prompt y mantener el schema exactamente igual', false, 'The schema still demands a string.', 'El schema sigue exigiendo un string.'),
        opt('Retry the extraction until the renewal date passes validation', 'Reintentar la extracción hasta que la fecha de renovación pase la validación', false, 'Retries cannot find absent information.', 'Los reintentos no encuentran información que no existe.'),
        opt('Delete the field', 'Borrar el campo', false, 'Loses the date when it exists.', 'Pierde la fecha cuando sí existe.')
      ],
      explain: T('A required non-null field tells the model "a value must exist". When it may be missing, allow null.', 'Un campo obligatorio y no nullable le dice al modelo «tiene que haber un valor». Cuando puede faltar, permite null.'),
      fixed: ['      "renewal_date": { "type": ["string", "null"], "description": "ISO date, or null if the contract has no renewal clause" }']
    },
    {
      id: 'lab20', domain: 4, ts: '4.3', level: 'basic', kind: 'schema', file: 'tools/classify_ticket.json',
      title: T('Everything new becomes "billing"', 'Todo lo nuevo acaba en «billing»'),
      context: T('A new product line launched; its tickets get forced into existing categories and reports are skewed.', 'Se lanzó una nueva línea de producto; sus tickets se meten a la fuerza en categorías existentes y los informes salen sesgados.'),
      lines: [
        '"category": {',
        '  "type": "string",',
        '  "enum": ["billing", "shipping", "returns", "account"]',
        '}'
      ],
      bug: [2],
      question: QFIX,
      options: [
        opt('Add "other" (and "unclear") to the enum plus a `category_detail` string', 'Añadir "other" (y "unclear") al enum más un string `category_detail`', true, 'Extensible categories without forcing wrong labels.', 'Categorías extensibles sin forzar etiquetas equivocadas.'),
        opt('Remove the enum entirely', 'Quitar el enum por completo', false, 'Loses consistent labels.', 'Se pierden etiquetas consistentes.'),
        opt('Add every plausible future category to the enum right now', 'Añadir ya al enum todas las categorías futuras plausibles', false, 'Impossible and brittle.', 'Imposible y frágil.'),
        opt('Ask the model to choose whichever existing category is closest', 'Pedir al modelo que elija la categoría existente más parecida', false, 'That is the current skew.', 'Ese es justamente el sesgo actual.')
      ],
      explain: T('The "other" + detail pattern keeps enums strict for known values and honest for unknown ones; "unclear" captures ambiguity.', 'El patrón "other" + detalle mantiene el enum estricto para los valores conocidos y honesto para los desconocidos; "unclear" recoge la ambigüedad.'),
      fixed: ['  "enum": ["billing", "shipping", "returns", "account", "other", "unclear"]', '},', '"category_detail": { "type": ["string", "null"] }']
    },
    {
      id: 'lab21', domain: 4, ts: '4.5', level: 'mid', kind: 'code', file: 'ci/premerge_check.py',
      title: T('Developers wait hours to merge', 'Los desarrolladores esperan horas para hacer merge'),
      context: T('To save money, the blocking pre-merge security check was moved to the Message Batches API. Merges now wait up to many hours.', 'Para ahorrar, el check de seguridad bloqueante previo al merge se pasó a la Message Batches API. Ahora los merges esperan hasta muchas horas.'),
      lines: [
        'def premerge_check(diff):',
        '    batch = client.messages.batches.create(requests=[{',
        '        "custom_id": f"pr-{PR}", "params": review_params(diff)}])',
        '    while not done(batch.id):',
        '        time.sleep(60)          # blocks the merge until results',
        '    return results(batch.id)'
      ],
      bug: [1],
      question: QFIX,
      options: [
        opt('Use a synchronous `client.messages.create` call for the blocking check; keep batch for overnight jobs', 'Usar una llamada síncrona `client.messages.create` para el check bloqueante; dejar batch para los trabajos nocturnos', true, 'Batch has no latency SLA (up to 24 h).', 'Batch no tiene SLA de latencia (hasta 24 h).'),
        opt('Keep the batch but poll every 5 seconds instead of every 60 to detect completion sooner', 'Mantener el batch pero consultar cada 5 segundos en lugar de cada 60 para detectar antes el final', false, 'Polling faster does not speed up processing.', 'Consultar más rápido no acelera el procesamiento.'),
        opt('Keep the batch and add a timeout that falls back to a synchronous call if results take over 10 minutes', 'Mantener el batch y añadir un timeout que pase a una llamada síncrona si los resultados tardan más de 10 minutos', false, 'Unnecessary complexity.', 'Complejidad innecesaria.'),
        opt('Batch several PRs together', 'Agrupar varios PRs', false, 'Still no latency guarantee.', 'Sigue sin garantía de latencia.')
      ],
      explain: T('Match the API to the workflow: blocking → synchronous; latency-tolerant → batch for the 50% savings.', 'Ajusta la API al flujo: bloqueante → síncrono; tolerante a la latencia → batch, con el 50 % de ahorro.'),
      fixed: ['def premerge_check(diff):', '    return client.messages.create(**review_params(diff))   # blocking → sync']
    },
    {
      id: 'lab22', domain: 4, ts: '4.1', level: 'basic', kind: 'prompt', file: 'review_system_prompt.md',
      title: T('Developers ignore the AI reviewer', 'Los desarrolladores ignoran al revisor de IA'),
      context: T('35% of findings are dismissed as noise, mostly style nits and "inaccurate comment" flags.', 'El 35 % de los hallazgos se descarta como ruido, sobre todo detalles de estilo y avisos de «comentario incorrecto».'),
      lines: [
        '# Code review',
        'Review the diff carefully.',
        'Be conservative and only report issues you are highly confident about.',
        'Check that comments are accurate.'
      ],
      bug: [2, 3],
      question: QFIX,
      options: [
        opt('Replace with explicit criteria: report bugs/security; skip style and consistent local patterns; flag comments only when they contradict code behavior', 'Sustituir por criterios explícitos: reportar bugs y seguridad; omitir estilo y patrones locales consistentes; señalar comentarios solo cuando contradigan lo que hace el código', true, 'Categorical criteria improve precision; confidence wording does not.', 'Los criterios categóricos mejoran la precisión; hablar de confianza no.'),
        opt('Add "be even more conservative and only report issues you are highly confident are real, impactful problems in this diff" to the prompt', 'Añadir al prompt «sé aún más conservador y reporta solo lo que estés muy seguro de que es un problema real e importante en este diff»', false, 'Same vague instruction.', 'La misma instrucción vaga.'),
        opt('Keep the prompt and filter out any finding whose self-reported model confidence is below 0.9 before posting', 'Mantener el prompt y descartar antes de publicar todo hallazgo con confianza autoinformada inferior a 0,9', false, 'Not a substitute for criteria.', 'No sustituye a los criterios.'),
        opt('Use a larger model', 'Usar un modelo más grande', false, 'Does not define what to report.', 'No define qué reportar.')
      ],
      explain: T('"Be conservative" and "check comments are accurate" are vague. Define what to report vs skip.', '«Sé conservador» y «comprueba que los comentarios sean correctos» son vagos. Define qué reportar y qué omitir.'),
      fixed: ['Report: bugs, security issues. Skip: style, naming, patterns used consistently in this repo.', 'Flag a comment ONLY when its claimed behavior contradicts what the code does.']
    },

    /* ================= D5 ================= */
    {
      id: 'lab23', domain: 5, ts: '5.1', level: 'mid', kind: 'code', file: 'support_agent/context.py',
      title: T('The refund amount drifts after long chats', 'El importe del reembolso cambia en chats largos'),
      context: T('After ~30 turns the agent offers the wrong refund amount or forgets the promised date. Context is rebuilt like this each turn.', 'Tras unos 30 turnos el agente ofrece un importe de reembolso equivocado u olvida la fecha prometida. El contexto se reconstruye así en cada turno.'),
      lines: [
        'def build_messages(history):',
        '    if len(history) > 20:',
        '        summary = summarize(history[:-6])   # prose summary',
        '        history = [{"role": "user", "content": summary}] + history[-6:]',
        '    return history'
      ],
      bug: [2, 3],
      question: QFIX,
      options: [
        opt('Keep a persistent case-facts block (order IDs, amounts, dates, promises) prepended every turn, outside the summary', 'Mantener un bloque persistente de case facts (IDs de pedido, importes, fechas, promesas) al principio en cada turno, fuera del resumen', true, 'Transactional facts must survive summarization verbatim.', 'Los datos transaccionales deben sobrevivir literalmente al resumen.'),
        opt('Summarize more aggressively, keeping only the last 3 turns verbatim and compressing everything else, to save tokens', 'Resumir de forma más agresiva, conservando literalmente solo los últimos 3 turnos y comprimiendo el resto, para ahorrar tokens', false, 'Loses even more detail.', 'Pierde aún más detalle.'),
        opt('Never summarize; send everything', 'No resumir nunca; enviarlo todo', false, 'Context grows without bound and tool output dominates.', 'El contexto crece sin límite y dominan las salidas de tools.'),
        opt('Ask the customer to restate the refund amount and order number every few turns', 'Pedir al cliente que repita el importe y el número de pedido cada pocos turnos', false, 'Shifts the burden; fixes nothing.', 'Traslada la carga; no arregla nada.')
      ],
      explain: T('Progressive summaries turn "$129.90 by Friday" into "a refund soon". Extract facts into a structured block that is always included.', 'Los resúmenes progresivos convierten «129,90 $ antes del viernes» en «un reembolso pronto». Extrae los datos a un bloque estructurado que siempre se incluya.'),
      fixed: ['    facts = render_case_facts(case)   # order, amount, status, promised date', '    return [{"role": "user", "content": facts + "\\n\\n" + summary}] + history[-6:]']
    },
    {
      id: 'lab24', domain: 5, ts: '5.3', level: 'mid', kind: 'code', file: 'research/web_searcher.py',
      title: T('Reports claim "no sources exist"', 'Los informes dicen «no hay fuentes»'),
      context: T('Some reports state that no research exists on a subtopic. Logs show the search API timed out for those subtopics.', 'Algunos informes afirman que no hay investigación sobre un subtema. Los logs muestran que la API de búsqueda agotó el tiempo en esos subtemas.'),
      lines: [
        'async def search(subtopic):',
        '    try:',
        '        return {"status": "success", "results": await web.search(subtopic)}',
        '    except TimeoutError:',
        '        return {"status": "success", "results": []}'
      ],
      bug: [4],
      question: QFIX,
      options: [
        opt('Return structured failure: failure_type, attempted query, partial results, alternatives', 'Devolver un fallo estructurado: failure_type, consulta intentada, resultados parciales y alternativas', true, 'Lets the coordinator retry, re-scope or annotate the gap.', 'Permite al coordinador reintentar, reacotar o anotar el hueco.'),
        opt('Re-raise the exception so the coordinator stops the whole research run', 'Volver a lanzar la excepción para que el coordinador detenga toda la investigación', false, 'One failure kills all other work.', 'Un fallo mata todo el resto del trabajo.'),
        opt('Return {"status": "error", "message": "search unavailable"} to the coordinator', 'Devolver {"status": "error", "message": "search unavailable"} al coordinador', false, 'Generic status hides useful context.', 'El estado genérico oculta contexto útil.'),
        opt('Retry forever until success', 'Reintentar indefinidamente hasta que funcione', false, 'Unbounded and blocks the pipeline.', 'No tiene límite y bloquea el pipeline.')
      ],
      explain: T('Returning empty "success" on a timeout silently suppresses the error: the coordinator believes the topic has no sources. Report the failure with context.', 'Devolver un «éxito» vacío ante un timeout suprime el error en silencio: el coordinador cree que el tema no tiene fuentes. Informa del fallo con su contexto.'),
      fixed: ['        return {"status": "error", "failure_type": "timeout", "query": subtopic,', '                "partial_results": partial, "alternatives": ["narrow query", "trade press"]}']
    },
    {
      id: 'lab25', domain: 5, ts: '5.2', level: 'basic', kind: 'prompt', file: 'support_system_prompt.md',
      title: T('55% first-contact resolution', '55 % de resolución en el primer contacto'),
      context: T('The agent escalates simple damage replacements but tries to handle policy exceptions alone. These are its escalation rules.', 'El agente escala reposiciones simples por daño pero intenta resolver solo las excepciones de política. Estas son sus reglas de escalado.'),
      lines: [
        '## Escalation',
        'Escalate when the customer sentiment score is below -0.5,',
        'or when your confidence in the resolution is below 7/10.',
        'Otherwise resolve the case yourself.'
      ],
      bug: [1, 2],
      question: QFIX,
      options: [
        opt('Explicit triggers (human requested, policy gap/exception, no progress) with few-shot examples of escalate vs resolve', 'Disparadores explícitos (piden una persona, vacío/excepción en la política, sin avance) con ejemplos few-shot de escalar vs resolver', true, 'Addresses unclear decision boundaries directly.', 'Ataca directamente unos límites de decisión poco claros.'),
        opt('Lower the sentiment threshold to -0.3 so frustrated customers reach humans sooner', 'Bajar el umbral de sentimiento a -0,3 para que los clientes frustrados lleguen antes a una persona', false, 'Sentiment does not track complexity.', 'El sentimiento no refleja la complejidad.'),
        opt('Train a classifier on historical tickets that predicts which conversations need escalation before the agent starts', 'Entrenar con tickets históricos un clasificador que prediga qué conversaciones necesitan escalado antes de que empiece el agente', false, 'Over-engineered before prompt fixes.', 'Sobreingeniería antes de arreglar el prompt.'),
        opt('Raise the confidence threshold to 9/10', 'Subir el umbral de confianza a 9/10', false, 'Self-confidence is poorly calibrated.', 'La autoconfianza está mal calibrada.')
      ],
      explain: T('Sentiment and self-reported confidence are unreliable proxies. The agent is already confidently wrong on hard cases.', 'El sentimiento y la confianza autoinformada son proxies poco fiables. El agente ya se equivoca con seguridad en los casos difíciles.'),
      fixed: ['Escalate when: (1) the customer asks for a human, (2) policy is silent or needs an exception,', '(3) you cannot make progress. Examples: <example>…</example>']
    }
  ];
})();
