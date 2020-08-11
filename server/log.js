const logType = process.env.LOG_TYPE || 'console';

export const LOG = (type, args) => {
  switch(logType) {
    case 'http':
      console.log(JSON.stringify({ time: Date.now(), type, ...args }))
      break;

    case 'console':
    default:
      console.log(`[${type}] `, args.message || args);
      break;
  }
};