// ==========================================
// SCENE 2: MENU (OVERHAULED)
// ==========================================
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        // Fetch local scores
        let scores = JSON.parse(localStorage.getItem('neonLeaderboard')) || [0, 0, 0];
        
        // Title
        this.add.text(160, 25, 'NEON VENGEANCE', { fontSize: '24px', fill: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
        
        // --- LEFT COLUMN: HALL OF FAME ---
        this.add.text(80, 60, 'HALL OF FAME', { fontSize: '10px', fill: '#ff0055', fontStyle: 'bold' }).setOrigin(0.5);
        for(let i=0; i<3; i++) {
            this.add.text(80, 75 + (i*12), `${i+1}. ${scores[i]}`, { fontSize: '10px', fill: '#fff' }).setOrigin(0.5);
        }

        // --- RIGHT COLUMN: CONTROLS ---
        this.add.text(240, 60, 'CONTROLS', { fontSize: '10px', fill: '#ff0055', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(240, 75, 'ARROWS: MOVE', { fontSize: '8px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(240, 87, 'SPACE: SHOOT', { fontSize: '8px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(240, 99, 'B / SHIFT: BOMB', { fontSize: '8px', fill: '#fff' }).setOrigin(0.5);

        // --- CENTER: POWER-UPS ---
        this.add.text(160, 125, 'POWER-UPS', { fontSize: '10px', fill: '#00ffaa', fontStyle: 'bold' }).setOrigin(0.5);
        
        // Row 1 (Power, Score, Life)
        this.add.image(80, 145, 'powPower'); 
        this.add.text(92, 145, 'POWER', { fontSize: '8px', fill: '#fff' }).setOrigin(0, 0.5);
        
        this.add.image(160, 145, 'powScore'); 
        this.add.text(172, 145, 'SCORE', { fontSize: '8px', fill: '#fff' }).setOrigin(0, 0.5);
        
        this.add.image(240, 145, 'powLife'); 
        this.add.text(252, 145, '1-UP', { fontSize: '8px', fill: '#fff' }).setOrigin(0, 0.5);

        // Row 2 (Armor, Bomb)
        this.add.image(120, 165, 'powShield'); 
        this.add.text(132, 165, 'ARMOR', { fontSize: '8px', fill: '#fff' }).setOrigin(0, 0.5);
        
        this.add.image(200, 165, 'powBomb'); 
        this.add.text(212, 165, 'BOMB', { fontSize: '8px', fill: '#fff' }).setOrigin(0, 0.5);

        // --- BOTTOM: START PROMPT ---
        let prompt = this.add.text(160, 205, 'PRESS [1] NORMAL  |  PRESS [2] HARD', { fontSize: '10px', fill: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
        
        // Add a pulsing effect to the prompt so it catches the eye!
        this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
        
        // Inputs
        this.input.keyboard.on('keydown-ONE', () => this.scene.start('GameScene', { diff: 1 }));
        this.input.keyboard.on('keydown-TWO', () => this.scene.start('GameScene', { diff: 1.5 }));
    }
}
