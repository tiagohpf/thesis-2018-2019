package entities;

import java.util.ArrayList;

public class District extends Local{
    private ArrayList<Countie> counties;

    public District(String name) {
        super(name);
        counties = new ArrayList<>();
    }

    public void addCountie(Countie countie) {
        counties.add(countie);
    }

    public ArrayList<Countie> getCounties() {
        return counties;
    }

    @Override
    public String toString() {
        return "Country {" +
                "name='" + super.getName() + '\'' + ", " +
                "category='" + super.getSubject() + '\'' + ", " +
                "no. counties='" + counties.size() + '\'' +
                '}';
    }
}
