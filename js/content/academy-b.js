/* Ruta «desde cero» · Parte B — Claude chat y Cowork (M06–M11) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    claude101: { label: 'Skilljar · Claude 101', url: 'https://anthropic.skilljar.com/claude-101' },
    cowork: { label: 'Skilljar · Introduction to Claude Cowork', url: 'https://anthropic.skilljar.com/introduction-to-claude-cowork' },
    coworkDocs: { label: 'Cowork overview', url: 'https://claude.com/docs/cowork/overview' },
    extend: { label: 'Connectors, skills, and plugins', url: 'https://claude.com/docs/extend/overview' },
    connectors: { label: 'Get started with connectors', url: 'https://claude.com/docs/connectors/getting-started' },
    skills: { label: 'Skills overview (claude.ai)', url: 'https://claude.com/docs/skills/overview' },
    plugins: { label: 'Plugins (claude.ai and Cowork)', url: 'https://claude.com/docs/plugins/overview' },
    support: { label: 'Claude Help Center', url: 'https://support.claude.com/' }
  };

  CAF.addLessons([
    /* ================================================== M06 */
    {
      id: 'a06', track: 'academy', domain: 0, minutes: 12, art: 'mascot',
      title: T('Your first conversations: getting better results', 'Tus primeras conversaciones: mejores resultados'),
      summary: T('A chat is a working session, not a search box. Give Claude the goal, the context and the materials, then steer: edit, retry, ask for alternatives, and correct it as you would a capable colleague.',
                 'Un chat es una sesión de trabajo, no una caja de búsqueda. Dale a Claude el objetivo, el contexto y los materiales, y luego dirige: edita, reintenta, pide alternativas y corrígelo como harías con un colega capaz.'),
      objectives: [
        T('Write requests with goal, audience, context and format.', 'Escribir peticiones con objetivo, público, contexto y formato.'),
        T('Use files, images, web search, styles and conversation controls.', 'Usar archivos, imágenes, búsqueda web, estilos y controles de la conversación.'),
        T('Understand memory, incognito chats and how context grows in a long chat.', 'Entender la memoria, los chats de incógnito y cómo crece el contexto en un chat largo.')
      ],
      docs: [D.claude101, D.support],
      blocks: [
        { type: 'compare',
          bad: { title: T('Weak request', 'Petición débil'), items: [
            T('"Write an email about the delay."', '«Escribe un correo sobre el retraso.»')
          ] },
          good: { title: T('Strong request', 'Petición sólida'), items: [
            T('"Write a short email to our client (formal, Spanish) explaining the 2-week delivery delay caused by a supplier issue. Offer a 5% discount and two new dates. Under 150 words."', '«Escribe un correo breve a nuestro cliente (formal, en español) explicando el retraso de 2 semanas en la entrega por un problema con un proveedor. Ofrece un 5 % de descuento y dos fechas nuevas. Menos de 150 palabras.»')
          ] } },
        { type: 'list', items: [
          T('**Attach materials**: PDFs, documents, spreadsheets, images and screenshots become context. Claude can read charts and photos too.', '**Adjunta materiales**: PDFs, documentos, hojas de cálculo, imágenes y capturas se convierten en contexto. Claude también lee gráficos y fotos.'),
          T('**Web search**: lets Claude look up current information and cite sources.', '**Búsqueda web**: permite a Claude buscar información actual y citar fuentes.'),
          T('**Styles**: choose a preset (for example concise or explanatory) or create a custom style from writing samples, so every reply matches your voice.', '**Estilos**: elige uno predefinido (por ejemplo conciso o explicativo) o crea uno propio a partir de muestras de escritura, para que cada respuesta suene como tú.'),
          T('**Edit and retry**: edit an earlier message to branch the conversation, or regenerate a reply to get an alternative.', '**Editar y reintentar**: edita un mensaje anterior para ramificar la conversación, o regenera una respuesta para obtener una alternativa.'),
          T('**Model selector**: switch models (and thinking level where available) for harder or faster work.', '**Selector de modelo**: cambia de modelo (y de nivel de pensamiento donde exista) para trabajo más difícil o más rápido.')
        ] },
        { type: 'h', text: T('Memory and privacy', 'Memoria y privacidad') },
        { type: 'p', text: T('The apps can remember useful context across conversations when memory is enabled, and you can view, edit or turn it off. Incognito chats are not saved to your history or memory. On Team and Enterprise, admins control these settings. Remember: the model itself only "remembers" what the app puts in its context.', 'Las apps pueden recordar contexto útil entre conversaciones cuando la memoria está activada, y tú puedes verla, editarla o desactivarla. Los chats de incógnito no se guardan en tu historial ni en la memoria. En Team y Enterprise, los administradores controlan estos ajustes. Recuerda: el modelo solo «recuerda» lo que la app pone en su contexto.') },
        { type: 'note', text: T('Long chats accumulate context. When a conversation drifts or gets slow, start a new chat with a short summary of what matters, or move recurring material into a project (M07).', 'Los chats largos acumulan contexto. Cuando una conversación se desvía o se vuelve lenta, empieza un chat nuevo con un resumen corto de lo importante, o lleva el material recurrente a un proyecto (M07).') },
        { type: 'trap', text: T('Pasting the same 40-page document into every new chat wastes effort and context. Recurring background belongs in a project; repeatable procedures belong in a skill.', 'Pegar el mismo documento de 40 páginas en cada chat nuevo desperdicia esfuerzo y contexto. El material de fondo recurrente va en un proyecto; los procedimientos repetibles, en una skill.') }
      ],
      quiz: [
        { q: T('A reply is close but too long and too formal. What is the most efficient next move?', 'Una respuesta está cerca, pero es demasiado larga y formal. ¿Cuál es el siguiente paso más eficiente?'),
          options: [
            opt('Tell Claude exactly what to change (length, tone) and keep iterating in the same chat', 'Decirle a Claude exactamente qué cambiar (longitud, tono) y seguir iterando en el mismo chat', true, 'Steering with specific feedback is the core chat skill.', 'Dirigir con feedback concreto es la habilidad central del chat.'),
            opt('Delete the conversation and start over with the same original request word for word', 'Borrar la conversación y empezar de nuevo con la misma petición original palabra por palabra', false, 'Same request, same result; you lose the progress.', 'Misma petición, mismo resultado; y pierdes el avance.'),
            opt('Switch to the most expensive model and resend without any changes', 'Cambiar al modelo más caro y reenviar sin ningún cambio', false, 'Length and tone are a description problem, not capability.', 'La longitud y el tono son un problema de descripción, no de capacidad.'),
            opt('Accept it as is, since Claude cannot adjust tone once it has replied', 'Aceptarla tal cual, ya que Claude no puede ajustar el tono tras responder', false, 'It adjusts easily with feedback.', 'Se ajusta fácilmente con feedback.')
          ] },
        { q: T('You want a conversation that is not saved to your history or used for memory. What should you use?', 'Quieres una conversación que no se guarde en tu historial ni se use para la memoria. ¿Qué deberías usar?'),
          options: [
            opt('An incognito chat', 'Un chat de incógnito', true, 'Incognito chats are not saved to history or memory.', 'Los chats de incógnito no se guardan en el historial ni en la memoria.'),
            opt('A project with no files attached to it', 'Un proyecto sin archivos adjuntos', false, 'Projects are saved and persistent by design.', 'Los proyectos se guardan y persisten por diseño.'),
            opt('A custom style named "private"', 'Un estilo personalizado llamado «privado»', false, 'Styles change tone, not privacy.', 'Los estilos cambian el tono, no la privacidad.'),
            opt('The API, because the apps always store every chat', 'La API, porque las apps siempre guardan todos los chats', false, 'The apps offer incognito precisely for this.', 'Las apps ofrecen incógnito justamente para esto.')
          ] }
      ]
    },

    /* ================================================== M07 */
    {
      id: 'a07', track: 'academy', domain: 0, minutes: 10, art: 'mascot',
      title: T('Projects: standing knowledge and instructions', 'Proyectos: conocimiento e instrucciones permanentes'),
      summary: T('A project groups chats around one body of work. Its knowledge (files) and instructions are loaded into every chat in the project, so you set the context once instead of repeating it.',
                 'Un proyecto agrupa chats en torno a un mismo trabajo. Su conocimiento (archivos) y sus instrucciones se cargan en cada chat del proyecto, así que fijas el contexto una vez en lugar de repetirlo.'),
      objectives: [
        T('Set up project knowledge and project instructions.', 'Configurar el conocimiento y las instrucciones del proyecto.'),
        T('Decide what belongs in a project vs a skill vs a single chat.', 'Decidir qué va en un proyecto, qué en una skill y qué en un chat suelto.'),
        T('Share projects with a team.', 'Compartir proyectos con un equipo.')
      ],
      docs: [D.claude101, D.skills],
      blocks: [
        { type: 'steps', items: [
          T('**Create the project** and name it after the work (e.g. "Q4 board report").', '**Crea el proyecto** y nómbralo según el trabajo (p. ej. «Informe al directorio Q4»).'),
          T('**Add knowledge**: reference documents, data exports, brand guide, previous reports. For large knowledge bases Claude searches the relevant parts instead of reading everything.', '**Añade conocimiento**: documentos de referencia, exportaciones de datos, guía de marca, informes anteriores. Con bases grandes, Claude busca las partes relevantes en lugar de leerlo todo.'),
          T('**Write project instructions**: audience, tone, format, what to always check. These apply to every chat inside.', '**Escribe instrucciones del proyecto**: público, tono, formato, qué comprobar siempre. Se aplican a todos los chats de dentro.'),
          T('**Work in focused chats** inside the project; each starts with the shared context.', '**Trabaja en chats enfocados** dentro del proyecto; cada uno empieza con el contexto compartido.')
        ] },
        { type: 'table', head: [T('Put it in…', 'Ponlo en…'), T('When', 'Cuándo')], rows: [
          [T('A project', 'Un proyecto'), T('Background knowledge that should always be present for one body of work', 'Conocimiento de fondo que debe estar siempre presente en un mismo trabajo')],
          [T('A skill', 'Una skill'), T('A procedure you repeat across many projects (a report format, a checklist)', 'Un procedimiento que repites en muchos proyectos (un formato de informe, una checklist)')],
          [T('A single chat', 'Un chat suelto'), T('One-off questions with their own materials', 'Preguntas puntuales con sus propios materiales')]
        ] },
        { type: 'note', text: T('This is the same design idea as CLAUDE.md in Claude Code (M22): always-loaded context for "how we work here", while skills load only when needed. Recognizing the always-loaded vs on-demand distinction will help you on exam questions about CLAUDE.md, rules and skills.', 'Es la misma idea de diseño que CLAUDE.md en Claude Code (M22): contexto siempre cargado para «cómo trabajamos aquí», mientras las skills se cargan solo cuando hacen falta. Reconocer la diferencia entre «siempre cargado» y «bajo demanda» te ayudará en preguntas del examen sobre CLAUDE.md, reglas y skills.') },
        { type: 'p', text: T('On Team and Enterprise plans, projects can be shared with colleagues so everyone works from the same knowledge and instructions. Cowork has its own projects that group folders, instructions and context for tasks (M11).', 'En los planes Team y Enterprise, los proyectos se pueden compartir con colegas para que todos trabajen con el mismo conocimiento e instrucciones. Cowork tiene sus propios proyectos que agrupan carpetas, instrucciones y contexto para las tareas (M11).') },
        { type: 'trap', text: T('Project instructions are guidance Claude follows, not a guarantee. If something must happen every time without exception, the answer in agentic tools is a programmatic control (a hook), not stronger wording.', 'Las instrucciones del proyecto son una guía que Claude sigue, no una garantía. Si algo debe ocurrir siempre sin excepción, en las herramientas agénticas la respuesta es un control programático (un hook), no una redacción más firme.') }
      ],
      quiz: [
        { q: T('Your team writes weekly reports for one client using the same 12 reference documents and tone rules. What is the best setup?', 'Tu equipo redacta informes semanales para un cliente con los mismos 12 documentos de referencia y reglas de tono. ¿Cuál es la mejor configuración?'),
          options: [
            opt('A shared project with the documents as knowledge and the tone rules as instructions', 'Un proyecto compartido con los documentos como conocimiento y las reglas de tono como instrucciones', true, 'Standing context for one body of work belongs in a project.', 'El contexto permanente de un mismo trabajo va en un proyecto.'),
            opt('A new chat each week, uploading the 12 documents every time and pasting the tone rules', 'Un chat nuevo cada semana, subiendo los 12 documentos cada vez y pegando las reglas de tono', false, 'Repetitive and error-prone.', 'Repetitivo y propenso a errores.'),
            opt('A custom style containing the full text of all 12 documents', 'Un estilo personalizado con el texto completo de los 12 documentos', false, 'Styles shape tone, not knowledge.', 'Los estilos dan forma al tono, no al conocimiento.'),
            opt('Memory alone, hoping Claude recalls the documents next week', 'Solo la memoria, esperando que Claude recuerde los documentos la semana siguiente', false, 'Memory is not a document store.', 'La memoria no es un almacén de documentos.')
          ] },
        { q: T('Which statement about project instructions is correct?', '¿Qué afirmación sobre las instrucciones de un proyecto es correcta?'),
          options: [
            opt('They apply to every chat in the project, but they are guidance rather than enforcement', 'Se aplican a todos los chats del proyecto, pero son una guía, no un mecanismo que obligue', true, 'Always loaded; still probabilistic.', 'Siempre se cargan, pero siguen siendo probabilísticas.'),
            opt('They apply only to the first chat created in the project', 'Solo se aplican al primer chat creado en el proyecto', false, 'They apply to all chats in the project.', 'Se aplican a todos los chats del proyecto.'),
            opt('They are executed as code, so Claude cannot ever ignore them in any chat of the project', 'Se ejecutan como código, así que Claude nunca puede ignorarlas en ningún chat del proyecto', false, 'They are instructions, not code.', 'Son instrucciones, no código.'),
            opt('They replace the model\'s system prompt and disable all tools', 'Sustituyen el system prompt del modelo y desactivan todas las herramientas', false, 'They add context; tools keep working.', 'Añaden contexto; las herramientas siguen funcionando.')
          ] }
      ]
    },

    /* ================================================== M08 */
    {
      id: 'a08', track: 'academy', domain: 0, minutes: 12, art: 'mascot',
      title: T('Artifacts: creating things you can use and share', 'Artefactos: crear cosas que puedes usar y compartir'),
      summary: T('Artifacts are standalone outputs Claude creates beside the chat: documents, code, diagrams, web pages and interactive apps. You iterate on them in conversation, keep versions, and can publish or share them.',
                 'Los artefactos son resultados independientes que Claude crea junto al chat: documentos, código, diagramas, páginas web y apps interactivas. Iteras sobre ellos en la conversación, conservas versiones y puedes publicarlos o compartirlos.'),
      objectives: [
        T('Know which outputs become artifacts and how to iterate on them.', 'Saber qué resultados se convierten en artefactos y cómo iterar sobre ellos.'),
        T('Understand interactive and AI-powered artifacts.', 'Entender los artefactos interactivos y los que usan IA.'),
        T('Share and publish responsibly.', 'Compartir y publicar con responsabilidad.')
      ],
      docs: [D.claude101, D.support],
      blocks: [
        { type: 'list', items: [
          T('**Documents**: reports, briefs, plans in Markdown that you can copy or download.', '**Documentos**: informes, resúmenes, planes en Markdown que puedes copiar o descargar.'),
          T('**Code**: scripts and snippets with syntax highlighting.', '**Código**: scripts y fragmentos con resaltado de sintaxis.'),
          T('**Visuals**: SVG graphics, diagrams and charts.', '**Visuales**: gráficos SVG, diagramas y gráficas.'),
          T('**Interactive apps**: HTML/React pages such as calculators, dashboards, games and study tools that run in the browser.', '**Apps interactivas**: páginas HTML/React como calculadoras, paneles, juegos y herramientas de estudio que se ejecutan en el navegador.')
        ] },
        { type: 'steps', items: [
          T('Ask for something substantial: "Build a one-page dashboard that compares these three suppliers."', 'Pide algo sustancial: «Construye un panel de una página que compare estos tres proveedores.»'),
          T('Iterate in the chat: "Add a filter by region", "Use our brand colors". Each change creates a new version you can go back to.', 'Itera en el chat: «Añade un filtro por región», «Usa nuestros colores de marca». Cada cambio crea una versión a la que puedes volver.'),
          T('Share or publish when it is ready; on paid plans artifacts can call Claude themselves (AI-powered apps) and keep data between visits.', 'Comparte o publica cuando esté listo; en los planes de pago los artefactos pueden llamar a Claude (apps con IA) y conservar datos entre visitas.')
        ] },
        { type: 'note', text: T('An artifact is the "product" in the 4D sense: describe it well (what, for whom, constraints), discern carefully (test the app, check the numbers) and be diligent before sharing.', 'Un artefacto es el «producto» en el sentido de las 4D: descríbelo bien (qué, para quién, restricciones), discierne con cuidado (prueba la app, revisa las cifras) y sé diligente antes de compartirlo.') },
        { type: 'p', text: T('For office formats such as Word, Excel, PowerPoint and PDF, Claude uses file-creation skills (M10) in its code sandbox, producing real files with formulas and formatting rather than an artifact preview.', 'Para formatos de oficina como Word, Excel, PowerPoint y PDF, Claude usa skills de creación de archivos (M10) en su sandbox de código, produciendo archivos reales con fórmulas y formato en lugar de una vista previa de artefacto.') },
        { type: 'trap', text: T('Publishing makes content reachable by others. Do not publish anything that contains confidential data, credentials or personal information, and remember that a convincing interface can still contain wrong numbers.', 'Publicar hace que otros puedan acceder al contenido. No publiques nada con datos confidenciales, credenciales o información personal, y recuerda que una interfaz convincente puede contener cifras erróneas.') }
      ],
      quiz: [
        { q: T('You need a small interactive tool your team can open in a browser to estimate project costs. What should you ask Claude for?', 'Necesitas una pequeña herramienta interactiva que tu equipo pueda abrir en el navegador para estimar costos de proyectos. ¿Qué deberías pedirle a Claude?'),
          options: [
            opt('An interactive artifact (HTML/React calculator) that you iterate on and then share', 'Un artefacto interactivo (una calculadora HTML/React) sobre el que iteras y luego compartes', true, 'Interactive artifacts are built for exactly this.', 'Los artefactos interactivos están pensados justo para esto.'),
            opt('A long text explanation of the formula pasted into an email for each person to compute by hand', 'Una larga explicación en texto de la fórmula pegada en un correo para que cada persona calcule a mano', false, 'Not interactive or reusable.', 'No es interactivo ni reutilizable.'),
            opt('A custom style that makes every answer include a cost table', 'Un estilo personalizado que haga que cada respuesta incluya una tabla de costos', false, 'Styles do not create tools.', 'Los estilos no crean herramientas.'),
            opt('A connector to a spreadsheet provider, without any artifact', 'Un conector a un proveedor de hojas de cálculo, sin ningún artefacto', false, 'Connectors give access to data, not an interface.', 'Los conectores dan acceso a datos, no una interfaz.')
          ] },
        { q: T('You asked for three changes to an artifact and now prefer the second version. What can you do?', 'Pediste tres cambios en un artefacto y ahora prefieres la segunda versión. ¿Qué puedes hacer?'),
          options: [
            opt('Go back to that earlier version, since artifacts keep versions as you iterate', 'Volver a esa versión anterior, ya que los artefactos conservan versiones al iterar', true, 'Versions let you return to earlier states.', 'Las versiones te permiten volver a estados anteriores.'),
            opt('Nothing; each change permanently overwrites the previous artifact without history', 'Nada; cada cambio sobrescribe para siempre el artefacto anterior sin historial', false, 'Earlier versions remain available.', 'Las versiones anteriores siguen disponibles.'),
            opt('Rebuild it from scratch in a new chat with no history', 'Reconstruirlo desde cero en un chat nuevo sin historial', false, 'Unnecessary work.', 'Trabajo innecesario.'),
            opt('Ask an administrator to restore it from a backup', 'Pedir a un administrador que lo restaure desde una copia de seguridad', false, 'You can do it yourself from the versions.', 'Puedes hacerlo tú mismo desde las versiones.')
          ] }
      ]
    },

    /* ================================================== M09 */
    {
      id: 'a09', track: 'academy', domain: 0, minutes: 13, art: 'mascot', exam: ['2.4'],
      title: T('Research, search and connectors', 'Research, búsqueda y conectores'),
      summary: T('Web search brings current facts with citations; Research runs a deeper multi-step investigation; connectors (MCP) let Claude read from and act in your own tools such as Drive, Gmail, Microsoft 365, GitHub, Slack or an internal system.',
                 'La búsqueda web trae datos actuales con citas; Research hace una investigación más profunda en varios pasos; y los conectores (MCP) permiten a Claude leer y actuar en tus propias herramientas, como Drive, Gmail, Microsoft 365, GitHub, Slack o un sistema interno.'),
      objectives: [
        T('Choose between quick search, deep research and a connector.', 'Elegir entre una búsqueda rápida, una investigación profunda y un conector.'),
        T('Add, enable and manage connectors safely.', 'Añadir, activar y gestionar conectores con seguridad.'),
        T('Understand that a connector is a connection to an MCP server.', 'Entender que un conector es una conexión a un servidor MCP.')
      ],
      docs: [D.connectors, D.extend, D.claude101],
      blocks: [
        { type: 'table', head: [T('Need', 'Necesidad'), T('Use', 'Usa')], rows: [
          [T('A current fact, price or news item', 'Un dato, precio o noticia actual'), T('Web search', 'Búsqueda web')],
          [T('A thorough, cited report across many sources', 'Un informe completo y con citas a partir de muchas fuentes'), T('Research', 'Research')],
          [T('Your own emails, files, calendar, tickets, internal data', 'Tus propios correos, archivos, calendario, tickets y datos internos'), T('A connector (plus enterprise search where available)', 'Un conector (más la búsqueda empresarial donde exista)')]
        ] },
        { type: 'steps', items: [
          T('Open **Customize > Connectors** and pick one from the **Connectors Directory**, or add a custom one by its MCP server URL.', 'Abre **Customize > Connectors** y elige uno del **Connectors Directory**, o añade uno personalizado con la URL de su servidor MCP.'),
          T('**Connect** (sign in to the service with your own account).', '**Conecta** (inicia sesión en el servicio con tu propia cuenta).'),
          T('**Enable it in the conversation** where you need it, and ask your question.', '**Actívalo en la conversación** donde lo necesites y haz tu pregunta.'),
          T('Disconnect or turn it off any time.', 'Desconéctalo o apágalo cuando quieras.')
        ] },
        { type: 'note', text: T('Under the hood every connector is a remote **MCP server** (M19). The same connectors work across claude.ai, the desktop app, mobile, Cowork and Claude Code. Desktop extensions (.mcpb files) package local MCP servers for one-click install.', 'Por debajo, cada conector es un **servidor MCP** remoto (M19). Los mismos conectores funcionan en claude.ai, la app de escritorio, el móvil, Cowork y Claude Code. Las extensiones de escritorio (archivos .mcpb) empaquetan servidores MCP locales para instalarlos con un clic.') },
        { type: 'list', items: [
          T('**Directory labels**: Verified, Community and Custom indicate how much Anthropic reviewed a connector.', '**Etiquetas del directorio**: Verified, Community y Custom indican cuánto revisó Anthropic un conector.'),
          T('**Prompt injection**: content returned by a connector (an email, a web page) can contain instructions. Claude treats it as data, and you should only connect services you trust.', '**Prompt injection**: el contenido que devuelve un conector (un correo, una página web) puede contener instrucciones. Claude lo trata como datos, y tú solo debes conectar servicios de confianza.'),
          T('**Least access**: on Team and Enterprise, owners decide which connectors are available and whether risky tools require approval.', '**Acceso mínimo**: en Team y Enterprise, los Owners deciden qué conectores están disponibles y si las herramientas de riesgo requieren aprobación.')
        ] },
        { type: 'trap', text: T('In Claude Code the same idea appears as `.mcp.json` (project) vs `~/.claude.json` (user). The exam asks which scope shares a server with a team: project scope, with secrets in environment variables.', 'En Claude Code la misma idea aparece como `.mcp.json` (proyecto) vs `~/.claude.json` (usuario). El examen pregunta qué alcance comparte un servidor con el equipo: el de proyecto, con los secretos en variables de entorno.') }
      ],
      quiz: [
        { q: T('You want Claude to answer "What did the client agree to in last month\'s emails?" from your inbox. What do you need?', 'Quieres que Claude responda «¿Qué aceptó el cliente en los correos del mes pasado?» usando tu bandeja de entrada. ¿Qué necesitas?'),
          options: [
            opt('An email connector (for example Gmail or Microsoft 365) connected and enabled', 'Un conector de correo (por ejemplo Gmail o Microsoft 365) conectado y activado', true, 'Private data requires a connector to that service.', 'Los datos privados requieren un conector a ese servicio.'),
            opt('Web search, since it can read any inbox on the internet once you give it the address', 'La búsqueda web, ya que puede leer cualquier bandeja de entrada en internet cuando le das la dirección', false, 'Web search reaches public pages, not your inbox.', 'La búsqueda web llega a páginas públicas, no a tu correo.'),
            opt('A higher effort level so Claude remembers your emails', 'Un nivel de effort más alto para que Claude recuerde tus correos', false, 'Effort does not grant data access.', 'El effort no da acceso a datos.'),
            opt('A custom style describing the client\'s writing tone', 'Un estilo personalizado que describa el tono del cliente', false, 'Style does not provide data.', 'El estilo no aporta datos.')
          ] },
        { q: T('What is a connector, technically?', '¿Qué es un conector, técnicamente?'),
          options: [
            opt('A connection to an MCP server that exposes tools and data from a service', 'Una conexión a un servidor MCP que expone herramientas y datos de un servicio', true, 'Connectors are MCP connections.', 'Los conectores son conexiones MCP.'),
            opt('A browser extension that copies your screen into the chat', 'Una extensión de navegador que copia tu pantalla en el chat', false, 'That is not what connectors are.', 'Eso no es un conector.'),
            opt('A fine-tuned version of Claude trained on that service\'s data every night', 'Una versión de Claude ajustada con los datos de ese servicio cada noche', false, 'No fine-tuning is involved.', 'No hay ningún ajuste fino.'),
            opt('A saved prompt that tells Claude to search the web first', 'Un prompt guardado que le dice a Claude que busque primero en la web', false, 'That would be a skill or instruction at most.', 'Eso sería, como mucho, una skill o una instrucción.')
          ] }
      ]
    },

    /* ================================================== M10 */
    {
      id: 'a10', track: 'academy', domain: 0, minutes: 13, art: 'mascot', exam: ['3.2'],
      title: T('Skills and plugins in the Claude app', 'Skills y plugins en la app de Claude'),
      summary: T('Skills teach Claude how to do a task your way: a folder with SKILL.md plus optional scripts and references, loaded only when relevant. Plugins package skills, connectors, commands and agents into one install you can share.',
                 'Las skills enseñan a Claude a hacer una tarea a tu manera: una carpeta con SKILL.md más scripts y referencias opcionales, que se carga solo cuando es relevante. Los plugins empaquetan skills, conectores, comandos y agentes en una sola instalación que puedes compartir.'),
      objectives: [
        T('Explain progressive disclosure: description → SKILL.md → supporting files.', 'Explicar la divulgación progresiva: descripción → SKILL.md → archivos de apoyo.'),
        T('Turn on Anthropic skills (Word, Excel, PowerPoint, PDF) and create a custom skill.', 'Activar las skills de Anthropic (Word, Excel, PowerPoint, PDF) y crear una propia.'),
        T('Compare skills, projects, connectors and plugins.', 'Comparar skills, proyectos, conectores y plugins.')
      ],
      docs: [D.skills, D.plugins, D.extend, { label: 'Skilljar · Introduction to agent skills', url: 'https://anthropic.skilljar.com/introduction-to-agent-skills' }],
      blocks: [
        { type: 'code', lang: 'yaml', title: 'weekly-report/SKILL.md', code: `
---
name: weekly-report
description: Writes our weekly client report. Use when the user asks for the weekly report, a status update for a client, or a summary of the week.
---
1. Read the attached data export.
2. Use the structure in template.md: Highlights, Risks, Next steps.
3. Keep it under one page. Numbers with two decimals.
4. Run scripts/check_totals.py and fix any mismatch before answering.` },
        { type: 'steps', items: [
          T('**Claude knows what exists**: only each skill\'s name and description are always in context.', '**Claude sabe qué existe**: solo el nombre y la descripción de cada skill están siempre en contexto.'),
          T('**Loads the one that fits**: when your request matches a description, it reads that SKILL.md.', '**Carga la que encaja**: cuando tu petición coincide con una descripción, lee ese SKILL.md.'),
          T('**Opens extra files only when needed**: references and scripts load or run on demand.', '**Abre archivos extra solo si hace falta**: las referencias y los scripts se cargan o se ejecutan bajo demanda.')
        ] },
        { type: 'list', items: [
          T('**Anthropic skills** create Excel (with working formulas), Word, PowerPoint and PDF files. Skills run in Claude\'s code sandbox, so "Code execution and file creation" must be on.', '**Las skills de Anthropic** crean archivos de Excel (con fórmulas que funcionan), Word, PowerPoint y PDF. Las skills se ejecutan en el sandbox de código de Claude, así que «Code execution and file creation» debe estar activado.'),
          T('**Invoke** by describing the task (Claude matches the description) or by typing `/` and choosing the skill.', '**Invócalas** describiendo la tarea (Claude compara con la descripción) o escribiendo `/` y eligiendo la skill.'),
          T('**Open standard**: skills follow the Agent Skills specification, so they also work in other tools that adopt it, and the same skill works in chat, Cowork, Claude Code and the API.', '**Estándar abierto**: las skills siguen la especificación Agent Skills, así que también funcionan en otras herramientas que la adopten, y la misma skill funciona en el chat, Cowork, Claude Code y la API.'),
          T('**Read before you enable**: shared or uploaded skills are not reviewed by Anthropic and can run scripts.', '**Léelas antes de activarlas**: las skills compartidas o subidas no las revisa Anthropic y pueden ejecutar scripts.')
        ] },
        { type: 'table', head: [T('Feature', 'Función'), T('Purpose', 'Propósito')], rows: [
          [T('Skill', 'Skill'), T('A procedure loaded when a task matches', 'Un procedimiento que se carga cuando una tarea coincide')],
          [T('Project', 'Proyecto'), T('Background knowledge always loaded in that project', 'Conocimiento de fondo siempre cargado en ese proyecto')],
          [T('Connector', 'Conector'), T('Access to an external service via MCP', 'Acceso a un servicio externo vía MCP')],
          [T('Plugin', 'Plugin'), T('A package of skills, connectors, commands and agents, installed as one unit', 'Un paquete de skills, conectores, comandos y agentes, instalado como una unidad')]
        ] },
        { type: 'note', text: T('Plugins are added from **Customize > Plugins** (Discover, add a marketplace, or upload). Chat uses a plugin\'s skills, commands and connectors; Cowork and Claude Code also run its agents. You can even create a plugin by chatting with Claude ("Create with Claude").', 'Los plugins se añaden desde **Customize > Plugins** (Discover, añadir un marketplace o subir un archivo). El chat usa las skills, comandos y conectores de un plugin; Cowork y Claude Code además ejecutan sus agentes. Incluso puedes crear un plugin conversando con Claude («Create with Claude»).') },
        { type: 'trap', text: T('A skill\'s description is the only part Claude sees before deciding to use it. A vague description means the skill never triggers: the same lesson as tool descriptions on the exam (2.1).', 'La descripción de una skill es lo único que Claude ve antes de decidir usarla. Si es vaga, la skill nunca se activa: es la misma lección que las descripciones de tools en el examen (2.1).') }
      ],
      quiz: [
        { q: T('Your custom skill never activates, even when users ask for exactly what it does. What should you fix first?', 'Tu skill propia nunca se activa, aunque los usuarios piden exactamente lo que hace. ¿Qué deberías arreglar primero?'),
          options: [
            opt('The description: say clearly what it does and when to use it, with trigger phrases', 'La descripción: decir con claridad qué hace y cuándo usarla, con frases que la activen', true, 'The description is what Claude matches against.', 'La descripción es contra lo que Claude compara.'),
            opt('The scripts folder, by adding more helper scripts', 'La carpeta de scripts, añadiendo más scripts auxiliares', false, 'Scripts load only after the skill is chosen.', 'Los scripts solo se cargan después de elegir la skill.'),
            opt('The model, by switching to Fable 5.1 for every chat', 'El modelo, cambiando a Fable 5.1 en todos los chats', false, 'Triggering depends on the description, not model size.', 'La activación depende de la descripción, no del tamaño del modelo.'),
            opt('The length of SKILL.md, by making it as long as possible with every detail inline', 'La longitud de SKILL.md, haciéndolo lo más largo posible con cada detalle incluido', false, 'The body is not seen before selection.', 'El cuerpo no se ve antes de la selección.')
          ] },
        { q: T('You want to give your whole team one install that adds a Jira connector plus three skills that use it. What should you create?', 'Quieres dar a todo tu equipo una sola instalación que añada un conector de Jira y tres skills que lo usan. ¿Qué deberías crear?'),
          options: [
            opt('A plugin that bundles the connector and the skills', 'Un plugin que agrupe el conector y las skills', true, 'Plugins package several components as one unit.', 'Los plugins empaquetan varios componentes como una unidad.'),
            opt('A project with the three skills pasted into its instructions', 'Un proyecto con las tres skills pegadas en sus instrucciones', false, 'Projects do not install connectors or skills.', 'Los proyectos no instalan conectores ni skills.'),
            opt('A custom style that mentions Jira in every response', 'Un estilo personalizado que mencione Jira en cada respuesta', false, 'Styles change tone only.', 'Los estilos solo cambian el tono.'),
            opt('Three separate chats, each sharing one skill as a link', 'Tres chats separados, cada uno compartiendo una skill como enlace', false, 'Not a single install and no connector.', 'No es una sola instalación y no incluye el conector.')
          ] }
      ]
    },

    /* ================================================== M11 */
    {
      id: 'a11', track: 'academy', domain: 0, minutes: 14, art: 'mascot',
      title: T('Cowork: Claude working on your computer', 'Cowork: Claude trabajando en tu computadora'),
      summary: T('Cowork brings Claude Code\'s agentic architecture into the Claude desktop app. You describe an outcome; Claude plans, works directly with your files and apps, splits work across sub-agents, and delivers finished outputs while you steer.',
                 'Cowork lleva la arquitectura agéntica de Claude Code a la app de escritorio de Claude. Describes un resultado; Claude planifica, trabaja directamente con tus archivos y apps, reparte el trabajo entre subagentes y entrega resultados terminados mientras tú diriges.'),
      objectives: [
        T('Hand Cowork a first end-to-end task and steer it.', 'Darle a Cowork una primera tarea de principio a fin y dirigirla.'),
        T('Give standing context with global instructions, projects, skills and plugins.', 'Dar contexto permanente con instrucciones globales, proyectos, skills y plugins.'),
        T('Work safely: scoped folders, review, and validated skills before sharing.', 'Trabajar con seguridad: carpetas acotadas, revisión y skills validadas antes de compartir.')
      ],
      docs: [D.coworkDocs, D.cowork, D.plugins],
      blocks: [
        { type: 'steps', items: [
          T('**Describe the outcome**, not the clicks: "Turn the invoices in /Finance/Oct into a reconciled Excel file and a one-page summary."', '**Describe el resultado**, no los clics: «Convierte las facturas de /Finanzas/Oct en un Excel conciliado y un resumen de una página.»'),
          T('**Claude plans** and shows the steps; adjust the plan if needed.', '**Claude planifica** y muestra los pasos; ajusta el plan si hace falta.'),
          T('**Claude executes**: reads and writes local files, uses connectors and, paired with Claude in Chrome, websites; sub-agents run parallel workstreams.', '**Claude ejecuta**: lee y escribe archivos locales, usa conectores y, junto con Claude in Chrome, sitios web; los subagentes ejecutan trabajos en paralelo.'),
          T('**You steer and review**: answer questions, redirect, then check the deliverables before using them.', '**Tú diriges y revisas**: respondes preguntas, rediriges y luego revisas los entregables antes de usarlos.')
        ] },
        { type: 'list', items: [
          T('**Outputs**: Excel with working formulas, PowerPoint decks, formatted documents, organized folders, synthesized research.', '**Entregables**: Excel con fórmulas que funcionan, presentaciones de PowerPoint, documentos con formato, carpetas organizadas, investigación sintetizada.'),
          T('**Standing context**: global instructions and Cowork projects (folders + instructions + context) so each session starts set up.', '**Contexto permanente**: instrucciones globales y proyectos de Cowork (carpetas + instrucciones + contexto) para que cada sesión empiece configurada.'),
          T('**Skills and plugins**: teach Cowork your way of working; plugins encode a team\'s expertise. Cowork loads what is enabled on your claude.ai account (Customize), not the CLI\'s ~/.claude folder.', '**Skills y plugins**: enseñan a Cowork tu forma de trabajar; los plugins codifican la experiencia de un equipo. Cowork carga lo activado en tu cuenta de claude.ai (Customize), no la carpeta ~/.claude de la CLI.'),
          T('**Dispatch**: assign work to a background agent that plans, runs and reports, even from your phone.', '**Dispatch**: asigna trabajo a un agente en segundo plano que planifica, ejecuta e informa, incluso desde tu teléfono.'),
          T('**Everywhere you work**: Claude in Chrome for websites; Claude for Microsoft 365 in Word, Excel, PowerPoint and Outlook.', '**Donde trabajes**: Claude in Chrome para sitios web; Claude for Microsoft 365 en Word, Excel, PowerPoint y Outlook.')
        ] },
        { type: 'compare',
          bad: { title: T('Risky habits', 'Hábitos de riesgo'), items: [
            T('Giving access to your whole drive for a small task', 'Dar acceso a todo tu disco para una tarea pequeña'),
            T('Sharing deliverables without checking numbers', 'Compartir entregables sin revisar las cifras'),
            T('Installing unreviewed plugins from unknown sources', 'Instalar plugins sin revisar de fuentes desconocidas')
          ] },
          good: { title: T('Safe habits', 'Hábitos seguros'), items: [
            T('Scope the folder to what the task needs', 'Acotar la carpeta a lo que la tarea necesita'),
            T('Review outputs before they leave your hands', 'Revisar los entregables antes de que salgan de tus manos'),
            T('Validate skills and plugins before sharing with your team', 'Validar skills y plugins antes de compartirlos con tu equipo')
          ] } },
        { type: 'note', text: T('Cowork is the clearest example of a **harness** (M24) for non-developers: the same loop of plan → act with tools → observe → continue that powers Claude Code and the Agent SDK.', 'Cowork es el ejemplo más claro de un **harness** (M24) para quien no programa: el mismo bucle de planificar → actuar con herramientas → observar → continuar que mueve Claude Code y el Agent SDK.') },
        { type: 'trap', text: T('"Cowork is just a chat with file upload" is wrong. It acts autonomously across multiple steps and files, which is exactly why scoping and review matter.', '«Cowork es solo un chat con subida de archivos» es incorrecto. Actúa de forma autónoma en varios pasos y archivos, y justamente por eso importan el acotado y la revisión.') }
      ],
      quiz: [
        { q: T('Cowork does not see a skill you created in ~/.claude/skills with the Claude Code CLI. Why?', 'Cowork no ve una skill que creaste en ~/.claude/skills con la CLI de Claude Code. ¿Por qué?'),
          options: [
            opt('Cowork loads skills enabled on your claude.ai account (Customize), not the CLI folder', 'Cowork carga las skills activadas en tu cuenta de claude.ai (Customize), no la carpeta de la CLI', true, 'Add the skill in Customize to use it in Cowork.', 'Añade la skill en Customize para usarla en Cowork.'),
            opt('Skills are not supported in Cowork under any circumstances, only in the terminal', 'Las skills no se admiten en Cowork bajo ninguna circunstancia, solo en la terminal', false, 'Cowork supports skills.', 'Cowork admite skills.'),
            opt('The skill must be renamed to cowork.md to be discovered', 'La skill debe renombrarse a cowork.md para que se detecte', false, 'No such convention.', 'No existe esa convención.'),
            opt('Cowork needs a higher effort level to read skill files', 'Cowork necesita un effort más alto para leer archivos de skills', false, 'Effort is unrelated.', 'El effort no tiene relación.')
          ] },
        { q: T('You want Cowork to clean up a client folder. What is the safest setup?', 'Quieres que Cowork ordene la carpeta de un cliente. ¿Cuál es la configuración más segura?'),
          options: [
            opt('Give access only to that client folder and review the result before sharing', 'Dar acceso solo a la carpeta de ese cliente y revisar el resultado antes de compartirlo', true, 'Scoping plus review is the recommended practice.', 'Acotar y revisar es la práctica recomendada.'),
            opt('Give access to the entire drive so Claude has full context', 'Dar acceso a todo el disco para que Claude tenga todo el contexto', false, 'Broader than needed; increases risk.', 'Más amplio de lo necesario; aumenta el riesgo.'),
            opt('Skip the plan step to finish faster and avoid interruptions', 'Saltarse el paso del plan para terminar antes y evitar interrupciones', false, 'The plan is where you catch problems early.', 'En el plan es donde detectas problemas a tiempo.'),
            opt('Install any plugin that promises to organize files automatically first', 'Instalar cualquier plugin que prometa ordenar archivos automáticamente, antes de nada', false, 'Unreviewed plugins run with your permissions.', 'Los plugins sin revisar se ejecutan con tus permisos.')
          ] }
      ]
    }
  ]);
})();
