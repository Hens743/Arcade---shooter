// ==========================================
// SCENE 2: MENU (WITH LEADERBOARD)
// ==========================================
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        let scores = JSON.parse(localStorage.getItem('neonLeaderboard')) || [0, 0, 0];
        
        this.add.text(160, 40, 'NEON VENGEANCE', { fontSize: '24px', fill: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(160, 80, '--- TOP PILOTS ---', { fontSize: '12px', fill: '#ff0055', fontStyle: 'bold' }).setOrigin(0.5);
        for(let i=0; i<3; i++) {
            this.add.text(160, 100 + (i*15), `${i+1}. ${scores[i]} PTS`, { fontSize: '12px', fill: '#fff' }).setOrigin(0.5);
        }
        this.add.text(160, 180, 'PRESS [1] NORMAL\nPRESS [2] HARD', { fontSize: '12px', fill: '#00ff00', align: 'center' }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-ONE', () => this.scene.start('GameScene', { diff: 1 }));
        this.input.keyboard.on('keydown-TWO', () => this.scene.start('GameScene', { diff: 1.5 }));
    }
}
