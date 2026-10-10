/* Blueprint oficial CCAR-F (Exam Guide v1.0, julio 2026).
   Todo texto de entrenamiento es {en, es}. */
window.CAF = window.CAF || {};

CAF.EXAM = {
  code: 'CCAR-F',
  items: 60,
  minutes: 120,
  scenariosPerExam: 4,
  scaleMin: 100,
  scaleMax: 1000,
  pass: 720,
  guide: 'Exam Guide v1.0 · July 2026'
};

CAF.COURSES = {
  api:      { name: 'Building with the Claude API', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api' },
  platform: { name: 'Claude Platform 101', url: 'https://anthropic.skilljar.com/claude-platform-101' },
  cc101:    { name: 'Claude Code 101', url: 'https://anthropic.skilljar.com/claude-code-101' },
  ccaction: { name: 'Claude Code in Action', url: 'https://anthropic.skilljar.com/claude-code-in-action' },
  mcp:      { name: 'Introduction to Model Context Protocol', url: 'https://anthropic.skilljar.com/introduction-to-model-context-protocol' },
  mcpadv:   { name: 'Model Context Protocol: Advanced Topics', url: 'https://anthropic.skilljar.com/model-context-protocol-advanced-topics' },
  skills:   { name: 'Introduction to agent skills', url: 'https://anthropic.skilljar.com/introduction-to-agent-skills' },
  subagents:{ name: 'Introduction to subagents', url: 'https://anthropic.skilljar.com/introduction-to-subagents' }
};

CAF.DOMAINS = [
  {
    id: 1, key: 'agents', weight: 27, glyph: '◈',
    name: { en: 'Agentic Architecture & Orchestration', es: 'Arquitectura agéntica y orquestación' },
    blurb: { en: 'Agentic loops, coordinator–subagent patterns, hooks, enforcement and sessions.',
             es: 'Bucles agénticos, coordinador–subagentes, hooks, enforcement y sesiones.' },
    courses: ['api', 'subagents', 'ccaction'],
    ts: [
      { id: '1.1', en: 'Design and implement agentic loops for autonomous task execution', es: 'Diseñar e implementar bucles agénticos para ejecutar tareas de forma autónoma' },
      { id: '1.2', en: 'Orchestrate multi-agent systems with coordinator-subagent patterns', es: 'Orquestar sistemas multiagente con el patrón coordinador–subagente' },
      { id: '1.3', en: 'Configure subagent invocation, context passing, and spawning', es: 'Configurar la invocación de subagentes, el paso de contexto y su creación' },
      { id: '1.4', en: 'Implement multi-step workflows with enforcement and handoff patterns', es: 'Implementar flujos de varios pasos con enforcement y traspaso (handoff)' },
      { id: '1.5', en: 'Apply Agent SDK hooks for tool call interception and data normalization', es: 'Aplicar hooks del Agent SDK para interceptar llamadas a tools y normalizar datos' },
      { id: '1.6', en: 'Design task decomposition strategies for complex workflows', es: 'Diseñar estrategias de descomposición de tareas para flujos complejos' },
      { id: '1.7', en: 'Manage session state, resumption, and forking', es: 'Gestionar el estado de sesión, la reanudación y el fork' }
    ]
  },
  {
    id: 2, key: 'tools', weight: 18, glyph: '⌁',
    name: { en: 'Tool Design & MCP Integration', es: 'Diseño de tools e integración MCP' },
    blurb: { en: 'Tool descriptions, structured errors, tool distribution, tool_choice and MCP servers.',
             es: 'Descripciones de tools, errores estructurados, reparto de tools, tool_choice y servidores MCP.' },
    courses: ['mcp', 'mcpadv', 'api', 'cc101'],
    ts: [
      { id: '2.1', en: 'Design effective tool interfaces with clear descriptions and boundaries', es: 'Diseñar interfaces de tools eficaces con descripciones y límites claros' },
      { id: '2.2', en: 'Implement structured error responses for MCP tools', es: 'Implementar respuestas de error estructuradas en tools MCP' },
      { id: '2.3', en: 'Distribute tools appropriately across agents and configure tool choice', es: 'Repartir las tools entre agentes y configurar tool_choice' },
      { id: '2.4', en: 'Integrate MCP servers into Claude Code and agent workflows', es: 'Integrar servidores MCP en Claude Code y en flujos de agentes' },
      { id: '2.5', en: 'Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively', es: 'Elegir y usar bien las tools integradas (Read, Write, Edit, Bash, Grep, Glob)' }
    ]
  },
  {
    id: 3, key: 'code', weight: 20, glyph: '❯',
    name: { en: 'Claude Code Configuration & Workflows', es: 'Configuración y flujos de Claude Code' },
    blurb: { en: 'CLAUDE.md hierarchy, commands and skills, path rules, plan mode and CI/CD.',
             es: 'Jerarquía de CLAUDE.md, comandos y skills, reglas por ruta, plan mode y CI/CD.' },
    courses: ['cc101', 'ccaction', 'skills', 'subagents'],
    ts: [
      { id: '3.1', en: 'Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization', es: 'Configurar CLAUDE.md con la jerarquía, el alcance y la organización modular adecuados' },
      { id: '3.2', en: 'Create and configure custom slash commands and skills', es: 'Crear y configurar slash commands y skills personalizados' },
      { id: '3.3', en: 'Apply path-specific rules for conditional convention loading', es: 'Aplicar reglas por ruta para cargar convenciones de forma condicional' },
      { id: '3.4', en: 'Determine when to use plan mode vs direct execution', es: 'Decidir cuándo usar plan mode y cuándo ejecución directa' },
      { id: '3.5', en: 'Apply iterative refinement techniques for progressive improvement', es: 'Aplicar técnicas de refinamiento iterativo para mejorar progresivamente' },
      { id: '3.6', en: 'Integrate Claude Code into CI/CD pipelines', es: 'Integrar Claude Code en pipelines de CI/CD' }
    ]
  },
  {
    id: 4, key: 'prompts', weight: 20, glyph: '{ }',
    name: { en: 'Prompt Engineering & Structured Output', es: 'Ingeniería de prompts y salida estructurada' },
    blurb: { en: 'Explicit criteria, few-shot, tool_use + JSON schemas, validation loops, batches and multi-pass review.',
             es: 'Criterios explícitos, few-shot, tool_use + JSON schema, bucles de validación, batches y revisión multipasada.' },
    courses: ['api', 'platform'],
    ts: [
      { id: '4.1', en: 'Design prompts with explicit criteria to improve precision and reduce false positives', es: 'Diseñar prompts con criterios explícitos para ganar precisión y reducir falsos positivos' },
      { id: '4.2', en: 'Apply few-shot prompting to improve output consistency and quality', es: 'Aplicar few-shot prompting para mejorar la consistencia y la calidad de la salida' },
      { id: '4.3', en: 'Enforce structured output using tool use and JSON schemas', es: 'Forzar salida estructurada con tool use y JSON schemas' },
      { id: '4.4', en: 'Implement validation, retry, and feedback loops for extraction quality', es: 'Implementar validación, reintentos y bucles de feedback para la calidad de extracción' },
      { id: '4.5', en: 'Design efficient batch processing strategies', es: 'Diseñar estrategias eficientes de procesamiento por lotes (batch)' },
      { id: '4.6', en: 'Design multi-instance and multi-pass review architectures', es: 'Diseñar arquitecturas de revisión multi-instancia y multipasada' }
    ]
  },
  {
    id: 5, key: 'context', weight: 15, glyph: '▤',
    name: { en: 'Context Management & Reliability', es: 'Gestión de contexto y fiabilidad' },
    blurb: { en: 'Long conversations, escalation, error propagation, codebase exploration, human review and provenance.',
             es: 'Conversaciones largas, escalado, propagación de errores, exploración de código, revisión humana y procedencia.' },
    courses: ['api', 'ccaction', 'subagents'],
    ts: [
      { id: '5.1', en: 'Manage conversation context to preserve critical information across long interactions', es: 'Gestionar el contexto para conservar la información crítica en interacciones largas' },
      { id: '5.2', en: 'Design effective escalation and ambiguity resolution patterns', es: 'Diseñar patrones eficaces de escalado y resolución de ambigüedad' },
      { id: '5.3', en: 'Implement error propagation strategies across multi-agent systems', es: 'Implementar estrategias de propagación de errores en sistemas multiagente' },
      { id: '5.4', en: 'Manage context effectively in large codebase exploration', es: 'Gestionar bien el contexto al explorar codebases grandes' },
      { id: '5.5', en: 'Design human review workflows and confidence calibration', es: 'Diseñar flujos de revisión humana y calibración de la confianza' },
      { id: '5.6', en: 'Preserve information provenance and handle uncertainty in multi-source synthesis', es: 'Preservar la procedencia de la información y manejar la incertidumbre al sintetizar varias fuentes' }
    ]
  }
];

CAF.SCENARIOS = [
  { id: 1, icon: 'support', domains: [1, 2, 5],
    en: 'Customer Support Resolution Agent', es: 'Agente de resolución de soporte al cliente',
    desc: { en: 'An Agent SDK support agent handles returns, billing disputes and account issues through MCP tools (get_customer, lookup_order, process_refund, escalate_to_human). Target: 80%+ first-contact resolution while knowing when to escalate.',
            es: 'Un agente de soporte con el Agent SDK atiende devoluciones, disputas de facturación y problemas de cuenta mediante tools MCP (get_customer, lookup_order, process_refund, escalate_to_human). Meta: más del 80 % de resolución en el primer contacto, sabiendo cuándo escalar.' } },
  { id: 2, icon: 'code', domains: [3, 5],
    en: 'Code Generation with Claude Code', es: 'Generación de código con Claude Code',
    desc: { en: 'Your team uses Claude Code for generation, refactoring, debugging and docs, with custom slash commands, CLAUDE.md configuration, and a choice between plan mode and direct execution.',
            es: 'Tu equipo usa Claude Code para generar, refactorizar, depurar y documentar, con slash commands propios, configuración de CLAUDE.md y la decisión entre plan mode y ejecución directa.' } },
  { id: 3, icon: 'research', domains: [1, 2, 5],
    en: 'Multi-Agent Research System', es: 'Sistema de investigación multiagente',
    desc: { en: 'A coordinator delegates to subagents that search the web, analyze documents, synthesize findings and generate cited reports.',
            es: 'Un coordinador delega en subagentes que buscan en la web, analizan documentos, sintetizan hallazgos y generan informes con citas.' } },
  { id: 4, icon: 'devtools', domains: [2, 3, 1],
    en: 'Developer Productivity with Claude', es: 'Productividad para desarrolladores con Claude',
    desc: { en: 'An Agent SDK tool helps engineers explore unfamiliar codebases, understand legacy systems and automate tasks with built-in tools (Read, Write, Bash, Grep, Glob) and MCP servers.',
            es: 'Una herramienta con el Agent SDK ayuda a explorar codebases desconocidos, entender sistemas legados y automatizar tareas con tools integradas (Read, Write, Bash, Grep, Glob) y servidores MCP.' } },
  { id: 5, icon: 'ci', domains: [3, 4],
    en: 'Claude Code for Continuous Integration', es: 'Claude Code en integración continua',
    desc: { en: 'Claude Code runs automated reviews, generates tests and comments on pull requests in CI/CD. Prompts must be actionable and minimize false positives.',
            es: 'Claude Code hace revisiones automáticas, genera tests y comenta pull requests en CI/CD. Los prompts deben dar feedback accionable y minimizar falsos positivos.' } },
  { id: 6, icon: 'extract', domains: [4, 5],
    en: 'Structured Data Extraction', es: 'Extracción de datos estructurados',
    desc: { en: 'Claude extracts information from unstructured documents, validates it with JSON schemas, handles edge cases and feeds downstream systems.',
            es: 'Claude extrae información de documentos no estructurados, la valida con JSON schemas, maneja casos límite y alimenta sistemas posteriores.' } }
];

/* Patrones de razonamiento detectados en las 12 muestras oficiales */
CAF.PATTERNS = {
  rootcause:     { en: 'Fix the root cause the logs reveal', es: 'Ataca la causa raíz que muestran los logs' },
  proportionate: { en: 'Proportionate first step before new infrastructure', es: 'Primer paso proporcionado antes de añadir infraestructura' },
  deterministic: { en: 'Deterministic enforcement when stakes are high', es: 'Enforcement determinista cuando hay mucho en juego' },
  leastprivilege:{ en: 'Least privilege for tools', es: 'Mínimo privilegio en las tools' },
  structurederr: { en: 'Structured errors over blind retries or silent success', es: 'Errores estructurados, no reintentos ciegos ni éxitos falsos' },
  documented:    { en: 'Know the exact documented mechanism', es: 'Conoce el mecanismo documentado exacto' },
  badproxy:      { en: 'Reject unreliable proxies (self-confidence, sentiment, voting)', es: 'Descarta proxies poco fiables (autoconfianza, sentimiento, votación)' },
  latencyfit:    { en: 'Match the API to latency requirements', es: 'Ajusta la API a los requisitos de latencia' },
  isolation:     { en: 'Isolate context (subagents, independent reviewers)', es: 'Aísla el contexto (subagentes, revisores independientes)' },
  explicit:      { en: 'Explicit criteria and examples beat vague instructions', es: 'Criterios explícitos y ejemplos ganan a instrucciones vagas' }
};

CAF.allTS = () => CAF.DOMAINS.flatMap(d => d.ts.map(t => ({ ...t, domain: d.id })));
CAF.domain = id => CAF.DOMAINS.find(d => d.id === Number(id));
CAF.findTS = id => CAF.allTS().find(t => t.id === id);
