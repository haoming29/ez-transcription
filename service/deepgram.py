import os
from dotenv import load_dotenv
from deepgram import Deepgram

load_dotenv()
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY")
if DEEPGRAM_API_KEY is None:
    raise Exception("You need to set your Deepgram API Key as environment variable before running the project.")
dg_client = Deepgram(DEEPGRAM_API_KEY)
