import sys

from files_aggregator import FilesAggregator
from dialogue import Dialogue
from pyAudioAnalysis import audioAnalysis as audioAnalysis
from recognizer import Recognizer
from transcription_requests import TranscriptionRequest
from splitter import Splitter
from audio_transformer import AudioTransformer
import logging


def main(argv):
    args_parser = FilesAggregator(argv)
    input_files = args_parser.get_input_files()
    volume = args_parser.get_volume()
    speed = args_parser.get_speed()
    n_speakers = args_parser.get_number_speakers()
    logging.debug('Start Transcription...')
    for file in input_files:
        transformer = AudioTransformer(file)
        if speed is not 1.0:
            transformer.change_speed(speed)
        if volume is not 0:
            transformer.change_volume(volume)
        duration = transformer.get_duration()
        audio_segment = transformer.get_audio_segment()
        audio_export = audio_segment.export(file.replace('.wav', '') + '_edited.wav', format="wav")
        associations = audioAnalysis.speakerDiarizationWrapper(audio_export.name, n_speakers, False)
        splitter = Splitter(associations)
        splitter.split_audio(audio_segment, audio_export.name)
        splitted_files = splitter.get_splitted_files()
        speakers = splitter.get_speakers()

        if '/' in file:
            dirs = file.split("/")
            transcription_file = str("transcriptions/" + dirs[len(dirs) - 1]).replace(".wav", ".txt")
            file_id = dirs[-1].replace('.wav', '')
        else:
            transcription_file = str("transcriptions/" + file)
            file_id = file.replace('.wav', '')

        recognizer = Recognizer()
        recognizer.recognize(transcription_file, splitted_files, speakers)
        transcription = recognizer.get_transcription()

        dialogue = Dialogue(file_id, file, duration, volume, speed, transcription)
        transcriptions_request = TranscriptionRequest()
        transcriptions_request.post_dialogues(dialogue.get_json())


if __name__ == "__main__":
    main(sys.argv[1:])
