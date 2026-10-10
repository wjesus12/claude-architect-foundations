/* Lecciones transversales: L0 (cómo piensa el examen) y Exam English. */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });

  CAF.addLessons([
    {
      id: '0', domain: 0, minutes: 15, art: 'mascot',
      title: T('How the exam thinks', 'Cómo piensa el examen'),
      summary: T(
        'CCAR-F does not reward memorizing definitions. Every item drops you into a production system, shows a symptom, and offers four plausible fixes. Your job is to pick the **best** one for that context.',
        'El CCAR-F no premia memorizar definiciones. Cada pregunta te mete en un sistema en producción, te muestra un síntoma y te da cuatro arreglos plausibles. Tu trabajo es elegir el **mejor** para ese contexto.'),
      objectives: [
        T('Know the format: 60 items, 120 minutes, 4 of 6 scenarios, scaled score 720/1000.', 'Conocer el formato: 60 ítems, 120 minutos, 4 de 6 escenarios, puntuación escalada 720/1000.'),
        T('Recognize the ten reasoning patterns behind the official sample answers.', 'Reconocer los diez patrones de razonamiento detrás de las respuestas oficiales de muestra.'),
        T('Apply a repeatable method to eliminate distractors.', 'Aplicar un método repetible para descartar distractores.')
      ],
      blocks: [
        { type: 'table', head: [T('Item', 'Dato'), T('Value', 'Valor')], rows: [
          [T('Items', 'Ítems'), T('60 multiple-choice and multiple-response (each item says how many to select)', '60 de opción múltiple y de respuesta múltiple (cada ítem dice cuántas elegir)')],
          [T('Time', 'Tiempo'), T('120 minutes → 2 minutes per item', '120 minutos → 2 minutos por ítem')],
          [T('Structure', 'Estructura'), T('4 scenarios drawn at random from a bank of 6 (~15 items each)', '4 escenarios sorteados de un banco de 6 (~15 ítems cada uno)')],
          [T('Passing score', 'Aprobado'), T('Scaled 720 on a 100–1,000 scale', '720 en una escala de 100 a 1000')],
          [T('Language', 'Idioma'), T('English only', 'Solo inglés')],
          [T('Report', 'Informe'), T('Pass/fail + percent correct per domain', 'Aprobado/no aprobado + % de acierto por dominio')]
        ] },
        { type: 'h', text: T('The anatomy of a question', 'La anatomía de una pregunta') },
        { type: 'p', text: T(
          'Almost every item follows the same shape: a **scenario** (support agent, CI pipeline, research system…), a **production observation** ("logs show…", "in 12% of cases…"), and a **question stem** that sets the bar: *most effective*, *first step*, *most likely root cause*. Read the stem as carefully as the scenario: "first step" and "best long-term architecture" lead to different answers.',
          'Casi todas siguen el mismo molde: un **escenario** (agente de soporte, pipeline de CI, sistema de investigación…), una **observación de producción** («los logs muestran…», «en el 12 % de los casos…») y un **enunciado** que fija el listón: *most effective*, *first step*, *most likely root cause*. Lee el enunciado con tanto cuidado como el escenario: «primer paso» y «mejor arquitectura a largo plazo» llevan a respuestas distintas.') },
        { type: 'h', text: T('Ten patterns that decide the answer', 'Diez patrones que deciden la respuesta') },
        { type: 'terms', items: [
          { term: 'root cause', en: 'Fix what the logs actually reveal. If the coordinator decomposed the topic too narrowly, don\'t blame the subagents that did their job.', es: 'Arregla lo que de verdad muestran los logs. Si el coordinador descompuso el tema de forma muy estrecha, no culpes a los subagentes que hicieron bien su trabajo.' },
          { term: 'proportionate', en: 'Prefer the low-effort, high-leverage fix before new infrastructure (classifiers, routing layers, bigger models).', es: 'Prefiere el arreglo de poco esfuerzo y mucho impacto antes de meter infraestructura nueva (clasificadores, capas de routing, modelos más grandes).' },
          { term: 'deterministic', en: 'When money, identity or compliance is at stake, use hooks and programmatic gates, not prompt instructions.', es: 'Cuando hay dinero, identidad o cumplimiento en juego, usa hooks y compuertas programáticas, no instrucciones en el prompt.' },
          { term: 'least privilege', en: 'Give each agent only the tools its role needs; add a narrow cross-role tool for the frequent case.', es: 'Da a cada agente solo las tools que su rol necesita; añade una tool acotada para el caso frecuente.' },
          { term: 'structured errors', en: 'Return error type, what was attempted, partial results and alternatives. Never fake success, never abort everything.', es: 'Devuelve tipo de error, qué se intentó, resultados parciales y alternativas. Nunca finjas éxito ni abortes todo.' },
          { term: 'documented mechanism', en: 'Know the exact flag or path (`-p`, `.claude/commands/`, `.mcp.json`). Distractors invent plausible ones (`--batch`, `CLAUDE_HEADLESS`).', es: 'Conoce el flag o la ruta exacta (`-p`, `.claude/commands/`, `.mcp.json`). Los distractores inventan otros plausibles (`--batch`, `CLAUDE_HEADLESS`).' },
          { term: 'bad proxies', en: 'Self-reported confidence, sentiment and majority voting are unreliable signals for complexity or correctness.', es: 'La confianza autoinformada, el sentimiento y la votación por mayoría son señales poco fiables de complejidad o de acierto.' },
          { term: 'latency fit', en: 'Batches API for latency-tolerant work only; synchronous calls for anything someone waits on.', es: 'Batches API solo para trabajo que tolera latencia; llamadas síncronas para todo lo que alguien espera.' },
          { term: 'context isolation', en: 'Subagents and independent reviewers start clean; that is a feature, so pass what they need explicitly.', es: 'Los subagentes y los revisores independientes empiezan en limpio; es una ventaja, así que pásales explícitamente lo que necesitan.' },
          { term: 'explicit > vague', en: 'Concrete criteria and few-shot examples beat "be careful" or "only high-confidence findings".', es: 'Criterios concretos y ejemplos few-shot ganan a «ten cuidado» o «solo hallazgos de alta confianza».' }
        ] },
        { type: 'h', text: T('A method you can repeat 60 times', 'Un método que puedes repetir 60 veces') },
        { type: 'steps', items: [
          T('**Name the constraint.** Is it money, compliance, latency, cost, developer trust or context size?', '**Nombra la restricción.** ¿Es dinero, cumplimiento, latencia, costo, confianza de los desarrolladores o tamaño del contexto?'),
          T('**Find the real symptom.** Underline the log line or percentage. That is where the root cause hides.', '**Encuentra el síntoma real.** Subraya la línea de log o el porcentaje. Ahí se esconde la causa raíz.'),
          T('**Read the bar in the stem.** "First step" → cheapest effective fix. "Most reliable" → deterministic. "Most likely cause" → diagnosis, not a fix.', '**Lee el listón del enunciado.** «First step» → el arreglo eficaz más barato. «Most reliable» → determinista. «Most likely cause» → diagnóstico, no arreglo.'),
          T('**Strike the impostors.** Invented flags, over-engineering, unreliable proxies, answers that fix a different problem.', '**Tacha a los impostores.** Flags inventados, sobreingeniería, proxies poco fiables, respuestas que arreglan otro problema.'),
          T('**Choose between the last two** by asking: which one acts on the cause the logs show, with the least new machinery?', '**Elige entre las dos últimas** preguntándote: ¿cuál actúa sobre la causa que muestran los logs con la menor maquinaria nueva?')
        ] },
        { type: 'example', situation: T(
          '**Official sample (Exam Guide v1.0).** In 12% of cases the support agent skips `get_customer` and calls `lookup_order` with only the customer\'s stated name, causing misidentified accounts and wrong refunds. Options: (A) a programmatic prerequisite that blocks `lookup_order` and `process_refund` until `get_customer` returns a verified ID; (B) a stronger system prompt; (C) few-shot examples; (D) a routing classifier.',
          '**Muestra oficial (Exam Guide v1.0).** En el 12 % de los casos el agente de soporte se salta `get_customer` y llama a `lookup_order` solo con el nombre que dice el cliente, lo que provoca cuentas mal identificadas y reembolsos erróneos. Opciones: (A) un prerrequisito programático que bloquee `lookup_order` y `process_refund` hasta que `get_customer` devuelva un ID verificado; (B) un system prompt más firme; (C) ejemplos few-shot; (D) un clasificador de routing.'),
          answer: T(
            '**A.** The constraint is money (refunds), so the pattern is *deterministic*. B and C are probabilistic: they lower the 12% but never to zero. D changes which tools exist, not the order they run in.',
            '**A.** La restricción es dinero (reembolsos), así que el patrón es *determinista*. B y C son probabilísticas: bajan el 12 % pero nunca a cero. D cambia qué tools existen, no el orden en que se ejecutan.') },
        { type: 'trap', text: T(
          'Two options often look right. One is the *best architecture in the abstract* (a classifier, a consolidated tool), the other is the *right move for the stem*. If the stem says "first step" or "most effective", the proportionate fix usually wins.',
          'A menudo dos opciones parecen correctas. Una es la *mejor arquitectura en abstracto* (un clasificador, una tool consolidada); la otra es *la jugada correcta para el enunciado*. Si el enunciado dice «first step» o «most effective», suele ganar el arreglo proporcionado.') },
        { type: 'note', text: T(
          'Out of scope, so do not over-study: fine-tuning, computer use, vision, streaming/SSE, rate limits and pricing math, OAuth, cloud-provider setup, embeddings/vector DBs, tokenization details, and prompt caching internals.',
          'Fuera del temario, así que no lo sobreestudies: fine-tuning, computer use, visión, streaming/SSE, límites de tasa y cálculo de precios, OAuth, configuración de proveedores cloud, embeddings/bases vectoriales, detalles de tokenización e internals de prompt caching.') }
      ],
      quiz: [
        { q: T('A question stem asks for the "most effective first step". Two options would both work. Which should you prefer?',
               'Un enunciado pide el «primer paso más eficaz». Dos opciones funcionarían. ¿Cuál deberías preferir?'),
          options: [
            opt('The low-effort change that addresses the observed root cause', 'El cambio de poco esfuerzo que ataca la causa raíz observada', true,
                'Correct: "first step" signals proportionality. Fix the observed cause before adding machinery.', 'Correcto: «primer paso» indica proporcionalidad. Arregla la causa observada antes de añadir maquinaria.'),
            opt('The option that adds a trained classifier, since it scales better', 'La opción que añade un clasificador entrenado, porque escala mejor', false,
                'Over-engineered for a first step; it needs labeled data and infrastructure.', 'Es sobreingeniería para un primer paso: necesita datos etiquetados e infraestructura.'),
            opt('The option that switches to a larger model', 'La opción que cambia a un modelo más grande', false,
                'A bigger model rarely fixes a design problem and is not proportionate.', 'Un modelo más grande rara vez arregla un problema de diseño y no es proporcionado.'),
            opt('Either, since the exam accepts any working solution', 'Cualquiera, porque el examen acepta cualquier solución que funcione', false,
                'The exam asks for the *best* option for the stated bar, not any working one.', 'El examen pide la *mejor* opción para el listón indicado, no cualquiera que funcione.')
          ] },
        { q: T('Which of these is a typical distractor pattern on CCAR-F?', '¿Cuál de estos es un patrón típico de distractor en el CCAR-F?'),
          options: [
            opt('A plausible-sounding CLI flag or config file that does not exist', 'Un flag de CLI o archivo de configuración que suena plausible pero no existe', true,
                'Correct: sample items use invented options like `--batch` or `.claude/config.json`.', 'Correcto: las muestras usan opciones inventadas como `--batch` o `.claude/config.json`.'),
            opt('An option that uses a PreToolUse hook to enforce a financial business rule', 'Una opción que usa un hook PreToolUse para imponer una regla de negocio financiera', false,
                'That is usually the correct pattern when stakes are high, not a distractor.', 'Ese suele ser el patrón correcto cuando hay mucho en juego, no un distractor.'),
            opt('An option that improves a minimal tool description', 'Una opción que mejora una descripción de tool mínima', false,
                'Improving descriptions is the documented first fix for misrouting.', 'Mejorar descripciones es el primer arreglo documentado para el mal enrutado.'),
            opt('An option that passes context explicitly to a subagent', 'Una opción que pasa contexto explícitamente a un subagente', false,
                'Subagents do not inherit context, so passing it explicitly is correct.', 'Los subagentes no heredan contexto, así que pasarlo explícitamente es lo correcto.')
          ] }
      ]
    },

    {
      id: 'en', domain: 0, minutes: 20, art: 'mascot',
      title: T('Exam English: the words that decide the answer', 'Exam English: las palabras que deciden la respuesta'),
      summary: T(
        'You do not need fluent English to pass. You need to read a small set of words with total precision, because they set the bar the correct option must clear.',
        'No necesitas un inglés fluido para aprobar. Necesitas leer con precisión total un pequeño grupo de palabras, porque fijan el listón que debe superar la opción correcta.'),
      objectives: [
        T('Decode the stems that appear again and again.', 'Descifrar los enunciados que se repiten una y otra vez.'),
        T('Spot qualifiers that flip the meaning (only, unless, rather than, first).', 'Detectar los matices que cambian el sentido (only, unless, rather than, first).'),
        T('Read architecture vocabulary without translating word by word.', 'Leer vocabulario de arquitectura sin traducir palabra por palabra.')
      ],
      blocks: [
        { type: 'h', text: T('Question stems', 'Enunciados típicos') },
        { type: 'table', head: [T('Stem', 'Enunciado'), T('What it really asks', 'Qué pide realmente')], rows: [
          [T('What change would **most effectively** address…?', 'What change would **most effectively** address…?'), T('The option with the biggest impact on the stated problem.', '«¿Qué cambio resolvería de forma **más eficaz**…?» La opción con mayor impacto sobre el problema descrito.')],
          [T('What is the most effective **first step**?', 'What is the most effective **first step**?'), T('The cheapest change that attacks the cause. Not the final architecture.', '«¿Cuál es el **primer paso** más eficaz?» El cambio más barato que ataca la causa. No la arquitectura final.')],
          [T('What is the **most likely root cause**?', 'What is the **most likely root cause**?'), T('A diagnosis. Look for the component the logs point to.', '«¿Cuál es la **causa raíz más probable**?» Un diagnóstico. Busca el componente al que apuntan los logs.')],
          [T('Which approach **best** enables…?', 'Which approach **best** enables…?'), T('Several work; pick the one that fully meets the goal.', '«¿Qué enfoque permite **mejor**…?» Varias funcionan; elige la que cumple el objetivo por completo.')],
          [T('How should you **evaluate** this proposal?', 'How should you **evaluate** this proposal?'), T('Often "accept part, reject part": match each workload to its fit.', '«¿Cómo deberías **evaluar** esta propuesta?» A menudo «acepta una parte y rechaza otra»: ajusta cada carga a lo que le conviene.')],
          [T('**Select TWO.** / Choose **two** answers.', '**Select TWO.** / Choose **two** answers.'), T('Multiple-response item: exactly two are correct.', '«Elige **dos**.» Ítem de respuesta múltiple: exactamente dos son correctas.')]
        ] },
        { type: 'h', text: T('Qualifiers that flip the meaning', 'Matices que cambian el sentido') },
        { type: 'terms', items: [
          { term: 'only / only when', en: 'Restricts. "Escalate only when policy is silent" ≠ "escalate when unsure".', es: '«solo / solo cuando». Restringe. «Escala solo cuando la política no dice nada» ≠ «escala cuando dudes».' },
          { term: 'rather than / instead of', en: 'The thing after it is the anti-pattern being rejected.', es: '«en lugar de». Lo que viene después es el anti-patrón que se rechaza.' },
          { term: 'unless', en: '"if not". "Retry unless the error is non-retryable."', es: '«a menos que». «Reintenta a menos que el error no sea reintentable.»' },
          { term: 'regardless of', en: '"no matter". "Apply to tests regardless of directory" → glob path rules.', es: '«sin importar». «Aplica a los tests sin importar el directorio» → reglas por ruta con glob.' },
          { term: 'guarantee / ensure', en: 'Signals determinism: hooks, forced tool_choice, programmatic gates.', es: '«garantizar / asegurar». Indica determinismo: hooks, tool_choice forzado, compuertas programáticas.' },
          { term: 'reliably / consistently', en: 'The current approach works sometimes; you need it to work every time.', es: '«de forma fiable / consistente». Lo actual funciona a veces; necesitas que funcione siempre.' },
          { term: 'non-zero failure rate', en: 'A polite way to say "prompts can still fail". Points to enforcement.', es: '«tasa de fallo distinta de cero». Forma educada de decir «los prompts pueden fallar». Apunta a enforcement.' },
          { term: 'upfront', en: '"at the beginning, before starting". Often a trap: reading all files upfront wastes context.', es: '«al principio, antes de empezar». A menudo una trampa: leer todos los archivos al principio desperdicia contexto.' }
        ] },
        { type: 'h', text: T('Architecture vocabulary', 'Vocabulario de arquitectura') },
        { type: 'terms', items: [
          { term: 'blocking (workflow)', en: 'Someone waits for it (pre-merge check). Opposite: latency-tolerant.', es: '«bloqueante». Alguien lo espera (check previo al merge). Lo contrario: tolerante a la latencia.' },
          { term: 'stale', en: 'Out of date. "Stale tool results" = results that no longer match the files.', es: '«obsoleto». «Stale tool results» = resultados que ya no coinciden con los archivos.' },
          { term: 'handoff', en: 'Passing a case to a human or another agent, with a summary.', es: '«traspaso». Pasar un caso a una persona u otro agente, con un resumen.' },
          { term: 'escalate', en: 'Send to a human. Know the triggers: explicit request, policy gap, no progress.', es: '«escalar». Enviar a una persona. Disparadores: petición explícita, vacío en la política, sin avance.' },
          { term: 'scoped', en: 'Limited to a role, project or path. "Scoped tool access", "project-scoped command".', es: '«acotado». Limitado a un rol, proyecto o ruta. «Acceso acotado a tools», «comando del proyecto».' },
          { term: 'attribution / provenance', en: 'Which source supports which claim.', es: '«atribución / procedencia». Qué fuente respalda cada afirmación.' },
          { term: 'false positive', en: 'Flagging a problem that is not real. High rates destroy developer trust.', es: '«falso positivo». Señalar un problema que no existe. Si abundan, destruyen la confianza de los desarrolladores.' },
          { term: 'attention dilution', en: 'Quality drops when the model processes too much at once (14 files in one pass).', es: '«dilución de la atención». La calidad cae cuando el modelo procesa demasiado a la vez (14 archivos en una pasada).' },
          { term: 'over-engineered', en: 'More machinery than the problem needs. A frequent reason an option is wrong.', es: '«sobrediseñado». Más maquinaria de la que el problema necesita. Motivo frecuente de que una opción sea incorrecta.' },
          { term: 'trade-off', en: 'What you gain vs what you give up (cost vs latency, autonomy vs control).', es: '«compromiso». Lo que ganas frente a lo que cedes (costo vs latencia, autonomía vs control).' }
        ] },
        { type: 'note', text: T(
          'Practice tip: answer in **Hybrid** mode first, then repeat the same set in **English** mode. When your English accuracy matches your Spanish accuracy, language is no longer costing you points.',
          'Consejo de práctica: responde primero en modo **Híbrido** y luego repite el mismo set en modo **Inglés**. Cuando tu acierto en inglés iguale al de español, el idioma ya no te está restando puntos.') },
        { type: 'trap', text: T(
          'Absolute words such as **always** and **never** are rare in correct options, and options that sound sophisticated are not automatically right. The exam rewards the fitting answer, not the impressive one.',
          'Las palabras absolutas como **always** y **never** rara vez aparecen en opciones correctas, y las opciones que suenan sofisticadas no son correctas por eso. El examen premia la respuesta adecuada, no la impresionante.') }
      ],
      quiz: [
        { q: T('"Use batch processing for the overnight report **rather than** the pre-merge check." Which workload should stay synchronous?',
               '«Use batch processing for the overnight report **rather than** the pre-merge check.» ¿Qué carga debe seguir siendo síncrona?'),
          options: [
            opt('The pre-merge check', 'El check previo al merge', true, '"Rather than" marks the pre-merge check as the one NOT moved to batch.', '«Rather than» marca el check previo al merge como el que NO pasa a batch.'),
            opt('The overnight report', 'El informe nocturno', false, 'The sentence moves the overnight report to batch.', 'La frase pasa el informe nocturno a batch.'),
            opt('Both', 'Ambas', false, 'Only one is excluded from batch.', 'Solo una queda fuera de batch.'),
            opt('Neither', 'Ninguna', false, 'The pre-merge check stays synchronous.', 'El check previo al merge sigue siendo síncrono.')
          ] },
        { q: T('In an exam option, "**stale** tool results" means…', 'En una opción del examen, «**stale** tool results» significa…'),
          options: [
            opt('Results that no longer reflect the current state of the files', 'Resultados que ya no reflejan el estado actual de los archivos', true, 'Stale = out of date. That is why a fresh session with a summary can beat resuming.', 'Stale = desactualizado. Por eso una sesión nueva con un resumen puede ser mejor que reanudar.'),
            opt('Results returned with an error flag', 'Resultados devueltos con un indicador de error', false, 'That would be an error result (`isError`), not a stale one.', 'Eso sería un resultado con error (`isError`), no uno obsoleto.'),
            opt('Results that were cached by the API and reused from an earlier call', 'Resultados que la API guardó en caché y reutilizó de una llamada anterior', false, 'Caching is unrelated to the meaning of "stale" here.', 'El caché no tiene que ver con el significado de «stale» aquí.'),
            opt('Results too long for the context window', 'Resultados demasiado largos para la ventana de contexto', false, 'That is a size problem, not staleness.', 'Eso es un problema de tamaño, no de obsolescencia.')
          ] }
      ]
    }
  ]);
})();
