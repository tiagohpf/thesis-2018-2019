import threading
import speech_recognition as sr
from sentence_manager import SentenceManager


class RecognizerThread(threading.Thread):
    def __init__(self, thread_id, name, counter, file, speaker):
        threading.Thread.__init__(self)
        self.thread_id = thread_id
        self.name = name
        self.counter = counter
        self.file = file
        self.speaker = speaker
        self._return = None

    def run(self):
        r = sr.Recognizer()
        with sr.AudioFile(self.file) as source:
            r.adjust_for_ambient_noise(source)
            audio = r.record(source)
            try:
                text = r.recognize_google(audio, language="pt-PT")
                out = "{}: {}".format(self.speaker, SentenceManager.replace_special_characters(text))
                print(out)
                self._return = out
            except sr.UnknownValueError:
                print("Google Speech Recognition could not understand audio")
            except sr.RequestError as e:
                print("Could not request results from Google Speech Recognition; {}".format(e))

    def join(self, **kwargs):
        threading.Thread.join(self)
        return self._return


thread_lock = threading.Lock()
