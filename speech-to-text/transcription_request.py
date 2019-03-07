import requests
import json


class TranscriptionRequest:
    def __init__(self):
        self.base_url = "http://10.113.141.31:8080/"
        self.dialogues_url = self.base_url + 'transcriptions/dialogues'
        self.headers = {"Content-Type": "application/json"}

    def post(self, dialogues):
        requests.post(self.dialogues_url, data=dialogues, headers=self.headers)

    def get_all(self):
        r = requests.get(self.dialogues_url, headers=self.headers)
        return json.loads(r.text)
