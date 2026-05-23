import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioEngine } from '../index.js';

// Mock Web Audio API
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
  }
}

class MockAudioBuffer implements AudioBuffer {
  sampleRate = 44100;
  length = 44100;
  duration = 1;
  numberOfChannels = 2;
  getChannelData() { return new Float32Array(0); }
  copyFromChannel() {}
  copyToChannel() {}
}

class MockAudioBufferSourceNode extends EventTarget implements AudioBufferSourceNode {
  buffer: AudioBuffer | null = null;
  detune = { value: 0 } as unknown as AudioParam;
  loop = false;
  loopEnd = 0;
  loopStart = 0;
  playbackRate = { value: 1 } as unknown as AudioParam;
  onended: ((this: AudioScheduledSourceNode, ev: Event) => any) | null = null;
  context = {} as unknown as BaseAudioContext;
  numberOfInputs = 0;
  numberOfOutputs = 1;
  channelCount = 2;
  channelCountMode = 'max' as const;
  channelInterpretation = 'speakers' as const;
  connect() { return {} as unknown as AudioNode; }
  disconnect() {}
  start() {
    if (this.onended) {
      setTimeout(() => this.onended!(new Event('ended')), 10);
    }
  }
  stop() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockGainNode implements GainNode {
  gain = { value: 1 } as unknown as AudioParam;
  context = {} as unknown as BaseAudioContext;
  numberOfInputs = 1;
  numberOfOutputs = 1;
  channelCount = 2;
  channelCountMode = 'max' as const;
  channelInterpretation = 'speakers' as const;
  connect() { return {} as unknown as AudioNode; }
  disconnect() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockStereoPannerNode implements StereoPannerNode {
  pan = { value: 0 } as unknown as AudioParam;
  context = {} as unknown as BaseAudioContext;
  numberOfInputs = 1;
  numberOfOutputs = 1;
  channelCount = 2;
  channelCountMode = 'max' as const;
  channelInterpretation = 'speakers' as const;
  connect() { return {} as unknown as AudioNode; }
  disconnect() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockAudioContext implements AudioContext {
  audioWorklet = {} as unknown as AudioWorklet;
  baseLatency = 0;
  currentTime = 0;
  destination = {} as unknown as AudioDestinationNode;
  listener = {} as unknown as AudioListener;
  onstatechange = null;
  sampleRate = 44100;
  state = 'running' as const;
  outputLatency = 0;
  getOutputTimestamp() { return { contextTime: 0, performanceTime: 0 }; }
  createBuffer() { return new MockAudioBuffer(); }
  createBufferSource() { return new MockAudioBufferSourceNode(); }
  createGain() { return new MockGainNode(); }
  createStereoPanner() { return new MockStereoPannerNode(); }
  createAnalyser() { return {} as unknown as AnalyserNode; }
  createBiquadFilter() { return {} as unknown as BiquadFilterNode; }
  createChannelMerger() { return {} as unknown as ChannelMergerNode; }
  createChannelSplitter() { return {} as unknown as ChannelSplitterNode; }
  createConstantSource() { return {} as unknown as ConstantSourceNode; }
  createConvolver() { return {} as unknown as ConvolverNode; }
  createDelay() { return {} as unknown as DelayNode; }
  createDynamicsCompressor() { return {} as unknown as DynamicsCompressorNode; }
  createIIRFilter() { return {} as unknown as IIRFilterNode; }
  createMediaElementSource() { return {} as unknown as MediaElementAudioSourceNode; }
  createMediaStreamDestination() { return {} as unknown as MediaStreamAudioDestinationNode; }
  createMediaStreamSource() { return {} as unknown as MediaStreamAudioSourceNode; }
  createOscillator() { return {} as unknown as OscillatorNode; }
  createPanner() { return {} as unknown as PannerNode; }
  createPeriodicWave() { return {} as unknown as PeriodicWave; }
  createScriptProcessor() { return {} as unknown as ScriptProcessorNode; }
  createWaveShaper() { return {} as unknown as WaveShaperNode; }
  decodeAudioData() { return Promise.resolve(new MockAudioBuffer()); }
  resume() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

describe('AudioEngine', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  it('creates context lazily', () => {
    const engine = new AudioEngine();
    expect(engine.masterVolume).toBe(1);
  });

  it('registers and plays a buffer', () => {
    const engine = new AudioEngine();
    const buffer = new MockAudioBuffer();
    engine.registerBuffer('sfx', buffer);
    const source = engine.play('sfx');
    expect(source).not.toBeNull();
  });

  it('returns null for missing sound', () => {
    const engine = new AudioEngine();
    const source = engine.play('missing');
    expect(source).toBeNull();
  });

  it('sets master volume', () => {
    const engine = new AudioEngine();
    engine.setMasterVolume(0.5);
    expect(engine.masterVolume).toBe(0.5);
  });

  it('mutes and unmutes', () => {
    const engine = new AudioEngine();
    engine.setMuted(true);
    expect(engine.muted).toBe(true);
    engine.setMuted(false);
    expect(engine.muted).toBe(false);
  });

  it('stops all sounds', () => {
    const engine = new AudioEngine();
    const buffer = new MockAudioBuffer();
    engine.registerBuffer('sfx', buffer);
    engine.play('sfx');
    engine.stopAll();
    expect(engine['_activeSources'].size).toBe(0);
  });

  it('destroys cleanly', () => {
    const engine = new AudioEngine();
    engine.destroy();
    expect(engine['_sounds'].size).toBe(0);
  });
});
