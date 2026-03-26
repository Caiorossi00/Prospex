import json
import os
import pandas as pd
from concurrent.futures import ThreadPoolExecutor, as_completed
from ollama_client import ask_llm

INPUT_FILE = "../crawler/output/output.json"
OUTPUT_JSON = "../output/leads_qualified.json"
OUTPUT_CSV = "../output/leads_qualified.csv"
MAX_WORKERS = 4

def generate_lead_insights(lead: dict) -> dict:
    prompt = f"""
Responda SOMENTE com um objeto JSON plano, sem objetos aninhados, sem texto antes ou depois, sem markdown.
Cada valor deve ser uma string simples.
Perfil:
Nome: {lead.get('title')}
Descrição: {lead.get('snippet')}
Seguidores: {lead.get('followers')}
Formato obrigatório:
{{
  "diagnosis": "string simples aqui",
  "opportunity": "string simples aqui",
  "offer_angle": "string simples aqui"
}}
"""
    response = ask_llm(prompt)
    try:
        clean = response.strip()
        if "```" in clean:
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        clean = clean.strip()
        return json.loads(clean)
    except Exception:
        return {
            "diagnosis": "",
            "opportunity": "",
            "offer_angle": ""
        }

def process_lead(lead: dict) -> dict:
    print(f"Analisando: {lead.get('username')}")
    insights = generate_lead_insights(lead)
    return {
        "username": lead.get("username"),
        "followers": lead.get("followers"),
        "query_origin": lead.get("query_origin"),
        "diagnosis": insights.get("diagnosis"),
        "opportunity": insights.get("opportunity"),
        "offer_angle": insights.get("offer_angle"),
    }

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Arquivo do scraper não encontrado: {INPUT_FILE}")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        leads = json.load(f)

    enhanced_leads = [None] * len(leads)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_lead, lead): i for i, lead in enumerate(leads)}
        for future in as_completed(futures):
            i = futures[future]
            try:
                enhanced_leads[i] = future.result()
            except Exception:
                enhanced_leads[i] = leads[i]

    enhanced_leads = [l for l in enhanced_leads if l is not None]

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(enhanced_leads, f, ensure_ascii=False, indent=2)

    if enhanced_leads:
        df = pd.DataFrame(enhanced_leads)
        df.to_csv(OUTPUT_CSV, index=False)

    print(f"JSON salvo em: {OUTPUT_JSON}")
    print(f"CSV salvo em: {OUTPUT_CSV}")
    print(f"Leads processados: {len(enhanced_leads)}")

if __name__ == "__main__":
    main()