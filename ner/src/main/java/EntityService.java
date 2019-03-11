import com.google.gson.JsonArray;
import entities.Entity;

import java.util.ArrayList;

public interface EntityService {
    ArrayList<Entity> createEntities();
    ArrayList<Entity> getEntities();
    JsonArray searchEntities(String sentence);
}
