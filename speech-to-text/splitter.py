class Splitter:
    def __init__(self, associations):
        self.associations = self.reduce_associations(associations)
        self.speakers = list(self.associations.values())
        self.splitted_files = []

    @staticmethod
    def reduce_associations(associations):
        reduced_associations = dict()
        last_timestamp = 0
        last_speaker = -1
        for association in associations:
            current_speaker = associations[association]
            if association == min(associations):
                last_timestamp = association
                last_speaker = current_speaker
            else:
                if association != last_timestamp and current_speaker != last_speaker:
                    reduced_associations[last_timestamp] = last_speaker
                    last_timestamp = association
                    last_speaker = current_speaker
        return reduced_associations

    def split_audio(self, audio_segment, filename):
        filename = filename.replace('.wav', '')
        last_timestamp = 0
        n = 0
        export = False
        for association in self.associations:
            if association == min(self.associations):
                cut_audio = audio_segment[: 1000 * association]
                last_timestamp = association
            elif association == max(self.associations):
                if association != last_timestamp:
                    cut_audio = audio_segment[1000 * last_timestamp: 1000 * association]
                    name = filename + "_cut_" + str(n) + ".wav"
                    cut_audio.export(name, format="wav")
                    self.splitted_files.append(name)
                    n += 1
                cut_audio = audio_segment[1000 * association:]
                export = True
            else:
                cut_audio = audio_segment[1000 * last_timestamp: 1000 * association]
                last_timestamp = association
                export = True
            if export:
                name = filename + "_cut_" + str(n) + ".wav"
                cut_audio.export(name, format="wav")
                self.splitted_files.append(name)
                n += 1
                export = False

    def get_splitted_files(self):
        return self.splitted_files

    def get_speakers(self):
        size = len(list(set(self.speakers)))
        self.speakers = [x + size for x in self.speakers]
        for i in range(0, size):
            actual_value = self.speakers[i]
            self.speakers = [i if x == actual_value else x for x in self.speakers]
        return self.speakers
