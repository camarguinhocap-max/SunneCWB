"""
Atualiza em todo o site a lista de estados atendidos pela energia por assinatura.

Como usar:
  1. Edite estados.json (acrescente ou remova estados).
  2. Rode:  python atualizar-estados.py --simular   (mostra o que vai mudar, sem gravar)
  3. Rode:  python atualizar-estados.py            (grava as mudanças)

O que o script atualiza (só onde a lista bate com a lista antiga do site):
  - o número: "18 estados" -> "20 estados", por exemplo;
  - listas de siglas: "AL, BA, CE, ..., SC, SP" ou "..., SC e SP";
  - listas de nomes: "Alagoas, Bahia, ..., Santa Catarina e São Paulo";
  - "areaServed" dos dados estruturados (JSON-LD);
  - a lista ATENDIDOS do quiz (quiz.html).

A lista antiga é lida da tag <meta name="coverage"> do index.html.
Listas que não batem com a lista antiga (por exemplo, a lista de todos os
estados do cadastro ou o mapa da AlugSol) não são tocadas.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
IGNORAR = {"1.html"}
IGNORAR_PREFIXO = ("quiz-backup",)

TODOS = {
    "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas", "BA": "Bahia",
    "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo", "GO": "Goiás",
    "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul", "MG": "Minas Gerais",
    "PA": "Pará", "PB": "Paraíba", "PR": "Paraná", "PE": "Pernambuco", "PI": "Piauí",
    "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte", "RS": "Rio Grande do Sul",
    "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina", "SP": "São Paulo",
    "SE": "Sergipe", "TO": "Tocantins",
}
NOME_PARA_SIGLA = {v: k for k, v in TODOS.items()}


def ler(p):
    b = p.read_bytes().decode("utf-8")
    crlf = "\r\n" in b
    return b.replace("\r\n", "\n"), crlf


def gravar(p, texto, crlf):
    if crlf:
        texto = texto.replace("\n", "\r\n")
    p.write_bytes(texto.encode("utf-8"))


def lista_texto(itens, com_e):
    if com_e and len(itens) > 1:
        return ", ".join(itens[:-1]) + " e " + itens[-1]
    return ", ".join(itens)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    simular = "--simular" in sys.argv
    cfg = json.loads((RAIZ / "estados.json").read_text(encoding="utf-8"))
    novos = [e["sigla"].upper() for e in cfg["estados"]]
    for s in novos:
        if s not in TODOS:
            sys.exit(f"Sigla desconhecida em estados.json: {s}")
    novos = sorted(set(novos))
    nomes_novos = [TODOS[s] for s in novos]

    idx, _ = ler(RAIZ / "index.html")
    m = re.search(r'<meta name="coverage" content="([^"]+)"', idx)
    if not m:
        sys.exit('Não achei <meta name="coverage"> no index.html para saber a lista antiga.')
    antigos = sorted(set(x.strip() for x in m.group(1).split(",")))
    set_ant = set(antigos)
    set_nomes_ant = {TODOS[s] for s in antigos}
    n_ant, n_novo = len(antigos), len(novos)

    if set_ant == set(novos):
        print(f"Nada a fazer: o site já está com estes {n_novo} estados.")
        return

    print(f"Lista antiga: {n_ant} estados -> nova: {n_novo} estados")
    print("  entram:", ", ".join(sorted(set(novos) - set_ant)) or "-")
    print("  saem:  ", ", ".join(sorted(set_ant - set(novos))) or "-")
    print()

    uf = r"(?:" + "|".join(TODOS) + r")"
    re_siglas = re.compile(rf"\b{uf}(?:,\s+{uf})+(?:,?\s+e\s+{uf})?\b")
    nome = r"(?:" + "|".join(sorted(map(re.escape, TODOS.values()), key=len, reverse=True)) + r")"
    re_nomes = re.compile(rf"{nome}(?:,\s+{nome})+(?:,?\s+e\s+{nome})?")
    re_area = re.compile(r'"areaServed":\s*\[[^\]]*\]')
    re_numero = re.compile(rf"\b{n_ant} estados\b")
    re_quiz = re.compile(r"var ATENDIDOS = \[[^\]]*\];")

    def troca_siglas(mt):
        txt = mt.group(0)
        achadas = re.findall(uf, txt)
        if set(achadas) != set_ant or len(achadas) != n_ant:
            return txt
        return lista_texto(novos, re.search(r"\se\s", txt) is not None)

    def troca_nomes(mt):
        txt = mt.group(0)
        partes = [p.strip() for p in re.split(r",\s+|\s+e\s+", txt)]
        if set(partes) != set_nomes_ant or len(partes) != n_ant:
            return txt
        return lista_texto(nomes_novos, re.search(r"\se\s", txt) is not None)

    def troca_area(mt):
        txt = mt.group(0)
        nomes = re.findall(r'"name":\s*"([^"]+)"', txt) if '"@type"' in txt else re.findall(r'"([^"]+)"', txt.split("[", 1)[1])
        if set(nomes) != set_nomes_ant:
            return txt
        if '"@type"' in txt:
            corpo = ", ".join(f'{{"@type": "State", "name": "{n}"}}' for n in nomes_novos)
        else:
            corpo = ", ".join(f'"{n}"' for n in nomes_novos)
        return f'"areaServed": [{corpo}]'

    arquivos = sorted(RAIZ.glob("*.html")) + [RAIZ / "llms.txt"]
    total = 0
    for p in arquivos:
        if p.name in IGNORAR or p.name.startswith(IGNORAR_PREFIXO) or not p.exists():
            continue
        texto, crlf = ler(p)
        novo = texto
        cont = {}

        def aplica(rx, fn, chave):
            nonlocal novo
            antes = novo
            novo = rx.sub(fn, novo)
            if novo != antes:
                cont[chave] = sum(1 for a, b in zip(rx.findall(antes), rx.findall(novo)) if a != b) or 1

        aplica(re_area, troca_area, "areaServed")
        aplica(re_nomes, troca_nomes, "nomes")
        aplica(re_siglas, troca_siglas, "siglas")
        n_num = len(re_numero.findall(novo))
        if n_num:
            novo = re_numero.sub(f"{n_novo} estados", novo)
            cont["número"] = n_num
        if p.name == "quiz.html":
            q = f'var ATENDIDOS = [{",".join(chr(34) + s + chr(34) for s in novos)}];'
            if re_quiz.search(novo) and re_quiz.search(novo).group(0) != q:
                novo = re_quiz.sub(q, novo)
                cont["quiz"] = 1
            dist = re.search(r"var DIST = \{(.*?)\n  \};", novo, re.S)
            if dist:
                faltam = [s for s in novos if not re.search(rf"\b{s}:\[", dist.group(1))]
                if faltam:
                    print(f"  ATENÇÃO quiz.html: sem distribuidoras cadastradas para {', '.join(faltam)} (editar var DIST).")

        if novo != texto:
            total += 1
            print(f"{p.name}: " + ", ".join(f"{k} {v}" for k, v in cont.items()))
            if not simular:
                gravar(p, novo, crlf)

    print()
    print(f"{total} arquivo(s) {'seriam alterados' if simular else 'alterados'}.")
    if not simular:
        print("Confira com: git diff   (e depois publique).")


if __name__ == "__main__":
    main()
