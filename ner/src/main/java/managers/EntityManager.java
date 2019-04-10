package managers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import filters.FileAggregator;
import models.Subject;
import org.mongodb.morphia.Datastore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import searchers.Searcher;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

public class EntityManager {
    private Datastore datastore;
    private static final Logger logger = LoggerFactory.getLogger(EntityManager.class);

    public EntityManager(Datastore datastore) {
        this.datastore = datastore;
    }

    public List<Subject> getEntities() {
        return datastore.find(Subject.class).asList();
    }

    public List<Subject> uploadEntities() {
        List<Subject> entities = new ArrayList<>();
        List<String> jsonFiles = FileAggregator.getJSONFiles("data/");
        for (String filename : jsonFiles) {
            Gson gson = new GsonBuilder().create();
            try {
                Subject subject = gson.fromJson(new FileReader(filename), Subject.class);
                entities.add(subject);
                datastore.save(subject);
            } catch (FileNotFoundException e) {
                logger.error(String.format("ERROR: %s not found", filename));
            }
        }
        return entities;
    }

    public JsonArray searchEntities(String sentence) {
        Searcher searcher = new Searcher(datastore);
        return searcher.searchForEntities(sentence);
    }
}
