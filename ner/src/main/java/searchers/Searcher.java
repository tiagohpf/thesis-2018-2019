package searchers;

import com.google.gson.*;
import entities.Entity;
import filters.StopWords;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class Searcher {
    private ArrayList<Entity> entities;
    private StopWords stopWords;
    private Map<String, String> entities_found;

    public Searcher(ArrayList<Entity> entities, StopWords stopWords) {
        this.entities = entities;
        this.stopWords = stopWords;
        entities_found = new HashMap<>();
    }

    public void search(String sentence) {
        entities_found.clear();
        String new_sentence = stopWords.removeStopWords(sentence.toLowerCase());
        String[] words = new_sentence.split("\\s");
        for (int i = 0; i < words.length; i++) {
            int DEFAULT_ORDER = 3;
            for (int order = 0; order <= DEFAULT_ORDER; order++) {
                int size = Arrays.copyOfRange(words, i + 1, words.length).length;
                if (order <= size) {
                    // Concatenate word + order
                    new_sentence = getSentenceInOrder(Arrays.copyOfRange(words, i, i + order + 1));
                    searchInContext(new_sentence);
                }
            }
        }
        fixAmbiguities();
    }

    private String getSentenceInOrder(String[] words) {
        StringBuilder sb = new StringBuilder();
        for (String word : words)
            sb.append(word).append(" ");
        return sb.toString().trim();
    }


    public JsonArray getEntities_found() {
        JsonArray jsonArray = new JsonArray();
        for (Map.Entry<String, String> entity : entities_found.entrySet()) {
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("_id", entity.getValue());
            jsonObject.addProperty("value", entity.getKey());
            jsonArray.add(jsonObject);
        }
        return jsonArray;
    }

    private void searchInContext(String sentence) {
        for (Entity entity : entities) {
            for (String value : entity.getValues()) {
                String new_value = stopWords.removeStopWords(value);
                if (new_value.equals(sentence)) {
                    entities_found.put(value, entity.getId());
                    break;
                }
            }
        }
    }

    private void fixAmbiguities() {
        Map<String, String> clone = new HashMap<>(entities_found);
        for (Map.Entry<String, String> element : clone.entrySet()) {
            String value = element.getKey();
            String category = element.getValue();

            // Filter instances that contains same value
            Map<String, String> same_value = clone.entrySet().stream()
                    .filter(x -> x.getKey().contains(value) && !x.getValue().equals(category))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            // Filter instances that contains same category
            Map<String, String> same_category = clone.entrySet().stream()
                    .filter(x -> x.getValue().equals(category) && x.getKey().length() > value.length())
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            if (same_value.size() > 0 || same_category.size() > 0)
                entities_found.remove(value, category);
        }
    }
}
