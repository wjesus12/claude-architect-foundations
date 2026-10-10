"""Reemplaza el texto (en, es) de opciones concretas de preguntas del banco, sin tocar su explicación.
Uso: python3 tests/tools/patch_options.py <archivo_parches.json>
Formato: { "s1q04": { "1": ["nuevo EN", "nuevo ES"], ... }, ... }"""
import json, re, sys, os

def js_str(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"

def read_literal(src, i):
    assert src[i] == "'", src[i:i+30]
    j = i + 1
    while True:
        if src[j] == "\\": j += 2; continue
        if src[j] == "'": return j + 1
        j += 1

def apply(patches):
    root = os.path.join(os.path.dirname(__file__), "..", "..", "js", "content")
    by_file = {}
    for qid, opts in patches.items():
        if qid.startswith("L"):
            lid = qid[1:]
            f = "lessons-intro.js" if lid in ("0", "en") else f"lessons-d{lid[0]}.js"
        elif qid.startswith("lab"):
            f = "labs.js"
        else:
            f = f"bank-s{qid[1]}.js"
        by_file.setdefault(f, {})[qid] = opts
    total = 0
    for fname, qs in by_file.items():
        path = os.path.join(root, fname)
        src = open(path, encoding="utf8").read()
        for qid, opts in qs.items():
            if qid.startswith("L") or qid.startswith("lab"):
                key = qid[1:] if qid.startswith("L") else qid
                start = src.index(f"      id: '{key}'")
                nxt = src.find("      id: '", start + 5)
                fn = r"\bopt\('"
            else:
                start = src.index(f"Q('{qid}'")
                nxt = src.find("Q('s", start + 5)
                fn = r"\bo\('"
            end = nxt if nxt != -1 else len(src)
            block = src[start:end]
            pos = [m.end() - 1 for m in re.finditer(fn, block)]
            def flat(k):  # "q.o" para lecciones (4 opciones por pregunta), "o" en el resto
                if "." in k: qi, oi = k.split("."); return int(qi) * 4 + int(oi)
                return int(k)
            # aplicar de atrás hacia delante para no desplazar índices
            for k in sorted(opts, key=flat, reverse=True):
                en, es = opts[k]
                idx = flat(k)
                a = pos[idx]
                a_end = read_literal(block, a)
                b = block.index("'", a_end)
                b_end = read_literal(block, b)
                block = block[:a] + js_str(en) + ", " + js_str(es) + block[b_end:]
                total += 1
            src = src[:start] + block + src[end:]
        open(path, "w", encoding="utf8").write(src)
    print(f"opciones reemplazadas: {total}")

apply(json.load(open(sys.argv[1], encoding="utf8")))
