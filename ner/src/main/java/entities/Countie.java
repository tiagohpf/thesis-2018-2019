package entities;

public class Countie extends Local {

    public Countie(String name) {
        super(name);
    }

    @Override
    public String toString() {
        return "Countie {" +
                "name='" + super.getName() + '\'' +
                "category='" + super.getSubject() + '\'' + ", " +
                '}';
    }
}
