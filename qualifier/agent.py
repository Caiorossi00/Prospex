import json
import os
import pandas as pd
from ollama_client import ask_llm  

INPUT_FILE = "../crawler/output/output.json"
OUTPUT_JSON = "../output/leads_qualified.json"
OUTPUT_CSV = "../output/leads_qualified.csv"

def generate_lead_insights(lead: dict) -> dict:
    """
    Gera análise do perfil do cliente e duas sugestões de abordagem
    focadas em oferta de serviços digitais.
    """
    prompt = f"""
Você é um agente de prospecção digital. Seu objetivo é analisar perfis de Instagram
para **oferecer serviços digitais** como site, landing page ou automação, de forma objetiva,
profissional e amigável. Não invente serviços que o cliente não oferece e evite comentários sobre posts ou hashtags.

Analise este perfil:

Nome: {lead.get('title')}
Descrição do perfil: {lead.get('snippet')}

1. Escreva um resumo conciso do perfil (profile_analysis) destacando o potencial do cliente
   para contratar serviços digitais. Em português.
2. Crie DUAS formas curtas e realistas de abordagem (approach_1 e approach_2), em português,
   para oferecer serviços digitais, com tom natural, amigável e direto.

Responda **somente** em JSON neste formato:
{{
  "profile_analysis": "...",
  "approach_1": "...",
  "approach_2": "..."
}}

Exemplos de abordagem para referência:
- approach_1: "Olá! Notei que seu negócio não possui um site. Podemos criar uma página simples para atrair mais clientes. Quer conversar sobre isso?"
- approach_2: "Oi! Vi seu perfil e acredito que uma landing page poderia facilitar agendamentos e aumentar vendas. Posso te mostrar como funciona."
"""
    response = ask_llm(prompt)
    try:
        return json.loads(response)
    except Exception as e:
        print(f"Erro ao processar lead '{lead.get('title')}': {e}")
        return {"profile_analysis": "", "approach_1": "", "approach_2": ""}

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Arquivo do scraper não encontrado: {INPUT_FILE}")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        leads = json.load(f)

    enhanced_leads = []
    for lead in leads:
        print(f"Analisando: {lead.get('title')}")
        insights = generate_lead_insights(lead)
        lead.update(insights)
        enhanced_leads.append(lead)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(enhanced_leads, f, ensure_ascii=False, indent=2)

    if enhanced_leads:
        df = pd.DataFrame(enhanced_leads)
        df.to_csv(OUTPUT_CSV, index=False)
        print(f"CSV salvo em: {OUTPUT_CSV}")

    print(f"JSON salvo em: {OUTPUT_JSON}")
    print(f"Leads processados: {len(enhanced_leads)}")

if __name__ == "__main__":
    main()
