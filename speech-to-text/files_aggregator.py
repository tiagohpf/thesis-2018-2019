import os


class FilesAggregator:
    def __init__(self):
        self.input_files = []

    def get_input_files(self):
        return self.input_files

    def collect_input_files(self, arg):
        files = []
        filename = str(arg).lstrip()
        if filename[-1] == '/':
            filename = filename[:-1]
        if os.path.exists(filename):
            if os.path.isfile(filename) and '.wav' in filename:
                files.append(filename)
            elif os.path.isdir(filename):
                for file in os.listdir(filename):
                    files += self.collect_input_files(filename + "/" + file)
        return files
