package managers;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mongodb.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

public class StopWordsManager {
    private DBCollection stopwordsCollection;
    private Set<String> stopwords;
    private static final Logger logger = LoggerFactory.getLogger(StopWordsManager.class);

    public StopWordsManager(DB database) {
        stopwordsCollection = database.getCollection("stopwords");
        stopwords = new HashSet<>();
    }

    public Set<String> createStopWords() {
        readStopWords();
        ArrayList<DBObject> stopwordsPersist = new ArrayList<>();
        for (String word : stopwords)
            stopwordsPersist.add(new BasicDBObject("_id", word));
        try {
            stopwordsCollection.insert(stopwordsPersist);
        } catch (CommandFailureException ex) {
            logger.error("ERROR: StopWords not uploaded");
        }
        return stopwords;
    }

    void loadStopWords() {
        DBCursor cursor = stopwordsCollection.find();
        for (DBObject obj : cursor) {
            Gson gson = new Gson();
            JsonElement jsonElement = gson.fromJson(obj.toString(), JsonElement.class);
            JsonObject jsonObject = jsonElement.getAsJsonObject();
            String word = jsonObject.get("_id").getAsString();
            stopwords.add(word);
        }
    }

    public String removeStopWords(String sentence) {
        StringBuilder sb = new StringBuilder();
        String[] words = sentence.split("\\s");
        if (words.length > 0) {
            for (String word : words) {
                if (!stopwords.contains(word.toLowerCase()))
                    sb.append(word).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private void readStopWords() {
        File file = new File("data/stopwords.txt");
        try {
            Scanner sc = new Scanner(file);
            while (sc.hasNextLine()) {
                String word = sc.nextLine().trim().toLowerCase();
                stopwords.add(word);
            }
            sc.close();
        } catch (FileNotFoundException e) {
            logger.error("ERROR: File of StopWords not found");
        }
    }
}
