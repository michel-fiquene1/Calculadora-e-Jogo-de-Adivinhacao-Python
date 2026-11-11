# Calculadora e Jogo de Adivinhação — Python & Web

Duas aplicações que começaram no terminal Python e evoluíram para uma experiência web interativa. A interface reúne calculadoras e um jogo de adivinhação em uma única página, com navegação sem recarregamento e suporte a português e inglês.

Os arquivos Python originais estão preservados. A versão web executa a lógica adaptada para **JavaScript** diretamente no navegador, sem backend, banco de dados ou dependências externas de execução.

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| Python | Versões originais dos programas de terminal |
| HTML5 | Estrutura semântica e formulários |
| CSS3 | Identidade visual, responsividade e animações |
| JavaScript | Navegação, traduções e lógica das aplicações |
| Node.js | Prévia local e testes, sem instalação de pacotes |

## Funcionalidades

### Calculadora

- **Dois números:** soma, subtração, multiplicação e divisão, com valores negativos e decimais.
- **Tradicional:** teclado numérico, separador decimal, troca de sinal, limpar, apagar e operações sequenciais.
- Validação de campos vazios e números inválidos; bloqueio de divisão por zero e resultados não finitos.
- Uso por mouse, toque e teclado; estados independentes preservados ao alternar os modos.

A calculadora tradicional executa operações **da esquerda para a direita**: `10 + 5 × 2 = 30`. Trocar o operador antes do segundo número substitui a operação. Repetir `=` reaplica a última operação e seu segundo número: `5 + 2 = 7`, depois `= 9`. Se faltar o segundo número, `=` reutiliza o primeiro: `5 + = 10`.

Depois de um resultado, um dígito inicia outro cálculo e um operador continua a conta. `C` limpa tudo; apagar edita a entrada e, após um resultado, começa em zero. Entradas têm limite de 15 dígitos; resultados usam até 15 algarismos significativos. Valores muito grandes ou pequenos são exibidos em notação científica. Não há avaliação dinâmica de expressões com `eval()`.

### Jogo de Adivinhação

| Dificuldade | Intervalo inclusivo | Tentativas |
| --- | --- | --- |
| Fácil | 1 a 100 | 10 |
| Médio | 1 a 500 | 10 |
| Difícil | 1 a 1000 | 10 |

- Dicas indicando se o palpite está muito alto ou muito baixo.
- Contador, indicador de progresso e feedback visual de vitória ou derrota.
- Entradas inválidas não consomem tentativas; palpites repetidos válidos consomem.
- Acertar na décima tentativa resulta em vitória. Na derrota, o número secreto é revelado.
- Nova partida com seleção de dificuldade.

### Interface

- Início, calculadora e jogo em uma página responsiva para desktop, tablet e celular.
- Prévias interativas dos projetos na abertura.
- Tradução PT-BR/EN, incluindo validações, dicas e resultados; português é o padrão.
- Navegação por teclado, rótulos, foco visível e mensagens acessíveis.
- Animações e microinterações com controle dos efeitos da abertura e suporte a movimento reduzido.
- Cálculos e partidas preservados ao trocar de seção ou idioma. Recarregar a página reinicia o estado; não há armazenamento persistente.

## Executar a aplicação web localmente

Use **Node.js 24 ou superior** para a ferramenta de prévia e os testes. Não é necessário executar `npm install`.

```sh
git clone https://github.com/michel-fiquene1/Calculadora-e-Jogo-de-Adivinhacao-Python.git
cd Calculadora-e-Jogo-de-Adivinhacao-Python
node scripts/serve.mjs
```

Abra **http://127.0.0.1:4173/** no navegador. Para encerrar, pressione `Ctrl+C` no terminal. O servidor atende somente no computador local e disponibiliza os arquivos da aplicação, sem expor a pasta `.git` ou arquivos de manutenção.

Se a porta estiver ocupada, escolha outra. No PowerShell:

```powershell
$env:DUOLAB_PORT = '4174'
node scripts/serve.mjs
```

Nesse caso, acesse **http://127.0.0.1:4174/**. Também é possível usar outro servidor estático. Os módulos JavaScript precisam ser servidos por HTTP; abrir `index.html` diretamente pelo sistema de arquivos não é suficiente.

### Teclado da calculadora tradicional

Dentro do painel tradicional, use números, ponto ou vírgula, `+`, `-`, `*`, `/`, `=` ou Enter. Backspace/Delete apaga; C/Esc limpa; F9 troca o sinal. Enter sobre um botão mantém a ativação nativa desse botão. As abas suportam setas, Home e End.

## Executar os programas Python originais

Com Python 3 instalado, na pasta do projeto:

```sh
python calculadora.chat.py
python "jogo.de.advinhação.py"
```

Os programas utilizam apenas a biblioteca padrão do Python. O nome e o conteúdo dos arquivos foram mantidos como nas versões originais de terminal.

## Organização do projeto

```text
.
├── index.html
├── assets/
│   ├── favicon.svg
│   ├── css/styles.css
│   └── js/
│       ├── app.js             # Navegação e prévias interativas
│       ├── i18n.js            # Traduções e formatação
│       ├── calculadora.js     # Calculadora entre dois números
│       ├── tradicional.js     # Máquina de estados e teclado
│       └── adivinhacao.js     # Regras e interface do jogo
├── scripts/serve.mjs          # Prévia HTTP local
├── scripts/build.mjs          # Pacote web com lista explícita de arquivos
├── tests/rules.test.mjs       # Testes das regras e traduções
├── tests/build.test.mjs       # Isolamento do pacote e política de segurança
├── netlify.toml               # Build e diretório de publicação
├── _headers                   # Cabeçalhos HTTP da aplicação
├── calculadora.chat.py       # Original de terminal
├── jogo.de.advinhação.py      # Original de terminal
└── .gitignore
```

## Qualidade e testes

Execute os testes automatizados com o próprio Node.js:

```sh
node --test tests/rules.test.mjs tests/build.test.mjs
```

Os testes cobrem operações, validações, precisão e encadeamento da calculadora tradicional, limites das dificuldades, tentativas, dicas, vitória na última tentativa, derrota e consistência das traduções. A revisão da interface verifica os fluxos no navegador, teclado, idiomas, responsividade e controle de efeitos. Capturas, relatórios locais, logs e caches ficam fora do versionamento.

O jogo é uma demonstração executada no navegador: seu estado pode ser inspecionado nas ferramentas de desenvolvimento. Não há contas, ranking ou premiação.

## Hospedagem

Aplicação pública: **https://duolab-calculadora-e-jogo.netlify.app/**.

A aplicação continua estática, sem dependências de execução. O build apenas copia os oito recursos web autorizados e o arquivo de cabeçalhos para `dist/`, sem transformar HTML, CSS ou JavaScript:

```sh
node scripts/build.mjs
node scripts/serve.mjs --dist
```

A prévia do pacote usa http://127.0.0.1:4173/ e os mesmos cabeçalhos de segurança. `dist/` é uma pasta gerada e pode ser substituída pelo próximo build; não coloque arquivos de trabalho nela. A lista de publicação está em `scripts/build.mjs`. Novos recursos precisam ser incluídos explicitamente nessa lista e na lista do servidor local.

O projeto Netlify existente acompanha a branch `main` deste repositório. `netlify.toml` define o comando `node scripts/build.mjs`, Node.js 24 e o diretório `dist`. Ao publicar manualmente no mesmo projeto, envie somente `dist/`. Os comandos de build e prévia acima não fazem deploy.

Python, testes, servidor local, documentação, logs e capturas não entram no pacote web. Os programas originais e as ferramentas permanecem no repositório. Não há redirecionamento genérico para `index.html`: a navegação usa fragmentos (`#calculadora`, por exemplo), e arquivos inexistentes devem retornar 404.

### Segurança e integração Netlify

O arquivo `_headers` é copiado para a distribuição e interpretado pelo Netlify. Ele mantém a CSP restritiva da página e acrescenta proteção contra incorporação por outros sites, bloqueio de iframes, `nosniff`, política sem envio de referência e bloqueio de câmera, microfone, geolocalização, pagamentos e USB. A aplicação não utiliza essas capacidades. Não são usados `unsafe-inline` ou `unsafe-eval`; a CSP em HTML permanece como proteção adicional.

O selo **Powered by Netlify** é inserido pela hospedagem, não pelo código do DuoLab. Ele deve ficar desligado no projeto existente em **Project configuration → General → Powered by Netlify badge**. A configuração é por projeto e independente do deploy automático. Sua remoção evita conteúdo promocional e controles invisíveis causados pela incompatibilidade do selo com a CSP. Não use CSS para ocultá-lo nem JavaScript para remover seu iframe. Consulte a [documentação oficial do selo](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/) e dos [cabeçalhos HTTP](https://docs.netlify.com/manage/routing/headers/).

**Pendência da hospedagem:** em 11/11/2026, a API autenticada recusou desligar o selo com a resposta `422 — Removing the Netlify badge is not available on this plan`. O plano atual foi mantido. A configuração de publicação não remove o selo nem elimina essa restrição: a CSP permanece ativa e pode registrar o bloqueio do componente no console. A remoção oficial depende de disponibilidade no plano ou de uma solução oferecida pelo Netlify.

## Autor

Desenvolvido por [Michel Fiquene](https://github.com/michel-fiquene1).
