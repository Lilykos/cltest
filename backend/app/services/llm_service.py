from typing import Optional, Dict, Any
import httpx
from openai import OpenAI
from anthropic import Anthropic

from app.config import settings
from app.utils.encryption import decrypt_api_key


class LLMService:
    """Service for interacting with multiple LLM providers."""

    def __init__(self, provider: str, model: str, api_key: Optional[str] = None):
        self.provider = provider.lower()
        self.model = model
        self.api_key = api_key or self._get_default_api_key()

    def _get_default_api_key(self) -> str:
        """Get default API key from settings."""
        if self.provider == "openai":
            return settings.DEFAULT_OPENAI_API_KEY
        elif self.provider == "anthropic":
            return settings.DEFAULT_ANTHROPIC_API_KEY
        elif self.provider == "deepseek":
            return settings.DEFAULT_DEEPSEEK_API_KEY
        return ""

    async def chat(self, messages: list[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        """Send a chat request to the configured LLM provider."""
        if self.provider == "openai":
            return await self._chat_openai(messages, system_prompt)
        elif self.provider == "anthropic":
            return await self._chat_anthropic(messages, system_prompt)
        elif self.provider == "deepseek":
            return await self._chat_deepseek(messages, system_prompt)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    async def _chat_openai(self, messages: list[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        """Chat with OpenAI API."""
        client = OpenAI(api_key=self.api_key)

        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        response = client.chat.completions.create(
            model=self.model,
            messages=formatted_messages,
            temperature=0.7,
        )

        return response.choices[0].message.content

    async def _chat_anthropic(self, messages: list[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        """Chat with Anthropic API."""
        client = Anthropic(api_key=self.api_key)

        response = client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system_prompt or "",
            messages=messages,
        )

        return response.content[0].text

    async def _chat_deepseek(self, messages: list[Dict[str, str]], system_prompt: Optional[str] = None) -> str:
        """Chat with DeepSeek API (OpenAI-compatible)."""
        formatted_messages = []
        if system_prompt:
            formatted_messages.append({"role": "system", "content": system_prompt})
        formatted_messages.extend(messages)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": formatted_messages,
                    "temperature": 0.7,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]


def get_llm_service(provider: str, model: str, encrypted_api_key: Optional[str] = None) -> LLMService:
    """Factory function to create LLM service."""
    api_key = None
    if encrypted_api_key:
        api_key = decrypt_api_key(encrypted_api_key)

    return LLMService(provider=provider, model=model, api_key=api_key)
