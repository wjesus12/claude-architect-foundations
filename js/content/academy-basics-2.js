/* «Desde lo básico»: explicación sencilla de cada módulo (M14–M26), antes de la parte técnica. */
(function () {
  const T = (en, es) => ({ en, es });
  const W = (term, en, es) => ({ term, en, es });
  CAF.ACADEMY_BASICS = Object.assign(CAF.ACADEMY_BASICS || {}, {
    a14: {
      simple: T('The API is how a program (not a person) talks to Claude. The program sends a message with the conversation and receives Claude\'s reply, along with a note that says why the reply ended. It is what developers use to put Claude inside their own apps.',
                'La API es la forma en que un programa (no una persona) habla con Claude. El programa envía un mensaje con la conversación y recibe la respuesta de Claude, junto con una nota que dice por qué terminó la respuesta. Es lo que usan los desarrolladores para poner a Claude dentro de sus propias apps.'),
      analogy: T('Like a restaurant window: the program hands in an order slip (the request) and gets the dish back (the response).',
                 'Como la ventanilla de un restaurante: el programa entrega una comanda (la petición) y recibe el plato (la respuesta).'),
      words: [
        W('Request', 'The message a program sends to Claude.', 'El mensaje que un programa envía a Claude.'),
        W('Response', 'What Claude sends back.', 'Lo que Claude devuelve.'),
        W('stop_reason', 'A label that says why Claude stopped: it finished, it wants to use a tool, or it ran out of space.', 'Una etiqueta que dice por qué Claude se detuvo: terminó, quiere usar una herramienta o se quedó sin espacio.')
      ],
      use: T('You do not need to program to follow this course, but knowing this idea helps you understand how apps with AI work.', 'No necesitas programar para seguir el curso, pero conocer esta idea te ayuda a entender cómo funcionan las apps con IA.')
    },
    a15: {
      simple: T('On its own, Claude can only write text. "Tool use" lets it ask your program to do something real, such as checking the weather or looking up an order. Claude says which tool it wants and with what data; your program runs it and gives Claude the result, and Claude continues.',
                'Por sí solo, Claude solo puede escribir texto. El «uso de herramientas» le permite pedirle a tu programa que haga algo real, como consultar el clima o buscar un pedido. Claude dice qué herramienta quiere y con qué datos; tu programa la ejecuta, le devuelve el resultado y Claude continúa.'),
      analogy: T('Like a doctor who orders a blood test: they do not run the lab, but they ask for it, read the result and decide what is next.',
                 'Como un médico que pide un análisis de sangre: no maneja el laboratorio, pero lo solicita, lee el resultado y decide qué sigue.'),
      words: [
        W('Tool', 'An action Claude can request: search, calculate, send, query…', 'Una acción que Claude puede pedir: buscar, calcular, enviar, consultar…'),
        W('Tool description', 'The text that explains what a tool does and when to use it.', 'El texto que explica qué hace una herramienta y cuándo usarla.')
      ],
      use: T('When an AI app "looks up your order" or "books a meeting", tool use is what is happening behind the scenes.', 'Cuando una app con IA «busca tu pedido» o «agenda una reunión», por detrás está ocurriendo el uso de herramientas.')
    },
    a16: {
      simple: T('Besides text, Claude can read images and PDFs, point to the exact sentence in your documents where an answer comes from (citations), and remember a long piece of text it reads often so it costs less (caching). It can also process many requests at once at a lower price, if you can wait (batches).',
                'Además de texto, Claude puede leer imágenes y PDF, señalar la frase exacta de tus documentos de donde sale una respuesta (citas) y recordar un texto largo que lee a menudo para que cueste menos (caché). También puede procesar muchas peticiones a la vez a menor precio, si puedes esperar (lotes).'),
      analogy: T('Caching is like keeping the manual open on your desk instead of fetching it from the shelf every time.',
                 'La caché es como dejar el manual abierto sobre tu escritorio en vez de ir a buscarlo al estante cada vez.'),
      words: [
        W('Citations', 'Claude shows the exact passage that supports what it says.', 'Claude muestra el pasaje exacto que respalda lo que dice.'),
        W('Caching', 'Reusing a repeated part of the request to save time and money.', 'Reutilizar una parte repetida de la petición para ahorrar tiempo y dinero.'),
        W('Batch', 'Many requests sent together, processed within a day at a discount.', 'Muchas peticiones enviadas juntas, que se procesan en un día con descuento.')
      ],
      use: T('When you need to trust an answer about a document, ask Claude to quote the exact passage.', 'Cuando necesites confiar en una respuesta sobre un documento, pídele a Claude que cite el pasaje exacto.')
    },
    a17: {
      simple: T('Claude cannot read thousands of documents at once. RAG solves this: first you find the fragments that matter for the question, and then Claude answers using only those fragments. In "agentic search", Claude itself decides what to search, reads, and searches again until it has enough.',
                'Claude no puede leer miles de documentos a la vez. El RAG lo resuelve: primero se buscan los fragmentos que importan para la pregunta y luego Claude responde usando solo esos fragmentos. En la «búsqueda agéntica», el propio Claude decide qué buscar, lee y vuelve a buscar hasta tener suficiente.'),
      analogy: T('Like a librarian who, instead of reading the whole library to you, brings you the three pages that answer your question.',
                 'Como un bibliotecario que, en lugar de leerte toda la biblioteca, te trae las tres páginas que responden tu pregunta.'),
      words: [
        W('RAG', 'Search first, then answer with what was found.', 'Primero buscar y luego responder con lo encontrado.'),
        W('Chunk', 'A small piece of a document, ready to be searched.', 'Un trozo pequeño de un documento, listo para buscarse.')
      ],
      use: T('Company "chat with your documents" tools usually work this way.', 'Las herramientas de empresa para «conversar con tus documentos» suelen funcionar así.')
    },
    a18: {
      simple: T('There are three ways to build something with Claude. You can program everything yourself with the API (maximum control). You can use the Agent SDK, which gives you Claude Code\'s engine ready to use. Or you can use Managed Agents, where Anthropic runs the agent on its own servers for you.',
                'Hay tres formas de construir algo con Claude. Puedes programarlo todo tú con la API (máximo control). Puedes usar el Agent SDK, que te da el motor de Claude Code listo para usar. O puedes usar Managed Agents, donde Anthropic ejecuta el agente en sus propios servidores por ti.'),
      analogy: T('Like having a meal: cook from scratch (API), buy a ready-to-heat kit (Agent SDK), or order from a restaurant (Managed Agents).',
                 'Como comer: cocinar desde cero (API), comprar un kit listo para calentar (Agent SDK) o pedir a un restaurante (Managed Agents).'),
      words: [
        W('Agent SDK', 'A library with Claude Code\'s engine for building your own agents.', 'Una biblioteca con el motor de Claude Code para crear tus propios agentes.'),
        W('Managed Agents', 'Agents that Anthropic hosts and runs for you.', 'Agentes que Anthropic aloja y ejecuta por ti.')
      ],
      use: T('The more control you need, the closer you get to the API; the less you want to maintain, the closer to Managed Agents.', 'Cuanto más control necesitas, más te acercas a la API; cuanto menos quieres mantener, más a Managed Agents.')
    },
    a19: {
      simple: T('MCP (Model Context Protocol) is a common standard for connecting AI to other apps and data. Instead of building a different connection for each app, the app offers an "MCP server" once, and any compatible AI can use it. Claude\'s connectors work this way.',
                'MCP (Model Context Protocol) es un estándar común para conectar la IA con otras apps y datos. En lugar de crear una conexión distinta para cada app, la app ofrece una sola vez un «servidor MCP» y cualquier IA compatible puede usarlo. Los conectores de Claude funcionan así.'),
      analogy: T('Like USB: one standard plug, and any device that follows it fits any computer.',
                 'Como el USB: un enchufe estándar, y cualquier aparato que lo siga encaja en cualquier computadora.'),
      words: [
        W('MCP server', 'The program that offers tools and data from an app (for example, GitHub).', 'El programa que ofrece herramientas y datos de una app (por ejemplo, GitHub).'),
        W('MCP client', 'The part inside Claude that connects to a server.', 'La parte dentro de Claude que se conecta a un servidor.'),
        W('Resource', 'Data the server lets Claude read.', 'Datos que el servidor deja leer a Claude.')
      ],
      use: T('When you add a connector in Claude, you are usually connecting to an MCP server.', 'Cuando añades un conector en Claude, normalmente te estás conectando a un servidor MCP.')
    },
    a20: {
      simple: T('Inside MCP, Claude and the server exchange short messages with a fixed format. The server can ask you for missing information through Claude, and you set limits on what it can see. Because a server can read data and act, you only install ones you trust.',
                'Dentro de MCP, Claude y el servidor se intercambian mensajes cortos con un formato fijo. El servidor puede pedirte información que falta a través de Claude, y tú pones límites a lo que puede ver. Como un servidor puede leer datos y actuar, solo instalas los que son de confianza.'),
      analogy: T('Like letting a technician into your home: you choose who comes in, which rooms they can enter, and you stay nearby.',
                 'Como dejar entrar a un técnico a tu casa: eliges quién entra, a qué habitaciones puede pasar y te quedas cerca.'),
      words: [
        W('Elicitation', 'The server asks the user for extra information.', 'El servidor le pide información adicional al usuario.'),
        W('Prompt injection', 'Hidden instructions in a text that try to trick the AI.', 'Instrucciones escondidas en un texto que intentan engañar a la IA.')
      ],
      use: T('Install connectors only from known sources and grant only the access they need.', 'Instala conectores solo de fuentes conocidas y concede solo el acceso que necesitan.')
    },
    a21: {
      simple: T('Claude Code is Claude working as a programmer. It reads your project, proposes a plan, changes files, runs tests and fixes errors. Before doing something important it asks you for permission, unless you have configured otherwise.',
                'Claude Code es Claude trabajando como programador. Lee tu proyecto, propone un plan, cambia archivos, ejecuta pruebas y corrige errores. Antes de hacer algo importante te pide permiso, salvo que hayas configurado otra cosa.'),
      analogy: T('Like a programmer sitting next to you: they look at the code, tell you what they will do, do it and show you the result.',
                 'Como un programador sentado a tu lado: mira el código, te dice qué va a hacer, lo hace y te muestra el resultado.'),
      words: [
        W('Terminal', 'A window where you type commands to the computer.', 'Una ventana donde escribes órdenes a la computadora.'),
        W('Permission mode', 'How much Claude may do without asking you first.', 'Cuánto puede hacer Claude sin preguntarte primero.'),
        W('Plan mode', 'Claude explores and proposes a plan without changing anything yet.', 'Claude explora y propone un plan sin cambiar nada todavía.'),
        W('CLAUDE.md', 'A notes file with the project\'s rules, which Claude reads at the start.', 'Un archivo de notas con las reglas del proyecto, que Claude lee al empezar.')
      ],
      use: T('Start with plan mode: ask Claude to explain the project and propose a plan before touching anything.', 'Empieza con plan mode: pídele a Claude que explique el proyecto y proponga un plan antes de tocar nada.')
    },
    a22: {
      simple: T('You can adapt Claude Code to your way of working. You write the project rules in a file (CLAUDE.md), save repeatable procedures as skills, create helpers with a specific job (subagents), set actions that must always happen (hooks) and decide what it is allowed to do (permissions).',
                'Puedes adaptar Claude Code a tu forma de trabajar. Escribes las reglas del proyecto en un archivo (CLAUDE.md), guardas procedimientos repetibles como skills, creas ayudantes con una tarea concreta (subagentes), fijas acciones que deben ocurrir siempre (hooks) y decides qué tiene permitido hacer (permisos).'),
      analogy: T('Like onboarding a new team member: a rules manual, step-by-step guides, specialist colleagues and some automatic checks.',
                 'Como integrar a un nuevo miembro del equipo: un manual de normas, guías paso a paso, colegas especialistas y algunos controles automáticos.'),
      words: [
        W('Subagent', 'A helper with its own task and its own memory of the conversation.', 'Un ayudante con su propia tarea y su propia memoria de la conversación.'),
        W('Hook', 'An automatic action that always runs at a given moment (for example, after editing).', 'Una acción automática que siempre se ejecuta en un momento dado (por ejemplo, después de editar).'),
        W('Settings', 'The configuration file: permissions, models and other options.', 'El archivo de configuración: permisos, modelos y otras opciones.')
      ],
      use: T('Rule of thumb: what Claude should know goes in CLAUDE.md; what must always happen goes in a hook.', 'Regla práctica: lo que Claude debe saber va en CLAUDE.md; lo que debe ocurrir siempre va en un hook.')
    },
    a23: {
      simple: T('Claude Code can also work without you watching: on long tasks, on a schedule, or automatically in the tools your team uses to review code. The less you supervise, the more you must check the result with tests and an independent review.',
                'Claude Code también puede trabajar sin que lo estés mirando: en tareas largas, con horario programado o de forma automática en las herramientas que tu equipo usa para revisar código. Cuanto menos supervisas, más debes comprobar el resultado con pruebas y una revisión independiente.'),
      analogy: T('Like leaving a task overnight for someone: in the morning you do not just trust it, you check the work before using it.',
                 'Como dejarle una tarea a alguien durante la noche: por la mañana no te fías sin más, revisas el trabajo antes de usarlo.'),
      words: [
        W('Headless', 'Running Claude Code without a chat window, from a script.', 'Ejecutar Claude Code sin ventana de chat, desde un script.'),
        W('CI', 'Automatic checks that run every time someone changes the code.', 'Comprobaciones automáticas que se ejecutan cada vez que alguien cambia el código.')
      ],
      use: T('Never accept unsupervised work just because the AI says it went well: look for evidence.', 'Nunca aceptes un trabajo sin supervisión solo porque la IA dice que salió bien: busca pruebas.')
    },
    a24: {
      simple: T('A model alone only writes text. To act, it needs a "harness": the software around it that runs a loop (think, use a tool, look at the result, repeat), manages its memory and controls what it is allowed to do. Claude Code is a harness, and the Agent SDK lets you use that same one.',
                'Un modelo por sí solo solo escribe texto. Para actuar necesita un «harness» (arnés): el software que lo rodea, que ejecuta un bucle (pensar, usar una herramienta, mirar el resultado, repetir), gestiona su memoria y controla lo que tiene permitido hacer. Claude Code es un harness, y el Agent SDK te deja usar ese mismo.'),
      analogy: T('The model is the engine; the harness is the rest of the car: steering wheel, brakes and dashboard.',
                 'El modelo es el motor; el harness es el resto del auto: volante, frenos y tablero.'),
      words: [
        W('Harness', 'Everything around the model that turns it into an agent.', 'Todo lo que rodea al modelo y lo convierte en agente.'),
        W('Agentic loop', 'The repeating cycle: think → act → observe → repeat.', 'El ciclo que se repite: pensar → actuar → observar → repetir.')
      ],
      use: T('When an agent fails, ask whether the problem is the model or the harness (its tools, memory or permissions).', 'Cuando un agente falla, pregúntate si el problema es el modelo o el harness (sus herramientas, su memoria o sus permisos).')
    },
    a25: {
      simple: T('Not every task needs a free agent. Sometimes it is better to set fixed steps (a workflow): first this, then that. An agent, instead, decides its own steps. Start with the simplest option that works, and add freedom only when the task really needs it.',
                'No toda tarea necesita un agente libre. A veces es mejor fijar pasos (un workflow): primero esto, luego aquello. Un agente, en cambio, decide sus propios pasos. Empieza con la opción más simple que funcione y añade libertad solo cuando la tarea de verdad lo necesite.'),
      analogy: T('A workflow is a production line; an agent is an experienced employee who organizes their own work.',
                 'Un workflow es una línea de producción; un agente es un empleado con experiencia que organiza su propio trabajo.'),
      words: [
        W('Workflow', 'Steps fixed in advance.', 'Pasos fijados de antemano.'),
        W('Coordinator', 'An agent that splits the work and hands it to other agents.', 'Un agente que reparte el trabajo y se lo entrega a otros agentes.'),
        W('Routing', 'Sending each case to the path that fits it.', 'Enviar cada caso por el camino que le corresponde.')
      ],
      use: T('If you can draw the steps on paper, you probably need a workflow, not an agent.', 'Si puedes dibujar los pasos en un papel, probablemente necesitas un workflow, no un agente.')
    },
    a26: {
      simple: T('A reliable agent says clearly when something failed, asks a person for help when it should, and shows where its information comes from. In this module you also see how everything you learned connects with the five areas of the exam.',
                'Un agente fiable dice con claridad cuando algo falló, pide ayuda a una persona cuando corresponde y muestra de dónde sale su información. En este módulo también ves cómo todo lo que aprendiste se conecta con las cinco áreas del examen.'),
      analogy: T('Like a good employee: they do not hide mistakes, they escalate what is beyond them, and they can show where every figure came from.',
                 'Como un buen empleado: no esconde los errores, escala lo que lo supera y puede mostrar de dónde salió cada cifra.'),
      words: [
        W('Escalate', 'Hand the case to a person.', 'Pasar el caso a una persona.'),
        W('Provenance', 'Knowing which source supports each statement.', 'Saber qué fuente respalda cada afirmación.')
      ],
      use: T('In the exam, when a rule must be met always, the answer is usually code or a hook, not just an instruction.', 'En el examen, cuando una regla debe cumplirse siempre, la respuesta suele ser código o un hook, no solo una instrucción.')
    }
  });
})();
