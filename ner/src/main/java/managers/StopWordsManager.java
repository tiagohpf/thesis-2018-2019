package managers;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mongodb.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

public class StopWordsManager {
    private DBCollection stopwords_collection;
    private Set<String> stopwords;

    public StopWordsManager(DB database) {
        stopwords_collection = database.getCollection("stopwords");
        stopwords = new HashSet<>();
    }

    public Set<String> createStopWords() {
        readStopWords();
        ArrayList<DBObject> stopwords_persist = new ArrayList<>();
        for (String word : stopwords)
            stopwords_persist.add(new BasicDBObject("_id", word));
        try {
            stopwords_collection.insert(stopwords_persist);
        } catch (CommandFailureException ex) {
            ex.printStackTrace();
            System.err.println("ERROR: StopWords not uploaded");
        }
        return stopwords;
    }

    void loadStopWords() {
        DBCursor cursor = stopwords_collection.find();
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
            System.err.println("ERROR: File of StopWords not found");
        }
    }
}
