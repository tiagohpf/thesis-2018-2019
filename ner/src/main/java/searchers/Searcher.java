package searchers;

import entities.*;
import filters.StopWords;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.util.*;

public class Searcher {
    private ArrayList<Entity> entities;
    private ArrayList<Intent> intents;
    private StopWords stopWords;
    private Map<String, Pair<String, String>> locals;
    private Map<String, Pair<String, String>> elements;
    private Map<String, Set<String>> categories;

    public Searcher(ArrayList<Entity> entities, ArrayList<Intent> intents, StopWords stopWords) {
        this.entities = entities;
        this.intents = intents;
        this.stopWords = stopWords;
        locals = new HashMap<>();
        elements = new HashMap<>();
        categories = new HashMap<>();
    }

    public String search(String sentence) {
        locals.clear();
        elements.clear();
        categories.clear();
        String new_sentence = stopWords.removeStopWords(sentence.toLowerCase());
        String[] words = new_sentence.split("\\s");
        searchInOrder(words, 0);
        searchInOrder(words, 1);
        searchInOrder(words, 2);
        searchInOrder(words, 3);
        elements = removeAmbiguities();
        getIntentsCovered();
        String get_entities = getEntities();
        String get_intents = getIntents();
        StringBuilder out = new StringBuilder();
        if (get_entities.replaceAll("\\[]", "").length() > 0)
            out.append(get_entities).append("\n");
        if (get_intents.replaceAll("\\[]", "").length() > 0)
            out.append(get_intents);
        return out.toString();
    }

    private void searchInOrder(String[] words, int order) {
        for (int i = 0; i < words.length - order; i++) {
            boolean found = false, found_number = false;
            for (Entity entity : entities) {
                String number_searcher = NumbersSearcher.searchWithNumbers(words[i]);
                String name = "";
                String subject = entity.getSubject();
                String subsubject = entity.getSubsubject();
                if (number_searcher.length() > 0) {
                    name = words[i];
                    subject = number_searcher;
                    found_number = true;
                } else if (order == 0) {
                    if (entity.getName().equals(words[i])) {
                        name = words[i];
                        found = true;
                    }
                } else if (order == 1) {
                    if (entity.getName().equals(words[i] + " " + words[i + 1])) {
                        name = words[i] + " " + words[i + 1];
                        found = true;
                    }
                } else if (order == 2) {
                    if (entity.getName().equals(words[i] + " " + words[i + 1] + " " + words[i + 2])) {
                        name = words[i] + " " + words[i + 1] + " " + words[i + 2];
                        found = true;
                    }
                } else if (order == 3) {
                    if (entity.getName().equals(words[i] + " " + words[i + 1] + " " + words[i + 2] + " " + words[i + 3])) {
                        name = words[i] + " " + words[i + 1] + " " + words[i + 2] + " " + words[i + 3];
                        found = true;
                    }
                }
                if (name.length() > 0 && subject.length() > 0) {
                    if (found_number)
                        elements.put(name, new Pair<>(subject, null));
                    else if (found) {
                        String childs_category = "";
                        String childs = "";
                        if (entity instanceof Area) {
                            childs = getListCountries(((Area) entity).getCountries());
                            childs_category = "countries";
                        } else if (entity instanceof Country) {
                            childs = ((Country) entity).getCapital().getName();
                            childs_category = "capital";
                        } else if (entity instanceof District) {
                            childs = getListCounties(((District) entity).getCounties());
                            childs_category = "counties";
                        }
                        if (childs.length() > 0)
                            locals.put(name, new Pair<>(childs_category, childs));
                        else {
                            if (subsubject != null)
                                elements.put(name, new Pair<>(subject, subsubject));
                            else
                                elements.put(name, new Pair<>(subject, null));
                        }
                    }
                }
            }
        }
    }

    private void getIntentsCovered() {
        for (Map.Entry<String, Pair<String, String>> pair : elements.entrySet()) {
            String subject;
            if (pair.getValue().getSecond() != null)
                subject = pair.getValue().getSecond();
            else
                subject = pair.getValue().getFirst();
            for (Intent intent : intents) {
                if (intent.getEntities().toString().contains(subject)) {
                    if (categories.keySet().size() > 0 && categories.keySet().contains(intent.getName())) {
                        Set<String> new_categories = categories.entrySet().stream()
                                .filter(e -> e.getKey().equals(intent.getName())).findFirst().get().getValue();
                        new_categories.add(subject);
                        categories.put(intent.getName(), new_categories);
                    }
                    else
                        categories.put(intent.getName(), new HashSet<>(Collections.singletonList(subject)));
                }
            }
        }
    }

    private Map<String, Pair<String, String>> removeAmbiguities() {
        Map<String, Pair<String, String>> clone = new HashMap<>(elements);
        for (Map.Entry<String, Pair<String, String>> obj : elements.entrySet()) {
            String obj_name = obj.getKey();
            String obj_subsubject = obj.getValue().getSecond();
            for (Map.Entry<String, Pair<String, String>> new_obj : elements.entrySet()) {
                String new_obj_name = new_obj.getKey();
                String new_obj_subsubject = new_obj.getValue().getSecond();
                // Compare different objects
                if (!obj_name.equals(new_obj_name)) {
                    Set<String> obj_set = new HashSet<>(Arrays.asList(obj_name.split("\\s+")));
                    Set<String> new_obj_set = new HashSet<>(Arrays.asList(new_obj_name.split("\\s+")));
                    Set<String> intersection = new HashSet<>(obj_set);
                    intersection.retainAll(new_obj_set);
                    // Check if exists intersection
                    if (intersection.size() > 0) {
                        // Remove sentence with shortest set
                        if (obj_set.size() > new_obj_set.size())
                            clone.remove(new_obj_name);
                        else if (obj_set.size() < new_obj_set.size())
                            clone.remove(obj_name);
                        // In case of same size of the set, remove the sentence with null subsubject
                        else {
                            if (obj_subsubject == null && new_obj_subsubject != null)
                                clone.remove(obj_name);
                            else
                                clone.remove(new_obj_name);
                        }
                    }
                }
            }
        }
        return clone;
    }

    private String getListCountries(ArrayList<Country> elements) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < elements.size(); i++) {
            if (i != elements.size() - 1)
                sb.append(elements.get(i).getName()).append(", ");
        }
        return sb.toString();
    }

    private String getListCounties(ArrayList<Countie> elements) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < elements.size(); i++) {
            if (i != elements.size() - 1)
                sb.append(elements.get(i).getName()).append(", ");
        }
        return sb.toString();
    }

    private String getEntities() {
        JSONArray array = new JSONArray();
        for (Map.Entry<String, Pair<String, String>> instance : elements.entrySet()) {
            JSONObject obj = new JSONObject();
            obj.put("name", instance.getKey());
            obj.put("subcategory", instance.getValue().getFirst());
            if (instance.getValue().getSecond() != null)
                obj.put("subsubcategory", instance.getValue().getSecond());
            array.add(obj);
        }
        for (Map.Entry<String, Pair<String, String>> local : locals.entrySet()) {
            JSONObject obj = new JSONObject();
            obj.put("name", local.getKey());
            obj.put("subcategory", "local");
            String childs_category = local.getValue().getFirst();
            if (!childs_category.equals("capital")) {
                JSONArray locals = new JSONArray();
                String[] childs = local.getValue().getSecond().split(", ");
                for (String child : childs)
                    locals.add(child);
                obj.put(childs_category, locals);
            }
            else
                obj.put(childs_category, local.getValue().getSecond());
            array.add(obj);
        }
        return array.toJSONString();
    }

    private String getIntents() {
        JSONArray array = new JSONArray();
        for(Map.Entry<String, Set<String>> intent : categories.entrySet()) {
            JSONObject obj = new JSONObject();
            obj.put("intent", intent.getKey());
            obj.put("entities", intent.getValue());
            if (intentHasConfidence(intent.getKey(), 0.5))
                array.add(obj);
        }
        return array.toJSONString();
    }

    private boolean intentHasConfidence(String intent_name, double threshold) {
        Intent intent = intents.stream().filter(e -> e.getName().equals(intent_name)).findFirst().get();
        Set<String> new_categories = categories.entrySet().stream()
                .filter(e -> e.getKey().equals(intent_name)).findFirst().get().getValue();
        double coverage = (double) new_categories.size() / intent.getEntities().size();
        return coverage >= threshold;
    }
}

