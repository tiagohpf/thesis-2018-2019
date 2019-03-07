import os, sys
import  itertools
from collections import defaultdict

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_manager import SentenceManager

dirname = "transcriptions/"


def calculate_cosine_sim(first_sentence, second_sentence):
    vectors = [t for t in get_vectors(first_sentence, second_sentence)]
    return cosine_similarity(vectors)

def calculate_jaccard_sim(self):
    original_set = set(self.original_file.split())
    transcription_set = set(self.transcription_file.split())
    intersect = original_set.intersection(transcription_set)
    return float(len(intersect)) / (len(original_set) + len(transcription_set) - len(intersect))

def get_vectors(*strs):
    text = [t for t in strs]
    vectorizer = CountVectorizer(text)
    vectorizer.fit(text)
    return vectorizer.transform(text).toarray()

if os.path.isdir(dirname):
    input_files =  os.listdir(dirname)
    sentences = []
else:
    print("Dir not found")
    sys.exit(1)

for file in input_files:
    f = open(dirname + file, 'r')
    sentences += [sentence.replace("'", "").replace("0:", "").replace("1:", "").strip() for sentence in f.readlines()]
    f.close()


associations = defaultdict(list)
permutations = itertools.permutations(sentences, 2)

for pair in permutations:
    x = pair[0]
    y = pair[1]
    if calculate_cosine_sim(x, y)[0][1] >= 0.75:
        associations[x].append(y)
        #associations[y].append(x)

groups = 0
file = open('groups.txt', 'w')
for group in associations:
    file.write("\n" + group + "\n")
    for sentence in associations[group]:
        file.write(sentence + "\n")
file.close()
