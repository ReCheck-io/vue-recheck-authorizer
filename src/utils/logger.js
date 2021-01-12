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
  let logs = localStorage.getItem('app-logs');
  let date = new Date().toUTCString();

  if (logs === null) {
    const lastLog = JSON.stringify([{ date: date, log: data }], null, 2);
    localStorage.setItem('app-logs', lastLog);
    return;
  }

  logs = JSON.parse(logs)
  logs.push({ date: date, log: data.flat(Infinity) });
  logs = JSON.stringify(logs, null, 2);
  localStorage.setItem('app-logs', logs);
  return;
}