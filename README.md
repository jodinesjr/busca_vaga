# Buscador de Vagas

Uma aplicação web para buscar vagas de emprego de uma empresa específica no Google Jobs e LinkedIn.

## Funcionalidades

- Busca de vagas a partir da URL do site da empresa
- Scraping em tempo real de vagas no Google Jobs e LinkedIn
- Filtro de resultados por fonte
- Interface responsiva e amigável
- Visualização detalhada das informações da vaga

## Como usar

1. Insira a URL do site da empresa no campo de busca
2. Clique em "Buscar Vagas"
3. Veja os resultados das vagas disponíveis em tempo real
4. Use os filtros para refinar os resultados por fonte
5. Clique em "Ver Vaga" para acessar a página original da vaga

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome
- API de proxy (AllOrigins) para contornar restrições de CORS

## Estrutura do projeto

```
busca_vaga/
├── assets/
│   ├── css/
│   │   ├── loader.css
│   │   └── styles.css
│   └── js/
│       ├── job-scraper.js
│       ├── loader.js
│       ├── main.js
│       └── sidebar.js
├── index.html
└── README.md
```

## Notas de implementação

Esta aplicação gera links diretos para buscar vagas no Google Jobs e realiza scraping em tempo real das vagas disponíveis no LinkedIn.

### Google Jobs

Para o Google Jobs, a aplicação gera URLs no formato exato do exemplo fornecido, usando o nome da empresa seguido de "Vagas":
```
https://www.google.com/search?q=NOME_DA_EMPRESA+Vagas&oq=NOME_DA_EMPRESA+Vagas&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIKCAEQABiABBiiBDIHCAIQABjvBTIKCAMQABiABBiiBDIKCAQQABiABBiiBDIHCAUQABjvBdIBCDM1MjdqMGo3qAIIsAIB8QUaGziIae2Haw&sourceid=chrome&ie=UTF-8&jbr=sep:0&udm=8
```

A aplicação extrai o nome da empresa da URL fornecida pelo usuário e o utiliza para construir a URL de busca no Google Jobs. O nome da empresa é extraído da parte entre o protocolo (http:// ou https://) e o primeiro ponto do domínio. Quaisquer pontos (.) ou hífens (-) no nome da empresa são substituídos por espaços, e a primeira letra de cada palavra é capitalizada.

A aplicação gera um único link destacado para o Google Jobs, apresentando-o como uma "Lista de Vagas Gerada" e não como uma vaga individual. O card exibe a quantidade estimada de vagas disponíveis na lista e recebe um destaque visual para chamar a atenção do usuário.

### LinkedIn

Para o LinkedIn, a aplicação gera URLs no formato:
```
https://www.linkedin.com/jobs/search/?keywords=NOME_DA_EMPRESA&location=Brazil
```

A busca é restrita ao Brasil para garantir resultados mais relevantes. A aplicação gera duas opções de busca:

1. Com localização "Brazil" (em inglês)
2. Com localização "Brasil" (em português)

O scraping é realizado diretamente no navegador do usuário, utilizando o DOMParser para analisar o HTML retornado. Para contornar as restrições de CORS, utilizamos o serviço AllOrigins como proxy para as requisições.

## Como executar localmente

Para executar a aplicação localmente, você pode usar qualquer servidor web simples. Por exemplo:

```bash
# Usando Python 3
python3 -m http.server 8000

# Usando Node.js (com http-server instalado)
npx http-server
```

Depois, acesse `http://localhost:8000` no seu navegador.
