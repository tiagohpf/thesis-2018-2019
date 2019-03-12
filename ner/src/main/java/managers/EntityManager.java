package managers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mongodb.*;
import entities.Entity;
import filters.FilesAggregator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import parsers.JsonParser;
import searchers.Searcher;
import services.EntityService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class EntityManager implements EntityService {
    private DBCollection entitiesCollection;
    private ArrayList<Entity> entities;
    private StopWordsManager stopWordsManager;
    private static final Logger logger = LoggerFactory.getLogger(EntityManager.class);

    public EntityManager(DB database) {
        entitiesCollection = database.getCollection("entities");
        stopWordsManager = new StopWordsManager(database);
        stopWordsManager.loadStopWords();
        parseEntities();
    }

    @Override
    public ArrayList<Entity> createEntities() throws IOException {
        List<String> entitiesFiles = FilesAggregator.getAllJSONFiles("data/");
        ArrayList<Entity> res = new ArrayList<>();
        ArrayList<DBObject> entitiesPersist = new ArrayList<>();
        JsonParser parser;
        for (String file : entitiesFiles) {
            parser = new JsonParser(file);
            parser.parse();
            for (Entity entity : parser.getEntities()) {
                if (getEntitiesById(entity.getId()).size() == 0) {
                    entitiesPersist.add(new BasicDBObject("_id", entity.getId())
                            .append("category", entity.getCategory())
                            .append("subcategory", entity.getSubcategory())
                            .append("values", entity.getValues()));
                    entities.add(entity);
                    res.add(entity);
                }
            }
        }
        try {
            entitiesCollection.insert(entitiesPersist);
        } catch (CommandFailureException ex) {
            logger.error("ERROR: Entities not uploaded.");
        }
        return res;
    }

    @Override
    public JsonArray searchEntities(String sentence) {
        Searcher searcher = new Searcher(entities, stopWordsManager);
        searcher.search(sentence);
        return searcher.getEntitiesFound();
    }

    @Override
    public ArrayList<Entity> getEntities() {
        return entities;
    }

    private DBCursor getEntitiesById(String id) {
        BasicDBObject obj = new BasicDBObject("_id", id);
        return entitiesCollection.find(obj);
    }

    private void parseEntities() {
        entities = new ArrayList<>();
        DBCursor cursor = entitiesCollection.find();
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
