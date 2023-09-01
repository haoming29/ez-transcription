import os
from dotenv import load_dotenv
from deepgram import Deepgram

load_dotenv()
dg_client = Deepgram(os.environ.get("DEEPGRAM_API_KEY"))
