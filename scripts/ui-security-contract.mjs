function requireReplacement(source, from, to, label) {
  if (!source.includes(from)) {
    throw new Error(`UI security contract drifted: missing ${label}.`);
  }
  return source.replace(from, to);
}

const DECODE_PNG_SOURCE = `    async function decodePng(bytes) {
      const blob = new Blob([bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)], { type: 'image/png' });
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas 2D context is unavailable.');
      context.drawImage(bitmap, 0, 0);
      const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);
      if (typeof bitmap.close === 'function') bitmap.close();
      return { width: imageData.width, height: imageData.height, data: imageData.data };
    }`;

const DECODE_PNG_SECURE = `    const MAX_PIXEL_PNG_BYTES = 32 * 1024 * 1024;
    const MAX_PIXEL_DIMENSION = 2048;

    function isRecord(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    function isSafeValidationId(value) {
      return Number.isSafeInteger(value) && value > 0;
    }

    function isSafeChannelTolerance(value) {
      return Number.isSafeInteger(value) && value >= 0 && value <= 255;
    }

    function boundedPngBytes(value) {
      let bytes;
      if (value instanceof Uint8Array) {
        bytes = value;
      } else if (value instanceof ArrayBuffer) {
        bytes = new Uint8Array(value);
      } else if (ArrayBuffer.isView(value)) {
        bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      } else if (Array.isArray(value)) {
        if (value.length > MAX_PIXEL_PNG_BYTES) throw new Error('PNG payload exceeds the pixel broker byte limit.');
        if (!value.every((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 255)) {
          throw new Error('PNG payload contains invalid byte values.');
        }
        bytes = Uint8Array.from(value);
      } else {
        throw new Error('PNG payload is not a supported byte sequence.');
      }
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_PIXEL_PNG_BYTES) {
        throw new Error('PNG payload size is outside the pixel broker byte limit.');
      }
      return bytes;
    }

    async function decodePng(value) {
      const bytes = boundedPngBytes(value);
      const blob = new Blob([bytes], { type: 'image/png' });
      const bitmap = await createImageBitmap(blob);
      try {
        if (!Number.isSafeInteger(bitmap.width)
          || !Number.isSafeInteger(bitmap.height)
          || bitmap.width <= 0
          || bitmap.height <= 0
          || bitmap.width > MAX_PIXEL_DIMENSION
          || bitmap.height > MAX_PIXEL_DIMENSION) {
          throw new Error('Decoded PNG dimensions exceed the pixel broker limit.');
        }
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Canvas 2D context is unavailable.');
        context.drawImage(bitmap, 0, 0);
        const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);
        return { width: imageData.width, height: imageData.height, data: imageData.data };
      } finally {
        if (typeof bitmap.close === 'function') bitmap.close();
      }
    }`;

const MESSAGE_HANDLER_SOURCE = `    window.onmessage = async (event) => {
      const message = event.data.pluginMessage;
      if (!message) return;`;

const MESSAGE_HANDLER_SECURE = `    window.onmessage = async (event) => {
      const eventData = event && isRecord(event.data) ? event.data : null;
      const message = eventData && isRecord(eventData.pluginMessage) ? eventData.pluginMessage : null;
      if (!message || typeof message.type !== 'string') return;`;

const PIXEL_REQUEST_SOURCE = `      if (message.type === 'validation-pixel-request') {
        try {
          const [before, after] = await Promise.all([
            decodePng(message.beforePng),
            decodePng(message.afterPng),
          ]);
          const pixelMetrics = comparePixels(before, after, message.channelTolerance);
          post('validation-pixel-result', {
            validationId: message.validationId,
            pixelMetrics,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          root.className = 'empty';
          root.textContent = \`Pixel comparison failed: \${errorMessage}\`;
          post('validation-pixel-error', {
            validationId: message.validationId,
            message: errorMessage,
          });
        }
        return;
      }`;

const PIXEL_REQUEST_SECURE = `      if (message.type === 'validation-pixel-request') {
        const validationId = isSafeValidationId(message.validationId) ? message.validationId : null;
        try {
          if (validationId === null) throw new Error('Pixel broker validation ID is invalid.');
          if (!isSafeChannelTolerance(message.channelTolerance)) {
            throw new Error('Pixel broker channel tolerance is invalid.');
          }
          const [before, after] = await Promise.all([
            decodePng(message.beforePng),
            decodePng(message.afterPng),
          ]);
          const pixelMetrics = comparePixels(before, after, message.channelTolerance);
          post('validation-pixel-result', {
            validationId,
            pixelMetrics,
          });
        } catch (error) {
          const errorMessage = (error instanceof Error ? error.message : String(error)).slice(0, 500);
          root.className = 'empty';
          root.textContent = \`Pixel comparison failed: \${errorMessage}\`;
          if (validationId !== null) {
            post('validation-pixel-error', {
              validationId,
              message: errorMessage,
            });
          }
        }
        return;
      }`;

export function buildSecureUi(source) {
  let secured = source.replace(/\r\n/g, '\n');
  secured = requireReplacement(secured, DECODE_PNG_SOURCE, DECODE_PNG_SECURE, 'PNG decoder boundary');
  secured = requireReplacement(secured, MESSAGE_HANDLER_SOURCE, MESSAGE_HANDLER_SECURE, 'plugin message envelope');
  secured = requireReplacement(secured, PIXEL_REQUEST_SOURCE, PIXEL_REQUEST_SECURE, 'pixel request handler');
  return secured;
}
