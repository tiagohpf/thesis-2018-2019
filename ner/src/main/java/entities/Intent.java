package entities;

import java.util.ArrayList;

public class Intent {
    private String name;
    private ArrayList<String> entities;

    public Intent(String name, ArrayList<String> entities) {
        this.name = name;
        this.entities = entities;
    }

    public String getName() { return name; }

    public ArrayList<String> getEntities() {
        return entities;
    }

    @Override
    public String toString() {
        return "Intent{" +
                "name='" + name + '\'' +
                ", entities=" + entities +
                '}';
    }
}
