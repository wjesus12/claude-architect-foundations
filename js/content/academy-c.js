/* Ruta «desde cero» · Parte C — Prompting (M12–M13) */
(function () {
  const T = (en, es) => ({ en, es });
  const opt = (en, es, ok, wen, wes) => ({ t: T(en, es), ok, why: T(wen, wes) });
  const D = {
    api: { label: 'Skilljar · Building with the Claude API', url: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api' },
    pe: { label: 'Prompting best practices', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices' },
    evals: { label: 'Develop tests and evals', url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests' }
  };

  CAF.addLessons([
    {
      id: 'a12', track: 'academy', domain: 0, minutes: 15, art: 'mascot', exam: ['4.1', '4.2'],
      title: T('Writing prompts that work', 'Escribir prompts que funcionan'),
      summary: T('A strong prompt reads like a good brief to a capable colleague: the goal, the reason behind it, the context Claude cannot guess, the shape of a good answer, and examples when wording alone is ambiguous.',
                 'Un buen prompt se lee como un buen encargo a un colega capaz: el objetivo, el motivo, el contexto que Claude no puede adivinar, la forma de una buena respuesta y ejemplos cuando las palabras solas resultan ambiguas.'),
      objectives: [
        T('Use clarity, specificity, examples and XML structure deliberately.', 'Usar a propósito la claridad, la especificidad, los ejemplos y la estructura XML.'),
        T('Place long material and the request in the right order.', 'Ordenar bien el material largo y la petición.'),
        T('Spot the vague-instruction patterns that exam options use as distractors.', 'Detectar las instrucciones vagas que las opciones del examen usan como distractores.')
      ],
      docs: [D.pe, D.api],
      blocks: [
        { type: 'h', text: T('Six habits', 'Seis hábitos') },
        { type: 'terms', items: [
          { term: 'clear goal', en: 'State the task, the audience and why it matters. Motivation helps Claude generalize the rule.', es: 'Indica la tarea, el público y por qué importa. El motivo ayuda a Claude a generalizar la regla.' },
          { term: 'specific criteria', en: 'Define length, format, what counts as good and what to leave out.', es: 'Define la longitud, el formato, qué cuenta como bueno y qué dejar fuera.' },
          { term: 'examples', en: 'Two to four input → output pairs, including a borderline case and the reasoning for it.', es: 'De dos a cuatro pares entrada → salida, incluido un caso límite y su razonamiento.' },
          { term: 'XML tags', en: 'Wrap material and instructions in tags such as <document> and <instructions> so they never blur together.', es: 'Envuelve material e instrucciones en etiquetas como <document> e <instructions> para que nunca se mezclen.' },
          { term: 'role', en: 'A system prompt role sets expertise and tone for the whole conversation.', es: 'Un rol en el system prompt fija la experiencia y el tono de toda la conversación.' },
          { term: 'order', en: 'Long reference material near the top, the actual request at the end.', es: 'El material de referencia largo arriba y la petición concreta al final.' }
        ] },
        { type: 'code', lang: 'md', title: 'a briefing-style prompt', code: `
<instructions>
Audience: a store manager with no finance background.
Task: explain last month's margin drop using the sales export below.
Give 3 causes, each with one supporting number from the data.
Keep it under 150 words. Skip methodology.
</instructions>

<example>
Cause: more discounted sales. Evidence: promo items were 41% of units (vs 28%).
</example>

<sales_export>
{{DATA}}
</sales_export>` },
        { type: 'compare',
          bad: { title: T('Vague', 'Vago'), items: [
            T('"Be careful with the numbers."', '«Ten cuidado con las cifras.»'),
            T('"Only mention important things."', '«Menciona solo lo importante.»'),
            T('Rules repeated in capitals with no reason', 'Reglas repetidas en mayúsculas sin explicar el motivo')
          ] },
          good: { title: T('Concrete', 'Concreto'), items: [
            T('"Every figure must come from the export; write n/a if missing."', '«Cada cifra debe salir del archivo; escribe n/d si falta.»'),
            T('"Report causes with an effect above 2 points of margin."', '«Reporta las causas con un efecto superior a 2 puntos de margen.»'),
            T('One short reason attached to each important rule', 'Un motivo breve unido a cada regla importante')
          ] } },
        { type: 'note', text: T('Current Claude models follow instructions closely. When output is off, add the missing context or a sharper criterion; ask explicitly for the length and format you want.', 'Los modelos Claude actuales siguen las instrucciones con mucha fidelidad. Si el resultado no encaja, añade el contexto que falta o un criterio más preciso; pide explícitamente la longitud y el formato que quieres.') },
        { type: 'trap', text: T('Examples fix inconsistent format and ambiguous judgment. They are not the first fix when tools are misrouted because of poor descriptions, and they never replace a hook when a rule must always hold.', 'Los ejemplos arreglan formatos inconsistentes y criterios ambiguos. No son el primer arreglo cuando las tools se enrutan mal por malas descripciones, y nunca sustituyen a un hook cuando una regla debe cumplirse siempre.') }
      ],
      quiz: [
        { q: T('Answers vary in layout from run to run even though your instructions describe the layout in detail. What should you add?', 'Las respuestas cambian de estructura en cada ejecución aunque tus instrucciones la describen con detalle. ¿Qué deberías añadir?'),
          options: [
            opt('A few examples that show the exact layout you expect', 'Unos pocos ejemplos que muestren la estructura exacta que esperas', true, 'Demonstrations are the most effective lever for consistent format.', 'Las demostraciones son la palanca más eficaz para un formato consistente.'),
            opt('The same layout rules again, this time written in capitals', 'Las mismas reglas de estructura otra vez, ahora en mayúsculas', false, 'Louder repetition rarely changes the result.', 'Repetir con más énfasis rara vez cambia el resultado.'),
            opt('A different model, keeping the prompt exactly as it is', 'Otro modelo, manteniendo el prompt exactamente igual', false, 'The missing piece is a demonstration, not capability.', 'Lo que falta es una demostración, no capacidad.'),
            opt('Nothing; varied layouts are unavoidable with language models', 'Nada; las estructuras variables son inevitables con modelos de lenguaje', false, 'Examples or schemas make output consistent.', 'Los ejemplos o los schemas hacen consistente la salida.')
          ] },
        { q: T('A prompt contains a long policy document and one question about it. What order works best?', 'Un prompt contiene un documento de política largo y una pregunta sobre él. ¿Qué orden funciona mejor?'),
          options: [
            opt('Document first, then the question at the very end', 'Primero el documento y luego la pregunta al final de todo', true, 'Long material on top, request last.', 'Material largo arriba y petición al final.'),
            opt('Question first, then the document, then nothing else', 'Primero la pregunta, luego el documento y nada más', false, 'The request ends up far from the end of the prompt.', 'La petición queda lejos del final del prompt.'),
            opt('Split the document in two and put the question between halves', 'Partir el documento en dos y poner la pregunta en medio', false, 'Burying the request in the middle hurts.', 'Enterrar la petición en medio perjudica.'),
            opt('Order does not matter for any prompt length', 'El orden no importa para ninguna longitud de prompt', false, 'It matters for long inputs.', 'Importa en entradas largas.')
          ] }
      ]
    },

    {
      id: 'a13', track: 'academy', domain: 0, minutes: 12, art: 'mascot', exam: ['4.4', '5.5'],
      title: T('Evaluating prompts with evidence', 'Evaluar prompts con pruebas'),
      summary: T('You only know a prompt works when you test it on many cases. An evaluation runs the prompt over a dataset, grades every output with code, a model or a person, and lets you compare versions with numbers instead of impressions.',
                 'Solo sabes que un prompt funciona cuando lo pruebas en muchos casos. Una evaluación ejecuta el prompt sobre un dataset, califica cada salida con código, con un modelo o con una persona, y te deja comparar versiones con números en lugar de impresiones.'),
      objectives: [
        T('Follow the eval loop: criteria, dataset, run, grade, iterate.', 'Seguir el ciclo de evaluación: criterios, dataset, ejecutar, calificar, iterar.'),
        T('Pick a grader that fits the output type.', 'Elegir un calificador acorde al tipo de salida.'),
        T('Read results per segment, not only overall.', 'Leer los resultados por segmento, no solo en conjunto.')
      ],
      docs: [D.evals, D.api],
      blocks: [
        { type: 'steps', items: [
          T('Write down what success looks like in checkable terms.', 'Escribe cómo es el éxito en términos comprobables.'),
          T('Collect realistic test inputs, including hard and unusual ones (Claude can draft extra cases).', 'Reúne entradas de prueba realistas, incluidas las difíciles e inusuales (Claude puede redactar casos extra).'),
          T('Run the prompt on all of them.', 'Ejecuta el prompt en todas.'),
          T('Grade each output and compute scores.', 'Califica cada salida y calcula las puntuaciones.'),
          T('Change one variable, re-run and keep the better version.', 'Cambia una sola variable, repite y quédate con la mejor versión.')
        ] },
        { type: 'table', head: [T('Grader', 'Calificador'), T('Method', 'Método'), T('Fits', 'Encaja con')], rows: [
          [T('Code', 'Código'), T('Exact match, schema validation, numeric checks', 'Coincidencia exacta, validación de schema, comprobaciones numéricas'), T('Labels, extraction, formats', 'Etiquetas, extracción, formatos')],
          [T('Model', 'Modelo'), T('A separate Claude call scores against a rubric', 'Una llamada aparte a Claude puntúa según una rúbrica'), T('Tone, helpfulness, open answers', 'Tono, utilidad, respuestas abiertas')],
          [T('Person', 'Persona'), T('Experts review a sample', 'Expertos revisan una muestra'), T('Calibration and high-stakes work', 'Calibración y trabajo crítico')]
        ] },
        { type: 'note', text: T('The Claude Console Workbench lets you draft and compare prompt versions in the browser; evals turn those trials into evidence you can trust.', 'El Workbench de la Claude Console te permite redactar y comparar versiones de prompts en el navegador; las evaluaciones convierten esas pruebas en evidencia fiable.') },
        { type: 'trap', text: T('A high overall score can hide one weak category. Break results down by segment before trusting a prompt, the same reasoning as exam objective 5.5.', 'Una puntuación global alta puede ocultar una categoría débil. Desglosa por segmento antes de confiar en un prompt: el mismo razonamiento del objetivo 5.5 del examen.') }
      ],
      quiz: [
        { q: T('You must check that extracted records always follow a strict JSON structure. Which grader is the best fit?', 'Debes comprobar que los registros extraídos siempre siguen una estructura JSON estricta. ¿Qué calificador encaja mejor?'),
          options: [
            opt('A code grader that validates every record against the schema', 'Un calificador por código que valide cada registro contra el schema', true, 'Deterministic and cheap for structural checks.', 'Determinista y barato para comprobaciones de estructura.'),
            opt('A model grader asked if the records look reasonable overall', 'Un calificador por modelo al que se le pregunta si los registros parecen razonables', false, 'Less precise than validating the structure directly.', 'Menos preciso que validar directamente la estructura.'),
            opt('Skimming a handful of records and trusting your impression', 'Ojear unos pocos registros y fiarse de la impresión', false, 'Not systematic or repeatable.', 'No es sistemático ni repetible.'),
            opt('Measuring how long each record is in characters', 'Medir cuántos caracteres tiene cada registro', false, 'Length says nothing about structure.', 'La longitud no dice nada de la estructura.')
          ] },
        { q: T('Version B scores 95% overall and version A scores 92%. What should happen before you switch?', 'La versión B saca 95 % global y la A 92 %. ¿Qué debe ocurrir antes de cambiar?'),
          options: [
            opt('Compare the versions segment by segment to confirm nothing got worse', 'Comparar las versiones segmento a segmento para confirmar que nada empeoró', true, 'Overall gains can hide a regression in one segment.', 'Una mejora global puede ocultar un retroceso en un segmento.'),
            opt('Switch at once, because a higher overall score is always safer', 'Cambiar de inmediato, porque una puntuación global más alta siempre es más segura', false, 'One segment could have dropped badly.', 'Un segmento podría haber caído mucho.'),
            opt('Ask Claude which version it likes better and follow that', 'Preguntar a Claude qué versión le gusta más y seguir eso', false, 'Preference is not evidence.', 'Una preferencia no es una prueba.'),
            opt('Throw away the dataset so future tests start clean', 'Tirar el dataset para que las pruebas futuras empiecen limpias', false, 'You need it to compare versions.', 'Lo necesitas para comparar versiones.')
          ] }
      ]
    }
  ]);
})();
