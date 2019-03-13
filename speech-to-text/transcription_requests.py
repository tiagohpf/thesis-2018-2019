import socket

import requests
import json


class TranscriptionRequest:
    def __init__(self):
        self.base_url = "http://10.113.141.31:8080/transcriptions/"
        self.dialogues_url = self.base_url + 'dialogues'
        self.entities_url = "http://10.113.134.43:4567/getEntities/"
        self.headers = {"Content-Type": "application/json"}

    def post_dialogues(self, dialogues):
        requests.post(self.dialogues_url, data=dialogues, headers=self.headers)

    def get_all_dialogues(self):
        r = requests.get(self.dialogues_url, headers=self.headers)
        return json.loads(r.text.encode('utf-8'))

    def get_entities(self, sentence):
        r = requests.get(self.entities_url + str(sentence), headers=self.headers)
        return json.loads(r.text.encode('utf-8'))
