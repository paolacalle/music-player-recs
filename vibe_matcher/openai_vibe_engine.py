
from openai import OpenAI
import os, json
from vibe_matcher.config import Config
# handles the prompting and communication with OpenAI's API


class OpenAIVibeEngine:
    """Handles vibe extraction using OpenAI's API."""
    
    def __init__(self, openai_api_key: str = None, model ="gpt-3.5-turbo"):
        self.client = OpenAI(api_key= openai_api_key or Config.OPENAI_API_KEY)
        self.model = model
        
    def prompt_to_vibe(self, prompt: str) -> str:
        """Sends a prompt to OpenAI and retrieves the vibe description."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a music vibe extractor."}, # system prompt
                {"role": "user", "content": prompt} # user prompt
            ],
            max_tokens=50, # limit the response length
            temperature=0.7 # adjust the creativity of the response
        )
        
        vibe_description = response.choices[0].message.content.strip()
        return vibe_description
    
def main():
    engine = OpenAIVibeEngine()
    prompt = "Describe the vibe of a relaxing acoustic guitar song."
    vibe = engine.prompt_to_vibe(prompt)
    print(f"Extracted Vibe: {vibe}")
    
if __name__ == "__main__":
    main()