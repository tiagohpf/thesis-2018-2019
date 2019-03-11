package parsers;

import entities.Entity;
import filters.StopWords;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;

public class GeneralHandler extends DefaultHandler {
    private ArrayList<Entity> entities = new ArrayList<>();
    private Entity entity = new Entity();
    private boolean bEM = false;
    private StopWords stopWords;

    public GeneralHandler(StopWords stopWords) {
        this.stopWords = stopWords;
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        if (qName.equals("EM")) {
            entity = new Entity();
            String category = attributes.getValue("CATEG");
            entity.setCategory(category);
            bEM = true;
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        if (qName.equals("EM")) {
            entities.add(entity);
            bEM = false;
        }
    }

    @Override
    public void characters(char ch[], int start, int length) throws SAXException {
        if (bEM) {
            String name = filterName(new String(ch, start, length));
            entity.setId(name);
        }
    }

    public ArrayList<Entity> getEntities() {
        return entities;
    }

    private String filterName(String name) {
        StringBuilder sb = new StringBuilder();
        // The name of the Book should stay intact
        if (name.length() > 0 && entity.getCategory() != "OBRA") {
            String new_name = stopWords.removeStopWords(name);
            sb.append(new_name);
        }
        else
            sb.append(name);
        return sb.toString();
    }
}
