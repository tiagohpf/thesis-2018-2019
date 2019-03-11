import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mongodb.*;
import entities.Entity;
import filters.FilesAggregator;
import filters.StopWords;
import parsers.JsonParser;
import searchers.Searcher;

import java.util.ArrayList;
import java.util.Map;

public class EntityManager implements EntityService {
    private DBCollection collection;
    private ArrayList<Entity> entities;
    private StopWords stopWords;

    EntityManager(DB database) {
        collection = database.getCollection("entities");
        stopWords = new StopWords("data/stopwords.txt");
        parseEntities();
    }

    @Override
    public ArrayList<Entity> createEntities() {
        ArrayList<String> entities_files = FilesAggregator.getAllJSONFiles("data/");
        ArrayList<Entity> res = new ArrayList<>();
        ArrayList<DBObject> entities_persist = new ArrayList<>();
        JsonParser parser;
        for (String file : entities_files) {
            parser = new JsonParser(file, stopWords);
            parser.parse();
            for (Entity entity : parser.getEntities()) {
                if (getDocsById(entity.getId()).size() == 0) {
                    entities_persist.add(new BasicDBObject("_id", entity.getId())
                            .append("category", entity.getCategory())
                            .append("subcategory", entity.getSubcategory())
                            .append("values", entity.getValues()));
                    entities.add(entity);
                    res.add(entity);
                }
            }
        }
        try {
            collection.insert(entities_persist);
        } catch (CommandFailureException ex) {
            System.out.println("Data not inserted");
        }
        return res;
    }

    @Override
    public JsonArray searchEntities(String sentence) {
        Searcher searcher = new Searcher(entities, stopWords);
        searcher.search(sentence);
        return searcher.getEntities_found();
    }

    @Override
    public ArrayList<Entity> getEntities() {
        return entities;
    }


    private DBCursor getDocsById(String id) {
        BasicDBObject obj = new BasicDBObject("_id", id);
        return collection.find(obj);
    }

    private void parseEntities() {
        entities = new ArrayList<>();
        DBCursor cursor = collection.find();
        for (DBObject obj : cursor) {
            Gson gson = new Gson();
            JsonElement jsonElement = gson.fromJson(obj.toString(), JsonElement.class);
            JsonObject jsonObject = jsonElement.getAsJsonObject();
            String id = jsonObject.get("_id").getAsString();
            String category = jsonObject.get("category").getAsString();
            String subcategory = jsonObject.get("subcategory").getAsString();
            JsonArray jsonArray = jsonObject.get("values").getAsJsonArray();
            ArrayList<String> values = new ArrayList<>();
            for (JsonElement element : jsonArray)
                values.add(element.getAsString());
            entities.add(new Entity(id, category, subcategory, values));
        }
    }
}
