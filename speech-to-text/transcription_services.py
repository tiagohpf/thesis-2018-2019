from flask import Flask, request

from audio_transformer import AudioTransformer
from dialogue import Dialogue
from files_aggregator import FilesAggregator
from pyAudioAnalysis import audioAnalysis as audioAnalysis
from recognizer import Recognizer
from splitter import Splitter
from talks import Talk
from transcription_requests import TranscriptionRequest

app = Flask(__name__)


def transcript_dialogues(path, n_speakers, volume, speed, file_id, download_path, func_name, student=None):
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
            splitter = Splitter(associations, duration)
            splitter.split_audio(audio_segment, audio_export.name)
            splitted_files = splitter.get_splitted_files()
            splitted_times = splitter.get_splitted_times()
            edited_files += splitted_files
            speakers = splitter.get_speakers()
            transcription_file = str("data/transcriptions/automatic/" + file_id + '.trs')
            recognizer = Recognizer(transcription_file, splitted_files, speakers)
            transcription = recognizer.get_transcription()
            if func_name == 'generate_all':
                dialogue = Dialogue(file_id, file, duration, volume,
                                    speed, transcription, splitted_times, student)
            else:
                dialogue = Talk(file_id, file, duration, volume, speed, transcription, splitted_times)
            transcriptions_request = TranscriptionRequest()
            transcriptions_request.post_dialogues(dialogue.get_json())

            i = 0
            out_file = open(transcription_file, 'w')
            for line in transcription:
                if line:
                    inital_time, final_time = splitted_times[i]
                    out_file.write("\t\t\t\t\t\t\t\t [{}, {}]\n {}\n".format(str(round(inital_time, 2)), str(round(final_time, 2)), line))
                    i +=1
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
    student = request.args.get('student')
    return transcript_dialogues(path, n_speakers, volume, speed, file_id,
                                download_pah, generate_all.__name__, student=student)


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
