package parsers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import entities.Entity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class JsonParser implements Parser {
    private String filename;
    private ArrayList<Entity> entities;
    private static final Logger logger = LoggerFactory.getLogger(JsonParser.class);

    public JsonParser(String filename) {
        this.filename = filename;
        entities = new ArrayList<>();
    }

    public void parse() throws IOException {
        try (FileReader reader = new FileReader(filename)) {
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
            logger.error(String.format("ERROR: %s not found", filename));
        }
    }

    public List<Entity> getEntities() {
        return entities;
    }
}
