package searchers;

class NumbersSearcher {
    static String searchWithNumbers(String word) {
        StringBuilder sb = new StringBuilder();
        if (word.matches("\\d+")) {
            if (word.length() == 9) {
                String starts_with = word.substring(0, 2);
                if ((starts_with.equals("91") || starts_with.equals("92") || starts_with.equals("93") || starts_with.equals("96")))
                    sb.append("telefone");
                else
                    sb.append("nif");
            }
            else if (word.length() == 4)
                sb.append("código");
            else
                sb.append("número");
        }
        return sb.toString();
    }
}
