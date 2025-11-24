# Scraper de Leads via Google + Instagram  
**Gerador automático de potenciais clientes usando Playwright + Chrome real**

Este projeto é uma ferramenta para encontrar potenciais clientes no Instagram a partir de buscas do Google. Ele automatiza a navegação como se fosse um usuário real, coleta resultados das páginas do Google e extrai perfis do Instagram relacionados à pesquisa desejada.

---

## O que esta aplicação faz?

- Realiza uma busca no Google como um usuário humano real (Chrome autêntico, sem detecção de automação).  
- Percorre automaticamente várias páginas da SERP (resultados de busca).  
- Identifica resultados que levam ao Instagram.  
- Extrai:
  - **Nome do perfil**
  - **@username do Instagram**
  - **Link direto**
  - **Trecho da descrição**
- Gera automaticamente um arquivo `.json` e `.csv` com todos os leads encontrados.

---

## Para que serve?

Ideal para quem quer **encontrar leads rapidamente**, por exemplo:

- Psicólogas/os  
- Nutricionistas  
- Clínicas  
- Profissionais liberais em geral  
- Negócios locais  
- Lojas pequenas  
- Criadores de conteúdo  

Basta ajustar a query — por exemplo:  
- `psicóloga pelotas instagram`  
- `nutricionista ribeirão preto instagram`  
- `clínica estética porto alegre instagram`  
- `dentista salvador instagram`  

A ferramenta automaticamente coleta todos os perfis relacionados.

---

## Query totalmente modular

A busca é totalmente customizável:  
**Você escolhe qualquer termo**, e o scraper encontra potenciais clientes daquela área automaticamente.  

---

## Comportamento 100% humano

A ferramenta usa:

- Chrome real  
- Perfil persistente (cookies salvos)  
- User-Agent humano  
- Pequenos delays aleatórios  
- Remoção do `navigator.webdriver`  

Isso reduz drasticamente risco de captcha ou bloqueio.

---

## Saída

O scraper gera dois arquivos:

- **output.json** — dados completos estruturados  
- **output.csv** — tabela pronta para importar em:
  - Excel
  - Google Sheets
  - CRMs
  - Apps de cold outreach

---

## Por que isso é útil?

Porque encontrar leads manualmente é lento.

Com esta ferramenta você consegue:

- Mapear dezenas de potenciais clientes em **segundos**  
- Trabalhar com nichos específicos  
- Filtrar apenas perfis que **não têm site**  
- Preparar listas para cold-email, cold-DM ou propostas comerciais

É uma automação ideal para freelancers, webdevs, agências e consultores que precisam descobrir clientes rapidamente.

---
