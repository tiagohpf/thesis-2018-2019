from pyAudioAnalysis import audioAnalysis as audioAnalysis
from pydub import AudioSegment


class AudioTransformer:
    def __init__(self, file):
        self.audio_segment = AudioSegment.from_wav(file)

    def change_volume(self, volume):
        self.audio_segment = self.audio_segment + volume

    def change_speed(self, speed):
        edited_file = self.audio_segment._spawn(self.audio_segment.raw_data,
                                                overrides={"frame_rate": int(self.audio_segment.frame_rate * speed)})
        self.audio_segment = edited_file.set_frame_rate(self.audio_segment.frame_rate)

    def get_duration(self):
        return int(round(self.audio_segment.duration_seconds))

    def get_audio_segment(self):
        return self.audio_segment
