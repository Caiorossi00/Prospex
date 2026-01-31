import requests

def ask_llm(prompt: str) -> str:
    """
    Envia um prompt para o modelo Mistral rodando localmente via Ollama.
    Retorna a resposta do LLM.
    """
    url = "http://localhost:11434/api/generate"  

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()
    except Exception as e:
        print(f"Erro ao chamar Ollama: {e}")
        return ""
