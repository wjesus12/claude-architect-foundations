/* Ruta «desde cero» · Parte A — Fundamentos (M01–M05) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    models: { label: 'Models overview', url: 'https://platform.claude.com/docs/en/about-claude/models/overview' },
    choose: { label: 'Choosing a model', url: 'https://platform.claude.com/docs/en/about-claude/models/choosing-a-model' },
    effort: { label: 'Effort', url: 'https://platform.claude.com/docs/en/build-with-claude/effort' },
    thinking: { label: 'Thinking', url: 'https://platform.claude.com/docs/en/build-with-claude/thinking' },
    ctx: { label: 'Context windows', url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows' },
    intro: { label: 'Intro to Claude', url: 'https://platform.claude.com/docs/en/intro' }
  };
  const C = { claude101: 'https://anthropic.skilljar.com/claude-101', fluency: 'https://anthropic.skilljar.com/ai-fluency-framework-foundations', limits: 'https://anthropic.skilljar.com/ai-capabilities-and-limitations' };

  CAF.addLessons([
    /* ================================================== M01 */
    {
      id: 'a01', track: 'academy', domain: 0, minutes: 15, art: 'mascot', exam: ['0'],
      title: T('What Claude is (and what it is not)', 'Qué es Claude (y qué no es)'),
      summary: T('Claude is a family of large language models (LLMs) built by Anthropic. It predicts text one token at a time, reasons over everything in its context window, and can act in the world only through the tools you give it.',
                 'Claude es una familia de modelos de lenguaje grandes (LLM) creada por Anthropic. Predice texto token a token, razona sobre todo lo que hay en su ventana de contexto y solo puede actuar en el mundo a través de las herramientas que le das.'),
      objectives: [
        T('Explain tokens, the context window and the knowledge cutoff in plain words.', 'Explicar con palabras sencillas qué son los tokens, la ventana de contexto y la fecha de corte de conocimiento.'),
        T('Separate what the model knows from what tools let it do.', 'Separar lo que el modelo sabe de lo que las herramientas le permiten hacer.'),
        T('Recognize the main limitations: hallucination, stale knowledge, no memory by default.', 'Reconocer las limitaciones principales: alucinación, conocimiento desactualizado y ausencia de memoria por defecto.')
      ],
      docs: [D.intro, D.ctx, { label: 'Skilljar · Claude 101', url: C.claude101 }, { label: 'Skilljar · AI Capabilities and Limitations', url: C.limits }],
      blocks: [
        { type: 'h', text: T('How a language model works', 'Cómo funciona un modelo de lenguaje') },
        { type: 'p', text: T('An LLM was trained on a very large amount of text to predict what comes next. Text is split into **tokens** (pieces of words). Each reply is generated token by token, conditioned on everything the model can currently "see": the system prompt, the conversation, files, tool results. That visible material is the **context window**.',
                             'Un LLM se entrenó con una cantidad enorme de texto para predecir lo que viene después. El texto se divide en **tokens** (trozos de palabras). Cada respuesta se genera token a token, condicionada por todo lo que el modelo «ve» en ese momento: el system prompt, la conversación, los archivos y los resultados de herramientas. Ese material visible es la **ventana de contexto**.') },
        { type: 'terms', items: [
          { term: 'token', en: 'The unit the model reads and writes. Roughly ¾ of an English word; pricing and limits are counted in tokens.', es: 'La unidad que el modelo lee y escribe. Aproximadamente ¾ de una palabra en inglés; precios y límites se cuentan en tokens.' },
          { term: 'context window', en: 'Everything the model can attend to in one request. Current Claude models have 1M tokens.', es: 'Todo lo que el modelo puede atender en una petición. Los modelos Claude actuales tienen 1M de tokens.' },
          { term: 'knowledge cutoff', en: 'The date after which the model has no trained knowledge. Newer facts must come from tools or from you.', es: 'La fecha a partir de la cual el modelo no tiene conocimiento entrenado. Lo más nuevo debe llegar por herramientas o por ti.' },
          { term: 'stateless', en: 'The API does not remember past requests. Apps re-send the conversation each turn.', es: 'La API no recuerda peticiones anteriores. Las apps reenvían la conversación en cada turno.' }
        ] },
        { type: 'h', text: T('Knowledge vs tools', 'Conocimiento vs herramientas') },
        { type: 'compare',
          bad: { title: T('The model alone', 'El modelo solo'), items: [
            T('Knows what it learned in training, up to its cutoff', 'Sabe lo que aprendió al entrenarse, hasta su fecha de corte'),
            T('Cannot browse, run code, or read your files', 'No puede navegar, ejecutar código ni leer tus archivos'),
            T('Can sound confident while being wrong', 'Puede sonar seguro aunque se equivoque')
          ] },
          good: { title: T('The model + tools', 'El modelo + herramientas'), items: [
            T('Web search and fetch bring fresh information', 'La búsqueda y lectura web traen información actual'),
            T('Code execution, files and connectors let it act', 'La ejecución de código, los archivos y los conectores le permiten actuar'),
            T('Results come back into context, so it can check itself', 'Los resultados vuelven al contexto, así que puede comprobarse')
          ] } },
        { type: 'h', text: T('Strengths and limits', 'Fortalezas y límites') },
        { type: 'list', items: [
          T('**Strong at**: writing and editing, summarizing, analysis, coding, reasoning through multi-step problems, working across languages, reading images and PDFs.', '**Destaca en**: redactar y editar, resumir, analizar, programar, razonar problemas de varios pasos, trabajar entre idiomas, leer imágenes y PDFs.'),
          T('**Hallucination**: it can produce plausible but false details, especially citations, numbers and niche facts. Ask for sources and verify.', '**Alucinación**: puede producir detalles plausibles pero falsos, sobre todo citas, cifras y datos de nicho. Pide fuentes y verifica.'),
          T('**No memory by default**: each API request starts fresh; memory features in the apps are explicit products, not magic.', '**Sin memoria por defecto**: cada petición a la API empieza de cero; las funciones de memoria de las apps son productos explícitos, no magia.'),
          T('**Context is finite**: very long sessions degrade; good tools manage context for you (compaction, summaries, subagents).', '**El contexto es finito**: las sesiones muy largas se degradan; las buenas herramientas gestionan el contexto por ti (compactación, resúmenes, subagentes).')
        ] },
        { type: 'note', text: T('Everything in this training builds on one idea: Claude only knows what is in its context. Prompts, tools, files, MCP, skills and agents are all different ways of putting the right information in front of it at the right moment.', 'Todo este entrenamiento se apoya en una idea: Claude solo sabe lo que está en su contexto. Prompts, herramientas, archivos, MCP, skills y agentes son distintas formas de poner la información correcta delante de él en el momento adecuado.') },
        { type: 'p', text: T('Anthropic trains Claude to be helpful, honest and harmless, and publishes how it shapes Claude\'s values (its constitution). Training methods are outside the exam, but knowing that refusals and caution are designed behaviors helps you write better requests.', 'Anthropic entrena a Claude para ser útil, honesto e inofensivo, y publica cómo moldea sus valores (su constitución). Los métodos de entrenamiento están fuera del examen, pero saber que las negativas y la cautela son comportamientos diseñados te ayuda a pedir mejor.') }
      ],
      quiz: [
        { q: T('You ask Claude about an event from last week and it answers vaguely. What is the most likely reason?', 'Le preguntas a Claude por algo que pasó la semana pasada y responde de forma vaga. ¿Cuál es la razón más probable?'),
          options: [
            opt('The event is after its knowledge cutoff and no search tool was used', 'El suceso es posterior a su fecha de corte y no se usó ninguna herramienta de búsqueda', true, 'Fresh facts need tools or user-provided context.', 'Los hechos recientes necesitan herramientas o contexto que aportes tú.'),
            opt('The context window was too small to hold a single question or its answer', 'La ventana de contexto era demasiado pequeña para una sola pregunta ni su respuesta', false, 'One question uses a tiny fraction of 1M tokens.', 'Una pregunta usa una fracción mínima de 1M de tokens.'),
            opt('Claude refuses to discuss any news by design', 'Claude se niega por diseño a hablar de cualquier noticia', false, 'It can discuss news, it just lacks post-cutoff facts.', 'Puede hablar de noticias; simplemente no tiene datos posteriores a su corte.'),
            opt('The model forgot the event because the API is stateless', 'El modelo olvidó el suceso porque la API no guarda estado', false, 'Statelessness is about past requests, not world knowledge.', 'No guardar estado se refiere a peticiones previas, no al conocimiento del mundo.')
          ] },
        { q: T('Which statement about the context window is correct?', '¿Qué afirmación sobre la ventana de contexto es correcta?'),
          options: [
            opt('It is everything the model can attend to in a single request', 'Es todo lo que el modelo puede atender en una sola petición', true, 'That is the definition.', 'Esa es la definición.'),
            opt('It is a permanent memory that persists across all conversations', 'Es una memoria permanente que persiste entre todas las conversaciones', false, 'It is per request; nothing persists automatically.', 'Es por petición; nada persiste automáticamente.'),
            opt('It only counts the user messages, not files or tool results', 'Solo cuenta los mensajes del usuario, no los archivos ni los resultados de herramientas', false, 'Files, tools and system prompt all count.', 'Archivos, herramientas y system prompt también cuentan.'),
            opt('It limits only how long the final answer can be', 'Solo limita lo larga que puede ser la respuesta final', false, 'Output has its own max_tokens limit.', 'La salida tiene su propio límite max_tokens.')
          ] }
      ]
    },

    /* ================================================== M02 */
    {
      id: 'a02', track: 'academy', domain: 0, minutes: 14, art: 'mascot',
      title: T('The Claude model family (2026)', 'La familia de modelos Claude (2026)'),
      summary: T('Four current models share the same abilities (text and image input, tools, 1M context) but trade speed, depth and cost: Fable 5.1, Opus 5.5, Sonnet 5.5 and Haiku 5.5. Picking a model is an engineering decision you validate with your own examples.',
                 'Cuatro modelos actuales comparten las mismas capacidades (entrada de texto e imagen, herramientas, 1M de contexto) pero equilibran de forma distinta velocidad, profundidad y costo: Fable 5.1, Opus 5.5, Sonnet 5.5 y Haiku 5.5. Elegir modelo es una decisión de ingeniería que validas con tus propios ejemplos.'),
      objectives: [
        T('Describe each current model and when to reach for it.', 'Describir cada modelo actual y cuándo recurrir a él.'),
        T('Read a model ID and know where it applies.', 'Leer un ID de modelo y saber dónde se usa.'),
        T('Choose a model by evaluating cost, latency and quality on your own task.', 'Elegir modelo evaluando costo, latencia y calidad en tu propia tarea.')
      ],
      docs: [D.models, D.choose],
      blocks: [
        { type: 'table', head: [T('Model', 'Modelo'), T('Best for', 'Ideal para'), T('Latency', 'Latencia'), T('Price (in / out per MTok)', 'Precio (entrada / salida por MTok)'), T('Default effort', 'Effort por defecto')], rows: [
          [T('Claude Fable 5.1', 'Claude Fable 5.1'), T('Demanding reasoning and long-horizon agentic work', 'Razonamiento exigente y trabajo agéntico de largo recorrido'), T('Slower', 'Más lenta'), T('$10 / $50', '$10 / $50'), T('high', 'high')],
          [T('Claude Opus 5.5', 'Claude Opus 5.5'), T('Long-running agentic coding and knowledge work; the recommended starting point', 'Programación agéntica larga y trabajo de conocimiento; el punto de partida recomendado'), T('Moderate', 'Moderada'), T('$4 / $20', '$4 / $20'), T('medium', 'medium')],
          [T('Claude Sonnet 5.5', 'Claude Sonnet 5.5'), T('Best combination of speed and intelligence', 'La mejor combinación de velocidad e inteligencia'), T('Fast', 'Rápida'), T('$2 / $10', '$2 / $10'), T('high', 'high')],
          [T('Claude Haiku 5.5', 'Claude Haiku 5.5'), T('High-volume, latency-sensitive work: classification, extraction, routing, subagents', 'Alto volumen y baja latencia: clasificación, extracción, enrutado, subagentes'), T('Fastest', 'La más rápida'), T('from $0.10 / $0.50', 'desde $0.10 / $0.50'), T('medium', 'medium')]
        ] },
        { type: 'note', text: T('All four: text + image input, text output, tool use, vision, multilingual, **1M-token context**, **128K max output** (synchronous API), reliable knowledge through **June 2026**. Prices are from the official docs at the time of writing; always check the pricing page.', 'Los cuatro: entrada de texto + imagen, salida de texto, tool use, visión, multilingüe, **contexto de 1M de tokens**, **salida máxima de 128K** (API síncrona), conocimiento fiable hasta **junio de 2026**. Los precios son de la documentación oficial al momento de escribir esto; consulta siempre la página de precios.') },
        { type: 'h', text: T('Model IDs', 'IDs de modelo') },
        { type: 'code', lang: 'json', title: 'Claude API request', code: `
{
  "model": "claude-opus-5-5",
  "max_tokens": 4096,
  "messages": [{ "role": "user", "content": "Hello, Claude" }]
}`,
          caption: T('Current IDs are dateless pinned snapshots: claude-fable-5-1, claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5. Bedrock prefixes them with anthropic.; Google Cloud, Microsoft Foundry and Claude Platform on AWS use the same IDs.', 'Los IDs actuales son snapshots fijos sin fecha: claude-fable-5-1, claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5. Bedrock les antepone anthropic.; Google Cloud, Microsoft Foundry y Claude Platform on AWS usan los mismos IDs.') },
        { type: 'h', text: T('How to choose', 'Cómo elegir') },
        { type: 'steps', items: [
          T('**Start with Opus 5.5** for most workloads, as the docs recommend.', '**Empieza con Opus 5.5** para la mayoría de cargas, como recomienda la documentación.'),
          T('**Build a small eval set** of real examples with expected outcomes.', '**Arma un pequeño conjunto de evaluación** con ejemplos reales y resultados esperados.'),
          T('**Move down** (Sonnet, Haiku) or lower effort when quality holds and speed or cost matter; **move up** (Fable 5.1 or higher effort) when your evals still fall short.', '**Baja** (Sonnet, Haiku) o reduce el effort cuando la calidad se mantiene y pesan la velocidad o el costo; **sube** (Fable 5.1 o más effort) cuando tus evaluaciones siguen quedándose cortas.'),
          T('**Mix models in one system**: a strong model to plan, fast models for many small subtasks.', '**Combina modelos en un mismo sistema**: uno potente para planificar y modelos rápidos para muchas subtareas pequeñas.')
        ] },
        { type: 'p', text: T('Older models (Fable 5, Opus 5, Opus 4.x, Sonnet 5, Sonnet 4.6, Haiku 4.5) remain available as legacy. Each model has a retirement date no sooner than a published commitment, so production systems should plan migrations. The Models API returns each model\'s limits and capabilities programmatically.', 'Los modelos anteriores (Fable 5, Opus 5, Opus 4.x, Sonnet 5, Sonnet 4.6, Haiku 4.5) siguen disponibles como legacy. Cada modelo tiene una fecha de retiro no anterior a un compromiso publicado, así que los sistemas en producción deben planificar migraciones. La Models API devuelve por programa los límites y capacidades de cada modelo.') },
        { type: 'trap', text: T('Exam questions rarely ask for prices, but they do reward the reasoning: "a larger model" is almost never the fix for a design problem (bad tool descriptions, missing context, attention dilution).', 'Las preguntas del examen casi nunca piden precios, pero sí premian el razonamiento: «un modelo más grande» casi nunca arregla un problema de diseño (descripciones de tools malas, contexto que falta, dilución de la atención).') }
      ],
      quiz: [
        { q: T('You classify 2 million support tickets per day into 12 categories and need low latency. Which model is the natural first candidate?', 'Clasificas 2 millones de tickets al día en 12 categorías y necesitas baja latencia. ¿Qué modelo es el candidato natural para empezar?'),
          options: [
            opt('Claude Haiku 5.5, then confirm accuracy with an eval set', 'Claude Haiku 5.5, y luego confirmar la precisión con un set de evaluación', true, 'High-volume, latency-sensitive classification is Haiku\'s target.', 'La clasificación de alto volumen y baja latencia es el objetivo de Haiku.'),
            opt('Claude Fable 5.1 at max effort, to be safe on every ticket', 'Claude Fable 5.1 con effort max, para ir seguro en cada ticket', false, 'Slowest and most expensive for a simple, high-volume task.', 'Es lo más lento y caro para una tarea simple de alto volumen.'),
            opt('Any model, since they all have identical speed and price', 'Cualquier modelo, ya que todos tienen la misma velocidad y precio', false, 'They differ a lot in latency and price.', 'Difieren mucho en latencia y precio.'),
            opt('A legacy model, because new models cannot classify text', 'Un modelo legacy, porque los modelos nuevos no saben clasificar texto', false, 'False premise.', 'Premisa falsa.')
          ] },
        { q: T('What does the official documentation recommend as the default starting model for most workloads?', '¿Qué modelo recomienda la documentación oficial como punto de partida para la mayoría de cargas?'),
          options: [
            opt('Claude Opus 5.5, adjusting model and effort based on your evals', 'Claude Opus 5.5, ajustando modelo y effort según tus evaluaciones', true, 'Exactly the docs\' guidance.', 'Es justo lo que indica la documentación.'),
            opt('Claude Haiku 5.5, upgrading only if a customer complains', 'Claude Haiku 5.5, subiendo solo si un cliente se queja', false, 'Not the recommendation; evals should drive choices.', 'No es la recomendación; deben guiarte las evaluaciones.'),
            opt('Whichever model has the most recent release date', 'El modelo con la fecha de lanzamiento más reciente', false, 'Recency is not a selection method.', 'Lo reciente no es un método de selección.'),
            opt('Claude Fable 5.1 for everything, since it is the most capable', 'Claude Fable 5.1 para todo, ya que es el más capaz', false, 'Reserved for demanding work; costly as a default.', 'Se reserva para trabajo exigente; es caro como opción por defecto.')
          ] }
      ]
    },

    /* ================================================== M03 */
    {
      id: 'a03', track: 'academy', domain: 0, minutes: 15, art: 'mascot',
      title: T('Thinking and effort', 'Pensamiento y effort'),
      summary: T('Current Claude models use **adaptive thinking**: they decide when and how much to reason before answering. You steer that with the **effort** parameter (low, medium, high, xhigh, max), which affects thinking, tool calls and text alike.',
                 'Los modelos Claude actuales usan **adaptive thinking**: deciden cuándo y cuánto razonar antes de responder. Tú lo diriges con el parámetro **effort** (low, medium, high, xhigh, max), que afecta por igual al pensamiento, a las llamadas a herramientas y al texto.'),
      objectives: [
        T('Explain adaptive thinking and how it replaced manual thinking budgets.', 'Explicar el adaptive thinking y cómo reemplazó a los presupuestos de pensamiento manuales.'),
        T('Pick an effort level for a task and set it in the API.', 'Elegir un nivel de effort para una tarea y configurarlo en la API.'),
        T('Account for thinking in max_tokens and cost.', 'Tener en cuenta el pensamiento en max_tokens y en el costo.')
      ],
      docs: [D.thinking, D.effort],
      blocks: [
        { type: 'table', head: [T('Effort', 'Effort'), T('What it means', 'Qué significa'), T('Typical use', 'Uso típico')], rows: [
          [T('low', 'low'), T('Most efficient; terse, fewer tool calls', 'Lo más eficiente; respuestas breves y menos llamadas a tools'), T('Simple, fast, high-volume tasks; subagents', 'Tareas simples, rápidas y de alto volumen; subagentes')],
          [T('medium', 'medium'), T('Balanced; default on Opus 5.5 and Haiku 5.5', 'Equilibrado; por defecto en Opus 5.5 y Haiku 5.5'), T('Agentic work balancing speed, cost and quality', 'Trabajo agéntico que equilibra velocidad, costo y calidad')],
          [T('high', 'high'), T('As many tokens as the task needs; default on Fable 5.1 and Sonnet 5.5', 'Tantos tokens como la tarea necesite; por defecto en Fable 5.1 y Sonnet 5.5'), T('Complex reasoning, hard coding problems', 'Razonamiento complejo, problemas de código difíciles')],
          [T('xhigh', 'xhigh'), T('Extended capability for long-horizon work', 'Capacidad extendida para trabajo de largo recorrido'), T('Agentic or coding runs over 30 minutes', 'Ejecuciones agénticas o de código de más de 30 minutos')],
          [T('max', 'max'), T('No constraint on token spending', 'Sin límite de gasto de tokens'), T('Frontier problems where depth beats cost', 'Problemas de frontera donde la profundidad vale más que el costo')]
        ] },
        { type: 'code', lang: 'python', title: 'set effort', code: `
response = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=16000,          # thinking + answer must fit here
    output_config={"effort": "medium"},
    messages=[{"role": "user", "content": "Compare these two database designs..."}],
)` },
        { type: 'list', items: [
          T('**Effort is a behavioral signal, not a hard budget.** At low effort Claude still thinks on hard problems, just less.', '**El effort es una señal de comportamiento, no un presupuesto estricto.** Con effort bajo Claude sigue pensando en problemas difíciles, solo que menos.'),
          T('**Thinking counts toward max_tokens.** At high effort and above, give a large max_tokens.', '**El pensamiento cuenta dentro de max_tokens.** Con effort alto o superior, da un max_tokens amplio.'),
          T('**On Fable 5.1 and Opus 5.5 adaptive thinking is always on**; effort is your main control. Some models let you reduce up-front thinking (e.g. Sonnet 5.5 with `thinking: {"type": "between_tools"}`).', '**En Fable 5.1 y Opus 5.5 el adaptive thinking siempre está activo**; el effort es tu control principal. Algunos modelos permiten reducir el pensamiento inicial (p. ej. Sonnet 5.5 con `thinking: {"type": "between_tools"}`).'),
          T('**Extended thinking** (manual `budget_tokens`) is the older mode: deprecated on the 4.6 generation and not accepted on later models.', '**Extended thinking** (con `budget_tokens` manual) es el modo antiguo: obsoleto en la generación 4.6 y no aceptado en modelos posteriores.'),
          T('**Changing effort mid-conversation**: newer models support a per-message effort change (beta) that preserves the prompt cache; changing the top-level value resets the cache.', '**Cambiar el effort a mitad de conversación**: los modelos nuevos admiten un cambio por mensaje (beta) que conserva el prompt cache; cambiar el valor general reinicia la caché.')
        ] },
        { type: 'note', text: T('In the Claude apps you usually pick the model (and, depending on your plan and surface, an effort or thinking level) from the model selector. In Claude Code, `/model` and effort settings do the same job. The principle is identical: spend more thinking where the task deserves it.', 'En las apps de Claude normalmente eliges el modelo (y, según tu plan y la superficie, un nivel de effort o pensamiento) en el selector de modelo. En Claude Code, `/model` y los ajustes de effort hacen lo mismo. El principio es idéntico: gasta más pensamiento donde la tarea lo merece.') },
        { type: 'trap', text: T('The exam guide still mentions "extended thinking" when comparing review strategies: an independent reviewer beats self-review "or extended thinking" in the same session. The lesson holds with adaptive thinking too: more thinking inside the same biased context is not independent review.', 'La guía del examen aún menciona «extended thinking» al comparar estrategias de revisión: un revisor independiente gana a la autorrevisión «o al extended thinking» en la misma sesión. La lección vale también con adaptive thinking: más pensamiento dentro del mismo contexto sesgado no es una revisión independiente.') }
      ],
      quiz: [
        { q: T('Your subagents perform many short, well-defined lookups and you want them fast and cheap. Which effort fits best?', 'Tus subagentes hacen muchas consultas cortas y bien definidas y los quieres rápidos y baratos. ¿Qué effort encaja mejor?'),
          options: [
            opt('low, after checking on your evals that quality holds', 'low, tras comprobar en tus evaluaciones que la calidad se mantiene', true, 'Low effort targets simple, fast tasks such as subagents.', 'El effort bajo está pensado para tareas simples y rápidas como los subagentes.'),
            opt('max, because subagents must never make mistakes', 'max, porque los subagentes nunca deben equivocarse', false, 'Max adds large cost for simple lookups.', 'Max añade mucho costo a consultas simples.'),
            opt('xhigh, because it is designed for very short requests', 'xhigh, porque está pensado para peticiones muy cortas', false, 'xhigh is for long-horizon work.', 'xhigh es para trabajo de largo recorrido.'),
            opt('None; effort cannot be set for subagents in any product', 'Ninguno; el effort no se puede configurar para subagentes en ningún producto', false, 'Effort is configurable per request and per skill/subagent in many tools.', 'El effort se configura por petición, y en muchas herramientas por skill o subagente.')
          ] },
        { q: T('A request at high effort returns a truncated answer. What should you check first?', 'Una petición con effort alto devuelve una respuesta truncada. ¿Qué deberías revisar primero?'),
          options: [
            opt('Whether max_tokens leaves room for both thinking and the answer', 'Si max_tokens deja espacio tanto para el pensamiento como para la respuesta', true, 'Thinking counts toward max_tokens.', 'El pensamiento cuenta dentro de max_tokens.'),
            opt('Whether the model supports text output, since some do not', 'Si el modelo admite salida de texto, ya que algunos no la admiten', false, 'All current models output text.', 'Todos los modelos actuales generan texto.'),
            opt('Whether the context window is smaller than the question itself', 'Si la ventana de contexto es más pequeña que la propia pregunta', false, 'Unlikely with 1M tokens.', 'Poco probable con 1M de tokens.'),
            opt('Whether you set budget_tokens, which is required on new models', 'Si configuraste budget_tokens, que es obligatorio en los modelos nuevos', false, 'budget_tokens is not accepted on later models.', 'budget_tokens no se acepta en los modelos posteriores.')
          ] }
      ]
    },

    /* ================================================== M04 */
    {
      id: 'a04', track: 'academy', domain: 0, minutes: 12, art: 'mascot',
      title: T('Where Claude lives: apps, Cowork, Code and the platform', 'Dónde vive Claude: apps, Cowork, Code y la plataforma'),
      summary: T('The same models reach you through different surfaces. Chat is for conversation and creation; Cowork does multi-step work on your files from the desktop app; Claude Code is the coding agent; the Claude Platform (API) is how developers build their own products.',
                 'Los mismos modelos te llegan por distintas superficies. El chat sirve para conversar y crear; Cowork hace trabajo de varios pasos sobre tus archivos desde la app de escritorio; Claude Code es el agente de programación; y la Claude Platform (API) es como los desarrolladores construyen sus propios productos.'),
      objectives: [
        T('Map each Claude surface to the work it is designed for.', 'Relacionar cada superficie de Claude con el trabajo para el que está pensada.'),
        T('Know that customizations (skills, connectors, plugins) follow your account across apps.', 'Saber que las personalizaciones (skills, conectores, plugins) siguen a tu cuenta entre apps.'),
        T('Locate the developer entry points: Console, API, SDKs and cloud providers.', 'Ubicar los puntos de entrada para desarrolladores: Console, API, SDKs y proveedores cloud.')
      ],
      docs: [{ label: 'Claude docs (apps)', url: 'https://claude.com/docs' }, { label: 'Claude Code overview', url: 'https://code.claude.com/docs/en/overview' }, D.intro],
      blocks: [
        { type: 'table', head: [T('Surface', 'Superficie'), T('What it is', 'Qué es'), T('Use it for', 'Úsala para')], rows: [
          [T('Claude chat (web, desktop, mobile)', 'Claude chat (web, escritorio, móvil)'), T('Conversations with projects, artifacts, research, connectors, skills', 'Conversaciones con proyectos, artefactos, research, conectores y skills'), T('Thinking, writing, analysis, quick creation', 'Pensar, redactar, analizar, crear rápido')],
          [T('Cowork (Claude Desktop)', 'Cowork (Claude Desktop)'), T('Agentic workspace using Claude Code\'s architecture, no terminal needed', 'Espacio agéntico con la arquitectura de Claude Code, sin terminal'), T('Multi-step tasks on local files: reports, spreadsheets, decks, organizing', 'Tareas de varios pasos sobre archivos locales: informes, hojas, presentaciones, organización')],
          [T('Claude Code', 'Claude Code'), T('Coding agent in terminal, VS Code, JetBrains, desktop app and web', 'Agente de programación en terminal, VS Code, JetBrains, app de escritorio y web'), T('Building and changing software, automation, CI', 'Construir y cambiar software, automatizar, CI')],
          [T('Claude in Chrome / Microsoft 365 / Slack', 'Claude en Chrome / Microsoft 365 / Slack'), T('Claude inside the tools you already use', 'Claude dentro de las herramientas que ya usas'), T('Web tasks, Excel/Word/PowerPoint/Outlook, team channels', 'Tareas web, Excel/Word/PowerPoint/Outlook, canales de equipo')],
          [T('Claude Platform (API)', 'Claude Platform (API)'), T('Messages API, tools, Agent SDK, Managed Agents, Console', 'Messages API, tools, Agent SDK, Managed Agents, Console'), T('Building your own apps and agents', 'Construir tus propias apps y agentes')]
        ] },
        { type: 'p', text: T('Developers can also use Claude through **Amazon Bedrock**, **Google Cloud (Vertex AI)**, **Microsoft Foundry** and **Claude Platform on AWS**. The model IDs are nearly identical; each provider sets its own availability and lifecycle dates.', 'Los desarrolladores también pueden usar Claude a través de **Amazon Bedrock**, **Google Cloud (Vertex AI)**, **Microsoft Foundry** y **Claude Platform on AWS**. Los IDs de modelo son casi idénticos; cada proveedor fija su propia disponibilidad y fechas de ciclo de vida.') },
        { type: 'note', text: T('Customizations you add in claude.ai or the desktop app (connectors, skills, plugins under **Customize**) are saved to your account, so chat, Cowork and Claude Code (signed in with the same account) can use them. Things you install only from the Claude Code command line stay on that machine.', 'Las personalizaciones que añades en claude.ai o en la app de escritorio (conectores, skills y plugins en **Customize**) se guardan en tu cuenta, así que el chat, Cowork y Claude Code (con la misma cuenta) pueden usarlas. Lo que instalas solo desde la línea de comandos de Claude Code se queda en esa máquina.') },
        { type: 'h', text: T('Plans in one paragraph', 'Los planes en un párrafo') },
        { type: 'p', text: T('Individual plans (Free, Pro, Max) differ in usage limits and access to features such as Claude Code, Cowork and advanced research. Team and Enterprise add administration: owners control connectors, plugins, skills, data retention and who can use what. API usage is billed separately, per token, through the Console. Exact features per plan change often, so check the plans page.', 'Los planes individuales (Free, Pro, Max) difieren en límites de uso y en el acceso a funciones como Claude Code, Cowork y la investigación avanzada. Team y Enterprise añaden administración: los Owners controlan conectores, plugins, skills, retención de datos y quién puede usar qué. El uso de la API se factura aparte, por token, desde la Console. Las funciones exactas de cada plan cambian a menudo, así que consulta la página de planes.') },
        { type: 'trap', text: T('Do not confuse **Claude Code plugins in the IDE** with the VS Code extension or the JetBrains plugin. The extension puts Claude Code inside your editor; a Claude Code *plugin* is a package of skills, agents, hooks and MCP servers.', 'No confundas los **plugins de Claude Code** con la extensión de VS Code o el plugin de JetBrains. La extensión mete Claude Code en tu editor; un *plugin* de Claude Code es un paquete de skills, agentes, hooks y servidores MCP.') }
      ],
      quiz: [
        { q: T('A finance analyst wants Claude to turn 30 local CSV files into a formatted Excel report and a short deck, without using a terminal. Which surface fits best?', 'Una analista financiera quiere que Claude convierta 30 CSV locales en un informe de Excel con formato y una presentación breve, sin usar terminal. ¿Qué superficie encaja mejor?'),
          options: [
            opt('Cowork in the Claude desktop app', 'Cowork en la app de escritorio de Claude', true, 'Multi-step work on local files with professional outputs.', 'Trabajo de varios pasos sobre archivos locales con entregables profesionales.'),
            opt('The Message Batches API with a custom script', 'La Message Batches API con un script propio', false, 'Requires coding and is not interactive.', 'Requiere programar y no es interactivo.'),
            opt('Claude Code headless mode in a CI pipeline', 'Claude Code en modo headless dentro de un pipeline de CI', false, 'Built for automation by developers, not this user.', 'Está pensado para automatizaciones de desarrolladores, no para esta usuaria.'),
            opt('A plain chat with every file pasted as text', 'Un chat normal pegando cada archivo como texto', false, 'Works poorly for many files and real deliverables.', 'Funciona mal con muchos archivos y entregables reales.')
          ] },
        { q: T('You add a connector in claude.ai under Customize. Where else can you use it with the same account?', 'Añades un conector en claude.ai desde Customize. ¿Dónde más puedes usarlo con la misma cuenta?'),
          options: [
            opt('In chat on other devices, in Cowork, and in Claude Code signed in to that account', 'En el chat de otros dispositivos, en Cowork y en Claude Code con esa cuenta', true, 'Account-level customizations follow you across apps.', 'Las personalizaciones de la cuenta te siguen entre apps.'),
            opt('Only in the browser tab where you added it', 'Solo en la pestaña del navegador donde lo añadiste', false, 'It is saved to the account, not the tab.', 'Se guarda en la cuenta, no en la pestaña.'),
            opt('Only through the API after exporting it as a JSON file', 'Solo por la API tras exportarlo como archivo JSON', false, 'No export is needed for the apps.', 'Las apps no necesitan ninguna exportación.'),
            opt('Nowhere else; connectors are tied to a single conversation and must be re-added in each one', 'En ningún otro sitio; los conectores están atados a una conversación y hay que volver a añadirlos en cada una', false, 'You enable them per conversation, but they live on the account.', 'Se activan por conversación, pero viven en la cuenta.')
          ] }
      ]
    },

    /* ================================================== M05 */
    {
      id: 'a05', track: 'academy', domain: 0, minutes: 14, art: 'mascot',
      title: T('AI Fluency: the 4D framework', 'AI Fluency: el marco de las 4D'),
      summary: T('Using Claude well is a skill. Anthropic\'s AI Fluency course organizes it into four competencies, the 4Ds: Delegation, Description, Discernment and Diligence.',
                 'Usar bien a Claude es una habilidad. El curso AI Fluency de Anthropic la organiza en cuatro competencias, las 4D: Delegation (delegación), Description (descripción), Discernment (discernimiento) y Diligence (diligencia).'),
      objectives: [
        T('Name and explain the 4Ds.', 'Nombrar y explicar las 4D.'),
        T('Run the Description–Discernment loop to improve results.', 'Aplicar el bucle descripción–discernimiento para mejorar los resultados.'),
        T('Apply diligence: responsibility, transparency and verification.', 'Aplicar diligencia: responsabilidad, transparencia y verificación.')
      ],
      docs: [{ label: 'Skilljar · AI Fluency: Framework & Foundations', url: C.fluency }],
      blocks: [
        { type: 'terms', items: [
          { term: 'Delegation', en: 'Deciding what work to give AI, what to keep, and on which platform: knowing your goal, the task, and the tools\' strengths and limits.', es: 'Decidir qué trabajo dar a la IA, qué conservar y en qué plataforma: conocer tu objetivo, la tarea y las fortalezas y límites de las herramientas.' },
          { term: 'Description', en: 'Communicating clearly: what you want (the product), how to approach it (the process) and how Claude should behave (the performance).', es: 'Comunicar con claridad: qué quieres (el producto), cómo abordarlo (el proceso) y cómo debe comportarse Claude (el desempeño).' },
          { term: 'Discernment', en: 'Critically evaluating what comes back: is the output accurate, was the reasoning sound, did the collaboration work?', es: 'Evaluar con criterio lo que vuelve: ¿es correcto el resultado, fue sólido el razonamiento, funcionó la colaboración?' },
          { term: 'Diligence', en: 'Taking responsibility: being transparent about AI use, verifying before you share or deploy, and owning the final result.', es: 'Asumir la responsabilidad: ser transparente sobre el uso de IA, verificar antes de compartir o desplegar y hacerte cargo del resultado final.' }
        ] },
        { type: 'h', text: T('The Description–Discernment loop', 'El bucle descripción–discernimiento') },
        { type: 'steps', items: [
          T('**Describe** the goal, context, constraints and the shape of a good answer.', '**Describe** el objetivo, el contexto, las restricciones y la forma de una buena respuesta.'),
          T('**Discern**: read the output critically. What is right, what is missing, what is wrong?', '**Discierne**: lee el resultado con criterio. ¿Qué está bien, qué falta, qué está mal?'),
          T('**Refine the description** with what you learned (examples, corrections, new constraints) and go again.', '**Ajusta la descripción** con lo aprendido (ejemplos, correcciones, nuevas restricciones) y repite.')
        ] },
        { type: 'example', situation: T('You ask Claude for "a summary of this contract" and get a generic paragraph.', 'Le pides a Claude «un resumen de este contrato» y recibes un párrafo genérico.'),
          answer: T('Better description: "Summarize for a non-lawyer procurement manager. List payment terms, termination conditions and auto-renewal, each with the clause number. Flag anything unusual." Then discern: check the clause numbers against the document.', 'Mejor descripción: «Resume para una jefa de compras que no es abogada. Enumera las condiciones de pago, de terminación y la renovación automática, cada una con su número de cláusula. Señala lo inusual.» Luego discierne: comprueba los números de cláusula contra el documento.') },
        { type: 'note', text: T('The 4Ds map directly onto later modules: Delegation → choosing chat, Cowork, Code or an agent; Description → prompting (M12); Discernment → evaluation (M13); Diligence → reliability and safety (M26).', 'Las 4D se corresponden con módulos posteriores: Delegation → elegir chat, Cowork, Code o un agente; Description → prompting (M12); Discernment → evaluación (M13); Diligence → fiabilidad y seguridad (M26).') },
        { type: 'trap', text: T('Fluency is not about trusting AI more or less; it is about calibrated trust. The same idea appears in the exam as "do not use self-reported confidence as a proxy": verify with evidence.', 'La fluidez no consiste en confiar más o menos en la IA, sino en una confianza calibrada. La misma idea aparece en el examen como «no uses la autoconfianza declarada como proxy»: verifica con pruebas.') }
      ],
      quiz: [
        { q: T('You compare Claude\'s summary against the source and notice two invented numbers. Which competency are you exercising?', 'Comparas el resumen de Claude con la fuente y detectas dos cifras inventadas. ¿Qué competencia estás ejerciendo?'),
          options: [
            opt('Discernment: critically evaluating the output against evidence', 'Discernment: evaluar con criterio el resultado frente a las pruebas', true, 'Evaluating output quality is discernment.', 'Evaluar la calidad del resultado es discernimiento.'),
            opt('Delegation: deciding which tasks to hand to the AI', 'Delegation: decidir qué tareas entregar a la IA', false, 'That happens before the work, not when checking it.', 'Eso ocurre antes del trabajo, no al revisarlo.'),
            opt('Description: explaining the product, process and performance', 'Description: explicar el producto, el proceso y el desempeño', false, 'Description is about communicating the request.', 'La descripción trata de comunicar la petición.'),
            opt('None; checking facts is outside the 4D framework', 'Ninguna; comprobar datos está fuera del marco de las 4D', false, 'It is central to discernment.', 'Es central en el discernimiento.')
          ] },
        { q: T('Before sending a client an AI-assisted report, you disclose AI use per company policy and verify every figure. Which D is this?', 'Antes de enviar a un cliente un informe hecho con ayuda de IA, declaras su uso según la política de la empresa y verificas cada cifra. ¿Qué D es esta?'),
          options: [
            opt('Diligence: transparency, verification and owning the result', 'Diligence: transparencia, verificación y hacerte cargo del resultado', true, 'Responsible use and accountability are diligence.', 'El uso responsable y la rendición de cuentas son diligencia.'),
            opt('Description: making the prompt clearer and more specific', 'Description: hacer el prompt más claro y específico', false, 'This is about responsibility after creation.', 'Esto trata de la responsabilidad después de crear.'),
            opt('Delegation: choosing a different model for the task', 'Delegation: elegir otro modelo para la tarea', false, 'No delegation decision is involved.', 'No hay ninguna decisión de delegación.'),
            opt('Discernment only, because disclosure is not part of fluency', 'Solo Discernment, porque declarar el uso no forma parte de la fluidez', false, 'Transparency is explicitly part of diligence.', 'La transparencia forma parte explícita de la diligencia.')
          ] }
      ]
    }
  ]);
})();
