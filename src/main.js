// ==========================================
// ENGINE INITIALIZATION
// ==========================================
const config = { 
    type: Phaser.AUTO, 
    width: 320, 
    height: 240, 
    zoom: 3, 
    pixelArt: true, 
    physics: { 
        default: 'arcade', 
        arcade: { 
            gravity: { y: 0 } 
        } 
    }, 
    scene: [BootScene, MenuScene, GameScene] 
};

// Start the game
new Phaser.Game(config);
