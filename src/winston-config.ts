import {format} from 'winston';

// Custom format for general logs
const customFormat = format.combine(
  format.colorize(),
  format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  format.errors({stack: true}), // Include the stack trace
  format.printf(({timestamp, level, message, stack, ...metadata}) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    return log;
  })
);

// Custom format for HTTP access logs
const httpAccessLogFormat = format.combine(
  format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  format.printf(({timestamp, method, url, statusCode, responseTime}) => {
    // Ensure that all properties are valid
    method = method || 'UNKNOWN_METHOD';
    url = url || 'UNKNOWN_URL';
    statusCode = statusCode || 'UNKNOWN_STATUS_CODE';
    responseTime = responseTime || 'UNKNOWN_RESPONSE_TIME';
    return `${timestamp} [HTTP Access]: ${method} ${url} ${statusCode} ${responseTime}ms`;
  })
);

