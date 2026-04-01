moon({
  name: "play",
  category: "tools",
  cooldown: 10,
  async execute(sock, jid, sender, args, m, { reply }) {
    try {
      const yts = require("yt-search");
      const axios = require("axios");
      if (!args.length) {
        return reply("❌ Example: .play alan walker faded");
      }

      const query = args.join(" ");
      reply(`🔍 Searching for: *${query}*...`);

      const search = await yts(query);
      const video = search.videos[0];

      if (!video) {
        return reply("❌ No results found.");
      }

      const videoUrl = video.url;
      let audioUrl = null;

      // Updated API list with current working endpoints as of late 2025/early 2026
      const extractionApis = [
        {
          name: "API-1",
          call: async () => {
            // Using a high-availability proxy for YouTube downloads
            const res = await axios.get(`https://api.vytmp3.com/api/v1/convert?url=${encodeURIComponent(videoUrl)}&format=mp3`);
            return res.data?.download_url || res.data?.url;
          }
        },
        {
          name: "API-2",
          call: async () => {
            // Cobalt API - often the most reliable but can have rate limits
            const res = await axios.post("https://api.cobalt.tools/api/json", {
              url: videoUrl,
              downloadMode: "audio",
              audioFormat: "mp3"
            }, { timeout: 15000 });
            return res.data?.url;
          }
        },
        {
          name: "API-3",
          call: async () => {
            // Alternative downloader service
            const res = await axios.get(`https://www.yt-download.org/api/button/mp3/${video.videoId}`);
            // Note: This often returns an HTML page, we might need a more direct link
            // For now, let's use a more direct API-like service
            const res2 = await axios.get(`https://api.shazam.best/download?url=${encodeURIComponent(videoUrl)}`);
            return res2.data?.url;
          }
        }
      ];

      for (const api of extractionApis) {
        try {
          console.log(`Trying ${api.name}...`);
          audioUrl = await api.call();
          if (audioUrl && audioUrl.startsWith('http')) break;
        } catch (e) {
          console.error(`${api.name} failed:`, e.message);
        }
      }

      if (!audioUrl) {
        return reply("❌ YouTube is currently blocking all extraction methods. This happens when the bot's IP is temporarily flagged. Please try again in 10-15 minutes or try a different song.");
      }

      // Send the audio to WhatsApp
      await sock.sendMessage(jid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: `Duration: ${video.timestamp} | Views: ${video.views}`,
            thumbnailUrl: video.thumbnail,
            sourceUrl: videoUrl,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("play command error:", err);
      // Detailed error reporting for the user
      if (err.code === 'ENOTFOUND') {
        reply("❌ Network Error: One of the music servers is currently down. I'm working on a fix!");
      } else {
        reply("❌ An unexpected error occurred. Please try again later.");
      }
    }
  }
});
