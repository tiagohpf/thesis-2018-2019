import os

from flask import Flask, request

from audio_transformer import AudioTransformer
from dialogue import Dialogue
from files_aggregator import FilesAggregator
from pyAudioAnalysis import audioAnalysis as audioAnalysis
from recognizer import Recognizer
from splitter import Splitter
from transcription_requests import TranscriptionRequest

app = Flask(__name__)


@app.route('/transcript/<path:subpath>')
def transcription(subpath):
    volume = 0
    speed = 1.0
    n_speakers = 2
    dialogues = []
    if request.args.get('volume'):
        volume = int(request.args.get('volume'))
    if request.args.get('speed'):
        speed = float(request.args.get('speed'))

    args_parser = FilesAggregator()
    input_files = args_parser.collect_input_files(subpath)
    if not input_files:
        return "File or dir not found"
    else:
        edited_files = []
        for file in input_files:
            transformer = AudioTransformer(file)
            if speed is not 1.0:
                transformer.change_speed(speed)
            if volume is not 0:
                transformer.change_volume(volume)
            duration = transformer.get_duration()
            audio_segment = transformer.get_audio_segment()
            filename_to_export = file.replace('.wav', '') + '_edited.wav'
            audio_export = audio_segment.export(filename_to_export, format="wav")
            edited_files.append(filename_to_export)
            associations = audioAnalysis.speakerDiarizationWrapper(audio_export.name, n_speakers, False)
            splitter = Splitter(associations)
            splitter.split_audio(audio_segment, audio_export.name)
            splitted_files = splitter.get_splitted_files()
            edited_files += splitted_files
            speakers = splitter.get_speakers()

            if '/' in file:
                dirs = file.split("/")
                transcription_file = str("data/transcriptions/automatic/" + dirs[len(dirs) - 1]).replace(".wav", ".txt")
                file_id = dirs[-1].replace('.wav', '')
            else:
                transcription_file = str("data/transcriptions/automatic/" + file)
                file_id = file.replace('.wav', '')

            recognizer = Recognizer()
            recognizer.recognize(transcription_file, splitted_files, speakers)
            transcription = recognizer.get_transcription()

            dialogue = Dialogue(file_id, file, duration, volume, speed, transcription)
            transcriptions_request = TranscriptionRequest()
            transcriptions_request.post_dialogues(dialogue.get_json())
            dialogues = dialogue.get_json()
        for file in edited_files:
            os.remove(file)
        return dialogues
