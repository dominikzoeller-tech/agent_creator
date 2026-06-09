"""
LLM (Large Language Model) Utilities für das AI Agent Builder System.

Zentrale Verwaltung aller LLM-Interaktionen über OpenAI und LangChain.
"""

import json
import logging
from typing import Optional, Dict, Any

try:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
except ImportError as e:
    raise ImportError(
        "Fehlende Abhängigkeit: installiere 'langchain-openai' und 'langchain-core' laut requirements.txt"
    ) from e

from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_TEMPERATURE,
    OPENAI_MAX_TOKENS,
)

logger = logging.getLogger(__name__)


class LLMClient:
    """Wrapper für OpenAI LLM mit zentral verwalteter Konfiguration."""
    
    def __init__(
        self,
        model: str = OPENAI_MODEL,
        temperature: float = OPENAI_TEMPERATURE,
        max_tokens: int = OPENAI_MAX_TOKENS,
    ):
        """
        Initialisiert den LLM Client.
        
        Args:
            model: OpenAI Modell (z.B. "gpt-4", "gpt-3.5-turbo")
            temperature: Kreativität des Models (0-1)
            max_tokens: Maximale Tokens in der Antwort
        """
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.llm: Optional[ChatOpenAI] = None
        self._initialized = False

    def _ensure_llm(self) -> None:
        """Stellt sicher, dass der LangChain-Client initialisiert ist."""
        if self._initialized:
            return

        if not OPENAI_API_KEY or OPENAI_API_KEY.strip() == "DEIN_API_KEY_HIER":
            raise RuntimeError(
                "OPENAI_API_KEY ist nicht gültig. Bitte setze einen echten OpenAI API-Key in .env oder als Umgebungsvariable."
            )

        self.llm = ChatOpenAI(
            api_key=OPENAI_API_KEY,
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        self._initialized = True

    def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        parse_json: bool = False,
    ) -> str:
        """
        Generiert Text basierend auf einem Prompt.
        
        Args:
            prompt: Hauptprompt für das LLM
            system_prompt: Optionaler System-Kontext
            parse_json: Wenn True, versuche JSON aus der Antwort zu parsen
        
        Returns:
            Generierter Text oder JSON-String
        """
        messages = []
        
        # Füge System-Prompt hinzu, falls vorhanden
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        
        # Füge Benutzer-Prompt hinzu
        messages.append(HumanMessage(content=prompt))
        
        self._ensure_llm()
        assert self.llm is not None
        
        # Rufe LLM auf
        response = self.llm.invoke(messages)
        
        # Extrahiere Text
        response_text = response.content.strip()
        
        # Versuche JSON zu parsen, falls angefordert
        if parse_json:
            try:
                # Versuche direkt zu parsen
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Versuche JSON aus Markdown-Codeblock zu extrahieren
                try:
                    json_match = response_text.find("{")
                    json_end = response_text.rfind("}") + 1
                    if json_match != -1 and json_end > json_match:
                        json_str = response_text[json_match:json_end]
                        return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
                
                # Fallback: Rückgabe des Rohtexts
                return response_text
        
        return response_text
    
    def batch_generate(
        self,
        prompts: list[str],
        system_prompt: Optional[str] = None,
    ) -> list[str]:
        """
        Generiert Text für mehrere Prompts sequenziell.
        
        Args:
            prompts: Liste von Prompts
            system_prompt: Optionaler System-Kontext für alle Prompts
        
        Returns:
            Liste von generierten Texten
        """
        results = []
        for prompt in prompts:
            result = self.generate_text(prompt, system_prompt)
            results.append(result)
        return results
    
    def get_config(self) -> Dict[str, Any]:
        """Gibt die aktuelle LLM-Konfiguration zurück."""
        return {
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }


# Globale LLM-Instanz (Singleton Pattern)
_llm_instance: Optional[LLMClient] = None


def get_llm_client() -> LLMClient:
    """
    Gibt die globale LLM-Client-Instanz zurück (Singleton).
    
    Returns:
        LLMClient Instanz
    """
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = LLMClient()
    return _llm_instance


def reset_llm_client() -> None:
    """Setzt die globale LLM-Client-Instanz zurück."""
    global _llm_instance
    _llm_instance = None


# Vordefinierte System-Prompts für verschiedene Agenten
SYSTEM_PROMPTS = {
    "planner": """Du bist ein erfahrener Softwarearchitekt und Agent-Designer.
Deine Aufgabe ist es, detaillierte Pläne für neue Agenten zu erstellen.
Du analysierst die Anforderungen sorgfältig und erstellst einen strukturierten Plan mit klaren Schritten.
Antworte IMMER mit strukturiertem JSON.""",
    
    "coder": """Du bist ein erstklassiger Python-Entwickler mit Expertise in modernen Python-Patterns.
Deine Aufgabe ist es, sauberen, wartbaren und gut dokumentierten Code zu schreiben.
Schreibe professionellen Code mit Docstrings und Kommentaren.
Nutze Best Practices und aktuelle Python-Standards.""",
    
    "critic": """Du bist ein erfahrener Code-Reviewer mit hohen Standards.
Deine Aufgabe ist es, generierten Code kritisch zu analysieren.
Überprüfe auf Qualität, Sicherheit, Performance und Wartbarkeit.
Gebe konstruktives Feedback mit konkreten Verbesserungsvorschlägen.
Antworte IMMER mit strukturiertem JSON.""",
    
    "refiner": """Du bist ein Experte darin, Code zu verbessern und zu optimieren.
Basierend auf Kritik und Feedback, verbesserst du Code iterativ.
Du behältst die Originalfunktionalität, während du Probleme behebst und den Code optimierst.
Schreibe verbesserten Code mit allen Verbesserungen eingebaut.""",
}


def get_system_prompt(agent_type: str) -> str:
    """
    Gibt den System-Prompt für einen Agent-Typ zurück.
    
    Args:
        agent_type: Typ des Agenten (planner, coder, critic, refiner)
    
    Returns:
        System-Prompt String
    """
    return SYSTEM_PROMPTS.get(agent_type, "")
