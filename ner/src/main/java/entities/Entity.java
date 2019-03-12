package entities;

import java.util.ArrayList;

public class Entity {
    private String id;
    private String category;
    private String subcategory;
    private ArrayList<String> values;

    public Entity(String id, String category, String subcategory, ArrayList<String> values) {
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

    public String getSubcategory() { return subcategory; }

    public ArrayList<String> getValues() {
        return values;
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
