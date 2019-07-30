package models;

import org.mongodb.morphia.annotations.Id;
import org.mongodb.morphia.annotations.Entity;

import java.util.List;

@Entity(value = "entities", noClassnameStored = true)
public class Subject {
    @Id
    private String id;
    private String category;
    private String subcategory;
    private List<String> values;

    public Subject() { }

    public Subject(String id, String category, String subcategory, List<String> values) {
        this.id = id;
        this.category = category;
        this.subcategory = subcategory;
        this.values = values;
    }

    public String getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) { this.values = values; }

    @Override
    public String toString() {
        return "Subject{" +
                "id='" + id + '\'' +
                ", category='" + category + '\'' +
                ", subcategory='" + subcategory + '\'' +
                ", values=" + values +
                '}';
    }
}
