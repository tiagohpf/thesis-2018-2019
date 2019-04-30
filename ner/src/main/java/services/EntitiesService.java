package services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.mongodb.MongoClient;
import managers.EntityManager;
import managers.SentenceManager;
import managers.StopwordManager;
import org.mongodb.morphia.Datastore;
import org.mongodb.morphia.Morphia;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import responses.StandardResponse;
import responses.StatusResponse;

import static spark.Spark.get;

public class EntitiesService {
    private final static  String responseType = "application/json";

    public static void main(String[] args) {
        Logger logger = LoggerFactory.getLogger(EntitiesService.class);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        Morphia morphia = new Morphia();
        MongoClient client = new MongoClient("10.113.141.31", 27017);
        Datastore datastore = morphia.createDatastore(client, "transcriptions");
        EntityManager entityManager = new EntityManager(datastore);
        StopwordManager stopwordManager = new StopwordManager(datastore);

        logger.info("Server Listening...");

        get("/getEntities", (req, resp) -> {
            resp.type(responseType);
            try {
                JsonElement data = gson.toJsonTree(entityManager.getEntities());
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            } catch (Exception ex) {
                logger.error("ERROR: Cannot get entities");
                return gson.toJson(new StandardResponse(StatusResponse.ERROR));
            }
        });

        get("/getEntities/:sentence", (req, resp) -> {
            resp.type(responseType);
            try {
                JsonElement data = gson.toJsonTree(entityManager.searchEntities(req.params(":sentence")));
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            } catch (Exception ex) {
                logger.error("ERROR: Cannot identify entities");
                return gson.toJson(new StandardResponse(StatusResponse.ERROR));
            }
        });

        get("/getStopwords", (req, resp) -> {
            resp.type(responseType);
            try {
                JsonElement data = gson.toJsonTree(stopwordManager.getStopwords());
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            } catch (Exception ex) {
                logger.error("ERROR: Cannot get stopwords");
                return gson.toJson(new StandardResponse(StatusResponse.ERROR));
            }
        });

        get("/uploadStopwords", (req, resp) -> {
            resp.type(responseType);
            try {
                JsonElement data = gson.toJsonTree(stopwordManager.uploadStopwords());
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            } catch (Exception ex) {
                logger.error("ERROR: Cannot upload entities");
                return gson.toJson(new StandardResponse(StatusResponse.ERROR));
            }
        });

        get("/removeStopwords/:sentence", (req, resp) -> {
            resp.type(responseType);
            try {
                JsonElement data = gson.toJsonTree(SentenceManager.removeStopWordsFromSentence(req.params(":sentence"), datastore));
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            } catch (Exception ex) {
                logger.error("ERROR: Cannot remove Stopwords");
                return gson.toJson(new StandardResponse(StatusResponse.ERROR));
            }
        });

        get("/uploadEntities", (req, resp) -> {
            resp.type(responseType);
            try {
                JsonElement data = gson.toJsonTree(entityManager.uploadEntities());
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            } catch (Exception ex) {
                logger.error("ERROR: Cannot upload entities");
                return gson.toJson(new StandardResponse(StatusResponse.ERROR));
            }
        });
    }
}
