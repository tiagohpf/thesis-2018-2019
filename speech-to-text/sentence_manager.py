class SentenceManager:
    @staticmethod
    def replace_special_characters(sentence):
        new_sentence = sentence.replace('€', 'euros')
        return new_sentence
