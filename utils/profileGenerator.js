const { createCanvas, loadImage } = require('canvas');

/**
 * Generates a profile image matching the Moonlight Haven style.
 * Layout (800x900):
 *  - Full background image
 *  - Dark overlay for readability
 *  - Bank / Wallet top-left
 *  - Circular profile picture centred horizontally with decorative ring
 *  - Username bold, centred below avatar
 *  - Bio / status line below username
 *  - Role line
 *  - Message-activity bar (replaces XP bar) with percentage label
 *  - MOONLIGHT - Family footer
 *
 * @param {Object} userData
 *   username, role, pfp, background, bio, wallet, bank, messageCount
 * @returns {Promise<Buffer>}
 */
async function generateProfileImage(userData) {
  const width  = 800;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');

  const DEFAULT_BG = 'https://files.catbox.moe/d04wzu.jpg';

  // ── 1. Background ──────────────────────────────────────────────────────────
  // If transparent is requested, we skip the background and overlay
  if (!userData.transparent) {
    try {
      const bgImg = await loadImage(userData.background || DEFAULT_BG);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f0c29');
      grad.addColorStop(0.5, '#302b63');
      grad.addColorStop(1, '#24243e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // ── 2. Dark overlay ────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, width, height);
  } else {
    // Clear canvas for transparency
    ctx.clearRect(0, 0, width, height);
  }

  // ── 3. Bank / Wallet – top-left ────────────────────────────────────────────
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = '#ffffff';
  ctx.font        = 'bold 26px Arial';
  ctx.textAlign   = 'left';
  const wallet = (userData.wallet || 0).toLocaleString();
  const bank   = (userData.bank   || 0).toLocaleString();
  ctx.fillText('Bank: $' + bank,     30, 45);
  ctx.fillText('Wallet: $' + wallet, 30, 78);
  ctx.shadowBlur = 0;

  // ── 4. Circular avatar – centred ───────────────────────────────────────────
  const pfpRadius = 130;
  const pfpCX     = width / 2;
  const pfpCY     = 310;

  // Outer decorative ring (teal glow)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 200, 220, 0.8)';
  ctx.shadowBlur  = 25;
  ctx.strokeStyle = 'rgba(0, 200, 220, 0.9)';
  ctx.lineWidth   = 8;
  ctx.beginPath();
  ctx.arc(pfpCX, pfpCY, pfpRadius + 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // White inner border
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 5;
  ctx.beginPath();
  ctx.arc(pfpCX, pfpCY, pfpRadius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Clip and draw avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(pfpCX, pfpCY, pfpRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  try {
    const pfpImg = await loadImage(userData.pfp || 'https://i.imgur.com/6VBx3io.png');
    ctx.drawImage(pfpImg, pfpCX - pfpRadius, pfpCY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
  } catch {
    ctx.fillStyle = '#555';
    ctx.fillRect(pfpCX - pfpRadius, pfpCY - pfpRadius, pfpRadius * 2, pfpRadius * 2);
  }
  ctx.restore();

  // ── 5. Username ────────────────────────────────────────────────────────────
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = '#ffffff';
  ctx.font        = 'bold 52px Arial';
  ctx.textAlign   = 'center';
  const displayName = (userData.username || 'Unknown').slice(0, 24);
  ctx.fillText(displayName, width / 2, pfpCY + pfpRadius + 65);

  // ── 6. Bio / status line ───────────────────────────────────────────────────
  const rawBio = userData.bio && userData.bio !== '.' ? userData.bio : 'Active';
  const bio    = rawBio.length > 50 ? rawBio.slice(0, 47) + '...' : rawBio;
  ctx.font      = '26px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.shadowBlur = 8;
  const bioY = pfpCY + pfpRadius + 110;
  ctx.fillText('\u00b7 \u2500\u2500\u2500 ' + bio + ' \u2500\u2500\u2500 \u00b7', width / 2, bioY);

  // ── 7. Role line ───────────────────────────────────────────────────────────
  ctx.font      = 'bold 30px Arial';
  ctx.fillStyle = '#7ecfff';
  ctx.shadowBlur = 10;
  ctx.fillText(userData.role || 'Member', width / 2, bioY + 50);

  // ── 8. Message-activity bar ────────────────────────────────────────────────
  // Every 100 messages = 5% activity, capped at 100%
  const msgs       = userData.messageCount || 0;
  const milestone  = 100;
  const pctPerStep = 5;
  const steps      = Math.floor(msgs / milestone);
  const rawPct     = Math.min(steps * pctPerStep, 100);
  const windowFrac = (msgs % milestone) / milestone;
  const totalFrac  = Math.min((rawPct + windowFrac * pctPerStep) / 100, 1.0);

  const barX = 80;
  const barY = bioY + 110;
  const barW = width - 160;
  const barH = 44;
  const barR = barH / 2;

  // Bar background
  ctx.save();
  ctx.shadowBlur = 0;
  roundRect(ctx, barX, barY, barW, barH, barR);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();

  // Bar fill (teal gradient)
  if (totalFrac > 0) {
    const fillW    = Math.max(barH, barW * totalFrac);
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
    fillGrad.addColorStop(0, '#3ab5d4');
    fillGrad.addColorStop(1, '#1e7fa8');
    roundRect(ctx, barX, barY, Math.min(fillW, barW), barH, barR);
    ctx.fillStyle = fillGrad;
    ctx.fill();
  }
  ctx.restore();

  // Bar label
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur  = 6;
  ctx.fillStyle   = '#ffffff';
  ctx.font        = 'bold 22px Arial';
  ctx.textAlign   = 'center';
  ctx.fillText(msgs + ' msgs \u00b7 ' + rawPct + '% active', width / 2, barY + barH / 2 + 8);

  // ── 9. Footer ──────────────────────────────────────────────────────────────
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = 'rgba(255,255,255,0.7)';
  ctx.font        = 'bold 28px Arial';
  ctx.textAlign   = 'center';
  ctx.fillText('\u{1D6B3}\u{1D6CF}\u{1D6B4}\u{1D41}\u{1D40B}\u{1D6AA}\u{1D6AB} - Family', width / 2, height - 30);

  return canvas.toBuffer();
}

// ── Helper: rounded rectangle path ─────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

module.exports = { generateProfileImage };
