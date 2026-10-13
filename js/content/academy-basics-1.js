/* «Desde lo básico»: explicación sencilla de cada módulo (M01–M13), antes de la parte técnica.
   simple = idea en lenguaje llano · analogy = comparación cotidiana · words = palabras nuevas · use = para qué te sirve */
(function () {
  const T = (en, es) => ({ en, es });
  const W = (term, en, es) => ({ term, en, es });
  CAF.ACADEMY_BASICS = Object.assign(CAF.ACADEMY_BASICS || {}, {
    a01: {
      simple: T('Claude is an artificial intelligence you talk to by writing, as you would with a person. You ask for something in your own words and it answers: it explains, writes, summarizes, translates or helps you think. It does not "know everything": it learned from a lot of text up to a certain date, and it can make mistakes, so you always check what matters.',
                'Claude es una inteligencia artificial con la que conversas escribiendo, como lo harías con una persona. Le pides algo con tus propias palabras y te responde: explica, redacta, resume, traduce o te ayuda a pensar. No «lo sabe todo»: aprendió de muchísimo texto hasta cierta fecha y puede equivocarse, por eso siempre revisas lo importante.'),
      analogy: T('Think of a very well-read assistant who has never left the library: they know a lot, but they do not know today\'s news unless you give it to them or let them search.',
                 'Imagina a un asistente muy leído que nunca salió de la biblioteca: sabe muchísimo, pero no conoce las noticias de hoy a menos que tú se las cuentes o le dejes buscar.'),
      words: [
        W('Prompt', 'What you write to Claude: your question or request.', 'Lo que le escribes a Claude: tu pregunta o tu pedido.'),
        W('Token', 'A small piece of text (part of a word). Claude reads and writes in tokens.', 'Un trocito de texto (parte de una palabra). Claude lee y escribe en tokens.'),
        W('Knowledge cutoff', 'The date up to which Claude learned. After it, it only knows what you give it.', 'La fecha hasta la que Claude aprendió. Después de ella solo sabe lo que tú le des.'),
        W('Hallucination', 'When the AI says something false with total confidence.', 'Cuando la IA dice algo falso con total seguridad.')
      ],
      use: T('Ask Claude to explain a topic as if you were starting from zero, and then ask it to give you an example.', 'Pídele a Claude que te explique un tema como si empezaras de cero y luego pídele un ejemplo.')
    },
    a02: {
      simple: T('Claude is not a single model: it is a family. Some are faster and cheaper, others think more deeply and cost more. Today there are four: Haiku (the fastest), Sonnet (the balanced one), Opus (very capable, the usual starting point) and Fable (the most powerful).',
                'Claude no es un solo modelo: es una familia. Unos son más rápidos y baratos; otros piensan con más profundidad y cuestan más. Hoy hay cuatro: Haiku (el más rápido), Sonnet (el equilibrado), Opus (muy capaz, el punto de partida habitual) y Fable (el más potente).'),
      analogy: T('Like choosing a vehicle: a motorbike for a quick errand, a car for everyday trips, a truck for heavy loads. You pick the one that fits the job.',
                 'Como elegir un vehículo: una moto para un encargo rápido, un auto para el día a día, un camión para cargas pesadas. Eliges el que encaja con el trabajo.'),
      words: [
        W('Model', 'Each version of Claude, with its own speed, capability and price.', 'Cada versión de Claude, con su propia velocidad, capacidad y precio.'),
        W('Context window', 'How much text Claude can keep in view at once (a very long document fits).', 'Cuánto texto puede tener Claude a la vista a la vez (cabe un documento muy largo).'),
        W('Latency', 'How long it takes to answer.', 'Cuánto tarda en responder.')
      ],
      use: T('For a quick email, any model works. For a hard analysis or a big project, choose Opus or Fable.', 'Para un correo rápido sirve cualquiera. Para un análisis difícil o un proyecto grande, elige Opus o Fable.')
    },
    a03: {
      simple: T('Before answering, Claude can "think" internally, as you would make a draft. The newest models decide on their own how much to think. You can also tell it how much effort to put in: little for simple things (faster), a lot for hard problems (slower but better).',
                'Antes de responder, Claude puede «pensar» por dentro, como cuando tú haces un borrador. Los modelos más nuevos deciden solos cuánto pensar. También puedes indicarle cuánto esfuerzo poner: poco para cosas simples (más rápido) y mucho para problemas difíciles (más lento, pero mejor).'),
      analogy: T('Like a student in an exam: for "2 + 2" they answer at once; for a hard problem they use scratch paper first.',
                 'Como un estudiante en un examen: para «2 + 2» responde al instante; para un problema difícil primero usa la hoja de borrador.'),
      words: [
        W('Adaptive thinking', 'Claude decides by itself how much to think before answering.', 'Claude decide por sí mismo cuánto pensar antes de responder.'),
        W('Effort', 'A setting that says how hard Claude should work: low, medium, high and more.', 'Un ajuste que indica cuánto debe esforzarse Claude: bajo, medio, alto y más.')
      ],
      use: T('If an answer feels shallow, ask Claude to think step by step or raise the effort level.', 'Si una respuesta te parece superficial, pídele que piense paso a paso o sube el nivel de esfuerzo.')
    },
    a04: {
      simple: T('You can use Claude in several places. In the chat (web, computer or phone) you talk to it. In Cowork, on the desktop app, it works on your files and completes tasks for you. Claude Code is for programming. And the platform (API) is for developers who build their own apps with Claude.',
                'Puedes usar Claude en varios lugares. En el chat (web, computadora o celular) conversas con él. En Cowork, dentro de la app de escritorio, trabaja con tus archivos y completa tareas por ti. Claude Code es para programar. Y la plataforma (API) es para desarrolladores que crean sus propias apps con Claude.'),
      analogy: T('The same professional can advise you by phone (chat), come to your office and do the work (Cowork), or be hired by a company to power its products (API).',
                 'El mismo profesional puede asesorarte por teléfono (chat), ir a tu oficina y hacer el trabajo (Cowork) o ser contratado por una empresa para dar vida a sus productos (API).'),
      words: [
        W('Cowork', 'Claude working on your computer: it reads your files and creates documents.', 'Claude trabajando en tu computadora: lee tus archivos y crea documentos.'),
        W('Claude Code', 'The version of Claude that writes and runs code.', 'La versión de Claude que escribe y ejecuta código.'),
        W('API', 'The "door" through which other programs talk to Claude.', 'La «puerta» por la que otros programas hablan con Claude.')
      ],
      use: T('To talk and learn: chat. To produce files from your folders: Cowork. To program: Claude Code.', 'Para conversar y aprender: el chat. Para producir archivos a partir de tus carpetas: Cowork. Para programar: Claude Code.')
    },
    a05: {
      simple: T('Using AI well is a skill, and it rests on four habits: decide what to hand over to the AI and what to do yourself (Delegation), explain clearly what you want (Description), check whether the answer is good (Discernment), and use it responsibly and honestly (Diligence).',
                'Usar bien la IA es una habilidad, y se apoya en cuatro hábitos: decidir qué le encargas a la IA y qué haces tú (Delegación), explicar con claridad lo que quieres (Descripción), revisar si la respuesta es buena (Discernimiento) y usarla de forma responsable y honesta (Diligencia).'),
      analogy: T('Like working with a new intern: you decide what to give them, explain it well, review their work and take responsibility for the result.',
                 'Como trabajar con un practicante nuevo: decides qué encargarle, se lo explicas bien, revisas su trabajo y respondes tú por el resultado.'),
      words: [
        W('Delegation', 'Choosing which tasks to give to the AI.', 'Elegir qué tareas darle a la IA.'),
        W('Discernment', 'Judging whether what the AI gave you is correct and useful.', 'Juzgar si lo que te dio la IA es correcto y útil.')
      ],
      use: T('Before sending something made with AI, ask yourself: is it true, is it what I asked for, and can I stand behind it?', 'Antes de enviar algo hecho con IA, pregúntate: ¿es cierto?, ¿es lo que pedí?, ¿puedo responder por ello?')
    },
    a06: {
      simple: T('The more context you give, the better the answer. Say who it is for, what you need it for, what format you want and any example. If the first answer is not right, you do not start over: you tell Claude what to change and keep refining in the same conversation.',
                'Cuanto más contexto das, mejor es la respuesta. Di para quién es, para qué lo necesitas, qué formato quieres y algún ejemplo. Si la primera respuesta no queda bien, no empiezas de cero: le dices qué cambiar y sigues afinando en la misma conversación.'),
      analogy: T('Like ordering at a tailor\'s: "a shirt" gets you anything; "a light blue shirt, size M, for a wedding" gets you what you want.',
                 'Como encargar algo a un sastre: «una camisa» te da cualquier cosa; «una camisa celeste, talla M, para una boda» te da lo que quieres.'),
      words: [
        W('Context', 'The background information Claude needs to understand your situation.', 'La información de fondo que Claude necesita para entender tu situación.'),
        W('Iterate', 'Improve the answer little by little with new instructions.', 'Mejorar la respuesta poco a poco con nuevas indicaciones.')
      ],
      use: T('Instead of "write an email", try: "write a short, friendly email to my boss asking for Friday off".', 'En vez de «escribe un correo», prueba: «escribe un correo corto y amable a mi jefe pidiendo el viernes libre».')
    },
    a07: {
      simple: T('A Project is a folder inside Claude where you save documents and instructions that apply to every chat in it. That way you do not have to upload the same files or repeat the same rules every time.',
                'Un Proyecto es una carpeta dentro de Claude donde guardas documentos e instrucciones que valen para todos los chats de esa carpeta. Así no tienes que subir los mismos archivos ni repetir las mismas reglas cada vez.'),
      analogy: T('Like a binder for a course: the syllabus and notes stay inside, and every time you open it you already have everything at hand.',
                 'Como el archivador de un curso: el sílabo y los apuntes se quedan dentro, y cada vez que lo abres ya tienes todo a mano.'),
      words: [
        W('Project knowledge', 'The files you upload to the project for Claude to consult.', 'Los archivos que subes al proyecto para que Claude los consulte.'),
        W('Project instructions', 'Rules that apply to every chat in the project (tone, format…).', 'Reglas que se aplican a todos los chats del proyecto (tono, formato…).')
      ],
      use: T('Create a project for each course or client and upload its key documents once.', 'Crea un proyecto por cada curso o cliente y sube sus documentos clave una sola vez.')
    },
    a08: {
      simple: T('An artifact is something Claude creates that appears in a separate panel, ready to use: a document, a table, a diagram or even a small interactive app. You can ask for changes, go back to earlier versions and share it.',
                'Un artefacto es algo que Claude crea y que aparece en un panel aparte, listo para usar: un documento, una tabla, un diagrama o hasta una pequeña app interactiva. Puedes pedir cambios, volver a versiones anteriores y compartirlo.'),
      analogy: T('Talking about a cake recipe versus getting the cake on a plate: the artifact is the finished thing.',
                 'Es la diferencia entre conversar sobre una receta de torta y recibir la torta en un plato: el artefacto es lo terminado.'),
      words: [
        W('Artifact', 'A finished, usable creation shown next to the chat.', 'Una creación terminada y usable que se muestra junto al chat.'),
        W('Version', 'Each saved state of the artifact as you change it.', 'Cada estado guardado del artefacto mientras lo cambias.')
      ],
      use: T('Ask: "make me an interactive calculator for my monthly budget".', 'Pide: «hazme una calculadora interactiva para mi presupuesto mensual».')
    },
    a09: {
      simple: T('By default Claude only knows what it learned. With web search it can look up current information and show its sources. With Research it investigates many sources and writes a report. With connectors it can read your own services, such as your email or your drive, if you allow it.',
                'Por defecto, Claude solo sabe lo que aprendió. Con la búsqueda web puede consultar información actual y mostrar sus fuentes. Con Research investiga muchas fuentes y te entrega un informe. Con los conectores puede leer tus propios servicios, como tu correo o tu Drive, si tú lo permites.'),
      analogy: T('Connectors are like giving the assistant a key to a specific drawer: it can only open the drawers you choose.',
                 'Los conectores son como darle al asistente la llave de un cajón concreto: solo puede abrir los cajones que tú eliges.'),
      words: [
        W('Web search', 'Claude looks things up on the internet and cites where it found them.', 'Claude busca en internet y cita dónde lo encontró.'),
        W('Connector', 'A link between Claude and one of your apps (Gmail, Drive, Slack…).', 'Un enlace entre Claude y una de tus apps (Gmail, Drive, Slack…).'),
        W('Source', 'The page or document an answer comes from.', 'La página o el documento de donde sale una respuesta.')
      ],
      use: T('For anything recent (prices, news, dates), turn on web search and check the sources.', 'Para algo reciente (precios, noticias, fechas), activa la búsqueda web y revisa las fuentes.')
    },
    a10: {
      simple: T('A skill is a set of instructions that teaches Claude to do a specific task your way, for example "make reports with my company\'s format". Claude uses it when it fits. A plugin is a package that bundles several skills and connections so you can install them all at once.',
                'Una skill es un conjunto de instrucciones que le enseña a Claude a hacer una tarea concreta a tu manera, por ejemplo «haz informes con el formato de mi empresa». Claude la usa cuando encaja. Un plugin es un paquete que junta varias skills y conexiones para instalarlas todas de una vez.'),
      analogy: T('A skill is like a recipe card; a plugin is the whole recipe book.',
                 'Una skill es como una ficha de receta; un plugin es el recetario completo.'),
      words: [
        W('Skill', 'Saved know-how for a task, which Claude loads only when it needs it.', 'Un «saber hacer» guardado para una tarea, que Claude carga solo cuando lo necesita.'),
        W('Plugin', 'A package of skills and tools installed together.', 'Un paquete de skills y herramientas que se instala junto.'),
        W('Customize', 'The page in Claude where you manage skills, plugins and connectors.', 'La página de Claude donde gestionas skills, plugins y conectores.')
      ],
      use: T('If you repeat the same instructions every week, turn them into a skill.', 'Si repites las mismas instrucciones cada semana, conviértelas en una skill.')
    },
    a11: {
      simple: T('Cowork is a mode of the Claude desktop app where Claude does not just answer: it works. It can open the files in a folder you choose, analyze them and create finished deliverables such as an Excel report or a presentation, without you writing code.',
                'Cowork es un modo de la app de escritorio de Claude en el que Claude no solo responde: trabaja. Puede abrir los archivos de una carpeta que tú eliges, analizarlos y crear entregables terminados, como un informe en Excel o una presentación, sin que escribas código.'),
      analogy: T('Chat is asking a colleague for advice; Cowork is handing them the folder and getting the finished work back.',
                 'El chat es pedirle consejo a un colega; Cowork es entregarle la carpeta y recibir el trabajo terminado.'),
      words: [
        W('Agent', 'An AI that does several steps on its own to complete a task.', 'Una IA que da varios pasos por su cuenta para completar una tarea.'),
        W('Deliverable', 'The final product: a file, report or presentation.', 'El producto final: un archivo, informe o presentación.'),
        W('Permissions', 'What you allow Claude to see and touch (for example, only one folder).', 'Lo que permites que Claude vea y toque (por ejemplo, solo una carpeta).')
      ],
      use: T('Give Cowork access only to the folder it needs and review the result before sharing it.', 'Dale a Cowork acceso solo a la carpeta que necesita y revisa el resultado antes de compartirlo.')
    },
    a12: {
      simple: T('Writing a good prompt is giving clear instructions. A good prompt says what role Claude plays, what task it should do, with what information, and in what format you want the answer. Showing an example of what you expect helps a lot.',
                'Escribir un buen prompt es dar instrucciones claras. Un buen prompt dice qué papel cumple Claude, qué tarea debe hacer, con qué información y en qué formato quieres la respuesta. Mostrar un ejemplo de lo que esperas ayuda muchísimo.'),
      analogy: T('Like leaving instructions for someone covering your shift: the clearer and more concrete, the fewer surprises.',
                 'Como dejar instrucciones a quien te reemplaza en el trabajo: cuanto más claras y concretas, menos sorpresas.'),
      words: [
        W('System prompt', 'General instructions that apply to the whole conversation.', 'Instrucciones generales que valen para toda la conversación.'),
        W('Example (few-shot)', 'Showing one or more samples of the answer you want.', 'Mostrar una o varias muestras de la respuesta que quieres.'),
        W('Format', 'The shape of the answer: list, table, JSON, paragraph…', 'La forma de la respuesta: lista, tabla, JSON, párrafo…')
      ],
      use: T('Use this template: "You are… Your task is… Use this information… Answer in this format…".', 'Usa esta plantilla: «Eres… Tu tarea es… Usa esta información… Responde con este formato…».')
    },
    a13: {
      simple: T('A prompt that worked once may fail with other cases. To know whether it really works, you test it with a list of examples and check the answers against clear criteria, as a teacher grades with a rubric.',
                'Un prompt que funcionó una vez puede fallar con otros casos. Para saber si de verdad funciona, lo pruebas con una lista de ejemplos y revisas las respuestas con criterios claros, como un profesor que corrige con una rúbrica.'),
      analogy: T('Like testing a recipe: you do not judge it by one cake; you bake it several times and check whether it always comes out well.',
                 'Como probar una receta: no la juzgas por una sola torta; la preparas varias veces y miras si siempre sale bien.'),
      words: [
        W('Evaluation (eval)', 'A set of test cases to measure how well a prompt works.', 'Un conjunto de casos de prueba para medir qué tan bien funciona un prompt.'),
        W('Rubric', 'The criteria used to grade an answer.', 'Los criterios con los que se califica una respuesta.')
      ],
      use: T('Before using a prompt every day, try it with 10 different cases, including tricky ones.', 'Antes de usar un prompt a diario, pruébalo con 10 casos distintos, incluidos algunos difíciles.')
    }
  });
})();
