import os

from flask import Flask, request

from audio_transformer import AudioTransformer
from dialogue import Dialogue
from files_aggregator import FilesAggregator
from pyAudioAnalysis import audioAnalysis as audioAnalysis
from splitter import Splitter
from talks import Talk
from recognizer import Recognizer
from transcription_requests import TranscriptionRequest

app = Flask(__name__)


def transcript_dialogues(path, n_speakers, volume, speed, file_id, download_path, func_name):
   #dialogues = []
    args_parser = FilesAggregator()
    input_files = args_parser.collect_input_files(path)
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
                transcription_file = str("data/transcriptions/automatic/" + dirs[len(dirs) - 1]).replace(".wav", ".trs")
            else:
                transcription_file = str("data/transcriptions/automatic/" + file)

            recognizer = Recognizer(transcription_file, splitted_files, speakers)
            transcription = recognizer.get_transcription()
            print(transcription)
            if func_name == 'generate_all':
                dialogue = Dialogue(file_id, file, duration, volume, speed, transcription)
            else:
                dialogue = Talk(file_id, file, duration, volume, speed, transcription)
            transcriptions_request = TranscriptionRequest()
            transcriptions_request.post_dialogues(dialogue.get_json())
            #dialogues = dialogue.get_json()
            out_file = open(transcription_file, 'w')
            for line in transcription:
                if line:
                    out_file.write(line + "\n")
            out_file.close()
        return download_path


@app.route('/transcript/')
def generate_all():
    path = request.args.get('path')
    n_speakers = 2
    volume = int(request.args.get('volume'))
    speed = float(request.args.get('speed'))
    file_id = request.args.get('file_id')
    download_pah = request.args.get('download_path')
    return transcript_dialogues(path, n_speakers, volume, speed, file_id,
                                download_pah, generate_all.__name__)


@app.route('/generateTranscription/')
def generate_just_transcription():
    path = request.args.get('path')
    n_speakers = 2
    volume = int(request.args.get('volume'))
    speed = float(request.args.get('speed'))
    file_id = request.args.get('file_id')
    download_pah = request.args.get('download_path')
    return transcript_dialogues(path, n_speakers, volume, speed, file_id,
                                download_pah, generate_just_transcription.__name__)
