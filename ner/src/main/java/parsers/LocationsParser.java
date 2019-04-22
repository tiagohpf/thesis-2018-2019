package parsers;

import models.Subject;
import org.mongodb.morphia.Datastore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.*;

public class LocationsParser {
    public static Subject getLocations() {
        Logger logger = LoggerFactory.getLogger(LocationsParser.class);
        List<String> locations = new ArrayList<>(parseCountries(logger));
        locations.addAll(parseCounties(logger));
        return new Subject("locations", "locations", "general", locations);
    }

    private static Set<String> parseCountries(Logger logger) {
        Set<String> countries = new HashSet<>();
        try {
            Scanner sc = new Scanner(new File("data/locations/countries.csv"));
            while (sc.hasNextLine()) {
                String[] data = sc.nextLine().split(",");
                for (String element : data) {
                    if (element.trim().length() > 0)
                        countries.add(element.trim());
                }
            }
        } catch (FileNotFoundException e) {
            logger.error("ERROR: File of countries not found");
        }
        return countries;
    }

    private static Set<String> parseCounties(Logger logger) {
        Set<String> counties = new HashSet<>();
        try {
            Scanner sc = new Scanner(new File("data/locations/counties.txt"));
            while (sc.hasNextLine()) {
                String[] data = sc.nextLine().split("\\s{2}+");
                for (String element : data) {
                    if (element.trim().length() > 0)
                        counties.add(element.trim());
                }
            }
        } catch (FileNotFoundException e) {
            logger.error("ERROR: File of counties not found");
        }
        return counties;
    }
}
