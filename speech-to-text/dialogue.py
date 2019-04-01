import json
import datetime
from transcription_requests import TranscriptionRequest


class Dialogue:
    def __init__(self, id, filename, duration, volume, speed, dialogues, splitted_times):
        self.id = id
        self.filename = filename
        self.duration = duration
        self.volume = volume
        self.speed = speed
        self.entities = []
        self.intents = []
        self.dialogues = dialogues
        self.splitted_times = splitted_times
        self.transcription_request = TranscriptionRequest()

    def get_filename(self):
        return self.filename

    def get_duration(self):
        return self.duration

    def get_dialogues(self):
        return self.dialogues

    def get_json(self):
        return json.dumps({"_id": self.id,
                           "filename": self.filename,
                           "duration": self.duration,
                           "volume": self.volume,
                           "speed": self.speed,
                           "entities": self.entities,
                           "intents": self.intents,
                           "language": "pt-PT",
                           "dialogues": self.get_json_dialogues(),
                           "last_update": datetime.datetime.now()},
                          ensure_ascii=False, indent=4, sort_keys=True).encode('utf-8')

    def get_json_dialogues(self):
        json_dialogues = []
        for i in range(0, len(self.dialogues)):
            if self.dialogues[i]:
                split = self.dialogues[i].split(': ')
                new_entities = self.transcription_request.get_entities(split[1])["data"]
                new_intent = self.transcription_request.get_intent(split[1])
                initial_time, final_time = self.splitted_times[i]
                if new_entities:
                    self.entities += new_entities
                if new_intent:
                    self.intents.append(new_intent)
                json_dialogues.append({
                    "index": i,
                    "speaker": split[0],
                    "text": split[1],
                    "entities": new_entities,
                    "intent": new_intent,
                    "initial_time": initial_time,
                    "final_time": final_time})
        return json_dialogues
