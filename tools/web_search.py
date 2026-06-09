from typing import Optional
from core.llm import get_llm_client


def simulate_web_search(
    query: str,
    context: Optional[str] = None,
    max_results: int = 5,
) -> str:
    """Simuliere eine Web-Recherche über das vorhandene LLM-System."""
    llm = get_llm_client()

    prompt = f"""
Du bist ein Web-Research-Assistent. Simuliere eine Websuche für die folgende Anfrage.
Verwende die Informationen, um relevante Tools, Bibliotheken, APIs und Lösungsansätze zu identifizieren.

SUCHANFRAGE: {query}
"""

    if context:
        prompt += f"\nKONTEXT: {context}\n"

    prompt += f"""

Gebe eine strukturierte, prägnante Zusammenfassung zurück.
Fokussiere dich auf relevante Technologien, mögliche Bibliotheken und praktische Umsetzungshinweise.
"""

    return llm.generate_text(prompt=prompt, parse_json=False)
