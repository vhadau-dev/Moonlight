moon({
  name: "weather",
  category: "tools",
  description: "Get weather of a city",
  cooldown: 5,

  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const axios = require("axios");

      if (!args.length) {
        return reply("❌ Example: .weather Johannesburg");
      }

      const city = args.join(" ");

      // Using wttr.in (no API key needed)
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

      const res = await axios.get(url);
      const data = res.data;

      if (!data || !data.current_condition) {
        return reply("❌ City not found.");
      }

      const current = data.current_condition[0];

      const temp = current.temp_C;
      const feels = current.FeelsLikeC;
      const desc = current.weatherDesc[0].value;
      const humidity = current.humidity;
      const wind = current.windspeedKmph;

      const msg = `
🌦️ *Weather - ${city}*

🌡️ Temp: ${temp}°C
🤔 Feels Like: ${feels}°C
🌥️ Condition: ${desc}

💧 Humidity: ${humidity}%
🌬️ Wind: ${wind} km/h
      `.trim();

      return reply(msg);

    } catch (err) {
      console.error("weather error:", err);
      return reply("❌ Failed to fetch weather.");
    }
  }
});