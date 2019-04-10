import threading
import speech_recognition as sr
from sentence_manager import SentenceManager


class RecognizerThread(threading.Thread):
    def __init__(self, thread_id, name, counter, file, speaker, time_range):
        threading.Thread.__init__(self)
        self.thread_id = thread_id
        self.name = name
        self.counter = counter
        self.file = file
        self.speaker = speaker
        self.initial_time = time_range[0]
        self.final_time = time_range[1]
        self._return = None

    def run(self):
        r = sr.Recognizer()
        with sr.AudioFile(self.file) as source:
            r.adjust_for_ambient_noise(source)
            audio = r.record(source)
            try:
                text = r.recognize_google(audio, language="pt-PT")
                out = "{}: {}".format(self.speaker, SentenceManager.replace_special_characters(text))
            except sr.UnknownValueError:
                print("Google Speech Recognition could not understand audio")
                out = self.get_unrecognized_message()
            except sr.RequestError as e:
                print("Could not request results from Google Speech Recognition; {}".format(e))
                out = self.get_unrecognized_message()
            print(out)
            self._return = out

    def join(self, **kwargs):
        threading.Thread.join(self)
        return self._return

    def get_unrecognized_message(self):
        unrecognized_time = int(self.final_time - self.initial_time)
        transcription = "{}: ".format(self.speaker)
        for i in range(0, unrecognized_time, 2):
            transcription += "X"
        return transcription

thread_lock = threading.Lock()
