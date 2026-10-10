/* Partes de la ruta «Aprende Claude desde cero» (orden = orden de estudio). */
(function () {
  const T = (en, es) => ({ en, es });
  CAF.ACADEMY = [
    { id: 'A', letter: 'A', title: T('Foundations', 'Fundamentos'),
      blurb: T('What Claude is, the 2026 model family, thinking and effort, where Claude lives, and how to work with AI well.', 'Qué es Claude, la familia de modelos 2026, pensamiento y effort, dónde vive Claude y cómo trabajar bien con IA.'),
      modules: ['a01', 'a02', 'a03', 'a04', 'a05'] },
    { id: 'B', letter: 'B', title: T('Claude chat and Cowork', 'Claude chat y Cowork'),
      blurb: T('The Claude app day to day: conversations, projects, artifacts, research, connectors, skills, plugins and Cowork.', 'La app de Claude en el día a día: conversaciones, proyectos, artefactos, research, conectores, skills, plugins y Cowork.'),
      modules: ['a06', 'a07', 'a08', 'a09', 'a10', 'a11'] },
    { id: 'C', letter: 'C', title: T('Prompting', 'Prompting'),
      blurb: T('How to write prompts that work, and how to measure whether they do.', 'Cómo escribir prompts que funcionan y cómo medir si de verdad funcionan.'),
      modules: ['a12', 'a13'] },
    { id: 'D', letter: 'D', title: T('Building with the Claude API', 'Construir con la API de Claude'),
      blurb: T('Messages API, tool use, platform features, RAG, and choosing between your own loop, the Agent SDK and Managed Agents.', 'Messages API, tool use, funciones de la plataforma, RAG y cómo elegir entre tu propio bucle, el Agent SDK y Managed Agents.'),
      modules: ['a14', 'a15', 'a16', 'a17', 'a18'] },
    { id: 'E', letter: 'E', title: T('Model Context Protocol', 'Model Context Protocol'),
      blurb: T('The open standard behind connectors: architecture, primitives, transports, and advanced features.', 'El estándar abierto detrás de los conectores: arquitectura, primitivas, transportes y funciones avanzadas.'),
      modules: ['a19', 'a20'] },
    { id: 'F', letter: 'F', title: T('Claude Code', 'Claude Code'),
      blurb: T('The coding agent: workflow and permissions, customization (CLAUDE.md, skills, subagents, hooks, plugins) and production use.', 'El agente de programación: flujo y permisos, personalización (CLAUDE.md, skills, subagentes, hooks, plugins) y uso en producción.'),
      modules: ['a21', 'a22', 'a23'] },
    { id: 'G', letter: 'G', title: T('Agents and architecture', 'Agentes y arquitectura'),
      blurb: T('The harness concept, the Agent SDK, agentic patterns, and how to run agents reliably and safely.', 'El concepto de harness, el Agent SDK, los patrones agénticos y cómo operar agentes de forma fiable y segura.'),
      modules: ['a24', 'a25', 'a26'] }
  ];
})();
