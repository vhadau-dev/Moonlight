const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

/**
 * Generates a stylized card image.
 * @param {Object} cardData - { name, tier, atk, def, image, cardId }
 * @returns {Promise<Buffer>} - The generated image buffer.
 */
async function generateCardImage(cardData) {
    const width = 600;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background / Border
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Golden border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 15;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // 2. Character Image
    try {
        const charImage = await loadImage(cardData.image);
        // Draw character image with a slight crop/zoom to fit the upper area
        const imgAspect = charImage.width / charImage.height;
        const targetAspect = width / (height * 0.7);
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        if (imgAspect > targetAspect) {
            drawHeight = height * 0.7;
            drawWidth = drawHeight * imgAspect;
            offsetX = (width - drawWidth) / 2;
        } else {
            drawWidth = width;
            drawHeight = drawWidth / imgAspect;
            offsetY = (height * 0.7 - drawHeight) / 2;
        }
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(20, 20, width - 40, height * 0.7 - 20);
        ctx.clip();
        ctx.drawImage(charImage, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
    } catch (err) {
        console.error("Failed to load character image for card:", err);
        ctx.fillStyle = '#333';
        ctx.fillRect(20, 20, width - 40, height * 0.7 - 20);
    }

    // 3. Dark Overlay for Info Area
    const gradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.2, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // 4. Card Info Text
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;

    // Tier Tag
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`TIER ${cardData.tier}`, 40, height - 220);

    // Name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 50px Arial';
    ctx.fillText(cardData.name.toUpperCase(), 40, height - 160);

    // Stats
    ctx.font = '30px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('⚔️ ATK:', 40, height - 100);
    ctx.fillStyle = '#fff';
    ctx.fillText(cardData.atk, 150, height - 100);

    ctx.fillStyle = '#aaa';
    ctx.fillText('🛡️ DEF:', 300, height - 100);
    ctx.fillStyle = '#fff';
    ctx.fillText(cardData.def, 410, height - 100);

    // ID at the bottom
    ctx.font = 'italic 25px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`ID: ${cardData.cardId}`, 40, height - 40);

    return canvas.toBuffer();
}

module.exports = { generateCardImage };
