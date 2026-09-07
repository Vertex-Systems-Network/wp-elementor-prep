import type { PixelDiffMetrics } from './validation-types';

export interface PixelBuffer {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

function round(value: number, digits = 4): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

/**
 * Deterministic raw RGBA comparison. Canvas decoding stays in plugin UI; this pure function is
 * independently unit-testable and defines the metrics contract used by the plugin runtime.
 */
export function comparePixelBuffers(
  before: PixelBuffer,
  after: PixelBuffer,
  channelTolerance: number,
): PixelDiffMetrics {
  const sameDimensions = before.width === after.width && before.height === after.height;
  const totalPixels = sameDimensions ? Math.max(0, before.width * before.height) : 0;

  if (!sameDimensions) {
    return {
      sameDimensions: false,
      widthBefore: before.width,
      heightBefore: before.height,
      widthAfter: after.width,
      heightAfter: after.height,
      totalPixels,
      changedPixels: 0,
      changedPixelPct: 100,
      meanChannelDelta: 255,
      maxChannelDelta: 255,
      channelTolerance,
    };
  }

  const expectedLength = totalPixels * 4;
  if (before.data.length < expectedLength || after.data.length < expectedLength) {
    throw new Error('Pixel buffer length does not match RGBA dimensions.');
  }

  let changedPixels = 0;
  let sumChannelDelta = 0;
  let maxChannelDelta = 0;

  for (let pixel = 0; pixel < totalPixels; pixel += 1) {
    const offset = pixel * 4;
    let changed = false;

    for (let channel = 0; channel < 4; channel += 1) {
      const delta = Math.abs(Number(before.data[offset + channel] ?? 0) - Number(after.data[offset + channel] ?? 0));
      sumChannelDelta += delta;
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      if (delta > channelTolerance) changed = true;
    }

    if (changed) changedPixels += 1;
  }

  return {
    sameDimensions: true,
    widthBefore: before.width,
    heightBefore: before.height,
    widthAfter: after.width,
    heightAfter: after.height,
    totalPixels,
    changedPixels,
    changedPixelPct: totalPixels === 0 ? 0 : round((changedPixels / totalPixels) * 100),
    meanChannelDelta: expectedLength === 0 ? 0 : round(sumChannelDelta / expectedLength),
    maxChannelDelta,
    channelTolerance,
  };
}
