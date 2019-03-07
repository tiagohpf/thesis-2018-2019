package parsers;

import entities.Area;
import entities.City;
import entities.Country;
import entities.Entity;
import filters.StopWords;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class CapitalsParser implements Parser {
    private String filename;
    private ArrayList<Country> countries;
    private ArrayList<City> capitals;
    private ArrayList<Area> areas;
    private StopWords stopWords;

    public CapitalsParser(String filename, StopWords stopWords) {
        this.filename = filename;
        this.stopWords = stopWords;
        countries = new ArrayList<>();
        capitals = new ArrayList<>();
        areas = new ArrayList<>();
    }

    public void parseEntities() {
        File file = new File(filename);
        try {
            Scanner sc = new Scanner(file);
            while (sc.hasNextLine()) {
                String[] line = sc.nextLine().split(", ");
                String line_country = stopWords.removeStopWords(line[0]);
                String line_capital = stopWords.removeStopWords(line[1]);
                String line_area = stopWords.removeStopWords(line[2]);
                if (line_country.length() > 0 && line_capital.length() > 0 && line_area.length() > 0) {
                    Country country = new Country(line_country.toLowerCase());
                    City capital = new City(line_capital.toLowerCase());
                    Area area = new Area(line_area.toLowerCase());
                    country.setCapital(capital);
                    addNewData(country, capital, area);
                }
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.err.println(filename + " not found.");
        }
    }

    public ArrayList<Entity> getAll() {
        ArrayList<Entity> entities = new ArrayList<>();
        entities.addAll(areas);
        entities.addAll(countries);
        entities.addAll(capitals);
        return entities;
    }

    private void addNewData(Country country, City capital, Area area) {
        if (!areaInList(area)) {
            capitals.add(capital);
            area.addCountry(country);
            countries.add(country);
            areas.add(area);
        } else if (!countryInList(country) && !countryInArea(country, area)) {
            for (Area a : areas) {
                if (a.getName().equals(area.getName())) {
                    capitals.add(capital);
                    a.addCountry(country);
                    countries.add(country);
                    break;
                }
            }
        }
    }

    private boolean countryInList(Country country) {
        for (Country c : countries) {
            if (c.getName().equals(country.getName()))
                return true;
        }
        return false;
    }

    private boolean areaInList(Area area) {
        for (Area a : areas) {
            if (a.getName().equals(area.getName()))
                return true;
        }
        return false;
    }

    private boolean countryInArea(Country country, Area area) {
        for (Country c : area.getCountries()) {
            if (c.getName().equals(country.getName()))
                return true;
        }
        return false;
    }
}
