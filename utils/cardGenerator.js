const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// Register custom fonts if they exist
const fontsDir = path.join(__dirname, '../assets/fonts');
if (fs.existsSync(path.join(fontsDir, 'BebasNeue.ttf'))) {
    registerFont(path.join(fontsDir, 'BebasNeue.ttf'), { family: 'BebasNeue' });
}
if (fs.existsSync(path.join(fontsDir, 'ShadowsIntoLight.ttf'))) {
    registerFont(path.join(fontsDir, 'ShadowsIntoLight.ttf'), { family: 'ShadowsIntoLight' });
}

/**
 * Generates a premium, edgy, high-energy anime card image.
 * Inspired by gacha game UI and dark action aesthetics.
 * @param {Object} cardData - { name, tier, atk, def, image, cardId, description }
 * @returns {Promise<Buffer>} - The generated image buffer.
 */
async function generateCardImage(cardData) {
    const width = 600;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- 1. Background Layer ---
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // --- 2. Character Image Layer ---
    try {
        const charImage = await loadImage(cardData.image);
        const imgAspect = charImage.width / charImage.height;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        if (imgAspect > canvasAspect) {
            drawHeight = height;
            drawWidth = height * imgAspect;
            offsetX = (width - drawWidth) / 2;
        } else {
            drawWidth = width;
            drawHeight = width / imgAspect;
            offsetY = (height - drawHeight) / 2;
        }

        ctx.save();
        // Add a slight zoom effect for more dynamic feel
        const zoom = 1.1;
        ctx.drawImage(charImage, offsetX - (drawWidth*(zoom-1)/2), offsetY - (drawHeight*(zoom-1)/2), drawWidth*zoom, drawHeight*zoom);
        ctx.restore();
    } catch (err) {
        console.error("Failed to load character image for card:", err);
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);
    }

    // --- 3. Edgy Overlays ---
    
    // Grungy Dark Overlay
    const gradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 600);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Bottom Info Gradient
    const bottomGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
    bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGrad.addColorStop(0.7, 'rgba(0,0,0,0.9)');
    bottomGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height * 0.5, width, height * 0.5);

    // --- 4. Decorative Elements (Lines & Crosshairs) ---
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    // Crosshair lines
    ctx.beginPath();
    ctx.moveTo(width/2, 50); ctx.lineTo(width/2, 150);
    ctx.moveTo(width/2, height-50); ctx.lineTo(width/2, height-150);
    ctx.moveTo(50, height/2); ctx.lineTo(150, height/2);
    ctx.moveTo(width-50, height/2); ctx.lineTo(width-150, height/2);
    ctx.stroke();

    // Corner brackets
    const bracketSize = 40;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    // Top Left
    ctx.beginPath(); ctx.moveTo(20, 20+bracketSize); ctx.lineTo(20, 20); ctx.lineTo(20+bracketSize, 20); ctx.stroke();
    // Top Right
    ctx.beginPath(); ctx.moveTo(width-20-bracketSize, 20); ctx.lineTo(width-20, 20); ctx.lineTo(width-20, 20+bracketSize); ctx.stroke();
    // Bottom Left
    ctx.beginPath(); ctx.moveTo(20, height-20-bracketSize); ctx.lineTo(20, height-20); ctx.lineTo(20+bracketSize, height-20); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(width-20-bracketSize, height-20); ctx.lineTo(width-20, height-20); ctx.lineTo(width-20, height-20-bracketSize); ctx.stroke();

    // --- 5. Typography & Stats ---
    
    // Tier Badge (Top Left - Edgy Style)
    const tierColors = {
        "1": "#cd7f32", "2": "#c0c0c0", "3": "#ffd700", 
        "4": "#e5e4e2", "5": "#ff00ff", "6": "#ff4500",
        "S": "#ff0000", "A": "#ffaa00", "B": "#00aaff"
    };
    const tierColor = tierColors[cardData.tier] || "#ffffff";

    ctx.save();
    ctx.translate(60, 60);
    ctx.rotate(-Math.PI / 12);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(-40, -40, 80, 80);
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(-40, -40, 80, 80);
    
    ctx.fillStyle = tierColor;
    ctx.font = 'bold 50px BebasNeue, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = tierColor;
    ctx.shadowBlur = 10;
    ctx.fillText(cardData.tier, 0, 0);
    ctx.restore();

    // ID Tag (Top Right - Glitchy)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`ID: ${cardData.cardId}`, width - 40, 50);
    ctx.fillText(`SEC_AUTH: VERIFIED`, width - 40, 70);

    // Character Name (Large, Slanted, Bold)
    ctx.save();
    ctx.translate(40, height - 220);
    ctx.rotate(-0.05);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 70px BebasNeue, Arial';
    ctx.shadowColor = 'rgba(255,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText(cardData.name.toUpperCase(), 0, 0);
    ctx.restore();

    // Description / Quote (Cursive)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'italic 24px ShadowsIntoLight, cursive, Arial';
    ctx.textAlign = 'left';
    const desc = cardData.description || "The moonlight reveals all secrets...";
    ctx.fillText(`"${desc.length > 45 ? desc.substring(0, 42) + '...' : desc}"`, 45, height - 150);

    // Stats Row (Modern UI style)
    const drawStat = (label, value, x, color) => {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, height - 120, 240, 60);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, height - 120, 240, 60);
        
        ctx.fillStyle = color;
        ctx.font = 'bold 20px BebasNeue, Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 15, height - 82);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px BebasNeue, Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value.toLocaleString(), x + 225, height - 82);
    };

    drawStat('ATTACK_PWR', cardData.atk, 40, '#ff3333');
    drawStat('DEFENSE_LVL', cardData.def, 320, '#3399ff');

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '12px Courier New';
    ctx.fillText('MOONLIGHT_SYSTEM // CARD_ID_' + cardData.cardId + ' // AUTH_LEVEL_S', width / 2, height - 20);

    return canvas.toBuffer();
}

module.exports = { generateCardImage };
