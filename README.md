## Site “Clarinha ✦”

Uma **página única** com **céu animado**, estrelas e **estrelas cadentes** — com o nome **Clarinha** em evidência.

### Como rodar

Você pode abrir direto o arquivo `index.html` no navegador, ou (recomendado) usar um servidor local:

```bash
cd /Users/danilo.assuncao/dev/dan/site-brinks
python3 -m http.server 5173
```

Depois abra no navegador:

- `http://localhost:5173`

### Publicar no GitHub Pages (github.io)

Esse projeto é **estático** (HTML/CSS/JS), que é exatamente o que o GitHub Pages serve.

- **Opção A (repositório normal)**: publique a branch `main` pela pasta raiz (`/`)
- **Opção B (seu github.io)**: crie um repositório `SEUUSUARIO.github.io` e coloque esses arquivos na raiz

No GitHub:

- Vá em `Settings` → `Pages`
- Em **Build and deployment**, selecione:
  - **Source**: `Deploy from a branch`
  - **Branch**: `main` / `root (/)`

O arquivo `.nojekyll` já está incluído para evitar comportamento do Jekyll com nomes/paths.

### Como usar

- Clique em **Fazer um pedido** para revelar a mensagem.
- Use **Modo calmo** para reduzir as estrelas cadentes (e alternar de volta quando quiser).

### Observações

- O site respeita **prefers-reduced-motion** (se o usuário tiver “reduzir movimento” ativado no sistema).


