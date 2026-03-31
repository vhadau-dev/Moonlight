moon({
  name: "calc",
  category: "tools",
  description: "Calculate math expressions",

  async execute(sock, jid, sender, args, m, { reply }) {
    try {

      if (!args.length) {
        return reply("❌ Example: .calc 2+2*5");
      }

      const expression = args.join(" ");

      // ❌ Block anything that's not math
      if (!/^[0-9+\-*/%.() ]+$/.test(expression)) {
        return reply("❌ Invalid characters in expression.");
      }

      let result;

      try {
        // Safe evaluation (still controlled)
        result = Function(`"use strict"; return (${expression})`)();
      } catch {
        return reply("❌ Invalid calculation.");
      }

      if (result === undefined || result === null || isNaN(result)) {
        return reply("❌ Could not calculate.");
      }

      return reply(`➗ *Calculator*\n\n${expression} = ${result}`);

    } catch (err) {
      console.error("calc error:", err);
      return reply("❌ Failed to calculate.");
    }
  }
});