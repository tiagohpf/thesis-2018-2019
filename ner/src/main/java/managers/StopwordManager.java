package managers;

import models.Stopword;
import org.mongodb.morphia.Datastore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class StopwordManager {
    private Datastore datastore;
    private static final Logger logger = LoggerFactory.getLogger(StopwordManager.class);

    public StopwordManager(Datastore datastore) {
        this.datastore = datastore;
    }

    public List<Stopword> getStopwords() {
        return datastore.find(Stopword.class).asList();
    }

    public List<Stopword> uploadStopwords() {
        List<Stopword> stopwords = new ArrayList<>();
        try {
            BufferedReader reader = new BufferedReader(new FileReader("data/stopwords.txt"));
            String word;
            while((word = reader.readLine()) != null) {
                Stopword stopword = new Stopword(word.toLowerCase().trim());
                datastore.save(stopword);
                stopwords.add(stopword);
            }
            reader.close();
        } catch (FileNotFoundException e) {
            logger.error("ERROR: File of Stopwords not found");
        } catch (IOException e) {
            logger.error("ERROR: Cannot upload Stopwords from file");
        }
        return stopwords;
    }
}
