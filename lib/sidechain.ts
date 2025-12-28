/**
 * Sidechain Compression Utilities
 * Ducking effect where one signal controls the compression of another
 * Critical for Lo-Fi and DJ mixing (kick ducking other elements)
 */

// Sidechain compression utilities

/**
 * Apply sidechain compression to audio buffer
 * This simulates sidechain by analyzing the audio and ducking based on amplitude
 * In a real scenario, you'd have a separate sidechain input signal
 */
/**
 * Apply sidechain compression with envelope follower
 * Creates a ducking effect based on the audio's own amplitude
 * Simulates kick drum ducking other elements (classic Lo-Fi/DJ technique)
 */
export async function applySidechainCompressionEnvelope(
  audioBuffer: AudioBuffer,
  threshold: number,
  ratio: number,
  attack: number,
  release: number,
  depth: number
): Promise<AudioBuffer> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  // Create new buffer for processed audio
  const processedBuffer = new AudioBuffer({
    numberOfChannels,
    length,
    sampleRate,
  });

  // Process each channel
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = processedBuffer.getChannelData(channel);

    let envelope = 0;
    // Envelope follower coefficients
    const attackCoeff = attack > 0 ? Math.exp(-1 / (attack * sampleRate)) : 0;
    const releaseCoeff = release > 0 ? Math.exp(-1 / (release * sampleRate)) : 0;
    
    // Convert threshold from dB to linear (0-1 range)
    const thresholdLinear = Math.pow(10, threshold / 20);

    for (let i = 0; i < length; i++) {
      const input = inputData[i];
      const absInput = Math.abs(input);

      // Envelope follower (simulates sidechain detection)
      // Follows the amplitude of the signal
      if (absInput > envelope) {
        // Attack phase
        envelope = absInput + (envelope - absInput) * attackCoeff;
      } else {
        // Release phase
        envelope = absInput + (envelope - absInput) * releaseCoeff;
      }

      // Calculate gain reduction based on envelope exceeding threshold
      let gain = 1.0;
      if (envelope > thresholdLinear) {
        // Convert to dB
        const envelopeDb = 20 * Math.log10(envelope + 0.0001);
        const overThreshold = envelopeDb - threshold;
        
        // Calculate compression gain reduction
        const gainReductionDb = overThreshold - (overThreshold / ratio);
        const gainReductionLinear = Math.pow(10, -gainReductionDb / 20);
        
        // Apply depth (how much sidechain ducking)
        gain = 1 - (1 - gainReductionLinear) * depth;
      }

      outputData[i] = input * gain;
    }
  }

  // Render through offline context to ensure proper format
  const offlineContext = new OfflineAudioContext(
    numberOfChannels,
    length,
    sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = processedBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return await offlineContext.startRendering();
}


