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
├── tests/rules.test.mjs       # Testes das regras e traduções
├── calculadora.chat.py       # Original de terminal
├── jogo.de.advinhação.py      # Original de terminal
└── .gitignore
```

## Qualidade e testes

Execute os testes automatizados com o próprio Node.js:

```sh
node --test tests/rules.test.mjs
```

Os testes cobrem operações, validações, precisão e encadeamento da calculadora tradicional, limites das dificuldades, tentativas, dicas, vitória na última tentativa, derrota e consistência das traduções. A revisão da interface verifica os fluxos no navegador, teclado, idiomas, responsividade e controle de efeitos. Capturas, relatórios locais, logs e caches ficam fora do versionamento.

O jogo é uma demonstração executada no navegador: seu estado pode ser inspecionado nas ferramentas de desenvolvimento. Não há contas, ranking ou premiação.

## Hospedagem

A versão pública da aplicação será disponibilizada futuramente. **A hospedagem ainda não foi configurada**, e não há link de demonstração publicado.

A aplicação é estática, utiliza caminhos relativos e não precisa de build. Os arquivos `index.html` e `assets/` estão preparados para uma futura hospedagem estática; os scripts locais não executam deploy.

## Autor

Desenvolvido por [Michel Fiquene](https://github.com/michel-fiquene1).
