package entities;

import java.util.ArrayList;

public class Entity {
    private String id;
    private String category;
    private String subcategory;
    private ArrayList<String> values;


    public Entity() { }

    public Entity(String id, String category, ArrayList<String> values) {
        this.id = id;
        this.category = category;
        this.values = values;
    }


    public Entity(String id, String category, String subcategory, ArrayList<String> values) {
        this.id = id;
        this.category = category;
        this.subcategory = subcategory;
        this.values = values;
    }

    public Entity(String id, String category) {
        this.id = id;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public String getSubcategory() { return subcategory; }

    public ArrayList<String> getValues() {
        return values;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public void setValues(ArrayList<String> values) {
        this.values = values;
    }

    @Override
    public String toString() {
        return "Entity{" +
                "id='" + id + '\'' +
                ", category='" + category + '\'' +
                ", subcategory='" + subcategory + '\'' +
                ", values=" + values +
                '}';
    }
}
