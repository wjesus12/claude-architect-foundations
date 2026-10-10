/* Ruta «desde cero» · Parte E — Model Context Protocol (M19–M20) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    mcp: { label: 'Skilljar · Introduction to Model Context Protocol', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol' },
    mcpadv: { label: 'Skilljar · MCP: Advanced Topics', url: 'https://anthropic.skilljar.com/model-context-protocol-advanced-topics' },
    arch: { label: 'MCP architecture (spec site)', url: 'https://modelcontextprotocol.io/docs/learn/architecture' },
    build: { label: 'Build an MCP server for Claude', url: 'https://claude.com/docs/connectors/building/index' }
  };

  CAF.addLessons([
    {
      id: 'a19', track: 'academy', domain: 0, minutes: 16, art: 'mascot', exam: ['2.2', '2.4'],
      title: T('MCP fundamentals', 'Fundamentos de MCP'),
      summary: T('The Model Context Protocol is an open standard for connecting AI applications to tools and data. A host (Claude Code, the desktop app) runs one client per server; each server exposes tools, resources and prompts over stdio or Streamable HTTP.',
                 'El Model Context Protocol es un estándar abierto para conectar aplicaciones de IA con herramientas y datos. Un host (Claude Code, la app de escritorio) ejecuta un cliente por cada servidor; cada servidor expone tools, resources y prompts por stdio o Streamable HTTP.'),
      objectives: [
        T('Explain host, client and server.', 'Explicar host, cliente y servidor.'),
        T('Tell tools, resources and prompts apart, and who controls each.', 'Distinguir tools, resources y prompts, y quién controla cada uno.'),
        T('Choose a transport and know how to build and inspect a server.', 'Elegir un transporte y saber cómo construir e inspeccionar un servidor.')
      ],
      docs: [D.arch, D.mcp, D.build],
      blocks: [
        { type: 'terms', items: [
          { term: 'host', en: 'The AI application the user works in (Claude Code, Claude Desktop, an IDE).', es: 'La aplicación de IA en la que trabaja el usuario (Claude Code, Claude Desktop, un IDE).' },
          { term: 'client', en: 'A connection the host keeps with exactly one server.', es: 'Una conexión que el host mantiene con exactamente un servidor.' },
          { term: 'server', en: 'A program that offers context and actions: local (stdio) or remote (Streamable HTTP).', es: 'Un programa que ofrece contexto y acciones: local (stdio) o remoto (Streamable HTTP).' }
        ] },
        { type: 'table', head: [T('Primitive', 'Primitiva'), T('What it is', 'Qué es'), T('Typically chosen by', 'Normalmente la elige')], rows: [
          [T('Tools', 'Tools'), T('Actions the model can call (query, create, send)', 'Acciones que el modelo puede llamar (consultar, crear, enviar)'), T('The model', 'El modelo')],
          [T('Resources', 'Resources'), T('Readable data: files, schemas, catalogs', 'Datos legibles: archivos, esquemas, catálogos'), T('The application', 'La aplicación')],
          [T('Prompts', 'Prompts'), T('Reusable templates the user picks', 'Plantillas reutilizables que elige el usuario'), T('The user', 'El usuario')]
        ] },
        { type: 'code', lang: 'python', title: 'a tiny MCP server (Python SDK)', code: `
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("docs")

@mcp.tool()
def search_docs(query: str) -> str:
    """Search the internal handbook. Use for policy or how-to questions."""
    return handbook.search(query)

@mcp.resource("docs://index")
def index() -> str:
    """Table of contents of the handbook."""
    return handbook.toc()

if __name__ == "__main__":
    mcp.run()          # stdio transport by default` },
        { type: 'table', head: [T('Transport', 'Transporte'), T('Use', 'Uso')], rows: [
          [T('stdio', 'stdio'), T('Local server launched by the host; one client; no network', 'Servidor local lanzado por el host; un cliente; sin red')],
          [T('Streamable HTTP', 'Streamable HTTP'), T('Remote server for many clients; HTTP auth, ideally OAuth', 'Servidor remoto para muchos clientes; autenticación HTTP, idealmente OAuth')]
        ] },
        { type: 'list', items: [
          T('**MCP Inspector**: a developer tool to call your server\'s tools and read its resources before connecting it to Claude.', '**MCP Inspector**: una herramienta para desarrolladores que llama a las tools y lee los resources de tu servidor antes de conectarlo a Claude.'),
          T('**Errors**: return failures with isError and useful metadata so the agent can decide to retry, explain or escalate.', '**Errores**: devuelve los fallos con isError y metadatos útiles para que el agente decida si reintenta, explica o escala.'),
          T('**Connectors** in the Claude apps are remote MCP servers; **.mcpb** desktop extensions package local ones.', '**Los conectores** de las apps de Claude son servidores MCP remotos; las extensiones **.mcpb** empaquetan servidores locales.')
        ] },
        { type: 'note', text: T('Resources are the underused primitive: exposing a catalog (a schema, a docs index, issue summaries) lets the agent see what exists without many exploratory tool calls.', 'Los resources son la primitiva menos aprovechada: exponer un catálogo (un esquema, un índice de documentación, resúmenes de issues) permite al agente ver lo que existe sin muchas llamadas exploratorias.') },
        { type: 'trap', text: T('In Claude Code, servers for the whole team go in the project `.mcp.json` with `${VAR}` for secrets; personal or experimental servers go in `~/.claude.json`. Tools from every configured server are available at the same time.', 'En Claude Code, los servidores de todo el equipo van en el `.mcp.json` del proyecto con `${VAR}` para los secretos; los personales o experimentales, en `~/.claude.json`. Las tools de todos los servidores configurados están disponibles a la vez.') }
      ],
      quiz: [
        { q: T('You want the agent to know which database tables exist without calling a tool each time. Which MCP primitive fits?', 'Quieres que el agente sepa qué tablas existen en la base de datos sin llamar a una tool cada vez. ¿Qué primitiva de MCP encaja?'),
          options: [
            opt('A resource that exposes the schema as readable content', 'Un resource que exponga el esquema como contenido legible', true, 'Resources expose catalogs and reference data.', 'Los resources exponen catálogos y datos de referencia.'),
            opt('A prompt template that the user must pick manually', 'Una plantilla de prompt que el usuario debe elegir a mano', false, 'Prompts are user-chosen templates, not data catalogs.', 'Los prompts son plantillas que elige el usuario, no catálogos.'),
            opt('A new tool that lists tables on every single request', 'Una tool nueva que liste las tablas en cada petición', false, 'That is the exploratory pattern you wanted to avoid.', 'Es justo el patrón exploratorio que querías evitar.'),
            opt('A larger context window so the whole database fits', 'Una ventana de contexto mayor para que quepa toda la base', false, 'Not a protocol design answer.', 'No es una respuesta de diseño del protocolo.')
          ] },
        { q: T('Which transport suits a server that many users reach over the internet?', '¿Qué transporte conviene a un servidor al que muchos usuarios acceden por internet?'),
          options: [
            opt('Streamable HTTP, with standard HTTP authentication such as OAuth', 'Streamable HTTP, con autenticación HTTP estándar como OAuth', true, 'Remote, multi-client servers use Streamable HTTP.', 'Los servidores remotos con muchos clientes usan Streamable HTTP.'),
            opt('stdio, because it is designed for many simultaneous remote users', 'stdio, porque está pensado para muchos usuarios remotos a la vez', false, 'stdio is for local processes.', 'stdio es para procesos locales.'),
            opt('Email, sending each tool call as a message attachment', 'El correo, enviando cada llamada como adjunto', false, 'Not an MCP transport.', 'No es un transporte de MCP.'),
            opt('Any transport, since remote servers need no authentication', 'Cualquier transporte, ya que los servidores remotos no necesitan autenticación', false, 'Remote servers should authenticate.', 'Los servidores remotos deben autenticarse.')
          ] }
      ]
    },

    {
      id: 'a20', track: 'academy', domain: 0, minutes: 13, art: 'mascot', exam: ['2.2'],
      title: T('MCP in depth: messages, client features and security', 'MCP a fondo: mensajes, funciones del cliente y seguridad'),
      summary: T('Under the hood MCP exchanges JSON-RPC messages: requests that expect a result and notifications that do not. Clients can offer features back to servers, such as asking the user for input. The protocol keeps evolving, so check the current specification.',
                 'Por debajo, MCP intercambia mensajes JSON-RPC: peticiones que esperan un resultado y notificaciones que no. Los clientes pueden ofrecer funciones a los servidores, como pedir datos al usuario. El protocolo sigue evolucionando, así que consulta la especificación vigente.'),
      objectives: [
        T('Distinguish requests, results and notifications.', 'Distinguir peticiones, resultados y notificaciones.'),
        T('Know client features: elicitation, roots, and the status of sampling.', 'Conocer las funciones del cliente: elicitation, roots y el estado de sampling.'),
        T('Apply transport choice and security basics.', 'Aplicar la elección de transporte y lo básico de seguridad.')
      ],
      docs: [D.mcpadv, D.arch],
      blocks: [
        { type: 'terms', items: [
          { term: 'request / result', en: 'A JSON-RPC message with an id that expects a matching reply (e.g. tools/list, tools/call).', es: 'Un mensaje JSON-RPC con id que espera una respuesta correspondiente (p. ej. tools/list, tools/call).' },
          { term: 'notification', en: 'A one-way message with no reply, e.g. "the tool list changed" or progress updates.', es: 'Un mensaje en una sola dirección y sin respuesta, p. ej. «cambió la lista de tools» o avisos de progreso.' },
          { term: 'elicitation', en: 'A server asks the user (through the client) for missing information or confirmation.', es: 'Un servidor pide al usuario (a través del cliente) información que falta o una confirmación.' },
          { term: 'roots', en: 'Boundaries the client gives a server, such as which folders it may work in.', es: 'Límites que el cliente da a un servidor, como en qué carpetas puede trabajar.' },
          { term: 'sampling', en: 'A server asks the client\'s model for a completion. Taught in the Skilljar course; deprecated in specification 2026-07-28.', es: 'Un servidor pide una respuesta al modelo del cliente. Se enseña en el curso de Skilljar; obsoleta en la especificación 2026-07-28.' }
        ] },
        { type: 'note', text: T('Version note: the Skilljar advanced course teaches sampling, logging notifications and stateful HTTP sessions. The 2026-07-28 specification makes the protocol stateless (each request carries its version and capabilities, with an optional server/discover call) and deprecates sampling and logging. Learn both views; the exam focuses on tool design and errors rather than protocol internals.', 'Nota de versión: el curso avanzado de Skilljar enseña sampling, notificaciones de logging y sesiones HTTP con estado. La especificación 2026-07-28 vuelve el protocolo stateless (cada petición lleva su versión y capacidades, con una llamada opcional server/discover) y marca sampling y logging como obsoletos. Aprende ambas versiones; el examen se centra en el diseño de tools y los errores, más que en los detalles internos del protocolo.') },
        { type: 'table', head: [T('Deployment need', 'Necesidad'), T('Choice', 'Elección')], rows: [
          [T('Local tool for one developer', 'Herramienta local para un desarrollador'), T('stdio', 'stdio')],
          [T('Shared service behind a load balancer', 'Servicio compartido detrás de un balanceador'), T('Streamable HTTP, stateless where possible', 'Streamable HTTP, sin estado cuando sea posible')],
          [T('Server inside a private network', 'Servidor dentro de una red privada'), T('A tunnel or private connector setup offered by the platform', 'Un túnel o conector privado que ofrezca la plataforma')]
        ] },
        { type: 'list', items: [
          T('**Least privilege**: expose only the tools a use case needs, with narrow inputs.', '**Mínimo privilegio**: expón solo las tools que el caso necesita, con entradas acotadas.'),
          T('**Treat tool output as data**: content from email, web pages or tickets may contain injected instructions.', '**Trata la salida de las tools como datos**: el contenido de correos, páginas o tickets puede traer instrucciones inyectadas.'),
          T('**Authenticate remote servers** (OAuth is recommended) and never hard-code secrets in shared config.', '**Autentica los servidores remotos** (se recomienda OAuth) y nunca escribas secretos en configuraciones compartidas.'),
          T('**Ask for approval** on risky actions; hosts can require confirmation for specific tools.', '**Pide aprobación** para acciones de riesgo; los hosts pueden exigir confirmación para tools concretas.')
        ] },
        { type: 'trap', text: T('When a question offers "return a generic error" versus "return error category, retryability and a clear message", choose the structured error. That is the MCP lesson the exam tests most.', 'Cuando una pregunta ofrece «devolver un error genérico» frente a «devolver categoría de error, si es reintentable y un mensaje claro», elige el error estructurado. Es la lección de MCP que más evalúa el examen.') }
      ],
      quiz: [
        { q: T('A server needs the user to confirm an account before continuing a tool call. Which client feature fits?', 'Un servidor necesita que el usuario confirme una cuenta antes de continuar una llamada. ¿Qué función del cliente encaja?'),
          options: [
            opt('Elicitation, where the server requests input from the user via the client', 'Elicitation, en la que el servidor pide datos al usuario a través del cliente', true, 'That is what elicitation is for.', 'Para eso existe elicitation.'),
            opt('Roots, which list the folders the server is allowed to read and write', 'Roots, que enumeran las carpetas que el servidor puede leer y escribir', false, 'Roots set boundaries, not user questions.', 'Roots fija límites, no hace preguntas al usuario.'),
            opt('A notification, which waits for the user to send a reply', 'Una notificación, que espera a que el usuario responda', false, 'Notifications expect no reply.', 'Las notificaciones no esperan respuesta.'),
            opt('A resource, which the model reads to guess the answer', 'Un resource, que el modelo lee para adivinar la respuesta', false, 'Guessing is not confirmation.', 'Adivinar no es confirmar.')
          ] },
        { q: T('What is the difference between a JSON-RPC request and a notification?', '¿Qué diferencia hay entre una petición JSON-RPC y una notificación?'),
          options: [
            opt('A request carries an id and expects a result; a notification expects no reply', 'Una petición lleva id y espera un resultado; una notificación no espera respuesta', true, 'That is the protocol distinction.', 'Esa es la distinción del protocolo.'),
            opt('A notification is always larger and must include an attachment for the reply', 'Una notificación siempre es más grande y debe incluir un adjunto para la respuesta', false, 'Size is unrelated.', 'El tamaño no tiene relación.'),
            opt('Requests are only sent by servers and never by clients', 'Las peticiones solo las envían los servidores, nunca los clientes', false, 'Both sides can send requests.', 'Ambos lados pueden enviar peticiones.'),
            opt('There is no difference; the names are interchangeable', 'No hay diferencia; los nombres son intercambiables', false, 'They behave differently.', 'Se comportan distinto.')
          ] }
      ]
    }
  ]);
})();
