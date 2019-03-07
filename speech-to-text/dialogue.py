import json


class Dialogue:
    def __init__(self, id, filename, duration, volume, speed, dialogues):
        self.id = id
        self.filename = filename
        self.duration = duration
        self.volume = volume
        self.speed = speed
        self.dialogues = dialogues

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
                           "entities": [],
                           "language": "pt-PT",
                           "dialogues": self.get_json_dialogues()},
                          ensure_ascii=False).encode("utf-8")

    def get_json_dialogues(self):
        json_dialogues = []
        for i in range(0, len(self.dialogues)):
            split = self.dialogues[i].split(': ')
            json_dialogues.append({"index": i, "speaker": split[0], "text": split[1], "sentiment analysis": ""})
        return json_dialogues
