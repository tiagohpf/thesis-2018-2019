package entities;

public class Entity {
    private String name;
    private String subject;
    private String subsubject;


    public Entity() { }

    public Entity(String name, String subject) {
        this.name = name;
        this.subject = subject;
    }

    public Entity(String name, String subject, String subsubject) {
        this.name = name;
        this.subject = subject;
        this.subsubject = subsubject;
    }

    public String getName() {
        return name;
    }

    public String getSubject() {
        return subject;
    }

    public String getSubsubject() { return subsubject; }

    public void setName(String name) {
        this.name = name;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    @Override
    public String toString() {
        return "{name='" + name + '\'' +
                ", subject='" + subject + '\'' +
                ", subsubject='" + subsubject + '\'' +
                '}';
    }
}
