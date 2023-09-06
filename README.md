# Easy Transcription

**Easy Transcription** is an interface to [Deepgram's](https://deepgram.com/) voice-to-text service, with Whisper model. The interface provides easy and high-accurcy access to transcribe audio files, with speaker diarisation enabled. You can also quickly mark different speakers and copy the finished transcript to anywhere you want.

## Setup

- Clone the project to your local achine:

  `git@github.com:Techming/ez-transcription.git`

- Make sure that you have [Python ^3.8](https://www.python.org/downloads/release/python-3810/) and [pip](https://pypi.org/project/pip/) installed. To check, run the following command:

```bash
$ python3 --version
Python 3.8.5 # or anything above 3.8.0

$ pip3 --version
pip 20.1.1 from /PATH/TO/YOUR/PYTHON/INTEPRETER/python3.8/site-packages/pip (python 3.8)
```

- Go to [Deepgram](https://console.deepgram.com/signup), register your account, create a new project and an API key.
- Under project root, create a `.env` file and copy & paste your API key with the name `DEEPGRAM_API_KEY`

```bash
echo DEEPGRAM_API_KEY=<PUT-YOUR-API-KEY-HERE> > .env
```

- For Mac users, simply navigate to the project root and run `./setup.sh`

- For Windows users, follow the steps below:

  - First create a python virtual environment under the project room

    ```bash
    python3 -m venv venv
    ```

  - Then activate the virtual environment

    ```bash
    source venv/bin/activate
    ```

  - Finally, run pip install

    ```bash
    pip install -r requirements.txt
    ```

## Usage

- Activate virtual environment under the project root

  ```bash
  source venv/bin/activate
  ```

- Run the command below

  ```bash
  python main.py
  ```

A new browser window should pop up and that's it!

## Options

`main.py` does accept several command line argument as following:

- `--reload`  
  Reload the server when source files change

- `--host TEXT`  
  Host of the app, default is `127.0.0.1`

- `--port INTEGER`  
  Port of the app, default is `8000`

- `--help`  
  Show this message and exit.

## Trouble Shooting

### It takes too long to process the audio file

The typical processing time for this API should be from 12x to 6x of the length of the audio file. For example, it can take from 20s to 40s for a 4 minute audio. Note that Whisper model takes more time to process the transcript, sometimes it can take up to 5 minutes to process a 30 mins audio file. Other factors such as Deepgram traffic and quality of the audio can also contribute to the process time.
