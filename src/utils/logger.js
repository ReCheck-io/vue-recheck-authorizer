const loggerConfig = {
  mode: 'production',
};

export function logger() {
  if (loggerConfig.mode === 'debug') {
    let args = Array.from(arguments);
    args.unshift('[DEBUG][' + new Date().toUTCString() + ']' + ': ');
    console.log.apply(console, args);
  }
}
