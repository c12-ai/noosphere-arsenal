"""Local Kokoro TTS: python kokoro_tts.py <model_dir> <voice> <text_file> <out.wav>"""
import sys
import soundfile as sf
from kokoro_onnx import Kokoro

model_dir, voice, text_file, out = sys.argv[1:5]
kokoro = Kokoro(f"{model_dir}/kokoro-v1.0.onnx", f"{model_dir}/voices-v1.0.bin")
samples, rate = kokoro.create(open(text_file).read(), voice=voice, speed=1.0, lang="en-us")
sf.write(out, samples, rate)
