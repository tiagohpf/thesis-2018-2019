package entities;

import java.util.ArrayList;

public class Area extends Local {
    private ArrayList<Country> countries;

    public Area(String name) {
        super(name);
        countries = new ArrayList<>();
    }

    public void addCountry(Country country) {
        countries.add(country);
    }

    public ArrayList<Country> getCountries() {
        return countries;
    }

    @Override
    public String toString() {
        return "Area {" +
                "name='" + super.getId() + '\'' + ", " +
                "category='" + super.getCategory() + '\'' + ", " +
                "no. countries='" + countries.size() + '\'' +
                '}';
    }
}
