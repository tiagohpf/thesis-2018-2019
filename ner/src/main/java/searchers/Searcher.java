package searchers;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import managers.SentenceManager;
import models.Subject;
import org.mongodb.morphia.Datastore;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Searcher {
    private Datastore datastore;

    public Searcher(Datastore datastore) {
        this.datastore = datastore;
    }

    public JsonArray searchForEntities(String sentence) {
        Map<String, String> entities = new HashMap<>();
        Map<String, String> entitiesFound;
        String newSentence = SentenceManager.removeStopWordsFromSentence(sentence, datastore);
        String[] words = newSentence.split("\\s+");
        for (int i = 0; i < words.length; i++)
            entities.putAll(searchInContext(newSentence));
        entitiesFound = fixAmbiguities(entities);
        return getEntitiesFound(entitiesFound);
    }

    private Map<String, String> searchInContext(String sentence) {
        List<Subject> entities = datastore.find(Subject.class).asList();
        Map<String, String> found = new HashMap<>();
        for (Subject entity : entities) {
            for (String value : entity.getValues()) {
                String newValue = SentenceManager.removeStopWordsFromSentence(value, datastore);
                if (newValue.length() > 0) {
                    String pattern = String.format("\\b%s\\b", newValue);
                    if (sentence.matches(pattern))
                        found.put(value, entity.getId());
                }
            }
        }
        return found;
    }

    private Map<String, String> fixAmbiguities(Map<String, String> found) {
        Map<String, String> clone = new HashMap<>(found);

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

            // If sentence is shorter and similar to something, remove it
            if (sameValue.size() > 0 || sameCategory.size() > 0)
                found.remove(value, category);
        }
        return found;
    }

    private JsonArray getEntitiesFound(Map<String, String> found) {
        JsonArray jsonArray = new JsonArray();
        for (Map.Entry<String, String> entity : found.entrySet()) {
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("_id", entity.getValue());
            jsonObject.addProperty("value", entity.getKey());
            jsonArray.add(jsonObject);
        }
        return jsonArray;
    }
}
