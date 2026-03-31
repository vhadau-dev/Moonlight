function log(...args) {
  console.log("[BOT LOG]", ...args);
}

function error(...args) {
  console.error("[BOT ERROR]", ...args);
}

module.exports = { log, error };