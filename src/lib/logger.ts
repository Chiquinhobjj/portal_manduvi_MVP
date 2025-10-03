// ✅ OTIMIZAÇÃO: Logger mais eficiente
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

type LogPayload = unknown[];

export const logger = {
  debug: (...args: LogPayload) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: LogPayload) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: LogPayload) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args: LogPayload) => {
    console.error('[ERROR]', ...args);

    // ✅ Em produção, enviar apenas erros críticos para monitoramento
    if (isProduction) {
      // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
      // sendToErrorTracking(args);
    }
  },
};
