package entities;

public class City extends Local {

    public City(String name) {
        super(name);
    }

    @Override
    public String toString() {
        return "City {" +
                "name='" + super.getName() + '\'' + ", " +
                "category='" + super.getSubject() + '\'' + ", " +
                '}';
    }
}
