import zlib from 'zlib';

/**
 * Native lightweight Gzip compression middleware.
 * Intercepts write/end calls to compress text, json, and javascript payloads natively.
 */
export const compressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Skip if client does not support gzip
  if (!acceptEncoding.includes('gzip')) {
    return next();
  }

  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks = [];

  res.write = function (chunk) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return true;
  };

  res.end = function (chunk, encoding, callback) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    const contentType = res.getHeader('content-type') || '';
    const isCompressible = /json|text|javascript|css|xml|html/i.test(contentType);

    // Compress payloads larger than 1024 bytes
    if (isCompressible && buffer.length > 1024) {
      zlib.gzip(buffer, (err, compressed) => {
        if (err) {
          // Fallback to uncompressed stream on zlib errors
          res.setHeader('Content-Length', buffer.length);
          originalEnd.call(res, buffer, encoding, callback);
        } else {
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Content-Length', compressed.length);
          originalEnd.call(res, compressed, encoding, callback);
        }
      });
    } else {
      originalEnd.call(res, buffer, encoding, callback);
    }
  };

  next();
};
