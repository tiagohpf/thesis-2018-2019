package entities;

public class Country extends Local{
    private City capital;

    public Country(String name) {
        super(name);
    }

    public City getCapital() {
        return capital;
    }

    public void setCapital(City capital) {
        this.capital = capital;
    }

    @Override
    public String toString() {
        return "Country {" +
                "name='" + super.getId() + '\'' + ", " +
                "category='" + super.getCategory() + '\'' + ", " +
                "capital='" + capital.getId() + '\'' +
                '}';
    }
}
