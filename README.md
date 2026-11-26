# EletroLabz

O EletroLabz é um laboratório virtual de eletrotécnica e automação industrial desenvolvido por **Murilo Henrique** e **Eryck Rocha Santo**, alunos do **terceiro ano do curso de Eletrotécnica do Instituto Federal de Alagoas (IFAL), Campus Maceió**.

Criamos o projeto para facilitar o estudo da eletrotécnica e demonstrar, no navegador, como os conceitos vistos em sala aparecem nos equipamentos industriais. Uma fórmula ganha outro sentido quando podemos mudar um valor e observar a consequência: ao reduzir a rotação de uma bomba, por exemplo, o tanque enche mais devagar e a curva de nível fica menos inclinada.

## Como aprender com os modelos

Cada demonstração apresenta o princípio de funcionamento do equipamento, comandos para experimentar e uma curiosidade sobre sua aplicação. Para estudar por conta própria ou demonstrar um conceito em aula, comece com uma pergunta, faça uma previsão e compare o resultado com o que aparece na tela.

| Pergunta para investigar | Experimento |
| --- | --- |
| O que acontece com um motor de quatro polos quando a frequência cai de 60 para 30 Hz? | Ajuste o inversor, observe o rotor e confira no gráfico a queda da velocidade síncrona de 1.800 para 900 rpm. |
| Como a esteira separa uma peça metálica? | Ligue a triagem e acompanhe a mesma peça no desenho da máquina e no diagrama Ladder. Observe quando o sensor detecta o metal, a correia para e a garra entra em ação. |
| Como o CLP representa um tanque pela metade? | Ajuste o nível para 100 cm no tanque de 200 cm. Compare o desenho com a curva do transmissor e confira o sinal de 12 mA, ponto médio da faixa de 4 a 20 mA. |
| Por que um motor continua ligado depois que soltamos o botão de partida? | Acione a partida direta e localize o contato auxiliar de selo no diagrama. Depois, atue o relé térmico, rearme e observe qual comando é necessário para voltar a ligar o motor. |

## Sobre a implementação

O laboratório foi construído com **HTML, CSS e JavaScript**. Os simuladores rodam no navegador, com temas claro e escuro e controles adaptados a computador e celular. A página inicial oferece experiências rápidas. Na área de Educação, cada modelo tem uma demonstração dedicada para explorar seus controles, gráficos e diagramas com mais detalhe.

## Como executar

Baixe ou clone este repositório e abra [public/index.html](public/index.html) no navegador. Para usar as contas e exportações, inicie o servidor local com Python 3.11 ou superior, execute na raiz do repositório:

```sh
python servidor.py
```

Abra [localhost:8000](http://localhost:8000) para acessar a página inicial.

## O que explorar

- [Página inicial](public/index.html) — carrossel com triagem de materiais, EletroSnake, transformador, harmônicas, partida direta e desafio de Ohm.
- [Seleção de módulos](public/eletrotec.html) — acesso às áreas de educação, ferramentas profissionais e documentação.
- [Modelos interativos](public/modelos.html) — ajuste a frequência de um inversor, acompanhe o enchimento de um tanque e observe a lógica Ladder de uma linha de triagem.
- [Integração Claude e Revit](public/ia.html) — tutorial para configurar o MCP do pyRevit e testar a leitura do documento ativo.

## Organização

```text
README.md
public/
├── index.html       Página inicial
├── eletrotec.html   Seleção de módulos
├── modelos.html     Demonstrações industriais
├── ia.html          Tutorial de integração
├── apps/            Aplicações, incluindo o simulador Ladder
└── assets/          Estilos, scripts, fontes, ícones e dados dos módulos
```

Os demais arquivos HTML de `public/` correspondem aos módulos individuais. Para hospedar somente os módulos estáticos, use `public/` como diretório de publicação e preserve a estrutura interna para que os links e recursos sejam carregados corretamente.


## Contas e exportações licenciadas

Abra Documentação para criar uma conta ou sair. A exportação de memoriais DOCX e relatórios PDF prediais exige sessão ativa. Os arquivos incluem nome e CPF completos em cada página. O cadastro valida os dígitos verificadores do CPF; o nome é autodeclarado. Não há consulta de titularidade nem coleta de data de nascimento.

Para publicar com contas, sirva a aplicação WSGI `servidor:application` na raiz do domínio, atrás de HTTPS. Configure `ELETROLABZ_HTTPS=1` ao terminar TLS no proxy e `ELETROLABZ_DB` para o caminho de um banco SQLite persistente fora da pasta pública, com acesso restrito ao serviço. O servidor iniciado por `python servidor.py` atende desenvolvimento local. GitHub Pages serve apenas arquivos estáticos. O banco contém dados pessoais e deve ficar fora do repositório e dos pacotes distribuídos.

A senha é protegida com scrypt e a sessão expira após oito horas. A marca identifica a conta usada na exportação e pode ser removida por edição do documento. Como os geradores rodam no navegador, a ferramenta serve para atribuição de autoria e uso pedagógico, sem garantia de bloqueio contra adulteração.

## Publicar na Vercel com PostgreSQL (Neon)

1. Envie o conteúdo da pasta EletroLabz ao GitHub. Na Vercel, importe o repositório. Em **Root Directory**, selecione a pasta que contém `vercel.json`, `api/`, `servidor.py`, `requirements.txt` e `public/`. Use o preset **Other** e deixe o comando de build padrão. O diretório de saída está definido como `public`; as quatro funções Python ficam em `api/` na raiz.
2. Na área **Storage** do projeto, escolha **Create Database → Neon Postgres**. Escolha a região e o plano, crie o banco e conecte-o ao projeto. Confira em **Settings → Environment Variables** se a variável **DATABASE_URL** está disponível em **Production**. Se criou o banco diretamente no Neon, copie a URL de conexão **pooled** do painel **Connect** para essa variável, incluindo as opções de TLS.
3. No console do Neon, abra **SQL Editor** no banco e na branch correspondentes à URL de produção. Cole e execute todo o conteúdo de [schema.sql](schema.sql). O script cria as tabelas de contas, sessões e controle de tentativas e pode ser executado novamente. Uma branch separada para Preview também precisa do esquema.
4. Faça **Redeploy** após configurar a variável. Abra `https://SEU-DOMINIO/api/session` em uma janela privada. Uma resposta **401** com `{}` indica que o banco respondeu e não há sessão. **503** indica que você deve conferir a variável, a conexão e as tabelas. **404** indica que você deve conferir se o commit publicado contém api/session.py e vercel.json na raiz configurada.
5. Acesse **Documentação**, use o botão abaixo dos cartões, cadastre uma conta e teste sair e entrar novamente. As credenciais do banco ficam somente nas variáveis de ambiente da Vercel. O banco SQLite de desenvolvimento é independente do PostgreSQL de produção.

[Integração Neon com a Vercel](https://neon.com/docs/guides/vercel-managed-integration) · [Aplicações Python na Vercel](https://vercel.com/docs/functions/runtimes/python)
