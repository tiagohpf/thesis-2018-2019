import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.mongodb.DB;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import filters.StopWords;
import searchers.Searcher;

import java.net.UnknownHostException;

import static spark.Spark.get;
import static spark.Spark.redirect;

public class EntitiesService {
    public static void main(String[] args) {
        try {
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            MongoClient client = new MongoClient(new MongoClientURI("mongodb://10.113.141.31:27017"));
            DB database = client.getDB("transcriptions");
            EntityManager manager = new EntityManager(database);

            // Todo: POST new entities
            // post("/addEntities, (req, resp) -> {});


            get("/createEntities", (req, resp) -> {
                resp.type("application/json");
                JsonElement data = null;
                try {
                    data = gson.toJsonTree(manager.createEntities());
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
                    data = gson.toJsonTree(manager.getEntities());
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
                    data = gson.toJsonTree(manager.searchEntities(req.params(":sentence")));
                } catch (Exception ex) {
                    ex.printStackTrace();
                    gson.toJson(new StandardResponse(StatusResponse.ERROR));
                }
                return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
                //return gson.toJson(new StandardResponse(StatusResponse.SUCCESS, data));
            });


            // Todo: POST and GET stopwords


        } catch (UnknownHostException e) {
            System.err.println("Unknown Host");
        }
    }
}
