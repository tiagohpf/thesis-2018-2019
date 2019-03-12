package parsers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import entities.Entity;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.ArrayList;

public class JsonParser implements Parser {
    private String filename;
    private ArrayList<Entity> entities;

    public JsonParser(String filename) {
        this.filename = filename;
        entities = new ArrayList<>();
    }

    public void parse() {
        try {
            FileReader reader = new FileReader(filename);
            JsonObject jsonObject = new Gson().fromJson(reader, JsonObject.class);
            String id = jsonObject.get("_id").getAsString();
            String category = jsonObject.get("category").getAsString();
            String subcategory = jsonObject.get("subcategory").getAsString();
            JsonArray jsonArray = jsonObject.get("values").getAsJsonArray();
            ArrayList<String> values = new ArrayList<>();
            for (JsonElement value : jsonArray)
                values.add(value.getAsString());
            entities.add(new Entity(id, category, subcategory, values));
        } catch (FileNotFoundException e) {
            System.err.println(filename + " not found");
        }
    }

    public ArrayList<Entity> getEntities() {
        return entities;
    }
}
