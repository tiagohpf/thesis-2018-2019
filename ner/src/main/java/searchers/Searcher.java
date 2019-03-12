package searchers;

import com.google.gson.*;
import entities.Entity;
import managers.StopWordsManager;

import java.util.*;
import java.util.stream.Collectors;

public class Searcher {
    private List<Entity> entities;
    private StopWordsManager stopWordsManager;
    private Map<String, String> entitiesFound;

    public Searcher(List<Entity> entities, StopWordsManager stopWordsManager) {
        this.entities = entities;
        this.stopWordsManager = stopWordsManager;
        entitiesFound = new HashMap<>();
    }

    public void search(String sentence) {
        entitiesFound.clear();
        String newSentence = stopWordsManager.removeStopWords(sentence);
        String[] words = newSentence.split("\\s");
        for (int i = 0; i < words.length; i++) {
            int defaultOrder = 3;
            for (int order = 0; order <= defaultOrder; order++) {
                int size = Arrays.copyOfRange(words, i + 1, words.length).length;
                if (order <= size) {
                    // Concatenate word + order
                    newSentence = getSentenceInOrder(Arrays.copyOfRange(words, i, i + order + 1));
                    searchInContext(newSentence);
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


    public JsonArray getEntitiesFound() {
        JsonArray jsonArray = new JsonArray();
        for (Map.Entry<String, String> entity : entitiesFound.entrySet()) {
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
                String newValue = stopWordsManager.removeStopWords(value);
                if (newValue.equals(sentence)) {
                    entitiesFound.put(value, entity.getId());
                    break;
                }
            }
        }
    }

    private void fixAmbiguities() {
        Map<String, String> clone = new HashMap<>(entitiesFound);
        for (Map.Entry<String, String> element : clone.entrySet()) {
            String value = element.getKey();
            String category = element.getValue();

            // Filter instances that contains same value
            Map<String, String> sameValue = clone.entrySet().stream()
                    .filter(x -> x.getKey().contains(value) && !x.getValue().equals(category))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            // Filter instances that contains same category
            Map<String, String> sameCategory = clone.entrySet().stream()
                    .filter(x -> x.getValue().equals(category) && x.getKey().length() > value.length())
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            if (sameValue.size() > 0 || sameCategory.size() > 0)
                entitiesFound.remove(value, category);
        }
    }
}
