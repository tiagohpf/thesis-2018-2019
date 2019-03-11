package parsers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.stream.JsonReader;
import entities.Entity;
import entities.Intent;
import filters.StopWords;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

public class JsonParser implements Parser {
    private String filename;
    private ArrayList<Entity> entities;
    private ArrayList<Intent> intents;
    private StopWords stopWords;

    public JsonParser(String filename, StopWords stopWords) {
        this.filename = filename;
        this.stopWords = stopWords;
        entities = new ArrayList<>();
        intents = new ArrayList<>();
    }

    public void parse() {
        try {
            FileReader reader = new FileReader(filename);
            JsonObject jsonObject = new Gson().fromJson(reader, JsonObject.class);
            String id = removeStopWords(jsonObject.get("_id").getAsString());
            String category = removeStopWords(jsonObject.get("category").getAsString());
            String subcategory = removeStopWords(jsonObject.get("subcategory").getAsString());
            JsonArray jsonArray = jsonObject.get("values").getAsJsonArray();
            ArrayList<String> values = new ArrayList<>();
            for (JsonElement value : jsonArray)
                values.add(value.getAsString());
            entities.add(new Entity(id, category, subcategory, values));
        } catch (FileNotFoundException e) {
            System.err.println(filename + " not found");
        }
    }

    public void parseEntities() {
        JSONParser parser = new JSONParser();
        try {
            Object obj = parser.parse(new FileReader(filename));
            JSONArray jsonArray = (JSONArray) obj;
            for (JSONObject jsonObject : (Iterable<JSONObject>) jsonArray) {
                String id = (String) jsonObject.get("name");
                id = stopWords.removeStopWords(id).trim();
                String subject = (String) jsonObject.get("subject");
                subject = stopWords.removeStopWords(subject).trim();
                String subsubject = (String) jsonObject.get("subsubject");
                Entity entity;
                if (subsubject != null) {
                    subsubject = stopWords.removeStopWords(subsubject).trim();
                    //entity = new Entity(name, subject, subsubject);
                    entity = new Entity(id, subject, subsubject, new ArrayList<>());
                } else
                    entity = new Entity(id, subject, new ArrayList<>());
                    //entity = new Entity(name, subject);
                if (id.length() > 0 && subject.length() > 0 && !objInEntities(entity))
                    entities.add(entity);
            }
        } catch (ParseException | IOException e) {
            e.printStackTrace();
        }
    }

    public void parseIntents() {
        JSONParser parser = new JSONParser();
        try {
            Object obj = parser.parse(new FileReader(filename));
            JSONObject jsonObject = (JSONObject) obj;
            String name = (String) jsonObject.get("intent");
            name = stopWords.removeStopWords(name).trim();
            JSONArray jsonArray = (JSONArray) jsonObject.get("entities");
            ArrayList<String> childs = new ArrayList<>();
            for (Object o : jsonArray) {
                String child = stopWords.removeStopWords(o.toString());
                childs.add(child);
            }
            Intent intent = new Intent(name, childs);
            if (name.length() > 0 && jsonArray.size() > 0 && !objInIntents(intent))
                    intents.add(intent);
        } catch (ParseException | IOException e) {
            e.printStackTrace();
        }
    }

    public ArrayList<Entity> getEntities() {
        return entities;
    }


    public ArrayList<Intent> getIntents() { return intents; }

    private String removeStopWords(String sentence) {
        return stopWords.removeStopWords(sentence.toLowerCase()).trim();
    }

    private boolean objInEntities(Entity entity) {
        boolean exists = false;
        for (Entity e : entities) {
            if (e.getId().equals(entity.getId()) && e.getCategory().equals(entity.getCategory())) {
                exists = true;
                break;
            }
        }
        return exists;
    }

    private boolean objInIntents(Intent intent) {
        boolean exists = false;
        for (Intent i : intents) {
            if (i.getName().equals(intent.getName()) && i.getEntities() == intent.getEntities()) {
                exists = true;
                break;
            }
        }
        return exists;
    }
}
