import requests
import json
import string
import random


class TranscriptionRequest:
    def __init__(self):
        self.base_url = "http://10.113.141.31:8080/transcriptions/"
        self.dialogues_url = self.base_url + 'dialogues'
        self.entities_url = "http://10.113.134.43:4567/getEntities/"
        self.intents_url = 'http://10.113.141.31:8900/sofia/question'
        self.headers = {"Content-Type": "application/json"}

    def post_dialogues(self, dialogues):
        requests.post(self.dialogues_url, data=dialogues, headers=self.headers)

    def get_all_dialogues(self):
        r = requests.get(self.dialogues_url, headers=self.headers)
        return json.loads(r.text.encode('utf-8'))

    def get_entities(self, sentence):
        r = requests.get(self.entities_url + str(sentence), headers=self.headers)
        if r:
            return json.loads(r.text.encode('utf-8'))
        return json.loads(json.dumps({"data": []}).encode('utf-8'))

    def get_intent(self, sentence):
        session_id = 'SessionID_' + ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        intent_headers = {
            'cache-control': 'no-cache',
            'Content-Type': "application/x-www-form-urlencoded",
            'postman-token': 'f66f3311-d2ad-5ea5-5f83-7ad26df1d1d9',
        }

        payload = "question=" + str(sentence) + \
                  "&sessionId=" + str(session_id) + \
                  "&VA=Telco" \
                  "&isTest=true"
        r = requests.post(self.intents_url, headers=intent_headers, data=payload)
        return json.loads(r.text)['nlpResponse']["intent"]
