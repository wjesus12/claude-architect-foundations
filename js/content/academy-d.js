/* Ruta «desde cero» · Parte D (1/2) — Messages API y tool use (M14–M15) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    api: { label: 'Skilljar · Building with the Claude API', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api' },
    platform: { label: 'Skilljar · Claude Platform 101', url: 'https://anthropic.skilljar.com/claude-platform-101' },
    msgs: { label: 'Working with the Messages API', url: 'https://platform.claude.com/docs/en/build-with-claude/working-with-messages' },
    tools: { label: 'Tool use overview', url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview' },
    runner: { label: 'Tool runner (SDK)', url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-runner' }
  };

  CAF.addLessons([
    {
      id: 'a14', track: 'academy', domain: 0, minutes: 14, art: 'mascot', exam: ['1.1'],
      title: T('The Messages API, step by step', 'La Messages API, paso a paso'),
      summary: T('Developers reach Claude through one main endpoint. A request carries the model, an output limit, optional system instructions and the conversation so far; the response carries content blocks, the reason it stopped and token counts.',
                 'Los desarrolladores llegan a Claude por un endpoint principal. Una petición lleva el modelo, un límite de salida, instrucciones de sistema opcionales y la conversación hasta ese momento; la respuesta trae bloques de contenido, el motivo por el que se detuvo y el conteo de tokens.'),
      objectives: [
        T('Read the parts of a request and a response.', 'Leer las partes de una petición y de una respuesta.'),
        T('Keep a multi-turn conversation by re-sending history.', 'Mantener una conversación de varios turnos reenviando el historial.'),
        T('Know the common parameters and where structured output fits.', 'Conocer los parámetros habituales y dónde encaja la salida estructurada.')
      ],
      docs: [D.msgs, D.platform, D.api],
      blocks: [
        { type: 'code', lang: 'python', title: 'one request, one reply', code: `
import anthropic
client = anthropic.Anthropic()   # API key from the ANTHROPIC_API_KEY variable

reply = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=800,
    system="You explain shipping terms to new sales staff.",
    messages=[{"role": "user", "content": "What does FOB mean?"}],
)
print(reply.content[0].text)
print(reply.stop_reason, reply.usage.output_tokens)` },
        { type: 'table', head: [T('Field', 'Campo'), T('Role', 'Función')], rows: [
          [T('model', 'model'), T('Which Claude model answers', 'Qué modelo de Claude responde')],
          [T('max_tokens', 'max_tokens'), T('Upper limit for output, thinking included', 'Límite superior de salida, pensamiento incluido')],
          [T('system', 'system'), T('Framing instructions for the whole exchange', 'Instrucciones que enmarcan todo el intercambio')],
          [T('messages', 'messages'), T('The alternating user/assistant history', 'El historial alterno user/assistant')],
          [T('content (response)', 'content (respuesta)'), T('A list of blocks: text, tool_use, thinking…', 'Una lista de bloques: text, tool_use, thinking…')],
          [T('stop_reason (response)', 'stop_reason (respuesta)'), T('end_turn, max_tokens, stop_sequence, tool_use…', 'end_turn, max_tokens, stop_sequence, tool_use…')],
          [T('usage (response)', 'usage (respuesta)'), T('Input and output token counts for billing and monitoring', 'Tokens de entrada y salida para facturación y seguimiento')]
        ] },
        { type: 'h', text: T('Conversations are rebuilt every turn', 'Las conversaciones se reconstruyen en cada turno') },
        { type: 'p', text: T('The API keeps no memory between calls. To continue a conversation, append Claude\'s reply as an assistant message, add the next user message, and send the whole list again. Every chat app does exactly this behind the scenes.', 'La API no guarda memoria entre llamadas. Para continuar una conversación, añades la respuesta de Claude como mensaje assistant, agregas el siguiente mensaje user y vuelves a enviar la lista completa. Todas las apps de chat hacen exactamente esto por detrás.') },
        { type: 'list', items: [
          T('**temperature** controls variety: lower for consistent extraction, higher for brainstorming.', '**temperature** controla la variedad: más baja para extracción consistente, más alta para lluvia de ideas.'),
          T('**stop_sequences** end generation when a chosen string appears.', '**stop_sequences** cortan la generación cuando aparece una cadena elegida.'),
          T('**Streaming** sends tokens as they are produced, useful for responsive interfaces (implementation details are outside the exam).', '**Streaming** envía los tokens a medida que se generan, útil para interfaces ágiles (los detalles de implementación están fuera del examen).'),
          T('**Structured output**: define a tool with a JSON schema or use the structured-output options so results are machine-readable.', '**Salida estructurada**: define una tool con un JSON schema o usa las opciones de salida estructurada para que el resultado sea legible por máquina.')
        ] },
        { type: 'note', text: T('API keys and workspaces live in the Claude Console, where you also set spend limits and test prompts in the Workbench. Official SDKs exist for Python, TypeScript and several other languages.', 'Las API keys y los workspaces se gestionan en la Claude Console, donde también fijas límites de gasto y pruebas prompts en el Workbench. Hay SDKs oficiales para Python, TypeScript y varios lenguajes más.') },
        { type: 'trap', text: T('stop_reason is the signal that drives agent loops (M15). "max_tokens" means the output was cut short, not that the task finished.', 'stop_reason es la señal que mueve los bucles de agentes (M15). «max_tokens» significa que la salida se cortó, no que la tarea terminó.') }
      ],
      quiz: [
        { q: T('Your app sends only the newest user message each turn, and Claude keeps losing track of earlier details. Why?', 'Tu app envía solo el mensaje más reciente del usuario en cada turno, y Claude pierde los detalles anteriores. ¿Por qué?'),
          options: [
            opt('The API is stateless, so the full history must be sent with every call', 'La API no guarda estado, así que hay que enviar todo el historial en cada llamada', true, 'Context exists only in what you send.', 'El contexto solo existe en lo que envías.'),
            opt('The model deletes earlier details on purpose after each reply', 'El modelo borra a propósito los detalles anteriores tras cada respuesta', false, 'It never had them; they were not sent.', 'Nunca los tuvo: no se enviaron.'),
            opt('max_tokens is too high, which erases previous context', 'max_tokens es demasiado alto, lo que borra el contexto previo', false, 'max_tokens limits output only.', 'max_tokens solo limita la salida.'),
            opt('The system prompt must repeat every past message in capitals', 'El system prompt debe repetir cada mensaje pasado en mayúsculas', false, 'History goes in messages, not shouted in system.', 'El historial va en messages, no gritado en system.')
          ] },
        { q: T('Which field tells you whether Claude finished naturally or ran out of output room?', '¿Qué campo te dice si Claude terminó con normalidad o se quedó sin espacio de salida?'),
          options: [
            opt('stop_reason, with values such as end_turn or max_tokens', 'stop_reason, con valores como end_turn o max_tokens', true, 'That is exactly its purpose.', 'Ese es exactamente su propósito.'),
            opt('temperature, which rises when the answer is incomplete', 'temperature, que sube cuando la respuesta queda incompleta', false, 'temperature is an input setting.', 'temperature es un ajuste de entrada.'),
            opt('model, which changes name when the output is truncated', 'model, que cambia de nombre cuando la salida se trunca', false, 'The model field does not change.', 'El campo model no cambia.'),
            opt('system, which is echoed back with a completion flag', 'system, que se devuelve con una marca de finalización', false, 'No such behavior.', 'No existe tal comportamiento.')
          ] }
      ]
    },

    {
      id: 'a15', track: 'academy', domain: 0, minutes: 16, art: 'mascot', exam: ['1.1', '2.1', '2.3'],
      title: T('Tool use: giving Claude hands', 'Tool use: darle manos a Claude'),
      summary: T('Tools let Claude ask your code to do things: look up an order, query a database, send a message. You describe each tool with a name, a description and a JSON schema; Claude replies with a tool_use block; you run it and return a tool_result. Repeating that is an agent loop.',
                 'Las tools permiten a Claude pedir a tu código que haga cosas: consultar un pedido, buscar en una base de datos, enviar un mensaje. Describes cada tool con un nombre, una descripción y un JSON schema; Claude responde con un bloque tool_use; tú la ejecutas y devuelves un tool_result. Repetir eso es un bucle de agente.'),
      objectives: [
        T('Define a tool and handle tool_use / tool_result.', 'Definir una tool y manejar tool_use / tool_result.'),
        T('Tell client tools from Anthropic-hosted server tools.', 'Distinguir las tools del cliente de las tools de servidor alojadas por Anthropic.'),
        T('Use tool_choice and know what the SDK tool runner automates.', 'Usar tool_choice y saber qué automatiza el tool runner del SDK.')
      ],
      docs: [D.tools, D.runner, D.platform, D.api],
      blocks: [
        { type: 'code', lang: 'json', title: 'a tool definition', code: `
{
  "name": "get_order_status",
  "description": "Look up ONE order by its number (e.g. A-1042) and return status, carrier and ETA. Use for shipping or delivery questions. Not for refunds.",
  "input_schema": {
    "type": "object",
    "properties": { "order_number": { "type": "string" } },
    "required": ["order_number"]
  }
}` },
        { type: 'steps', items: [
          T('You send the user request plus the tool definitions.', 'Envías la petición del usuario junto con las definiciones de tools.'),
          T('Claude answers with stop_reason "tool_use" and a tool_use block naming the tool and its input.', 'Claude responde con stop_reason "tool_use" y un bloque tool_use con el nombre de la tool y su entrada.'),
          T('Your code runs the tool and sends back a tool_result that references the tool_use id.', 'Tu código ejecuta la tool y devuelve un tool_result que referencia el id del tool_use.'),
          T('Claude continues; when it no longer needs tools it ends with "end_turn".', 'Claude continúa; cuando ya no necesita tools termina con "end_turn".')
        ] },
        { type: 'table', head: [T('Kind', 'Tipo'), T('Who runs it', 'Quién la ejecuta'), T('Examples', 'Ejemplos')], rows: [
          [T('Client tools', 'Tools del cliente'), T('Your application', 'Tu aplicación'), T('Your database, CRM, internal APIs', 'Tu base de datos, CRM, APIs internas')],
          [T('Server tools', 'Tools de servidor'), T('Anthropic, inside the API', 'Anthropic, dentro de la API'), T('Web search, web fetch, code execution', 'Búsqueda web, lectura web, ejecución de código')],
          [T('MCP tools', 'Tools MCP'), T('An MCP server you connect', 'Un servidor MCP que conectas'), T('Connectors for GitHub, Slack, Drive…', 'Conectores de GitHub, Slack, Drive…')]
        ] },
        { type: 'list', items: [
          T('**tool_choice**: "auto" (Claude decides), "any" (must call some tool), or a specific tool by name.', '**tool_choice**: "auto" (Claude decide), "any" (debe llamar a alguna tool) o una tool concreta por nombre.'),
          T('**Parallel calls**: Claude can request several tools in one response; return all results together.', '**Llamadas en paralelo**: Claude puede pedir varias tools en una respuesta; devuelve todos los resultados juntos.'),
          T('**Tool runner**: the SDK can drive the loop for you once you understand it; Claude Platform 101 builds the loop by hand first.', '**Tool runner**: el SDK puede llevar el bucle por ti cuando ya lo entiendes; Claude Platform 101 lo construye primero a mano.')
        ] },
        { type: 'note', text: T('The description is how Claude chooses between tools. Say what the tool does, what input it expects, and when to use a different tool instead.', 'La descripción es cómo Claude elige entre tools. Di qué hace la tool, qué entrada espera y cuándo usar otra en su lugar.') },
        { type: 'trap', text: T('The exam\'s whole Domain 1 starts here: continue while stop_reason is "tool_use", stop on "end_turn", always return tool results into the history. Parsing the text for "done" is the classic wrong option.', 'Todo el dominio 1 del examen empieza aquí: continuar mientras stop_reason sea "tool_use", parar con "end_turn" y devolver siempre los resultados al historial. Buscar «done» en el texto es la opción incorrecta clásica.') }
      ],
      quiz: [
        { q: T('Claude returns stop_reason "tool_use" with a call to get_order_status. What must your code do next?', 'Claude devuelve stop_reason "tool_use" con una llamada a get_order_status. ¿Qué debe hacer tu código a continuación?'),
          options: [
            opt('Run the tool and send back a tool_result that references the tool_use id', 'Ejecutar la tool y devolver un tool_result que referencie el id del tool_use', true, 'That closes the step so Claude can continue.', 'Eso cierra el paso para que Claude continúe.'),
            opt('Show the tool call to the user as the final answer and stop', 'Mostrar la llamada a la tool al usuario como respuesta final y detenerse', false, 'The task is not finished yet.', 'La tarea aún no ha terminado.'),
            opt('Resend the same request until stop_reason becomes end_turn', 'Reenviar la misma petición hasta que stop_reason sea end_turn', false, 'Without the result, Claude cannot progress.', 'Sin el resultado, Claude no puede avanzar.'),
            opt('Delete the conversation history to free space for the result before replying', 'Borrar el historial de la conversación para hacer sitio al resultado antes de responder', false, 'History is needed for coherence.', 'El historial es necesario para la coherencia.')
          ] },
        { q: T('You need Claude to always return data through one of three extraction tools, letting it pick which. Which tool_choice fits?', 'Necesitas que Claude siempre devuelva datos mediante una de tres tools de extracción, dejándole elegir cuál. ¿Qué tool_choice encaja?'),
          options: [
            opt('"any", which requires a tool call but lets Claude choose the tool', '"any", que exige llamar a una tool pero deja que Claude elija cuál', true, 'Guarantees a tool call with flexible selection.', 'Garantiza una llamada con selección flexible.'),
            opt('"auto", which guarantees that a tool will always be called', '"auto", que garantiza que siempre se llamará a una tool', false, 'auto allows a plain text reply.', 'auto permite responder solo con texto.'),
            opt('Forcing the first extraction tool for every single document', 'Forzar la primera tool de extracción para todos los documentos', false, 'Wrong schema for the other document types.', 'Schema equivocado para los otros tipos de documento.'),
            opt('Removing all tools and asking for JSON in the prompt text', 'Quitar todas las tools y pedir JSON en el texto del prompt', false, 'Less reliable than tool use.', 'Menos fiable que tool use.')
          ] }
      ]
    }
  ]);
})();
