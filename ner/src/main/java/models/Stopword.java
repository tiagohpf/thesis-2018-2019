package models;

import org.mongodb.morphia.annotations.Entity;
import org.mongodb.morphia.annotations.Id;

@Entity(value = "stopwords", noClassnameStored = true)
public class Stopword {
    @Id
    public String id;

    public Stopword() { }

    public Stopword(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public String toString() {
        return "Stopword{" +
                "id='" + id + '\'' +
                '}';
    }
}
