import json
import os
import pandas as pd
from ollama_client import ask_llm  

INPUT_FILE = "../scraper/output.json"
OUTPUT_JSON = "../output/leads_qualified.json"
OUTPUT_CSV = "../output/leads_qualified.csv"

def is_instagram_link(link: str) -> bool:
    """Verifica se é link do Instagram"""
    return "instagram.com" in link.lower()

def has_website(lead: dict) -> bool:
    """Verifica se o lead parece ter site próprio"""
    snippet = lead.get("snippet", "").lower()
    if not is_instagram_link(lead.get("link", "")):
        return True
    if any(x in snippet for x in ["www.", ".com", ".br"]):
        return True
    return False

def generate_potential_text(lead: dict) -> str:
    """Usa o LLM para criar uma frase de potencial do cliente"""
    prompt = f"""
Analise este perfil de Instagram:

Nome: {lead.get('title')}
Descrição: {lead.get('snippet')}

Escreva UMA frase curta descrevendo o potencial desse cliente para contratar serviços como site, landing page ou automação.
Responda apenas a frase.
"""
    response = ask_llm(prompt)
    return response.strip() if response else ""

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Arquivo do scraper não encontrado: {INPUT_FILE}")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        leads = json.load(f)

    qualified = []
    for lead in leads:
        if not is_instagram_link(lead.get("link", "")):
            continue
        if has_website(lead):
            continue

        lead["potential_text"] = generate_potential_text(lead)
        qualified.append(lead)

    print(f"Leads qualificados: {len(qualified)}")

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(qualified, f, ensure_ascii=False, indent=2)

    if qualified:
        df = pd.DataFrame(qualified)
        df.to_csv(OUTPUT_CSV, index=False)
        print(f"CSV salvo em: {OUTPUT_CSV}")

    print(f"JSON salvo em: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()

