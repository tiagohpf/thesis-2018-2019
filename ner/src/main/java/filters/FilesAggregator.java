package filters;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class FilesAggregator {

    private FilesAggregator() {}

    public static List<String> getAllJSONFiles(String path) {
        ArrayList<String> files = new ArrayList<>();
        File data = new File(path);
        if (data.exists()) {
            for (String file : Objects.requireNonNull(data.list())) {
                File f = new File(path + file);
                if (f.exists()) {
                    if (f.isFile() && file.endsWith(".json"))
                        files.add(path + file);
                    else if (f.isDirectory())
                        files.addAll(getAllJSONFiles(path + file + "/"));
                }
            }
        }
        return files;
    }
}
