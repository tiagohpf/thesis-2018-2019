import entities.Entity;

import java.util.ArrayList;
import java.util.Map;

public interface EntityService {
    ArrayList<Entity> createEntities();
    ArrayList<Entity> getEntities();
    Map<String, String> searchEntities(String sentence);
}
