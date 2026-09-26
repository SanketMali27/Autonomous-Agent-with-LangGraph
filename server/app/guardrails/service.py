import os

from dotenv import load_dotenv
from nemoguardrails import LLMRails, RailsConfig
from nemoguardrails.rails.llm.options import RailType


class GuardrailService:

    def __init__(self):
        load_dotenv()

        groq_api_key = os.getenv("GROQ_API_KEY")

        if not groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not set")

        os.environ["OPENAI_API_KEY"] = groq_api_key

        config = RailsConfig.from_path("app/guardrails")

        self.rails = LLMRails(config)

    async def check_input(self, message: str):
        return await self.rails.check_async(
            [
                {
                    "role": "user",
                    "content": message,
                }
            ],
            rail_types=[RailType.INPUT],
        )

    async def check_output(self, message: str):
        return await self.rails.check_async(
            [
                {
                    "role": "assistant",
                    "content": message,
                }
            ],
            rail_types=[RailType.OUTPUT],
        )