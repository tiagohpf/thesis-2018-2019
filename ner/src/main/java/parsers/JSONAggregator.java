package parsers;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class JSONAggregator {
    public static List<String> getJSONFiles(String path) {
        ArrayList<String> files = new ArrayList<>();
        File data = new File(path);
        if (data.exists()) {
            for (String file : Objects.requireNonNull(data.list())) {
                File f = new File(path + file);
                if (f.exists()) {
                    if (f.isFile() && file.endsWith(".json"))
                        files.add(path + file);
                    else if (f.isDirectory())
                        files.addAll(getJSONFiles(path + file + "/"));
                }
            }
        }
        return files;
    }
}
