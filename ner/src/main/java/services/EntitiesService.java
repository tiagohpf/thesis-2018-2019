package services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.mongodb.DB;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import managers.EntityManager;
import managers.StopWordsManager;
import responses.StandardResponse;
import responses.StatusResponse;

import java.net.UnknownHostException;

import static spark.Spark.get;

public class EntitiesService {
    public static void main(String[] args) {
        try {
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            MongoClient client = new MongoClient(new MongoClientURI("mongodb://10.113.141.31:27017"));
            DB database = client.getDB("transcriptions");
            EntityManager entityManager = new EntityManager(database);
            StopWordsManager stopWordsManager = new StopWordsManager(database);

            get("/createStopwords", (req, resp) -> {
               resp.type("application/json");
               JsonElement data = null;
               try {
                   data = gson.toJsonTree(stopWordsManager.createStopWords());
               } catch (Exception ex) {
                   gson.toJson(new StandardResponse(StatusResponse.ERROR));
               }
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            });

            get("/createEntities", (req, resp) -> {
                resp.type("application/json");
                JsonElement data = null;
                try {
                    data = gson.toJsonTree(entityManager.createEntities());
                } catch (Exception ex) {
                    ex.printStackTrace();
                    gson.toJson(new StandardResponse(StatusResponse.ERROR));
                }
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            });

            get("/getEntities", (req, resp) -> {
                resp.type("application/json");
                JsonElement data = null;
                try {
                    data = gson.toJsonTree(entityManager.getEntities());
                } catch (Exception ex) {
                    ex.printStackTrace();
                    gson.toJson(new StandardResponse(StatusResponse.ERROR));
                }
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            });

            get("/getEntities/:sentence", (req, resp) -> {
                resp.type("application/json");
                JsonElement data = null;
                try {
                    data = gson.toJsonTree(entityManager.searchEntities(req.params(":sentence")));
                } catch (Exception ex) {
                    ex.printStackTrace();
                    gson.toJson(new StandardResponse(StatusResponse.ERROR));
                }
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            });

        } catch (UnknownHostException e) {
            System.err.println("Unknown Host");
        }
    }
}
