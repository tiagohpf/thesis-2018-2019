package filters;

import entities.Entity;
import java.util.ArrayList;

public class EntitiesReducer {
    // Remove some ambiguities
    public static void unifyEntities(ArrayList<Entity> original, ArrayList<Entity> general) {
        for (Entity entity : general) {
            if (!entityExists(original, entity))
                original.add(entity);
        }
    }

    private static boolean entityExists(ArrayList<Entity> original, Entity entity) {
        boolean exists = false;
        for (Entity e : original) {
            if (e.getName().equals(entity.getName())) {
                exists = true;
                break;
            }
        }
        return exists;
    }
}
