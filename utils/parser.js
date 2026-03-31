function parsePipeCommand(text) {
  const content = text.replace(/^\S+\s+/, "");
  return content.split('|').map(v => v.trim());
}

module.exports = { parsePipeCommand };