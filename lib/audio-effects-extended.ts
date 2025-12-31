/**
 * Extended audio effects processing functions
 * Professional-grade effect implementations
 */

/**
 * Apply chorus effect to audio buffer
 */
export function applyChorus(
  audioBuffer: AudioBuffer,
  rate: number,
  depth: number,
  feedback: number,
  delay: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  const delaySamples = Math.floor((delay / 1000) * sampleRate);
  const maxDelay = delaySamples + Math.floor((depth * delaySamples));
  const delayBuffer = new Float32Array(maxDelay * numberOfChannels);
  let delayIndex = 0;

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    const channelDelayBuffer = new Float32Array(maxDelay);
    let channelDelayIndex = 0;

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const lfo = Math.sin(2 * Math.PI * rate * time);
      const currentDelay = delaySamples + Math.floor(lfo * depth * delaySamples);
      
      const delayedSample = channelDelayBuffer[(channelDelayIndex - currentDelay + maxDelay) % maxDelay] || 0;
      const input = inputData[i];
      const output = input + delayedSample * (1 - feedback);
      
      channelDelayBuffer[channelDelayIndex] = input + output * feedback;
      channelDelayIndex = (channelDelayIndex + 1) % maxDelay;
      
      outputData[i] = output;
    }
  }

  return outputBuffer;
}

/**
 * Apply flanger effect to audio buffer
 */
export function applyFlanger(
  audioBuffer: AudioBuffer,
  rate: number,
  depth: number,
  feedback: number,
  delay: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  const maxDelay = Math.floor((delay / 1000) * sampleRate) + Math.floor(depth * (delay / 1000) * sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    const delayBuffer = new Float32Array(maxDelay);
    let delayIndex = 0;

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const lfo = Math.sin(2 * Math.PI * rate * time);
      const currentDelay = Math.floor((delay / 1000) * sampleRate + lfo * depth * (delay / 1000) * sampleRate);
      
      const delayedSample = delayBuffer[(delayIndex - currentDelay + maxDelay) % maxDelay] || 0;
      const input = inputData[i];
      const output = input + delayedSample;
      
      delayBuffer[delayIndex] = input + output * feedback;
      delayIndex = (delayIndex + 1) % maxDelay;
      
      outputData[i] = output;
    }
  }

  return outputBuffer;
}

/**
 * Apply phaser effect to audio buffer
 */
export function applyPhaser(
  audioBuffer: AudioBuffer,
  rate: number,
  depth: number,
  feedback: number,
  stages: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  const centerFreq = 1000;
  const range = 2000;

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    const allpassDelays: Float32Array[] = [];
    const allpassIndices: number[] = [];
    
    // Initialize allpass filters
    for (let stage = 0; stage < stages; stage++) {
      allpassDelays.push(new Float32Array(1024));
      allpassIndices.push(0);
    }

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const lfo = Math.sin(2 * Math.PI * rate * time);
      const freq = centerFreq + lfo * depth * range;
      
      let sample = inputData[i];
      
      // Apply allpass filters in series
      for (let stage = 0; stage < stages; stage++) {
        const delay = Math.floor((1 / freq) * sampleRate * 0.001);
        const delayBuffer = allpassDelays[stage];
        const delayIndex = allpassIndices[stage];
        
        const delayed = delayBuffer[(delayIndex - delay + delayBuffer.length) % delayBuffer.length] || 0;
        const output = -sample + delayed;
        delayBuffer[delayIndex] = sample + delayed * feedback;
        allpassIndices[stage] = (delayIndex + 1) % delayBuffer.length;
        
        sample = output;
      }
      
      outputData[i] = inputData[i] + sample * 0.5;
    }
  }

  return outputBuffer;
}

/**
 * Apply tremolo effect to audio buffer
 */
export function applyTremolo(
  audioBuffer: AudioBuffer,
  rate: number,
  depth: number,
  waveform: 'sine' | 'square' | 'triangle'
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let lfo: number;
      
      const phase = (2 * Math.PI * rate * time) % (2 * Math.PI);
      
      switch (waveform) {
        case 'sine':
          lfo = Math.sin(phase);
          break;
        case 'square':
          lfo = phase < Math.PI ? 1 : -1;
          break;
        case 'triangle':
          lfo = phase < Math.PI ? (2 * phase / Math.PI) - 1 : 1 - (2 * (phase - Math.PI) / Math.PI);
          break;
        default:
          lfo = Math.sin(phase);
      }
      
      const modulation = 1 - (depth * (1 - lfo) / 2);
      outputData[i] = inputData[i] * modulation;
    }
  }

  return outputBuffer;
}

/**
 * Apply vibrato effect to audio buffer
 */
export function applyVibrato(
  audioBuffer: AudioBuffer,
  rate: number,
  depth: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  const maxDelay = Math.floor((depth * 0.01) * sampleRate); // Max 10ms delay
  const delayBuffer = new Float32Array(maxDelay * numberOfChannels);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    const channelDelayBuffer = new Float32Array(maxDelay);
    let delayIndex = 0;

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const lfo = Math.sin(2 * Math.PI * rate * time);
      const currentDelay = Math.floor(lfo * depth * maxDelay);
      
      const delayedSample = channelDelayBuffer[(delayIndex - currentDelay + maxDelay) % maxDelay] || inputData[i];
      channelDelayBuffer[delayIndex] = inputData[i];
      delayIndex = (delayIndex + 1) % maxDelay;
      
      outputData[i] = delayedSample;
    }
  }

  return outputBuffer;
}

/**
 * Apply noise gate to audio buffer
 */
export function applyNoiseGate(
  audioBuffer: AudioBuffer,
  threshold: number,
  attack: number,
  release: number,
  hold: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  const thresholdLinear = Math.pow(10, threshold / 20);
  const attackSamples = Math.floor((attack / 1000) * sampleRate);
  const releaseSamples = Math.floor((release / 1000) * sampleRate);
  const holdSamples = Math.floor((hold / 1000) * sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);
    
    let gateState = 0; // 0 = closed, 1 = open
    let holdCounter = 0;
    let envelope = 0;

    for (let i = 0; i < length; i++) {
      const amplitude = Math.abs(inputData[i]);
      const thresholdExceeded = amplitude > thresholdLinear;

      if (thresholdExceeded) {
        holdCounter = holdSamples;
        if (gateState === 0) {
          // Opening
          envelope = Math.min(1, envelope + 1 / attackSamples);
          if (envelope >= 1) {
            gateState = 1;
          }
        } else {
          envelope = 1;
        }
      } else {
        if (holdCounter > 0) {
          holdCounter--;
          envelope = 1;
        } else {
          // Closing
          envelope = Math.max(0, envelope - 1 / releaseSamples);
          if (envelope <= 0) {
            gateState = 0;
          }
        }
      }

      outputData[i] = inputData[i] * envelope;
    }
  }

  return outputBuffer;
}

/**
 * Apply stereo widener to audio buffer
 */
export function applyStereoWidener(
  audioBuffer: AudioBuffer,
  width: number,
  balance: number
): AudioBuffer {
  if (audioBuffer.numberOfChannels < 2) {
    return audioBuffer; // Need stereo for widening
  }

  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels: 2,
    length,
    sampleRate,
  });

  const leftInput = audioBuffer.getChannelData(0);
  const rightInput = audioBuffer.getChannelData(1);
  const leftOutput = outputBuffer.getChannelData(0);
  const rightOutput = outputBuffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const mid = (leftInput[i] + rightInput[i]) / 2;
    const side = (leftInput[i] - rightInput[i]) / 2;
    
    const widenedSide = side * width;
    
    leftOutput[i] = (mid + widenedSide) * (1 - Math.max(0, balance));
    rightOutput[i] = (mid - widenedSide) * (1 + Math.min(0, balance));
  }

  return outputBuffer;
}

/**
 * Apply pan to audio buffer
 */
export function applyPan(
  audioBuffer: AudioBuffer,
  position: number
): AudioBuffer {
  if (audioBuffer.numberOfChannels < 2) {
    return audioBuffer; // Need stereo for panning
  }

  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels: 2,
    length,
    sampleRate,
  });

  const leftInput = audioBuffer.getChannelData(0);
  const rightInput = audioBuffer.getChannelData(1);
  const leftOutput = outputBuffer.getChannelData(0);
  const rightOutput = outputBuffer.getChannelData(1);

  // Pan law: -3dB center, constant power
  const leftGain = Math.cos((position + 1) * Math.PI / 4);
  const rightGain = Math.sin((position + 1) * Math.PI / 4);

  for (let i = 0; i < length; i++) {
    leftOutput[i] = leftInput[i] * leftGain;
    rightOutput[i] = rightInput[i] * rightGain;
  }

  return outputBuffer;
}

/**
 * Apply auto-pan to audio buffer
 */
export function applyAutoPan(
  audioBuffer: AudioBuffer,
  rate: number,
  depth: number,
  waveform: 'sine' | 'square' | 'triangle'
): AudioBuffer {
  if (audioBuffer.numberOfChannels < 2) {
    return audioBuffer;
  }

  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels: 2,
    length,
    sampleRate,
  });

  const leftInput = audioBuffer.getChannelData(0);
  const rightInput = audioBuffer.getChannelData(1);
  const leftOutput = outputBuffer.getChannelData(0);
  const rightOutput = outputBuffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    let lfo: number;
    
    const phase = (2 * Math.PI * rate * time) % (2 * Math.PI);
    
    switch (waveform) {
      case 'sine':
        lfo = Math.sin(phase);
        break;
      case 'square':
        lfo = phase < Math.PI ? 1 : -1;
        break;
      case 'triangle':
        lfo = phase < Math.PI ? (2 * phase / Math.PI) - 1 : 1 - (2 * (phase - Math.PI) / Math.PI);
        break;
      default:
        lfo = Math.sin(phase);
    }
    
    const panPosition = lfo * depth;
    const leftGain = Math.cos((panPosition + 1) * Math.PI / 4);
    const rightGain = Math.sin((panPosition + 1) * Math.PI / 4);
    
    leftOutput[i] = leftInput[i] * leftGain;
    rightOutput[i] = rightInput[i] * rightGain;
  }

  return outputBuffer;
}

/**
 * Apply ring modulator to audio buffer
 */
export function applyRingModulator(
  audioBuffer: AudioBuffer,
  frequency: number,
  depth: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const carrier = Math.sin(2 * Math.PI * frequency * time);
      outputData[i] = inputData[i] * carrier * depth + inputData[i] * (1 - depth);
    }
  }

  return outputBuffer;
}

/**
 * Apply exciter (harmonic enhancement) to audio buffer
 */
export function applyExciter(
  audioBuffer: AudioBuffer,
  amount: number,
  frequency: number,
  harmonics: number
): AudioBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  
  const outputBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      const sample = inputData[i];
      // Add harmonics above the frequency threshold
      const enhanced = sample + (sample * sample * sample) * harmonics * amount;
      outputData[i] = sample * (1 - amount) + enhanced * amount;
    }
  }

  return outputBuffer;
}

