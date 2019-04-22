package managers;

import models.Stopword;
import org.mongodb.morphia.Datastore;

import java.util.List;
import java.util.stream.Collectors;

public class SentenceManager {
    public static String removeStopWordsFromSentence(String sentence, Datastore datastore) {
        StringBuilder sb = new StringBuilder();
        String[] words = removeSpecialCharacters(sentence).split("\\s+");
        List<String> stopwords = datastore.find(Stopword.class).asList()
                .stream().map(Stopword::getId).collect(Collectors.toList());
        if (words.length > 0) {
            for (String word : words) {
                if (!stopwords.contains(word.toLowerCase().trim()))
                    sb.append(word).append(" ");
            }
        }
        return sb.toString().trim().toLowerCase();
    }

    private static String removeSpecialCharacters(String sentence) {
        return sentence.replaceAll("[/\\-_]", " ");
    }
}
