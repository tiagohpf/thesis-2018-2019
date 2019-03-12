package services;

import com.google.gson.JsonArray;
import entities.Entity;

import java.io.IOException;
import java.util.ArrayList;

public interface EntityService {
    ArrayList<Entity> createEntities() throws IOException;
    ArrayList<Entity> getEntities();
    JsonArray searchEntities(String sentence);
}
