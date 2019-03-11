package parsers;

import entities.Countie;
import entities.District;
import entities.Entity;
import filters.StopWords;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class CountiesParser implements Parser {
    private String filename;
    private ArrayList<Countie> counties;
    private ArrayList<District> districts;
    private StopWords stopWords;

    public CountiesParser(String filename, StopWords stopWords) {
        this.filename = filename;
        this.stopWords = stopWords;
        counties = new ArrayList<>();
        districts = new ArrayList<>();
    }

    public void parseEntities() {
        File file = new File(filename);
        try {
            Scanner sc = new Scanner(file);
            sc.nextLine();
            sc.nextLine();
            sc.nextLine();
            while (sc.hasNextLine()) {
                String[] lines = sc.nextLine().split("\\s\\s+");
                if (lines.length == 2) {
                    String line_county = lines[0].toLowerCase();
                    Countie countie = new Countie(stopWords.removeStopWords(line_county));
                    String line_district = lines[1].toLowerCase();
                    District district = new District(stopWords.removeStopWords(line_district));
                    addNewData(countie, district);
                }
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.err.println(filename + " not found.");
        }
    }

    public ArrayList<Entity> getAll() {
        ArrayList<Entity> entities = new ArrayList<>();
        entities.addAll(districts);
        entities.addAll(counties);
        return entities;
    }

    private void addNewData(Countie countie, District district) {
        if (!districtInList(district)) {
            district.addCountie(countie);
            counties.add(countie);
            districts.add(district);
        } else if (!countieInList(countie) && !countieInDistrict(countie, district)) {
            for (District d : districts) {
                if (d.getId().equals(district.getId())) {
                    d.addCountie(countie);
                    counties.add(countie);
                }
            }
        }
    }

    private boolean districtInList(District district) {
        for (District d : districts) {
            if (d.getId().equals(district.getId()))
                return true;
        }
        return false;
    }

    private boolean countieInList(Countie countie) {
        for (Countie c : counties) {
            if (c.getId().equals(countie.getId()))
                return true;
        }
        return false;
    }

    private boolean countieInDistrict(Countie countie, District district) {
        for (Countie c : district.getCounties()) {
            if (c.getId().equals(countie.getId()))
                return true;
        }
        return false;
    }
}
