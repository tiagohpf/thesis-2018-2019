import sys

from parsers.args_parser import ArgsParser
from dialogue import Dialogue
from pyAudioAnalysis import audioAnalysis as audioAnalysis
from recognizer import Recognizer
from transcription_request import TranscriptionRequest
from similarity import SimilarityMeasures
from splitter import Splitter
from audio.audio_transformer import AudioTransformer


def main(argv):
    args_parser = ArgsParser(argv)
    input_files = args_parser.get_input_files()
    volume = args_parser.get_volume()
    speed = args_parser.get_speed()
    n_speakers = args_parser.get_number_speakers()

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
            original_file = str("original/" + dirs[len(dirs) - 1]).replace(".wav", ".txt")
            file_id = dirs[-1].replace('.wav', '')
        else:
            transcription_file = str("transcriptions/" + file)
            original_file = file
            file_id = file.replace('.wav', '')

        recognizer = Recognizer()
        recognizer.recognize(transcription_file, splitted_files, speakers)
        transcription = recognizer.get_transcription()

        dialogue = Dialogue(file_id, audio_export.name, duration, volume, speed, transcription)
        transcriptions_request = TranscriptionRequest()
        transcriptions_request.post(dialogue.get_json())

        """print("Original: {}; Transcription: {}".format(original_file, transcription_file))
        similarity = SimilarityMeasures(original_file, transcription_file)
        print("Cos Similarity: {}\t".format(similarity.calculate_cosine_sim()[0][1]))
        print("Jaccard Similarity: {}\n\n".format(similarity.calculate_jaccard_sim()))"""


if __name__ == "__main__":
    main(sys.argv[1:])
