import entities.Entity;
import entities.Intent;
import filters.EntitiesReducer;
import filters.FilesAggregator;
import filters.StopWords;
import parsers.CapitalsParser;
import parsers.CountiesParser;
import parsers.GeneralInfoParser;
import parsers.JsonParser;
import searchers.Searcher;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        ArrayList<Intent> intents = new ArrayList<>();

        StopWords stopWords = new StopWords("data/stopwords.txt");

        CountiesParser counties = new CountiesParser("data/entities/counties.txt", stopWords);
        counties.parseEntities();

        ArrayList<Entity> entities = new ArrayList<>(counties.getAll());

        CapitalsParser capitals = new CapitalsParser("data/entities/capitals.txt", stopWords);
        capitals.parseEntities();
        entities.addAll(capitals.getAll());

        GeneralInfoParser general = new GeneralInfoParser("data/entities/general.xml", stopWords);
        general.parseEntities();

        ArrayList<String> entities_files = FilesAggregator.getAllJSONFiles("data/entities/");
        for (String file : entities_files) {
            JsonParser parser = new JsonParser(file, stopWords);
            parser.parseEntities();
            entities.addAll(parser.getEntities());
        }

        ArrayList<String> intents_files = FilesAggregator.getAllJSONFiles("data/intents/");
        for (String file : intents_files) {
            JsonParser parser = new JsonParser(file, stopWords);
            parser.parseIntents();
            intents.addAll(parser.getIntents());
        }

        ArrayList<Entity> general_entities = general.getEntities();
        EntitiesReducer.unifyEntities(entities, general_entities);

        StringBuilder msg = new StringBuilder();
        try {
            FileWriter json_file = new FileWriter("json_results.json");
            msg.append("[\n");
            Searcher searcher = new Searcher(entities, intents, stopWords);
            Scanner sc = new Scanner(System.in);
            String sentence = " ";
            String result;
            while (sentence.length() > 0) {
                System.out.print("» ");
                sentence = sc.nextLine().trim();
                result = searcher.search(sentence);
                if (sentence.length() > 0 && result.length() > 0) {
                    msg.append(", ").append(result);
                    System.out.println(result);
                }
            }
            //json_file.write(msg.toString() + "\n]");
            //json_file.write("{}");
            //json_file.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
