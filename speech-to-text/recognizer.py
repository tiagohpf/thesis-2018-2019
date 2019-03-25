import speech_recognition as sr


class Recognizer:
    def __init__(self):
        self.transcription = []

    def recognize(self, filename, files, speakers):
        filename = filename.replace('.wav', '.txt')
        res_file = open(filename, 'w')
        res_file.write("\n")
        for i in range(0, len(files)):
            r = sr.Recognizer()
            with sr.AudioFile(files[i]) as source:
                r.adjust_for_ambient_noise(source)
                audio = r.record(source)
                try:
                    text = r.recognize_google(audio, language="pt-PT")
                    out = "{}: {}".format(speakers[i], text)
                    self.transcription.append(str(out).lower())
                    print(out)
                    res_file.write(str(speakers[i]) + ": " + text + "\n")
                except sr.UnknownValueError:
                    print("Google Speech Recognition could not understand audio")
                except sr.RequestError as e:
                    print("Could not request results from Google Speech Recognition; {}".format(e))
        res_file.close()

    def get_transcription(self):
        return self.transcription
