/* Ruta «desde cero» · Parte D (2/2) — Funciones, RAG y elección de plataforma (M16–M18) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    api: { label: 'Skilljar · Building with the Claude API', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api' },
    platform: { label: 'Skilljar · Claude Platform 101', url: 'https://anthropic.skilljar.com/claude-platform-101' },
    caching: { label: 'Prompt caching', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching' },
    batch: { label: 'Batch processing', url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing' },
    citations: { label: 'Citations', url: 'https://platform.claude.com/docs/en/build-with-claude/citations' },
    retrieval: { label: 'Contextual Retrieval (Anthropic)', url: 'https://www.anthropic.com/news/contextual-retrieval' },
    managed: { label: 'Managed Agents overview', url: 'https://platform.claude.com/docs/en/managed-agents/overview' },
    sdk: { label: 'Agent SDK overview', url: 'https://code.claude.com/docs/en/agent-sdk/overview' }
  };

  CAF.addLessons([
    {
      id: 'a16', track: 'academy', domain: 0, minutes: 14, art: 'mascot', exam: ['4.5', '5.1'],
      title: T('Platform features: files, citations, caching, batches', 'Funciones de la plataforma: archivos, citas, caché y batches'),
      summary: T('Beyond plain text, the platform lets Claude read images and PDFs, cite the exact passages it relied on, reuse repeated prompt prefixes cheaply with caching, and process large non-urgent workloads at half price with batches.',
                 'Más allá del texto, la plataforma permite a Claude leer imágenes y PDFs, citar los pasajes exactos en que se basó, reutilizar a bajo costo los prefijos de prompt repetidos con caché y procesar grandes cargas no urgentes a mitad de precio con batches.'),
      objectives: [
        T('Know what vision, PDF support, citations and the Files API add.', 'Saber qué aportan la visión, el soporte de PDF, las citas y la Files API.'),
        T('Explain when prompt caching saves cost and latency.', 'Explicar cuándo el prompt caching ahorra costo y latencia.'),
        T('Decide when the Batches API is appropriate.', 'Decidir cuándo conviene la Batches API.')
      ],
      docs: [D.caching, D.batch, D.citations, D.api],
      blocks: [
        { type: 'terms', items: [
          { term: 'vision & PDFs', en: 'Claude reads images, charts, scanned pages and PDFs directly as input.', es: 'Claude lee directamente imágenes, gráficos, páginas escaneadas y PDFs como entrada.' },
          { term: 'citations', en: 'Answers point to the exact passages of your documents that support each claim.', es: 'Las respuestas señalan los pasajes exactos de tus documentos que respaldan cada afirmación.' },
          { term: 'Files API', en: 'Upload a file once and reference it across requests instead of re-sending it.', es: 'Subes un archivo una vez y lo referencias en varias peticiones en lugar de reenviarlo.' },
          { term: 'code execution', en: 'A sandbox where Claude runs code to analyze data or create files.', es: 'Un sandbox donde Claude ejecuta código para analizar datos o crear archivos.' }
        ] },
        { type: 'h', text: T('Prompt caching', 'Prompt caching') },
        { type: 'p', text: T('When many requests share the same beginning (a long system prompt, tool definitions, a reference document), you can mark that prefix for caching. Later requests that reuse it read it from cache at a fraction of the normal input price and with lower latency. Caching works on exact prefixes, so put stable content first and changing content last.', 'Cuando muchas peticiones comparten el mismo comienzo (un system prompt largo, definiciones de tools, un documento de referencia), puedes marcar ese prefijo para caché. Las peticiones posteriores que lo reutilizan lo leen de caché a una fracción del precio normal de entrada y con menos latencia. La caché funciona con prefijos exactos, así que pon primero el contenido estable y al final el que cambia.') },
        { type: 'h', text: T('Message Batches', 'Message Batches') },
        { type: 'table', head: [T('Property', 'Propiedad'), T('Value', 'Valor')], rows: [
          [T('Cost', 'Costo'), T('50% of the standard price', '50 % del precio estándar')],
          [T('Turnaround', 'Plazo'), T('Up to 24 hours, no latency guarantee', 'Hasta 24 horas, sin garantía de latencia')],
          [T('Matching results', 'Emparejar resultados'), T('custom_id on each request', 'custom_id en cada petición')],
          [T('Limitation', 'Limitación'), T('No multi-turn tool use within one request', 'Sin tool use de varios turnos dentro de una petición')]
        ] },
        { type: 'note', text: T('Rule of thumb: if a person is waiting for the answer, call the synchronous API; if the work can finish overnight, batch it.', 'Regla práctica: si una persona espera la respuesta, usa la API síncrona; si el trabajo puede terminar durante la noche, mándalo en batch.') },
        { type: 'trap', text: T('Exam favorite: moving a blocking pre-merge check to batches to save money is wrong; moving an overnight report is right. Result order is not a problem because custom_id matches them.', 'Clásico del examen: pasar a batch un check bloqueante previo al merge para ahorrar es incorrecto; pasar un informe nocturno es correcto. El orden de los resultados no es problema porque custom_id los empareja.') }
      ],
      quiz: [
        { q: T('Thousands of requests share the same 20-page policy document at the start of the prompt. What reduces cost most directly?', 'Miles de peticiones comparten el mismo documento de política de 20 páginas al inicio del prompt. ¿Qué reduce el costo de forma más directa?'),
          options: [
            opt('Prompt caching of that shared prefix', 'Prompt caching de ese prefijo compartido', true, 'Cached prefixes are read at a fraction of the input price.', 'Los prefijos en caché se leen a una fracción del precio de entrada.'),
            opt('Raising temperature so outputs get shorter', 'Subir la temperatura para que las salidas sean más cortas', false, 'Temperature does not reduce input cost.', 'La temperatura no reduce el costo de entrada.'),
            opt('Moving the document to the end of every prompt', 'Mover el documento al final de cada prompt', false, 'Caching needs stable content at the start.', 'La caché necesita el contenido estable al principio.'),
            opt('Splitting each request into ten smaller requests', 'Dividir cada petición en diez peticiones más pequeñas', false, 'Repeats the document even more.', 'Repite el documento todavía más.')
          ] },
        { q: T('A nightly job summarizes 50,000 documents for a report read the next morning. Which approach fits?', 'Un proceso nocturno resume 50.000 documentos para un informe que se lee a la mañana siguiente. ¿Qué enfoque encaja?'),
          options: [
            opt('The Message Batches API, matching results by custom_id', 'La Message Batches API, emparejando resultados por custom_id', true, 'Latency-tolerant and half price.', 'Tolera la latencia y cuesta la mitad.'),
            opt('Synchronous calls, because batches lose the order of results', 'Llamadas síncronas, porque los batches pierden el orden de los resultados', false, 'custom_id solves ordering.', 'custom_id resuelve el orden.'),
            opt('Streaming every request to finish faster overnight', 'Hacer streaming de cada petición para terminar antes de noche', false, 'Streaming does not reduce cost.', 'El streaming no reduce el costo.'),
            opt('A chat conversation with all documents pasted in', 'Una conversación de chat con todos los documentos pegados', false, 'Not scalable.', 'No escala.')
          ] }
      ]
    },

    {
      id: 'a17', track: 'academy', domain: 0, minutes: 13, art: 'mascot',
      title: T('RAG and agentic search', 'RAG y búsqueda agéntica'),
      summary: T('When knowledge is too large for the prompt, you retrieve only the relevant pieces. Classic RAG splits documents into chunks, finds the best matches with embeddings and keyword search, and puts them in context. Agentic search lets Claude look things up itself with tools.',
                 'Cuando el conocimiento no cabe en el prompt, recuperas solo las partes relevantes. El RAG clásico divide los documentos en fragmentos, encuentra los mejores con embeddings y búsqueda por palabras clave, y los pone en el contexto. La búsqueda agéntica deja que Claude busque por sí mismo con tools.'),
      objectives: [
        T('Describe the RAG pipeline: chunk, index, retrieve, generate.', 'Describir el pipeline de RAG: fragmentar, indexar, recuperar, generar.'),
        T('Compare semantic (embeddings) and lexical (BM25) search.', 'Comparar la búsqueda semántica (embeddings) y la léxica (BM25).'),
        T('Know when agentic search is a better fit.', 'Saber cuándo encaja mejor la búsqueda agéntica.')
      ],
      docs: [D.api, D.retrieval],
      blocks: [
        { type: 'steps', items: [
          T('**Chunk**: split documents into passages (by size, by section, or by structure).', '**Fragmentar**: dividir los documentos en pasajes (por tamaño, por sección o por estructura).'),
          T('**Index**: store an embedding (a numeric vector of meaning) for each chunk, and optionally a keyword index.', '**Indexar**: guardar un embedding (un vector numérico del significado) de cada fragmento y, opcionalmente, un índice de palabras clave.'),
          T('**Retrieve**: for each question, find the closest chunks, often combining both indexes.', '**Recuperar**: para cada pregunta, encontrar los fragmentos más cercanos, a menudo combinando ambos índices.'),
          T('**Generate**: give Claude the retrieved chunks with their sources and ask for a cited answer.', '**Generar**: darle a Claude los fragmentos recuperados con sus fuentes y pedir una respuesta con citas.')
        ] },
        { type: 'table', head: [T('Search', 'Búsqueda'), T('Strength', 'Fortaleza')], rows: [
          [T('Embeddings (semantic)', 'Embeddings (semántica)'), T('Finds passages with similar meaning even with different words', 'Encuentra pasajes de significado similar aunque usen otras palabras')],
          [T('BM25 (lexical)', 'BM25 (léxica)'), T('Exact terms, codes, product names, IDs', 'Términos exactos, códigos, nombres de producto, IDs')],
          [T('Hybrid + reranking', 'Híbrida + reranking'), T('Combines both, then reorders the best candidates', 'Combina ambas y luego reordena los mejores candidatos')]
        ] },
        { type: 'note', text: T('Anthropic\'s contextual retrieval adds a short explanation of where each chunk sits in its document before indexing, which makes retrieval noticeably more accurate.', 'El contextual retrieval de Anthropic añade a cada fragmento, antes de indexarlo, una breve explicación de dónde se ubica en su documento, lo que mejora notablemente la recuperación.') },
        { type: 'p', text: T('Agentic search takes a different route: instead of a fixed retrieval step, Claude uses tools (grep, file reads, web search, MCP queries) to explore iteratively. Claude Code finds things in a codebase this way, which is why exam questions favor Grep for content and Glob for file names.', 'La búsqueda agéntica toma otro camino: en lugar de un paso de recuperación fijo, Claude usa tools (grep, lectura de archivos, búsqueda web, consultas MCP) para explorar de forma iterativa. Así encuentra Claude Code las cosas en un codebase, y por eso las preguntas del examen prefieren Grep para contenido y Glob para nombres de archivo.') },
        { type: 'trap', text: T('Embeddings and vector databases are listed as out of scope for the exam. Study this module to understand the ecosystem, but expect exam questions about context management and provenance instead.', 'Los embeddings y las bases vectoriales figuran como fuera del temario del examen. Estudia este módulo para entender el ecosistema, pero espera preguntas sobre gestión de contexto y procedencia.') }
      ],
      quiz: [
        { q: T('Users search a manual for an error code such as "E-4471", and semantic search keeps missing it. What helps most?', 'Los usuarios buscan en un manual un código de error como «E-4471» y la búsqueda semántica no lo encuentra. ¿Qué ayuda más?'),
          options: [
            opt('Adding lexical search (BM25) alongside embeddings', 'Añadir búsqueda léxica (BM25) junto a los embeddings', true, 'Exact codes are a lexical-search strength.', 'Los códigos exactos son la fortaleza de la búsqueda léxica.'),
            opt('Making every chunk ten times longer than before', 'Hacer cada fragmento diez veces más largo que antes', false, 'Does not fix exact matching.', 'No arregla la coincidencia exacta.'),
            opt('Raising temperature during the generation step', 'Subir la temperatura en el paso de generación', false, 'Retrieval is the problem, not generation.', 'El problema es la recuperación, no la generación.'),
            opt('Removing citations from the final answer', 'Quitar las citas de la respuesta final', false, 'Unrelated and loses provenance.', 'No tiene relación y pierde la procedencia.')
          ] },
        { q: T('How does Claude Code usually find information in a codebase?', '¿Cómo suele encontrar información Claude Code en un codebase?'),
          options: [
            opt('Agentic search: iteratively using tools like Grep, Glob and Read', 'Búsqueda agéntica: usando de forma iterativa tools como Grep, Glob y Read', true, 'It explores with tools rather than a fixed index.', 'Explora con tools en lugar de un índice fijo.'),
            opt('A vector database that must be rebuilt before each session', 'Una base vectorial que hay que reconstruir antes de cada sesión', false, 'Not how Claude Code works by default.', 'Claude Code no funciona así por defecto.'),
            opt('Reading the entire repository into context at startup', 'Leyendo todo el repositorio en el contexto al arrancar', false, 'Wasteful; it reads incrementally.', 'Sería un derroche; lee de forma incremental.'),
            opt('Guessing from file names without opening any file', 'Adivinando por los nombres de archivo sin abrir ninguno', false, 'It reads and searches content.', 'Lee y busca en el contenido.')
          ] }
      ]
    },

    {
      id: 'a18', track: 'academy', domain: 0, minutes: 13, art: 'mascot', exam: ['1.3', '1.7'],
      title: T('Choosing how to build: API, Agent SDK or Managed Agents', 'Cómo construir: API, Agent SDK o Managed Agents'),
      summary: T('You can call the model directly and write your own loop, embed Claude Code\'s agent as a library with the Agent SDK, or let Anthropic host the whole agent with Managed Agents. The choice depends on how much control and infrastructure you want to own.',
                 'Puedes llamar al modelo directamente y escribir tu propio bucle, integrar el agente de Claude Code como biblioteca con el Agent SDK, o dejar que Anthropic aloje todo el agente con Managed Agents. La elección depende de cuánto control e infraestructura quieras asumir.'),
      objectives: [
        T('Compare the Messages API, Agent SDK, Managed Agents and the Claude Code CLI.', 'Comparar la Messages API, el Agent SDK, Managed Agents y la CLI de Claude Code.'),
        T('Know the Managed Agents concepts: agent, environment, session, events.', 'Conocer los conceptos de Managed Agents: agent, environment, session, events.'),
        T('Pick the right option for a scenario.', 'Elegir la opción correcta para un escenario.')
      ],
      docs: [D.managed, D.sdk, D.platform],
      blocks: [
        { type: 'table', head: [T('Option', 'Opción'), T('You get', 'Obtienes'), T('Fits when', 'Encaja cuando')], rows: [
          [T('Messages API (+ tool runner)', 'Messages API (+ tool runner)'), T('Direct model access; you write the loop', 'Acceso directo al modelo; tú escribes el bucle'), T('You need fine-grained control or a simple feature', 'Necesitas control fino o una función sencilla')],
          [T('Agent SDK (Python/TS)', 'Agent SDK (Python/TS)'), T('Claude Code\'s tools, loop, permissions, hooks and sessions as a library', 'Las tools, el bucle, los permisos, los hooks y las sesiones de Claude Code como biblioteca'), T('You want a capable agent inside your own app and process', 'Quieres un agente capaz dentro de tu propia app y proceso')],
          [T('Managed Agents', 'Managed Agents'), T('A hosted agent harness in an Anthropic cloud sandbox (or your own)', 'Un harness de agente alojado en un sandbox cloud de Anthropic (o en el tuyo)'), T('Long-running, asynchronous or scheduled work without running infrastructure', 'Trabajo largo, asíncrono o programado sin mantener infraestructura')],
          [T('Claude Code CLI', 'CLI de Claude Code'), T('The interactive terminal agent; `-p` for scripts', 'El agente interactivo en terminal; `-p` para scripts'), T('Daily development and one-off automation', 'Desarrollo diario y automatizaciones puntuales')]
        ] },
        { type: 'terms', items: [
          { term: 'agent', en: 'Managed Agents: the model, system prompt, tools, MCP servers and skills, defined once and reused.', es: 'Managed Agents: el modelo, el system prompt, las tools, los servidores MCP y las skills, definidos una vez y reutilizados.' },
          { term: 'environment', en: 'Where sessions run: an Anthropic-managed sandbox or a self-hosted one.', es: 'Dónde se ejecutan las sesiones: un sandbox gestionado por Anthropic o uno propio.' },
          { term: 'session', en: 'A running agent instance working on one task, with persistent state.', es: 'Una instancia del agente en ejecución trabajando en una tarea, con estado persistente.' },
          { term: 'events', en: 'Messages between your app and the agent, streamed back as it works; you can steer or interrupt.', es: 'Mensajes entre tu app y el agente, enviados en streaming mientras trabaja; puedes dirigirlo o interrumpirlo.' }
        ] },
        { type: 'note', text: T('All of these share one idea: a harness around the model (loop, tools, context management, permissions). M24 looks at the harness concept in depth.', 'Todas comparten una idea: un harness alrededor del modelo (bucle, tools, gestión de contexto, permisos). El M24 profundiza en el concepto de harness.') },
        { type: 'trap', text: T('The exam scenarios use the Agent SDK vocabulary: AgentDefinition, allowedTools including "Task" for subagents, hooks, sessions with resume and fork_session. Know those names even if you later choose Managed Agents in practice.', 'Los escenarios del examen usan el vocabulario del Agent SDK: AgentDefinition, allowedTools con "Task" para subagentes, hooks y sesiones con resume y fork_session. Conoce esos nombres aunque luego en la práctica elijas Managed Agents.') }
      ],
      quiz: [
        { q: T('A team wants an agent that runs for hours on a schedule, in a secure sandbox, without building or operating any infrastructure. Which option fits best?', 'Un equipo quiere un agente que funcione durante horas de forma programada, en un sandbox seguro, sin construir ni operar infraestructura. ¿Qué opción encaja mejor?'),
          options: [
            opt('Managed Agents, which hosts the harness and the sandbox for you', 'Managed Agents, que aloja por ti el harness y el sandbox', true, 'Long-running, scheduled, minimal infrastructure.', 'Largo, programado y con infraestructura mínima.'),
            opt('A hand-written loop on the Messages API on a laptop', 'Un bucle escrito a mano sobre la Messages API en un portátil', false, 'You would own the runtime and sandbox.', 'Tendrías que asumir el entorno y el sandbox.'),
            opt('The interactive Claude Code terminal left open overnight', 'La terminal interactiva de Claude Code abierta toda la noche', false, 'Not designed as hosted scheduled infrastructure.', 'No está pensada como infraestructura alojada y programada.'),
            opt('A chat conversation with a reminder to continue later', 'Una conversación de chat con un recordatorio para continuar luego', false, 'Not an autonomous scheduled agent.', 'No es un agente autónomo programado.')
          ] },
        { q: T('You want Claude Code\'s built-in tools, permissions and hooks inside your own Python service. What should you use?', 'Quieres las tools integradas, los permisos y los hooks de Claude Code dentro de tu propio servicio en Python. ¿Qué deberías usar?'),
          options: [
            opt('The Claude Agent SDK', 'El Claude Agent SDK', true, 'It exposes Claude Code\'s harness as a library.', 'Expone el harness de Claude Code como biblioteca.'),
            opt('The Message Batches API', 'La Message Batches API', false, 'Batches have no agent loop or tools mid-request.', 'Los batches no tienen bucle de agente ni tools a mitad de la petición.'),
            opt('A custom style in claude.ai', 'Un estilo personalizado en claude.ai', false, 'Unrelated to building services.', 'No tiene relación con construir servicios.'),
            opt('A connector from the Connectors Directory', 'Un conector del Connectors Directory', false, 'Connectors add tools; they are not an agent runtime.', 'Los conectores añaden tools; no son un entorno de agente.')
          ] }
      ]
    }
  ]);
})();
