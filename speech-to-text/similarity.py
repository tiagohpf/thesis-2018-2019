from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_manager import SentenceManager


class SimilarityMeasures:
    def __init__(self, original_file, transcription_file):
        self.original_file = self.read_and_edit(original_file)
        self.transcription_file = self.read_and_edit(transcription_file)

    def calculate_cosine_sim(self):
        vectors = [t for t in self.get_vectors(self.original_file, self.transcription_file)]
        return cosine_similarity(vectors)

    def calculate_jaccard_sim(self):
        original_set = set(self.original_file.split())
        transcription_set = set(self.transcription_file.split())
        intersect = original_set.intersection(transcription_set)
        return float(len(intersect)) / (len(original_set) + len(transcription_set) - len(intersect))

    def get_vectors(self, *strs):
        text = [t for t in strs]
        vectorizer = CountVectorizer(text)
        vectorizer.fit(text)
        return vectorizer.transform(text).toarray()

    def read_and_edit(self, filename):
        file = open(filename, 'r')
        text = ' '.join(file.readlines())
        file.close()
        manager = SentenceManager()
        return manager.edit_text(text)
