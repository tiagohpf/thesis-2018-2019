from recognizer_thread import RecognizerThread


class Recognizer:
    def __init__(self, filename, files, speakers):
        self.filename = filename.replace('.wav', '.txt')
        self.files = files
        self.speakers = speakers
        self.transcription = []
        self.threads = []
        self.start_threads(len(self.files))

    def start_threads(self, size):
        for i in range(0, size):
            thread = RecognizerThread(i, str("thread " + str(i)), i, self.files[i], self.speakers[i])
            self.threads.append(thread)
            thread.start()
        self.join_threads()

    def join_threads(self):
        for i in self.threads:
            self.transcription.append(i.join())

    def get_transcription(self):
        return self.transcription
