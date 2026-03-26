import requests

def ask_llm(prompt: str) -> str:
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "phi3:mini",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 600,
            "temperature": 0.3,
            "top_p": 0.9
        }
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()
    except Exception as e:
        print(f"Erro ao chamar Ollama: {e}")
        return ""