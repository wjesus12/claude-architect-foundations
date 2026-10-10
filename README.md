# Claude Architect Foundations

Portal de entrenamiento para la certificación **Claude Certified Architect – Foundations (CCAR-F)**. Tiene forma de consola, con un árbol lateral y una terminal de comandos, e incluye a Clay, una mascota pixelada animada.

Todo el contenido está en tres modos de idioma. Es la misma pregunta traducida, con la misma dificultad:

| Modo | Para qué sirve |
|---|---|
| **EN** | Practicar tal como será el examen, que es 100 % en inglés |
| **ES** | Entender el concepto |
| **EN+ES** | Puente: ver cada frase en inglés con su traducción |

## Qué incluye

| Sección | Contenido |
|---|---|
| **Aprende Claude desde cero** | 26 módulos en 7 partes: modelos (Fable, Opus, Sonnet, Haiku), pensamiento adaptativo y *effort*, Claude chat, Projects, Artifacts, conectores, skills, plugins, Cowork, prompting y evaluación, Messages API, tool use, RAG, Agent SDK y Managed Agents, MCP, Claude Code (modos de permisos, CLAUDE.md, hooks, subagentes, output styles, headless, CI), el *harness* y los patrones agénticos |
| **Glosario** | 110 términos bilingües con buscador y filtros, cada uno enlazado a su módulo |
| **Ruta del examen** | 32 lecciones: formato del examen, inglés del examen y los 30 *task statements* de los 5 dominios oficiales |
| **Simulacro** | 60 preguntas en 4 escenarios y 120 minutos, con puntuación escalada de 100 a 1000 (aprueba con 720). Hay 3 formas fijas y una aleatoria, y se reparten según los pesos oficiales 27/18/20/20/15 |
| **Práctica** | Banco de 200 preguntas filtrable por dominio, nivel e idioma |
| **Labs de diagnóstico** | 25 casos para encontrar el fallo en configuraciones, prompts y bucles |
| **Arquitecto** | 15 retos de arrastrar y soltar con 34 componentes |
| **Flashcards** | 150 tarjetas con repetición espaciada (SM-2) |
| **Gamificación** | XP, 7 niveles, racha, logros, puntuación estimada y brecha de idioma (EN frente a ES) |
| **Cuentas locales** | Un administrador con contraseña y estudiantes con PIN (SHA-256 con sal), más exportación e importación en JSON |

Las preguntas son originales y están escritas contra cada *task statement* de la guía oficial. Las 12 preguntas de muestra publicadas por Anthropic aparecen marcadas como tales. En las preguntas originales, la respuesta correcta nunca delata su posición por ser la más larga: las pruebas automáticas vigilan ese sesgo.

## Uso

Es un sitio estático, sin compilación ni dependencias. Basta con servir la carpeta:

```bash
python3 -m http.server 8850
```

Después abre `http://localhost:8850`. La primera vez se crea la cuenta de administrador, y desde el panel **admin** se dan de alta los estudiantes.

Todo se guarda en el `localStorage` del navegador. Para hacer un respaldo o mover el progreso a otro equipo, usa **admin → Exportar todo** (o **Exportar** en cada estudiante) e **Importar respaldo**.

Atajos de la terminal: pulsa `/` para abrirla y `Tab` para autocompletar. Algunos comandos: `/academia`, `/modulo 3`, `/glosario mcp`, `/simulacro en`, `/practica bi`, `/help`.

## Pruebas

```bash
node tests/todo.js
```

Las pruebas comprueban la sintaxis de todos los archivos, el banco (cobertura, una única respuesta correcta y sesgo de longitud), las lecciones y la academia (bilingüismo, quizzes y enlaces), las flashcards, los labs (todos resolubles), los retos de arquitectura y SHA-256.

## Estructura

```
index.html          punto de entrada (scripts con ?v=N para romper caché)
css/                base, app, escenas, lecciones, práctica, academia
js/                 motor: almacén, gamificación, arte, terminal, vistas, examen…
js/content/         contenido: blueprint, lecciones, academia, glosario, banco, labs, flashcards
fonts/              JetBrains Mono (OFL)
tests/              pruebas en Node
netlify.toml        cabeceras de seguridad (CSP estricta) y caché
```

## Despliegue

Netlify publica la carpeta tal cual (`publish = "."`) con una CSP estricta: no hay scripts en línea, `eval` ni CDNs.

---

Proyecto de estudio independiente; no está afiliado a Anthropic. «Claude» es una marca de Anthropic.
