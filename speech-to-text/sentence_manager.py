import nltk
from nltk import tokenize
import nltk.stem.snowball

CHARS = [',', '.', '?', "'"]


class SentenceManager:
    def __init__(self):
        self.stopwords = nltk.corpus.stopwords.words('portuguese')

    def tokenize(self, sentence):
        return tokenize.word_tokenize(sentence, language='portuguese')

    def remove_stopwords(self, sentence):
        sentence = self.tokenize(sentence)
        return ' '.join([word for word in sentence if word not in self.stopwords])

    def stemming(self, sentece):
        stemmer = nltk.stem.SnowballStemmer('portuguese')
        return stemmer.stem(sentece)

    def replace_words(self, characters, replacer, text):
        for char in characters:
            text = text.replace(char, replacer)
        return text

    def edit_text(self, text):
        new_text = self.replace_words(CHARS, '', ''.join(text))
        new_text = ''.join(self.remove_stopwords(new_text))
        new_text = self.stemming(new_text)
        return new_text
