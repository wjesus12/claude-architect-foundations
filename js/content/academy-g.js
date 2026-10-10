/* Ruta «desde cero» · Parte F — Claude Code (M21–M23) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    cc101: { label: 'Skilljar · Claude Code 101', url: 'https://anthropic.skilljar.com/claude-code-101' },
    ccaction: { label: 'Skilljar · Claude Code in Action', url: 'https://anthropic.skilljar.com/claude-code-in-action' },
    skills: { label: 'Skilljar · Introduction to agent skills', url: 'https://anthropic.skilljar.com/introduction-to-agent-skills' },
    subagents: { label: 'Skilljar · Introduction to subagents', url: 'https://anthropic.skilljar.com/introduction-to-subagents' },
    modes: { label: 'Permission modes', url: 'https://code.claude.com/docs/en/permission-modes' },
    hooks: { label: 'Hooks reference', url: 'https://code.claude.com/docs/en/hooks' },
    plugins: { label: 'Plugins overview', url: 'https://code.claude.com/docs/en/plugins' },
    styles: { label: 'Output styles', url: 'https://code.claude.com/docs/en/output-styles' },
    settings: { label: 'Settings and precedence', url: 'https://code.claude.com/docs/en/settings' },
    skillsDoc: { label: 'Skills (Claude Code docs)', url: 'https://code.claude.com/docs/en/skills' },
    headless: { label: 'Headless mode', url: 'https://code.claude.com/docs/en/headless' }
  };

  CAF.addLessons([
    {
      id: 'a21', track: 'academy', domain: 0, minutes: 16, art: 'mascot', scene: 3, exam: ['3.4', '2.5'],
      title: T('Claude Code 101: the coding agent', 'Claude Code 101: el agente de programación'),
      summary: T('Claude Code is an agent, not an autocomplete: it reads your project, plans, edits files, runs commands and checks results in a loop, within the permissions you grant. It runs in the terminal, VS Code, JetBrains, the desktop app and the web.',
                 'Claude Code es un agente, no un autocompletado: lee tu proyecto, planifica, edita archivos, ejecuta comandos y comprueba resultados en un bucle, dentro de los permisos que concedes. Funciona en la terminal, VS Code, JetBrains, la app de escritorio y la web.'),
      objectives: [
        T('Explain how the loop, tools, context window and permissions fit together.', 'Explicar cómo encajan el bucle, las tools, la ventana de contexto y los permisos.'),
        T('Follow Explore → Plan → Code → Commit.', 'Seguir Explore → Plan → Code → Commit.'),
        T('Choose a permission mode and manage context with /compact, /clear and /context.', 'Elegir un modo de permisos y gestionar el contexto con /compact, /clear y /context.')
      ],
      docs: [D.cc101, D.modes],
      blocks: [
        { type: 'steps', items: [
          T('**Explore**: ask Claude to read the relevant code and explain it before changing anything.', '**Explore**: pide a Claude que lea el código relevante y lo explique antes de cambiar nada.'),
          T('**Plan**: in plan mode, Claude proposes an approach without editing; you review and adjust it.', '**Plan**: en plan mode, Claude propone un enfoque sin editar; tú lo revisas y ajustas.'),
          T('**Code**: Claude implements, runs tests and fixes what fails.', '**Code**: Claude implementa, ejecuta los tests y corrige lo que falla.'),
          T('**Commit**: Claude writes the commit message and, if you want, opens the pull request.', '**Commit**: Claude escribe el mensaje de commit y, si quieres, abre el pull request.')
        ] },
        { type: 'table', head: [T('Mode', 'Modo'), T('Runs without asking', 'Se ejecuta sin preguntar'), T('Good for', 'Útil para')], rows: [
          [T('default (Manual)', 'default (Manual)'), T('Reads only', 'Solo lecturas'), T('Sensitive work, reviewing each action', 'Trabajo sensible, revisar cada acción')],
          [T('acceptEdits', 'acceptEdits'), T('Reads, file edits, common file commands', 'Lecturas, ediciones y comandos de archivo comunes'), T('Iterating on code you review', 'Iterar sobre código que revisas')],
          [T('plan', 'plan'), T('Reads (edits blocked until a plan is approved)', 'Lecturas (las ediciones esperan a que apruebes un plan)'), T('Exploring before changing', 'Explorar antes de cambiar')],
          [T('auto', 'auto'), T('Everything, with a classifier reviewing actions', 'Todo, con un clasificador que revisa las acciones'), T('Long tasks with fewer prompts', 'Tareas largas con menos interrupciones')],
          [T('dontAsk', 'dontAsk'), T('Only pre-approved tools; anything else denied', 'Solo tools preaprobadas; lo demás se deniega'), T('Locked-down CI and scripts', 'CI y scripts restringidos')],
          [T('bypassPermissions', 'bypassPermissions'), T('Everything', 'Todo'), T('Isolated containers or VMs only', 'Solo contenedores o VMs aislados')]
        ] },
        { type: 'note', text: T('Switch modes with **Shift+Tab** in the CLI (or the mode selector in VS Code and Desktop). Deny rules still apply in every mode, and some removals and protected paths are never auto-approved.', 'Cambia de modo con **Shift+Tab** en la CLI (o con el selector de VS Code y Desktop). Las reglas deny se aplican en todos los modos, y algunos borrados y rutas protegidas nunca se aprueban automáticamente.') },
        { type: 'list', items: [
          T('**/compact** summarizes the conversation to free context; you can tell it what to keep.', '**/compact** resume la conversación para liberar contexto; puedes indicarle qué conservar.'),
          T('**/clear** starts fresh; **/context** shows what is using the window.', '**/clear** empieza de cero; **/context** muestra qué ocupa la ventana.'),
          T('**Rewind** lets you step back to an earlier point when a direction goes wrong.', '**Rewind** te deja volver a un punto anterior cuando una dirección sale mal.'),
          T('**/init** drafts a CLAUDE.md for the project; **--resume** continues a past session.', '**/init** redacta un CLAUDE.md para el proyecto; **--resume** continúa una sesión pasada.'),
          T('**Built-in tools** include Read, Write, Edit, Bash, Grep, Glob and web search/fetch.', '**Las tools integradas** incluyen Read, Write, Edit, Bash, Grep, Glob y búsqueda/lectura web.')
        ] },
        { type: 'trap', text: T('Plan mode is for large, multi-file or architectural work with several valid approaches; direct execution is for small, well-scoped fixes. The exam punishes plan mode for a one-line fix and direct execution for a microservices split.', 'Plan mode es para trabajo grande, multiarchivo o de arquitectura con varios enfoques válidos; la ejecución directa es para arreglos pequeños y bien acotados. El examen penaliza usar plan mode para un arreglo de una línea y ejecución directa para dividir en microservicios.') }
      ],
      quiz: [
        { q: T('You want Claude to explore an unfamiliar codebase and propose an approach without changing any file yet. Which mode fits?', 'Quieres que Claude explore un codebase desconocido y proponga un enfoque sin cambiar todavía ningún archivo. ¿Qué modo encaja?'),
          options: [
            opt('plan, so edits wait until you approve the plan', 'plan, para que las ediciones esperen a que apruebes el plan', true, 'Plan mode explores and designs before editing.', 'Plan mode explora y diseña antes de editar.'),
            opt('bypassPermissions, so it can move quickly through files', 'bypassPermissions, para que avance rápido por los archivos', false, 'Removes all checks; meant for isolated environments.', 'Quita todos los controles; es para entornos aislados.'),
            opt('acceptEdits, so it starts editing as soon as it reads', 'acceptEdits, para que empiece a editar en cuanto lea', false, 'You wanted no edits yet.', 'Querías que todavía no editara.'),
            opt('dontAsk, so every tool is denied including reading', 'dontAsk, para que se deniegue todo, incluida la lectura', false, 'Denies non-preapproved tools; not for exploration.', 'Deniega lo no preaprobado; no sirve para explorar.')
          ] },
        { q: T('Halfway through a long session the context is full of old search output. What is the quickest way to free space while keeping the essentials?', 'A mitad de una sesión larga, el contexto está lleno de resultados de búsqueda antiguos. ¿Cuál es la forma más rápida de liberar espacio conservando lo esencial?'),
          options: [
            opt('/compact, telling it which decisions and facts to keep', '/compact, indicándole qué decisiones y datos conservar', true, 'Directed compaction keeps what matters.', 'La compactación dirigida conserva lo importante.'),
            opt('/clear, then hope Claude remembers the important parts', '/clear, y confiar en que Claude recuerde lo importante', false, '/clear drops everything.', '/clear lo borra todo.'),
            opt('Switching to bypassPermissions mode for the rest of the task', 'Cambiar a bypassPermissions para el resto de la tarea', false, 'Permissions do not affect context.', 'Los permisos no afectan al contexto.'),
            opt('Re-reading every file so the new content pushes out the old', 'Volver a leer cada archivo para que lo nuevo desplace lo viejo', false, 'Fills context further.', 'Llena aún más el contexto.')
          ] }
      ]
    },

    {
      id: 'a22', track: 'academy', domain: 0, minutes: 18, art: 'mascot', scene: 3, exam: ['3.1', '3.2', '3.3', '1.5'],
      title: T('Customizing Claude Code', 'Personalizar Claude Code'),
      summary: T('Claude Code adapts to a team through layered configuration: CLAUDE.md and rules for what Claude should know, settings and permissions for what it may do, skills for repeatable procedures, subagents for isolated helpers, hooks for guaranteed behavior, MCP for external tools, output styles for how it responds, and plugins to package it all.',
                 'Claude Code se adapta a un equipo mediante configuración por capas: CLAUDE.md y reglas para lo que Claude debe saber, settings y permisos para lo que puede hacer, skills para procedimientos repetibles, subagentes para ayudantes aislados, hooks para comportamientos garantizados, MCP para herramientas externas, output styles para cómo responde y plugins para empaquetarlo todo.'),
      objectives: [
        T('Place configuration at the right level (managed, user, project, local).', 'Ubicar la configuración en el nivel correcto (managed, usuario, proyecto, local).'),
        T('Choose between CLAUDE.md, a skill, a subagent, a hook and an output style.', 'Elegir entre CLAUDE.md, una skill, un subagente, un hook y un output style.'),
        T('Install and build plugins from marketplaces.', 'Instalar y crear plugins desde marketplaces.')
      ],
      docs: [D.settings, D.skillsDoc, D.hooks, D.styles, D.plugins, D.skills, D.subagents],
      blocks: [
        { type: 'table', head: [T('Settings level (highest first)', 'Nivel de settings (de mayor a menor)'), T('File', 'Archivo')], rows: [
          [T('Managed (organization)', 'Managed (organización)'), T('managed-settings.json / MDM', 'managed-settings.json / MDM')],
          [T('Command line', 'Línea de comandos'), T('claude --settings', 'claude --settings')],
          [T('Project local (you, this repo)', 'Proyecto local (tú, este repo)'), T('.claude/settings.local.json', '.claude/settings.local.json')],
          [T('Shared project (the team)', 'Proyecto compartido (el equipo)'), T('.claude/settings.json', '.claude/settings.json')],
          [T('User (you, every project)', 'Usuario (tú, todos los proyectos)'), T('~/.claude/settings.json', '~/.claude/settings.json')]
        ] },
        { type: 'table', head: [T('You want…', 'Quieres…'), T('Use', 'Usa')], rows: [
          [T('Claude to know conventions and commands', 'Que Claude conozca convenciones y comandos'), T('CLAUDE.md (+ .claude/rules with paths globs)', 'CLAUDE.md (+ .claude/rules con globs en paths)')],
          [T('A repeatable procedure, run on demand or when relevant', 'Un procedimiento repetible, bajo demanda o cuando aplique'), T('A skill (.claude/skills/<name>/SKILL.md)', 'Una skill (.claude/skills/<nombre>/SKILL.md)')],
          [T('A helper with its own context, tools and model', 'Un ayudante con su propio contexto, tools y modelo'), T('A subagent (/agents, .claude/agents)', 'Un subagente (/agents, .claude/agents)')],
          [T('Something that must happen every time', 'Algo que debe ocurrir siempre'), T('A hook', 'Un hook')],
          [T('A different voice, length or role for every reply', 'Otra voz, longitud o rol en cada respuesta'), T('An output style', 'Un output style')],
          [T('External tools and data', 'Herramientas y datos externos'), T('MCP servers (claude mcp add, .mcp.json)', 'Servidores MCP (claude mcp add, .mcp.json)')],
          [T('All of the above shared as one install', 'Todo lo anterior como una sola instalación'), T('A plugin', 'Un plugin')]
        ] },
        { type: 'code', lang: 'yaml', title: '.claude/skills/release-notes/SKILL.md', code: `
---
name: release-notes
description: Drafts release notes from merged PRs. Use when asked for release notes or a changelog.
disable-model-invocation: true
allowed-tools: Bash(git log *) Read
argument-hint: <version>
---
Collect PRs merged since the last tag for $ARGUMENTS and group them by Features, Fixes, Breaking.` },
        { type: 'list', items: [
          T('**Skills**: descriptions always in context, body loaded on use, supporting files on demand. Custom slash commands were merged into skills; `.claude/commands/*.md` files keep working. `context: fork` runs a skill in an isolated subagent.', '**Skills**: la descripción siempre está en contexto, el cuerpo se carga al usarla y los archivos de apoyo bajo demanda. Los slash commands personalizados se fusionaron con las skills; los archivos `.claude/commands/*.md` siguen funcionando. `context: fork` ejecuta la skill en un subagente aislado.'),
          T('**Subagents**: built-ins such as Explore keep verbose discovery out of your main conversation; custom agents get their own prompt, tools and model.', '**Subagentes**: los integrados, como Explore, mantienen la exploración extensa fuera de tu conversación principal; los propios tienen su prompt, sus tools y su modelo.'),
          T('**Hooks**: shell, HTTP, MCP-tool, prompt or agent handlers on events like PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart and PreCompact. Exit code 2 blocks events that support blocking; JSON output can deny, ask or rewrite input.', '**Hooks**: manejadores de shell, HTTP, tool MCP, prompt o agente en eventos como PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart y PreCompact. El código de salida 2 bloquea los eventos que lo admiten; la salida JSON puede denegar, preguntar o reescribir la entrada.'),
          T('**Output styles**: built-in Proactive, Concise, Explanatory and Learning, or your own Markdown file; switch with /output-style.', '**Output styles**: los integrados Proactive, Concise, Explanatory y Learning, o tu propio archivo Markdown; se cambian con /output-style.'),
          T('**Plugins**: a folder with .claude-plugin/plugin.json plus skills, agents, hooks and MCP servers; install from a marketplace with /plugin. Anthropic\'s official marketplace is added automatically.', '**Plugins**: una carpeta con .claude-plugin/plugin.json más skills, agentes, hooks y servidores MCP; se instalan desde un marketplace con /plugin. El marketplace oficial de Anthropic se añade automáticamente.')
        ] },
        { type: 'note', text: T('A useful mental model: CLAUDE.md is what Claude knows, skills are what it can do on request, hooks are what always happens, and permissions are what it is allowed to touch.', 'Un modelo mental útil: CLAUDE.md es lo que Claude sabe, las skills lo que puede hacer cuando se le pide, los hooks lo que siempre ocurre y los permisos lo que tiene permitido tocar.') },
        { type: 'trap', text: T('Output styles and CLAUDE.md are instructions, not guarantees. When a rule must hold without exception, the exam answer is a hook or a permission rule.', 'Los output styles y CLAUDE.md son instrucciones, no garantías. Cuando una regla debe cumplirse sin excepción, la respuesta del examen es un hook o una regla de permisos.') }
      ],
      quiz: [
        { q: T('Every file edit must be auto-formatted, with no exceptions. Which mechanism fits?', 'Cada edición de archivo debe formatearse automáticamente, sin excepciones. ¿Qué mecanismo encaja?'),
          options: [
            opt('A PostToolUse hook on Edit and Write that runs the formatter', 'Un hook PostToolUse sobre Edit y Write que ejecute el formateador', true, 'Hooks run every time at lifecycle events.', 'Los hooks se ejecutan siempre en los eventos del ciclo de vida.'),
            opt('A line in CLAUDE.md asking Claude to format after edits', 'Una línea en CLAUDE.md pidiendo a Claude que formatee tras editar', false, 'Instructions are not guarantees.', 'Las instrucciones no son garantías.'),
            opt('An output style that makes responses more concise', 'Un output style que haga las respuestas más concisas', false, 'Styles change replies, not file formatting.', 'Los estilos cambian las respuestas, no el formato de archivos.'),
            opt('A skill that the developer remembers to invoke', 'Una skill que el desarrollador recuerde invocar', false, 'Depends on someone remembering.', 'Depende de que alguien se acuerde.')
          ] },
        { q: T('A teammate\'s personal preference should apply only on their machine in this repo, never for others. Where does it go?', 'Una preferencia personal de un compañero debe aplicarse solo en su máquina en este repo, nunca a los demás. ¿Dónde va?'),
          options: [
            opt('.claude/settings.local.json, the project-local settings file', '.claude/settings.local.json, el archivo de settings local del proyecto', true, 'Local scope: you, this project, not shared.', 'Alcance local: tú, este proyecto, no compartido.'),
            opt('.claude/settings.json, so the whole team picks it up', '.claude/settings.json, para que lo reciba todo el equipo', false, 'That file is shared with everyone.', 'Ese archivo se comparte con todos.'),
            opt('Managed settings, which apply to the whole organization', 'Los managed settings, que aplican a toda la organización', false, 'Far too broad.', 'Demasiado amplio.'),
            opt('The project CLAUDE.md, committed to the repository', 'El CLAUDE.md del proyecto, versionado en el repositorio', false, 'Shared with everyone and not a setting.', 'Se comparte con todos y no es un setting.')
          ] }
      ]
    },

    {
      id: 'a23', track: 'academy', domain: 0, minutes: 14, art: 'mascot', scene: 3, exam: ['3.6', '1.7', '5.4'],
      title: T('Claude Code in production: long runs, automation and CI', 'Claude Code en producción: ejecuciones largas, automatización y CI'),
      summary: T('Beyond interactive use, Claude Code runs long supervised sessions, scheduled routines, headless jobs in your own pipeline and pull-request reviews. The more unattended the run, the more you invest in verification.',
                 'Más allá del uso interactivo, Claude Code ejecuta sesiones largas supervisadas, rutinas programadas, trabajos headless en tu propio pipeline y revisiones de pull requests. Cuanto menos supervisada es la ejecución, más inviertes en verificación.'),
      objectives: [
        T('Steer long sessions with plans, directed compaction and rewind.', 'Dirigir sesiones largas con planes, compactación dirigida y rewind.'),
        T('Run Claude Code headless with -p and structured output.', 'Ejecutar Claude Code en modo headless con -p y salida estructurada.'),
        T('Verify unsupervised runs in proportion to how little you watched them.', 'Verificar las ejecuciones sin supervisión en proporción a lo poco que las observaste.')
      ],
      docs: [D.ccaction, D.headless],
      blocks: [
        { type: 'list', items: [
          T('**Long sessions**: scope the work in plan mode, tell /compact what to keep, use rewind to correct course, and use subagents or scratchpad files to keep the main context clean.', '**Sesiones largas**: acota el trabajo en plan mode, indica a /compact qué conservar, usa rewind para corregir el rumbo y apóyate en subagentes o archivos scratchpad para mantener limpio el contexto principal.'),
          T('**Sessions**: name sessions and resume them with --resume; fork to compare two approaches from the same starting point.', '**Sesiones**: ponles nombre y reanúdalas con --resume; haz fork para comparar dos enfoques desde el mismo punto de partida.'),
          T('**Routines**: schedule prompts to run on Anthropic\'s infrastructure.', '**Rutinas**: programa prompts para que se ejecuten en la infraestructura de Anthropic.'),
          T('**Headless**: `claude -p "…" --output-format json` in your own pipeline; add `--json-schema` for machine-readable findings.', '**Headless**: `claude -p "…" --output-format json` en tu propio pipeline; añade `--json-schema` para obtener hallazgos legibles por máquina.'),
          T('**GitHub**: managed code review and the GitHub Action bring Claude into pull requests.', '**GitHub**: la revisión de código gestionada y la GitHub Action llevan a Claude a los pull requests.')
        ] },
        { type: 'code', lang: 'bash', title: 'a CI review step', code: `
claude -p "Review the diff in pr.diff. Report bugs and security issues only." \\
  --output-format json \\
  --json-schema "$(cat findings.schema.json)" \\
  --permission-mode dontAsk --allowedTools "Read" > findings.json` },
        { type: 'steps', items: [
          T('**Gate on real signals**: run tests and checks; hooks can block a turn from ending until tests pass.', '**Condiciona a señales reales**: ejecuta tests y comprobaciones; los hooks pueden impedir que un turno termine hasta que pasen los tests.'),
          T('**Review independently**: a fresh instance reviews work better than the session that wrote it.', '**Revisa de forma independiente**: una instancia nueva revisa mejor que la sesión que escribió el trabajo.'),
          T('**Package what works**: once a setup is trusted, ship it to the team as a plugin.', '**Empaqueta lo que funciona**: cuando una configuración sea fiable, entrégala al equipo como plugin.')
        ] },
        { type: 'note', text: T('Isolation matters for unattended work: sandboxing, containers and git worktrees limit what an automated run can reach, and bypassPermissions belongs only inside such boundaries.', 'El aislamiento importa en el trabajo desatendido: el sandboxing, los contenedores y los git worktrees limitan lo que una ejecución automática puede alcanzar, y bypassPermissions solo debe usarse dentro de esos límites.') },
        { type: 'trap', text: T('Without -p, a pipeline job waits for interactive input and hangs. Invented options such as a "--batch" flag or a "CLAUDE_HEADLESS" variable are the distractors.', 'Sin -p, un job del pipeline espera una entrada interactiva y se queda colgado. Opciones inventadas como un flag «--batch» o una variable «CLAUDE_HEADLESS» son los distractores.') }
      ],
      quiz: [
        { q: T('Your CI job must post review findings as inline PR comments reliably. Which invocation fits?', 'Tu job de CI debe publicar hallazgos de revisión como comentarios en línea del PR de forma fiable. ¿Qué invocación encaja?'),
          options: [
            opt('claude -p with --output-format json and --json-schema', 'claude -p con --output-format json y --json-schema', true, 'Non-interactive and machine-readable.', 'No interactivo y legible por máquina.'),
            opt('claude in interactive mode, copying the answer by hand', 'claude en modo interactivo, copiando la respuesta a mano', false, 'Not automatable and hangs in CI.', 'No se puede automatizar y se cuelga en CI.'),
            opt('claude --batch with the review prompt as an argument', 'claude --batch con el prompt de revisión como argumento', false, 'That flag does not exist.', 'Ese flag no existe.'),
            opt('A regex that parses free-text output into comments', 'Una regex que convierta la salida en texto libre en comentarios', false, 'Fragile compared with schema output.', 'Frágil comparado con una salida con schema.')
          ] },
        { q: T('An overnight run finished unattended and touched 40 files. What is the right attitude before merging?', 'Una ejecución nocturna terminó sin supervisión y tocó 40 archivos. ¿Cuál es la actitud correcta antes de hacer merge?'),
          options: [
            opt('Verify in proportion: tests, checks and an independent review', 'Verificar en proporción: tests, comprobaciones y una revisión independiente', true, 'Less supervision means more verification.', 'Menos supervisión implica más verificación.'),
            opt('Merge immediately, since the agent reported success', 'Hacer merge de inmediato, ya que el agente informó éxito', false, 'Self-reported success is not evidence.', 'Un éxito autoinformado no es una prueba.'),
            opt('Ask the same session to confirm its own work is correct', 'Pedir a la misma sesión que confirme que su trabajo es correcto', false, 'Self-review shares the same blind spots.', 'La autorrevisión comparte los mismos puntos ciegos.'),
            opt('Revert everything, since unattended runs are never useful', 'Revertirlo todo, ya que las ejecuciones desatendidas nunca sirven', false, 'Useful when verified.', 'Son útiles si se verifican.')
          ] }
      ]
    }
  ]);
})();
