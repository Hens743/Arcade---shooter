// ==========================================
// SCENE 1: BOOT & ASSET GENERATION
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        var g = this.make.graphics();
        // Player & Enemies
        g.fillStyle(0x00ff00); g.beginPath(); g.moveTo(8, 0); g.lineTo(16, 16); g.lineTo(8, 12); g.lineTo(0, 16); g.closePath(); g.fillPath(); g.generateTexture('playerImg', 16, 16);
        g.clear(); g.fillStyle(0xff0000); g.fillRect(0,0,16,16); g.fillStyle(0x000000); g.fillRect(3,4,3,3); g.fillRect(10,4,3,3); g.generateTexture('enemyImg', 16, 16);
        g.clear(); g.fillStyle(0xff8800); g.beginPath(); g.moveTo(8,0); g.lineTo(16,8); g.lineTo(8,16); g.lineTo(0,8); g.closePath(); g.fillPath(); g.generateTexture('enemyZigZag', 16, 16);
        g.clear(); g.fillStyle(0xff00ff); g.beginPath(); g.moveTo(0,0); g.lineTo(16,0); g.lineTo(8,16); g.closePath(); g.fillPath(); g.generateTexture('enemyHunter', 16, 16);
        
        // Projectiles & Environment
        g.clear(); g.fillStyle(0xffff00); g.fillRect(0, 0, 4, 10); g.generateTexture('bulletImg', 4, 10);
        g.clear(); g.fillStyle(0xff0055); g.fillCircle(4, 4, 4); g.generateTexture('enemyBulletImg', 8, 8);
        g.clear(); g.fillStyle(0xffffff); g.fillRect(0,0,2,2); g.generateTexture('starImg', 2, 2);
        g.clear(); g.fillStyle(0xffffff); g.fillCircle(64,64,64); g.generateTexture('planetImg', 128, 128);
        
        // Boss
        g.clear(); g.fillStyle(0xffffff); g.fillRect(0, 0, 48, 48); g.lineStyle(2, 0xffffff); g.strokeRect(0, 0, 48, 48); g.fillStyle(0x000000); g.fillRect(10,12,8,8); g.fillRect(30,12,8,8); g.generateTexture('bossImg', 48, 48);
        
        // Power-ups
        const drawOrb = (key, color, letter) => {
            g.clear(); g.fillStyle(color); g.fillCircle(8,8,8); g.fillStyle(0xffffff);
            if(letter === 'S') { g.fillRect(5,4,6,1); g.fillRect(5,5,1,2); g.fillRect(5,7,6,1); g.fillRect(10,8,1,2); g.fillRect(5,10,6,1); }
            else if(letter === 'A') { g.fillRect(7,4,2,1); g.fillRect(6,5,1,2); g.fillRect(9,5,1,2); g.fillRect(5,7,1,4); g.fillRect(10,7,1,4); g.fillRect(6,8,4,1); }
            else if(letter === 'B') { g.fillRect(5,4,2,7); g.fillRect(5,4,4,1); g.fillRect(9,5,1,1); g.fillRect(5,6,4,1); g.fillRect(9,7,1,1); g.fillRect(9,8,1,1); g.fillRect(5,10,4,1); }
            else if(letter === 'P') { g.fillRect(5,4,2,7); g.fillRect(5,4,4,1); g.fillRect(9,5,1,2); g.fillRect(5,7,4,1); }
            else if(letter === 'C') { g.fillRect(6,4,3,1); g.fillRect(5,5,1,4); g.fillRect(6,9,3,1); g.fillRect(9,5,1,1); g.fillRect(9,8,1,1); }
            g.generateTexture(key, 16, 16);
        };
        drawOrb('powPower', 0xff00ff, 'P'); drawOrb('powScore', 0x00ffaa, 'C');
        drawOrb('powShield', 0x00ffff, 'A'); drawOrb('powBomb', 0xff0000, 'B');
        drawOrb('powLife', 0x00ff00, 'S'); 
        
        g.clear(); g.lineStyle(2, 0x00ffff, 0.8); g.strokeCircle(12, 12, 11); g.generateTexture('shieldImg', 24, 24);
    }

    create() { 
        this.scene.start('MenuScene'); 
    }
}
