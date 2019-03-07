import getopt
import os
import sys


class ArgsParser:
    def __init__(self, argv):
        self.argv = argv
        self.input_files = []
        self.n_speakers = 0
        self.volume = 0
        self.speed = 1.0
        self.parse_args()

    def parse_args(self):
        try:
            opts, args = getopt.getopt(self.argv, "i:n:v:s:", ["input=", "nspeakers=", "volume=", "speed="])
            commands = [command for command, arg in opts]
            if len(commands) < 2 or '-i' not in commands or '-n' not in commands:
                print("You have to use args -i and -n")
                sys.exit(1)
        except getopt.GetoptError:
            print("usage: main.py -i <input> -n <no. speakers> (-v <increase volume>) (-s <speed>)")
            sys.exit(1)
        for opt, arg in opts:
            if opt in ("-i", "--input"):
                if arg[-1] is '/':
                    arg = arg[:-1]
                self.input_files = self.collect_input_files(arg)
                if not self.input_files:
                    print("File or dir not found")
                    sys.exit(1)
            if opt in ("-n", "--nspeakers"):
                self.n_speakers = int(arg)
                if self.n_speakers <= 0:
                    print("Error: Number of speakers should be greater than zero.")
                    sys.exit(1)
            if opt in ("-v", "--volume"):
                self.volume = int(arg)
            if opt in ("-s", "--speed"):
                self.speed = float(arg)

    def get_volume(self):
        return self.volume

    def get_speed(self):
        return self.speed

    def get_input_files(self):
        return self.input_files

    def get_number_speakers(self):
        return self.n_speakers

    def collect_input_files(self, arg):
        files = []
        filename = str(arg).lstrip()
        if os.path.exists(filename):
            if os.path.isfile(filename) and '.wav' in filename:
                files.append(filename)
            elif os.path.isdir(filename):
                for file in os.listdir(filename):
                    files += self.collect_input_files(filename + "/" + file)
        return files
