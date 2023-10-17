import {
  LogDebug,
  LogInfo,
  LogWarning,
  LogError,
} from "@/../wailsjs/runtime/runtime";

export const useLogger = (moduleName: string) => {
  function debug(message: string) {
    LogDebug(`[WEB] [${moduleName}] ${message}`);
  }

  function info(message: string) {
    LogInfo(`[WEB] [${moduleName}] ${message}`);
  }

  function warn(message: string) {
    LogWarning(`[WEB] [${moduleName}] ${message}`);
  }

  function error(message: string) {
    LogError(`[WEB] [${moduleName}] ${message}`);
  }

  return {
    debug,
    info,
    warn,
    error,
  };
}
