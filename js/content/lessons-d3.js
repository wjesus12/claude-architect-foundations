/* Dominio 3 — Claude Code Configuration & Workflows (20 %) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const DOCS = {
    memory: { label: 'Manage Claude\'s memory (CLAUDE.md)', url: 'https://docs.claude.com/en/docs/claude-code/memory' },
    slash: { label: 'Slash commands', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' },
    skills: { label: 'Agent Skills', url: 'https://docs.claude.com/en/docs/claude-code/skills' },
    common: { label: 'Common workflows (plan mode)', url: 'https://docs.claude.com/en/docs/claude-code/common-workflows' },
    headless: { label: 'Headless mode / CLI reference', url: 'https://docs.claude.com/en/docs/claude-code/cli-reference' },
    practices: { label: 'Claude Code best practices', url: 'https://www.anthropic.com/engineering/claude-code-best-practices' }
  };

  CAF.addLessons([
    /* ---------------------------------------------------------- 3.1 */
    {
      id: '3.1', domain: 3, minutes: 13, docs: [DOCS.memory],
      summary: T('CLAUDE.md has levels: **user** (only you), **project** (everyone, via git) and **directory** (that subtree). Most "Claude ignores our standard for the new hire" questions are a file in the wrong level.',
                 'CLAUDE.md tiene niveles: **usuario** (solo tú), **proyecto** (todos, vía git) y **directorio** (ese subárbol). La mayoría de preguntas del tipo «Claude ignora nuestro estándar con la persona nueva» se deben a un archivo en el nivel equivocado.'),
      objectives: [
        T('Place instructions at the right level and diagnose hierarchy issues.', 'Poner las instrucciones en el nivel correcto y diagnosticar problemas de jerarquía.'),
        T('Keep CLAUDE.md modular with `@import` and `.claude/rules/`.', 'Mantener CLAUDE.md modular con `@import` y `.claude/rules/`.'),
        T('Use `/memory` to see which memory files are loaded.', 'Usar `/memory` para ver qué archivos de memoria están cargados.')
      ],
      blocks: [
        { type: 'table', head: [T('Level', 'Nivel'), T('Path', 'Ruta'), T('Shared?', '¿Compartido?')], rows: [
          [T('User', 'Usuario'), T('`~/.claude/CLAUDE.md`', '`~/.claude/CLAUDE.md`'), T('No, only you, on your machine', 'No, solo tú, en tu máquina')],
          [T('Project', 'Proyecto'), T('`./CLAUDE.md` or `./.claude/CLAUDE.md`', '`./CLAUDE.md` o `./.claude/CLAUDE.md`'), T('Yes, committed to the repo', 'Sí, versionado en el repo')],
          [T('Directory', 'Directorio'), T('`packages/api/CLAUDE.md`', '`packages/api/CLAUDE.md`'), T('Yes, applies to that subtree', 'Sí, aplica a ese subárbol')]
        ] },
        { type: 'example', situation: T('A new developer\'s Claude Code does not follow the team\'s testing conventions, but yours does. The conventions live in your `~/.claude/CLAUDE.md`.',
                                        'El Claude Code de una persona recién llegada no sigue las convenciones de testing del equipo, pero el tuyo sí. Las convenciones están en tu `~/.claude/CLAUDE.md`.'),
          answer: T('User-level files are not shared through version control. Move the conventions to the **project** CLAUDE.md and commit it.', 'Los archivos de nivel usuario no se comparten por control de versiones. Mueve las convenciones al CLAUDE.md del **proyecto** y versiónalo.') },
        { type: 'code', lang: 'md', title: 'packages/billing/CLAUDE.md', code: `
# Billing package

@../../docs/standards/money-handling.md
@../../docs/standards/api-errors.md

- Amounts are integers in cents. Never use floats for money.
- Run \`pnpm test billing\` before proposing a commit.`,
          caption: T('`@import` pulls in only the standards this package\'s maintainers chose, so each package stays focused.', '`@import` trae solo los estándares que eligieron los mantenedores del paquete, así cada paquete se mantiene enfocado.') },
        { type: 'h', text: T('From monolith to topic files', 'Del monolito a archivos por tema') },
        { type: 'p', text: T('A 900-line CLAUDE.md is hard to maintain and loads everything always. Split it into `.claude/rules/testing.md`, `api-conventions.md`, `deployment.md`. Those rule files can also be **path-scoped** (lesson 3.3).',
                             'Un CLAUDE.md de 900 líneas es difícil de mantener y lo carga todo siempre. Divídelo en `.claude/rules/testing.md`, `api-conventions.md`, `deployment.md`. Esos archivos de reglas también pueden **acotarse por ruta** (lección 3.3).') },
        { type: 'note', text: T('Inconsistent behavior across sessions or machines? Run `/memory` to see exactly which memory files are loaded.', '¿Comportamiento inconsistente entre sesiones o máquinas? Ejecuta `/memory` para ver exactamente qué archivos de memoria están cargados.') },
        { type: 'trap', text: T('`.claude/config.json` with a "commands" or "instructions" array does not exist. Distractors invent config files.', '`.claude/config.json` con un array de «commands» o «instructions» no existe. Los distractores inventan archivos de configuración.') }
      ],
      quiz: [
        { q: T('Only you get Claude to follow the team\'s naming conventions; two new hires do not. Most likely cause?', 'Solo a ti Claude te sigue las convenciones de nombres del equipo; a dos personas nuevas no. ¿Causa más probable?'),
          options: [
            opt('The conventions are in your user-level ~/.claude/CLAUDE.md instead of the project CLAUDE.md', 'Las convenciones están en tu ~/.claude/CLAUDE.md de usuario en lugar del CLAUDE.md del proyecto', true, 'User-level memory is not shared via version control.', 'La memoria de usuario no se comparte por control de versiones.'),
            opt('The new hires use a different model version that ignores project-level memory files', 'Las personas nuevas usan otra versión del modelo que ignora los archivos de memoria del proyecto', false, 'Not a configuration-hierarchy explanation.', 'No explica un problema de jerarquía de configuración.'),
            opt('CLAUDE.md only loads after 10 sessions', 'CLAUDE.md solo se carga tras 10 sesiones', false, 'Not true.', 'No es cierto.'),
            opt('Their CLAUDE.md is too short', 'Su CLAUDE.md es demasiado corto', false, 'They have none with those conventions at all.', 'Ni siquiera tienen uno con esas convenciones.')
          ] },
        { q: T('Each package in a monorepo should include only the standards relevant to it, chosen by its maintainers. Best mechanism?', 'Cada paquete de un monorepo debe incluir solo los estándares que le conciernen, elegidos por sus mantenedores. ¿Mejor mecanismo?'),
          options: [
            opt('@import the relevant standards files from each package\'s CLAUDE.md', 'Hacer @import de los estándares relevantes desde el CLAUDE.md de cada paquete', true, 'Modular, selective inclusion.', 'Inclusión modular y selectiva.'),
            opt('Copy all standards into the root CLAUDE.md', 'Copiar todos los estándares en el CLAUDE.md raíz', false, 'Monolithic and loads everything everywhere.', 'Es monolítico y lo carga todo en todas partes.'),
            opt('Put the relevant standards in each package developer\'s ~/.claude/CLAUDE.md', 'Poner los estándares relevantes en el ~/.claude/CLAUDE.md de cada desarrollador del paquete', false, 'Not shared and not per package.', 'No se comparte ni va por paquete.'),
            opt('Create a skill per standard', 'Crear una skill por estándar', false, 'Skills are on-demand; standards should apply automatically.', 'Las skills son bajo demanda; los estándares deben aplicarse automáticamente.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 3.2 */
    {
      id: '3.2', domain: 3, minutes: 14, docs: [DOCS.slash, DOCS.skills],
      summary: T('Commands and skills live in `.claude/` (team, via git) or `~/.claude/` (personal). Skills add frontmatter: `context: fork` isolates verbose work, `allowed-tools` restricts what the skill can do, `argument-hint` asks for missing parameters.',
                 'Los comandos y las skills viven en `.claude/` (equipo, vía git) o en `~/.claude/` (personal). Las skills añaden frontmatter: `context: fork` aísla el trabajo extenso, `allowed-tools` limita lo que la skill puede hacer y `argument-hint` pide los parámetros que faltan.'),
      objectives: [
        T('Choose project vs user scope for commands and skills.', 'Elegir entre alcance de proyecto o de usuario para comandos y skills.'),
        T('Configure SKILL.md frontmatter: context: fork, allowed-tools, argument-hint.', 'Configurar el frontmatter de SKILL.md: context: fork, allowed-tools, argument-hint.'),
        T('Decide between a skill (on demand) and CLAUDE.md (always loaded).', 'Decidir entre una skill (bajo demanda) y CLAUDE.md (siempre cargado).')
      ],
      blocks: [
        { type: 'table', head: [T('What', 'Qué'), T('Team (git)', 'Equipo (git)'), T('Personal', 'Personal')], rows: [
          [T('Slash commands', 'Slash commands'), T('`.claude/commands/review.md` → `/review`', '`.claude/commands/review.md` → `/review`'), T('`~/.claude/commands/`', '`~/.claude/commands/`')],
          [T('Skills', 'Skills'), T('`.claude/skills/<name>/SKILL.md`', '`.claude/skills/<name>/SKILL.md`'), T('`~/.claude/skills/<name>/SKILL.md`', '`~/.claude/skills/<name>/SKILL.md`')]
        ] },
        { type: 'code', lang: 'yaml', title: '.claude/skills/codebase-map/SKILL.md', code: `
---
name: codebase-map
description: Maps an unfamiliar module and returns a short architecture summary.
context: fork
allowed-tools: Read, Grep, Glob
argument-hint: <path to the module, e.g. src/billing>
---
Explore the module at $ARGUMENTS. Return: entry points, main data flow,
external dependencies and the 5 files a newcomer should read first.`,
          caption: T('`context: fork` runs it in an isolated sub-agent context, so dozens of file reads never pollute the main conversation. Only the summary comes back.', '`context: fork` la ejecuta en un contexto aislado de subagente, así decenas de lecturas de archivos nunca ensucian la conversación principal. Solo vuelve el resumen.') },
        { type: 'terms', items: [
          { term: 'context: fork', en: 'Isolated sub-agent context. Use for verbose output (codebase analysis) or exploratory brainstorming.', es: 'Contexto aislado de subagente. Úsalo para salidas extensas (análisis de código) o lluvias de ideas exploratorias.' },
          { term: 'allowed-tools', en: 'Restricts tools during the skill, e.g. read-only or write-only, to prevent destructive actions.', es: 'Restringe las tools durante la skill, p. ej. solo lectura o solo escritura, para evitar acciones destructivas.' },
          { term: 'argument-hint', en: 'Prompts the developer for required parameters when the skill is invoked without arguments.', es: 'Pide al desarrollador los parámetros necesarios cuando invoca la skill sin argumentos.' }
        ] },
        { type: 'table', head: [T('Put it in…', 'Ponlo en…'), T('When', 'Cuándo')], rows: [
          [T('CLAUDE.md', 'CLAUDE.md'), T('Universal standards that must always apply', 'Estándares universales que siempre deben aplicarse')],
          [T('A skill', 'Una skill'), T('A task-specific workflow invoked on demand', 'Un flujo para una tarea concreta, invocado bajo demanda')]
        ] },
        { type: 'note', text: T('Want your own twist on a team skill? Create a personal variant in `~/.claude/skills/` with a **different name** so teammates are not affected.', '¿Quieres tu propia versión de una skill del equipo? Crea una variante personal en `~/.claude/skills/` con **otro nombre** para no afectar a tus compañeros.') },
        { type: 'trap', text: T('"/review must be available to everyone who clones the repo" → `.claude/commands/` in the repository. Not `~/.claude/commands/`, not CLAUDE.md, not a config.json array.', '«/review debe estar disponible para todos los que clonen el repo» → `.claude/commands/` en el repositorio. No `~/.claude/commands/`, ni CLAUDE.md, ni un array en config.json.') }
      ],
      quiz: [
        { q: T('A /review command must be available to every developer who clones or pulls the repo. Where do you create it?', 'Un comando /review debe estar disponible para todos los desarrolladores que clonen o actualicen el repo. ¿Dónde lo creas?'),
          options: [
            opt('.claude/commands/ in the project repository', '.claude/commands/ en el repositorio del proyecto', true, 'Project-scoped, version-controlled commands.', 'Comandos del proyecto, versionados.'),
            opt('~/.claude/commands/ on each machine', '~/.claude/commands/ en cada máquina', false, 'Personal, not shared.', 'Personal, no compartido.'),
            opt('Inside CLAUDE.md', 'Dentro de CLAUDE.md', false, 'CLAUDE.md holds instructions, not command definitions.', 'CLAUDE.md contiene instrucciones, no definiciones de comandos.'),
            opt('A commands array in .claude/config.json', 'Un array commands en .claude/config.json', false, 'That mechanism does not exist.', 'Ese mecanismo no existe.')
          ] },
        { q: T('A codebase-analysis skill floods the main conversation with hundreds of lines of file output. Which frontmatter fixes it?', 'Una skill de análisis de código inunda la conversación principal con cientos de líneas de salida de archivos. ¿Qué frontmatter lo arregla?'),
          options: [
            opt('context: fork', 'context: fork', true, 'Runs the skill in an isolated sub-agent context.', 'Ejecuta la skill en un contexto aislado de subagente.'),
            opt('argument-hint', 'argument-hint', false, 'Only prompts for parameters.', 'Solo pide parámetros.'),
            opt('allowed-tools: Write', 'allowed-tools: Write', false, 'Restricts tools; does not isolate output.', 'Restringe tools; no aísla la salida.'),
            opt('Moving the skill into CLAUDE.md', 'Mover la skill a CLAUDE.md', false, 'Would load it always and still pollute context.', 'Se cargaría siempre y seguiría ensuciando el contexto.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 3.3 */
    {
      id: '3.3', domain: 3, minutes: 10, docs: [DOCS.memory],
      summary: T('A rule file in `.claude/rules/` with a `paths:` glob loads **only** when Claude edits matching files, wherever they live. That beats per-directory CLAUDE.md files when conventions are spread across the tree.',
                 'Un archivo de reglas en `.claude/rules/` con un glob en `paths:` se carga **solo** cuando Claude edita archivos que coinciden, estén donde estén. Eso supera a los CLAUDE.md por directorio cuando las convenciones están repartidas por el árbol.'),
      objectives: [
        T('Write path-scoped rules with YAML frontmatter globs.', 'Escribir reglas acotadas por ruta con globs en el frontmatter YAML.'),
        T('Explain the token/context benefit of conditional loading.', 'Explicar el beneficio en tokens y contexto de la carga condicional.'),
        T('Choose glob rules over directory CLAUDE.md for cross-cutting conventions.', 'Elegir reglas con glob en lugar de CLAUDE.md por directorio para convenciones transversales.')
      ],
      blocks: [
        { type: 'code', lang: 'yaml', title: '.claude/rules/testing.md', code: `
---
paths: ["**/*.test.tsx", "**/*.test.ts"]
---
- Use React Testing Library; query by role, never by test id.
- One behavior per test. Name tests "does X when Y".
- Use fixtures from test/fixtures/, never inline JSON blobs.` },
        { type: 'code', lang: 'yaml', title: '.claude/rules/terraform.md', code: `
---
paths: ["terraform/**/*"]
---
- Every resource needs owner and cost-center tags.
- Never hard-code regions; use var.region.` },
        { type: 'compare',
          bad: { title: T('Directory CLAUDE.md for tests', 'CLAUDE.md por directorio para tests'), items: [
            T('Tests live next to code in 40 folders', 'Los tests viven junto al código en 40 carpetas'),
            T('You would need 40 copies of the same rules', 'Necesitarías 40 copias de las mismas reglas'),
            T('Copies drift apart over time', 'Las copias se desincronizan con el tiempo')
          ] },
          good: { title: T('One glob rule', 'Una regla con glob'), items: [
            T('`**/*.test.tsx` matches every test, anywhere', '`**/*.test.tsx` coincide con todos los tests, estén donde estén'),
            T('Loads only while editing tests → less noise, fewer tokens', 'Solo se carga al editar tests → menos ruido y menos tokens'),
            T('Single source of truth', 'Una única fuente de verdad')
          ] } },
        { type: 'trap', text: T('A skill per code type is wrong for "automatically apply conventions": skills need invocation. A big root CLAUDE.md with headers relies on inference. Glob rules are the deterministic, maintainable choice.', 'Una skill por tipo de código es incorrecta para «aplicar convenciones automáticamente»: las skills hay que invocarlas. Un CLAUDE.md raíz enorme con secciones depende de la inferencia. Las reglas con glob son la opción determinista y mantenible.') }
      ],
      quiz: [
        { q: T('Test files sit next to the code they test across the whole repo, and all must follow the same conventions. Most maintainable approach?', 'Los archivos de test están junto al código que prueban por todo el repo, y todos deben seguir las mismas convenciones. ¿Enfoque más mantenible?'),
          options: [
            opt('A .claude/rules/ file with paths: ["**/*.test.tsx"]', 'Un archivo en .claude/rules/ con paths: ["**/*.test.tsx"]', true, 'Applies by file pattern regardless of directory.', 'Se aplica por patrón de archivo sin importar el directorio.'),
            opt('A CLAUDE.md in every directory that has tests', 'Un CLAUDE.md en cada directorio que tenga tests', false, 'Duplicated and directory-bound.', 'Duplicado y atado a cada directorio.'),
            opt('A "testing" skill developers invoke', 'Una skill «testing» que los desarrolladores invoquen', false, 'Not automatic.', 'No es automático.'),
            opt('A "Tests" section in the root CLAUDE.md', 'Una sección «Tests» en el CLAUDE.md raíz', false, 'Relies on inference and always loads.', 'Depende de la inferencia y siempre se carga.')
          ] },
        { q: T('What is the main context benefit of path-scoped rules?', '¿Cuál es el principal beneficio de contexto de las reglas acotadas por ruta?'),
          options: [
            opt('They load only when editing matching files, reducing irrelevant context and tokens', 'Solo se cargan al editar archivos que coinciden, reduciendo contexto irrelevante y tokens', true, 'Conditional loading.', 'Carga condicional.'),
            opt('They make Claude run faster on every file', 'Hacen que Claude vaya más rápido en todos los archivos', false, 'Speed is not the documented benefit.', 'La velocidad no es el beneficio documentado.'),
            opt('They replace the need for any CLAUDE.md', 'Eliminan la necesidad de cualquier CLAUDE.md', false, 'Universal standards still belong in CLAUDE.md.', 'Los estándares universales siguen yendo en CLAUDE.md.'),
            opt('They are shared automatically with other repositories that use the same rules', 'Se comparten automáticamente con otros repositorios que usan las mismas reglas', false, 'No.', 'No.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 3.4 */
    {
      id: '3.4', domain: 3, minutes: 11, docs: [DOCS.common],
      summary: T('Plan mode is for big, ambiguous or architectural work: explore and design before touching code. Direct execution is for small, well-scoped changes. Combine them: plan the migration, then execute the plan.',
                 'Plan mode es para trabajo grande, ambiguo o de arquitectura: explorar y diseñar antes de tocar código. La ejecución directa es para cambios pequeños y bien acotados. Combínalos: planifica la migración y luego ejecuta el plan.'),
      objectives: [
        T('Classify tasks into plan mode vs direct execution.', 'Clasificar tareas entre plan mode y ejecución directa.'),
        T('Use the Explore subagent to keep verbose discovery out of the main context.', 'Usar el subagente Explore para mantener la exploración extensa fuera del contexto principal.'),
        T('Combine planning and execution.', 'Combinar planificación y ejecución.')
      ],
      blocks: [
        { type: 'table', head: [T('Task', 'Tarea'), T('Mode', 'Modo')], rows: [
          [T('Split a monolith into microservices', 'Dividir un monolito en microservicios'), T('Plan mode', 'Plan mode')],
          [T('Library migration touching 45+ files', 'Migración de librería que toca más de 45 archivos'), T('Plan mode → then execute', 'Plan mode → luego ejecutar')],
          [T('Pick between two integrations with different infrastructure', 'Elegir entre dos integraciones con distinta infraestructura'), T('Plan mode', 'Plan mode')],
          [T('Fix a single-file bug with a clear stack trace', 'Arreglar un bug en un archivo con un stack trace claro'), T('Direct execution', 'Ejecución directa')],
          [T('Add a date validation conditional', 'Añadir una validación de fecha'), T('Direct execution', 'Ejecución directa')]
        ] },
        { type: 'note', text: T('In Claude Code you toggle plan mode with **Shift+Tab**. In plan mode Claude explores and proposes a plan without editing files.', 'En Claude Code se activa plan mode con **Shift+Tab**. En plan mode Claude explora y propone un plan sin editar archivos.') },
        { type: 'p', text: T('The **Explore subagent** isolates verbose discovery (dozens of file reads, long grep results) and returns a summary. That keeps the main conversation from exhausting its context during multi-phase tasks.',
                             'El **subagente Explore** aísla la exploración extensa (decenas de lecturas, resultados largos de grep) y devuelve un resumen. Así la conversación principal no agota su contexto en tareas de varias fases.') },
        { type: 'trap', text: T('"Start in direct execution and switch to plan mode if complexity appears" is wrong when the complexity is **already stated** in the task (dozens of files, service boundaries).', '«Empieza en ejecución directa y cambia a plan mode si aparece complejidad» es incorrecto cuando la complejidad **ya está dicha** en la tarea (decenas de archivos, límites entre servicios).') },
        { type: 'trap', text: T('Plan mode for a one-line fix is overkill; the exam rewards proportionate choices in both directions.', 'Plan mode para un arreglo de una línea es excesivo; el examen premia decisiones proporcionadas en ambas direcciones.') }
      ],
      quiz: [
        { q: T('You must restructure a monolith into microservices, deciding service boundaries across dozens of files. Approach?', 'Debes reestructurar un monolito en microservicios, decidiendo límites de servicio en decenas de archivos. ¿Enfoque?'),
          options: [
            opt('Enter plan mode to explore dependencies and design before changing code', 'Entrar en plan mode para explorar dependencias y diseñar antes de cambiar código', true, 'Architectural, multi-file, multiple valid approaches.', 'Es de arquitectura, multiarchivo y con varios enfoques válidos.'),
            opt('Direct execution, letting boundaries emerge', 'Ejecución directa, dejando que los límites surjan solos', false, 'Late discovery causes costly rework.', 'Descubrir tarde provoca retrabajo costoso.'),
            opt('Direct execution with detailed upfront instructions', 'Ejecución directa con instrucciones detalladas desde el inicio', false, 'Assumes the structure is known without exploring.', 'Supone que conoces la estructura sin explorar.'),
            opt('Direct execution for now; switch to plan mode only if the work turns out to be hard', 'Ejecución directa por ahora; cambiar a plan mode solo si el trabajo resulta difícil', false, 'The complexity is already known.', 'La complejidad ya se conoce.')
          ] },
        { q: T('A clear stack trace points to a null check missing in one function. Approach?', 'Un stack trace claro apunta a una comprobación de null que falta en una función. ¿Enfoque?'),
          options: [
            opt('Direct execution', 'Ejecución directa', true, 'Small, well-understood, single-file change.', 'Cambio pequeño, bien entendido y en un solo archivo.'),
            opt('Plan mode with a full architecture review', 'Plan mode con una revisión completa de arquitectura', false, 'Disproportionate.', 'Desproporcionado.'),
            opt('Fork the session to compare two fixes', 'Hacer fork de la sesión para comparar dos arreglos', false, 'Unnecessary for a clear fix.', 'Innecesario para un arreglo claro.'),
            opt('Spawn an Explore subagent first', 'Lanzar primero un subagente Explore', false, 'No broad discovery is needed.', 'No hace falta una exploración amplia.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 3.5 */
    {
      id: '3.5', domain: 3, minutes: 11, docs: [DOCS.practices],
      summary: T('When words are interpreted inconsistently, show examples. When correctness matters, write tests first and iterate on failures. When the domain is unfamiliar, let Claude interview you before it builds.',
                 'Cuando las palabras se interpretan de forma inconsistente, muestra ejemplos. Cuando importa la corrección, escribe primero los tests e itera sobre los fallos. Cuando el dominio es desconocido, deja que Claude te entreviste antes de construir.'),
      objectives: [
        T('Use 2–3 concrete input/output examples to pin down a transformation.', 'Usar 2–3 ejemplos concretos de entrada/salida para fijar una transformación.'),
        T('Apply test-driven iteration and the interview pattern.', 'Aplicar la iteración guiada por tests y el patrón de entrevista.'),
        T('Send interacting issues together; fix independent issues one by one.', 'Enviar juntos los problemas que interactúan; arreglar uno a uno los independientes.')
      ],
      blocks: [
        { type: 'code', lang: 'md', title: 'prompt · input/output examples', code: `
Normalize phone numbers. Examples:
  "(01) 555-1234"      -> "+51 1 5551234"
  "987 654 321"        -> "+51 987654321"
  "+1 415-555-0100"    -> "+1 4155550100"   # keep foreign codes`,
          caption: T('Three examples settle what a paragraph of prose left ambiguous.', 'Tres ejemplos resuelven lo que un párrafo de prosa dejaba ambiguo.') },
        { type: 'steps', items: [
          T('**Test-driven**: write tests for expected behavior, edge cases and performance → ask for an implementation → share the failing test output → iterate.', '**Guiado por tests**: escribe tests de comportamiento esperado, casos límite y rendimiento → pide la implementación → comparte la salida de los tests que fallan → itera.'),
          T('**Interview pattern**: "Before implementing the cache, ask me the questions you need answered." Surfaces invalidation strategy and failure modes you had not considered.', '**Patrón de entrevista**: «Antes de implementar la caché, hazme las preguntas que necesites.» Saca a la luz la estrategia de invalidación y los modos de fallo que no habías considerado.'),
          T('**Edge cases by example**: "For `null` in `legacy_id`, expected output is `{id: null, migrated: false}`."', '**Casos límite con ejemplos**: «Para `null` en `legacy_id`, la salida esperada es `{id: null, migrated: false}`.»')
        ] },
        { type: 'table', head: [T('Issues', 'Problemas'), T('Send them…', 'Envíalos…')], rows: [
          [T('Interacting (fixing one changes the other)', 'Que interactúan (arreglar uno cambia el otro)'), T('Together, in one detailed message', 'Juntos, en un solo mensaje detallado')],
          [T('Independent', 'Independientes'), T('Sequentially, one at a time', 'Uno tras otro')]
        ] },
        { type: 'trap', text: T('Rewriting the same prose instruction more forcefully does not fix inconsistent interpretation. Examples do.', 'Reescribir la misma instrucción en prosa con más fuerza no arregla una interpretación inconsistente. Los ejemplos sí.') }
      ],
      quiz: [
        { q: T('Claude formats migration output differently each run despite a detailed prose description. Most effective fix?', 'Claude formatea la salida de la migración de forma distinta en cada ejecución pese a una descripción detallada en prosa. ¿Arreglo más eficaz?'),
          options: [
            opt('Provide 2–3 concrete input/output examples', 'Dar 2–3 ejemplos concretos de entrada/salida', true, 'Examples communicate transformations better than prose.', 'Los ejemplos comunican transformaciones mejor que la prosa.'),
            opt('Make the prose longer and use capitals', 'Alargar la prosa y usar mayúsculas', false, 'Same ambiguity, louder.', 'La misma ambigüedad, más fuerte.'),
            opt('Lower the temperature', 'Bajar la temperatura', false, 'Does not define the expected format.', 'No define el formato esperado.'),
            opt('Switch to plan mode', 'Cambiar a plan mode', false, 'Plan mode does not clarify output format.', 'Plan mode no aclara el formato de salida.')
          ] },
        { q: T('You ask Claude to add caching in a domain you do not know well. What should you do before implementation?', 'Le pides a Claude que añada caché en un dominio que no conoces bien. ¿Qué deberías hacer antes de implementar?'),
          options: [
            opt('Use the interview pattern: have Claude ask you questions first', 'Usar el patrón de entrevista: que Claude te haga preguntas primero', true, 'Surfaces invalidation and failure-mode decisions.', 'Saca a la luz decisiones de invalidación y modos de fallo.'),
            opt('Ask for the implementation immediately and fix later', 'Pedir la implementación ya y arreglar después', false, 'Risks building the wrong design.', 'Arriesga construir el diseño equivocado.'),
            opt('Run /compact', 'Ejecutar /compact', false, 'Unrelated.', 'No tiene relación.'),
            opt('Put "be careful with caching and invalidation" in CLAUDE.md', 'Poner «ten cuidado con la caché y la invalidación» en CLAUDE.md', false, 'Vague instruction.', 'Instrucción vaga.')
          ] }
      ]
    },

    /* ---------------------------------------------------------- 3.6 */
    {
      id: '3.6', domain: 3, minutes: 14, docs: [DOCS.headless],
      summary: T('In CI, run Claude Code non-interactively with `-p`, get machine-readable results with `--output-format json` + `--json-schema`, give it project context through CLAUDE.md, and review with an **independent** instance, not the one that wrote the code.',
                 'En CI, ejecuta Claude Code sin interacción con `-p`, obtén resultados legibles por máquina con `--output-format json` + `--json-schema`, dale el contexto del proyecto con CLAUDE.md y revisa con una instancia **independiente**, no con la que escribió el código.'),
      objectives: [
        T('Use -p to avoid interactive hangs; produce structured findings for PR comments.', 'Usar -p para evitar bloqueos interactivos y producir hallazgos estructurados para comentarios de PR.'),
        T('Feed prior findings and existing tests to avoid duplicates.', 'Pasar hallazgos previos y tests existentes para evitar duplicados.'),
        T('Explain why self-review in the same session is weaker.', 'Explicar por qué la autorrevisión en la misma sesión es más débil.')
      ],
      blocks: [
        { type: 'code', lang: 'bash', title: '.github/workflows/review.yml · step', code: `
claude -p "Review the diff in pr.diff. Report only bugs and security issues." \\
  --output-format json \\
  --json-schema "$(cat review-schema.json)" \\
  > findings.json
# a script then posts each finding as an inline PR comment`,
          caption: T('Without `-p` the job waits for interactive input and hangs forever.', 'Sin `-p` el job espera una entrada interactiva y se queda colgado para siempre.') },
        { type: 'code', lang: 'json', title: 'review-schema.json', code: `
{
  "type": "object",
  "properties": {
    "findings": { "type": "array", "items": {
      "type": "object",
      "properties": {
        "file": {"type": "string"}, "line": {"type": "integer"},
        "severity": {"enum": ["critical", "major", "minor"]},
        "issue": {"type": "string"}, "suggested_fix": {"type": "string"}
      },
      "required": ["file", "line", "severity", "issue"]
    }}
  },
  "required": ["findings"]
}` },
        { type: 'list', items: [
          T('**CLAUDE.md is the CI context**: testing standards, fixture conventions, review criteria. CI-invoked Claude Code reads it like a developer\'s session does.', '**CLAUDE.md es el contexto de CI**: estándares de testing, convenciones de fixtures, criterios de revisión. Claude Code invocado en CI lo lee igual que la sesión de un desarrollador.'),
          T('**Re-runs after new commits**: include prior findings and ask to report only new or still-unaddressed issues → no duplicate comments.', '**Repeticiones tras nuevos commits**: incluye los hallazgos anteriores y pide reportar solo lo nuevo o lo que sigue sin resolver → sin comentarios duplicados.'),
          T('**Test generation**: provide the existing test files so it does not suggest scenarios already covered; document valuable test criteria and fixtures in CLAUDE.md.', '**Generación de tests**: pasa los archivos de test existentes para que no proponga escenarios ya cubiertos; documenta en CLAUDE.md qué tests aportan valor y qué fixtures hay.'),
          T('**Independent reviewer**: the session that generated code keeps its reasoning and is less likely to question itself. Review with a fresh instance.', '**Revisor independiente**: la sesión que generó el código conserva su razonamiento y es menos propensa a cuestionarse. Revisa con una instancia nueva.')
        ] },
        { type: 'trap', text: T('`CLAUDE_HEADLESS=true`, `--batch`, and `< /dev/null` are distractors. The documented flag is `-p` / `--print`.', '`CLAUDE_HEADLESS=true`, `--batch` y `< /dev/null` son distractores. El flag documentado es `-p` / `--print`.') }
      ],
      quiz: [
        { q: T('`claude "Analyze this PR for security issues"` hangs in the pipeline, waiting for input. Fix?', '`claude "Analyze this PR for security issues"` se queda colgado en el pipeline esperando una entrada. ¿Arreglo?'),
          options: [
            opt('Add -p: claude -p "Analyze this PR for security issues"', 'Añadir -p: claude -p "Analyze this PR for security issues"', true, 'Documented non-interactive mode.', 'Es el modo no interactivo documentado.'),
            opt('Set CLAUDE_HEADLESS=true in the CI job environment', 'Definir CLAUDE_HEADLESS=true en el entorno del job de CI', false, 'Does not exist.', 'No existe.'),
            opt('Redirect stdin from /dev/null so it cannot wait', 'Redirigir stdin desde /dev/null para que no pueda esperar', false, 'Workaround, not the documented approach.', 'Es un parche, no el enfoque documentado.'),
            opt('Add the --batch flag to the command', 'Añadir el flag --batch al comando', false, 'Does not exist.', 'No existe.')
          ] },
        { q: T('After each new commit, the CI review re-posts the same comments. Best fix?', 'Tras cada commit nuevo, la revisión de CI vuelve a publicar los mismos comentarios. ¿Mejor arreglo?'),
          options: [
            opt('Include prior findings in context and report only new or still-unaddressed issues', 'Incluir los hallazgos anteriores en el contexto y reportar solo lo nuevo o lo que siga sin resolver', true, 'Documented pattern to avoid duplicates.', 'Patrón documentado para evitar duplicados.'),
            opt('Run the review only on the first commit of each PR', 'Ejecutar la revisión solo en el primer commit de cada PR', false, 'Misses new issues.', 'Se pierde los problemas nuevos.'),
            opt('Delete old comments before every run', 'Borrar los comentarios viejos antes de cada ejecución', false, 'Loses discussion history; does not dedupe logically.', 'Pierde el historial de la discusión y no evita los duplicados de forma lógica.'),
            opt('Review with the same session that wrote the code, since it already knows the changes', 'Revisar con la misma sesión que escribió el código, ya que conoce los cambios', false, 'Self-review is weaker.', 'La autorrevisión es más débil.')
          ] }
      ]
    }
  ]);
})();
