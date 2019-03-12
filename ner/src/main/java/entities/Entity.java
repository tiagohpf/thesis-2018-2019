package entities;

import java.util.List;

public class Entity {
    private String id;
    private String category;
    private String subcategory;
    private List<String> values;

    public Entity(String id, String category, String subcategory, List<String> values) {
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

    public List<String> getValues() {
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
