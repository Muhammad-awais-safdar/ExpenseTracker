const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

const formatMessage = (tag, message) => {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] [${tag}] ${message}`;
};

const logger = {
  debug: (tag, message, data = null) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.log(formatMessage(tag, message), data || "");
    }
  },

  info: (tag, message, data = null) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.log(`\x1b[36m${formatMessage(tag, message)}\x1b[0m`, data || "");
    }
  },

  warn: (tag, message, data = null) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatMessage(tag, message), data || "");
    }
  },

  error: (tag, message, error = null) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(`\x1b[31m${formatMessage(tag, message)}\x1b[0m`, error || "");
    }
  },

  // Helper for masking sensitive data
  mask: (data, keysToMask = ["password", "token", "access_token"]) => {
    if (!data) return data;
    const masked = { ...data };
    keysToMask.forEach((key) => {
      if (masked[key]) masked[key] = "********";
    });
    return masked;
  },
};

export default logger;
