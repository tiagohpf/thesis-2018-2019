package filters;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

public class StopWords {
    private String filename;
    private ArrayList<String> stopwords;

    public StopWords(String filename) {
        this.filename = filename;
        stopwords = new ArrayList<>();
        loadStopWords();
    }

    public String removeStopWords(String sentence) {
        StringBuilder sb = new StringBuilder();
        String[] words = sentence.split("\\s");
        if (words.length > 0) {
            for (String word : words) {
                if (!stopwords.contains(word.toLowerCase()))
                    sb.append(word).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private void loadStopWords() {
        File file = new File(filename);
        try {
            Scanner sc = new Scanner(file);
            while (sc.hasNextLine()) {
                String word = sc.nextLine().trim().toLowerCase();
                if (!stopwords.contains(word))
                    stopwords.add(word);
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.err.println(filename + " not found.");
        }
    }
}
