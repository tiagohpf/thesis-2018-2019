package parsers;

import entities.Entity;
import filters.StopWords;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

public class GeneralInfoParser implements Parser {
    private String filename;
    private StopWords stopWords;
    private ArrayList<Entity> entities;

    public GeneralInfoParser(String filename, StopWords stopWords) {
        this.filename = filename;
        this.stopWords = stopWords;
        entities = new ArrayList<>();
    }

    public void parseEntities() {
        try {
            File file = new File(filename);
            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();
            GeneralHandler generalHandler = new GeneralHandler(stopWords);
            saxParser.parse(file, generalHandler);
            // Modifications on original entities
            entities = generalHandler.getEntities();
            entities = removeLongEntities();
            entities = splitCategories();
            entities = removeDuplicates();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error with " + filename + ".");
        }
    }

    public ArrayList<Entity> getEntities() {
        return entities;
    }

    private ArrayList<Entity> removeLongEntities() {
        ArrayList<Entity> new_entities = new ArrayList<>();
        for (Entity entity : entities) {
            String category = entity.getCategory();
            String[] words = entity.getId().split("\\s");
            // Remove null sentences
            // Remove terms with more than 4 words (Order 3)
            // The name of the Book should stay intact
            if (entity.getId() != null && entity.getCategory() != null) {
                if (words.length <= 4 || category.equalsIgnoreCase("OBRA"))
                    new_entities.add(new Entity(entity.getId(), category, new ArrayList<>()));
                    //new_entities.add(new Entity(entity.getId(), category));
            }
        }
        return new_entities;
    }

    private ArrayList<Entity> removeDuplicates() {
        ArrayList<Entity> new_entities = new ArrayList<>();
        Set<String> set = new HashSet<>();
        for (Entity entity : entities) {
            // Combination of name and category
            if (set.add(entity.getId() + entity.getCategory()))
                new_entities.add(entity);
        }
        return new_entities;
    }

    // Trade: 1 instance and N categories for N instances and 1 category
    private ArrayList<Entity> splitCategories() {
        ArrayList<Entity> new_entities = new ArrayList<>();
        for (Entity entity : entities) {
            String name = entity.getId();
            String[] categories = entity.getCategory().split("\\|");
            for (String category : categories) {
                new_entities.add(new Entity(name.toLowerCase(), category.toLowerCase(), new ArrayList<>()));
                //new_entities.add(new Entity(name.toLowerCase(), category.toLowerCase()));
            }
        }
        return new_entities;
    }
}
