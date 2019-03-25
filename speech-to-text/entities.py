import json

from talks import Talk


class Talk_Entities(Talk):
    def __init__(self, id, filename, duration, volume, speed, dialogues):
        super().__init__(id, filename, duration, volume, speed, dialogues)
        self.entities = []

    def get_json(self):
        return json.dumps({
                           "entities": self.entities,
                           "dialogues": self.get_json_dialogues()},
                          ensure_ascii=False, indent=4, sort_keys=True).encode("utf-8")

    def get_json_dialogues(self):
        json_dialogues = []
        for i in range(0, len(self.dialogues)):
            split = self.dialogues[i].split(': ')
            new_entities = self.transcription_request.get_entities(split[1])["data"]
            if new_entities:
                self.entities += new_entities
            json_dialogues.append({
                "index": i,
                "speaker": split[0],
                "text": split[1],
                "entities": new_entities})
        return json_dialogues

