const loggerConfig = {
  mode: process.env.VUE_APP_LOGGER_MODE || 'production',
};

export function logger() {
  if (loggerConfig.mode === 'debug') {
    let args = Array.from(arguments);
    args.unshift('[DEBUG][' + new Date().toUTCString() + ']' + ': ');
    console.log.apply(console, args);
  }
}

export function saveAppLogs(...data) {
  const logs = localStorage.getItem('app-logs');
  data = JSON.stringify(data);
  let date = '[' + new Date().toUTCString() + ']: ';
  if (logs !== null) {
    let log = logs + '\n' + date + data;
    localStorage.setItem('app-logs', log);
    return;
  }
  return localStorage.setItem('app-logs', date + data);
}