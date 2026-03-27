// ==========================================
// SCENE 3: GAMEPLAY
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    init(data) { this.diffMult = data.diff || 1; }

    create() {
        this.score = 0; this.level = 1; this.lives = 3; this.bombs = 1; 
        this.powerLevel = 1; this.hasShield = false; this.isInvulnerable = false; 
        this.playerSpeed = 170; this.isGameOver = false; this.boss = null;
        this.lastFired = 0; this.bossLastFired = 0; this.bombCooldown = false;
        
        this.cameras.main.setBackgroundColor(0x050505);

        this.stars = this.add.group();
        for(let i=0; i<50; i++) {
            let s = this.add.image(Phaser.Math.Between(0, 320), Phaser.Math.Between(0, 240), 'starImg').setAlpha(0.5);
            s.speed = Phaser.Math.FloatBetween(0.5, 3.0); this.stars.add(s);
        }
        this.planet = this.add.image(240, -100, 'planetImg').setTint(0x220044).setAlpha(0.4);

        this.player = this.physics.add.sprite(160, 210, 'playerImg').setCollideWorldBounds(true).setDepth(10);
        this.player.body.setSize(10, 10);
        
        this.engineTrail = this.add.particles('starImg').createEmitter({ speed: 50, angle: { min: 85, max: 95 }, scale: { start: 1, end: 0 }, blendMode: 'ADD', tint: 0x00ffff, lifespan: 300 });
        this.engineTrail.startFollow(this.player, 0, 8);
        this.shieldAura = this.add.sprite(0, 0, 'shieldImg').setVisible(false).setDepth(11);

        this.bullets = this.physics.add.group({ defaultKey: 'bulletImg', maxSize: 50 });
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group({ defaultKey: 'enemyBulletImg', maxSize: 100 });
        this.powerups = this.physics.add.group();
        this.bossGroup = this.physics.add.group();

        this.explosionEmitter = this.add.particles('starImg').createEmitter({ speed: { min: 50, max: 200 }, scale: { start: 2, end: 0 }, lifespan: 500, on: false });

        this.scoreText = this.add.text(5, 5, '', { fontSize: '10px', fill: '#00ff00', fontStyle: 'bold' });
        this.statText = this.add.text(315, 5, '', { fontSize: '10px', fill: '#00ff00', align: 'right', fontStyle: 'bold' }).setOrigin(1, 0);
        this.centerText = this.add.text(160, 100, 'LEVEL 1 START', { fontSize: '16px', fill: '#fff', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
        this.tweens.add({ targets: this.centerText, alpha: 0, delay: 1500, duration: 500 });
        this.updateUI();

        this.bossUI = this.add.container(160, 25).setVisible(false).setDepth(100);
        this.bossUI.add([
            this.add.graphics().fillStyle(0x333333).fillRect(-60, 0, 120, 8),
            this.bossBar = this.add.graphics(),
            this.add.text(0, -10, 'SECTOR GUARDIAN', { fontSize: '8px', fill: '#ff0055', fontStyle: 'bold' }).setOrigin(0.5)
        ]);

        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.bullets, this.bossGroup, this.hitBoss, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.bossGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey('SPACE');
        this.bombKey = this.input.keyboard.addKey('B');
        this.input.keyboard.addKey('SHIFT').on('down', () => this.triggerBomb());
        this.restartKey = this.input.keyboard.addKey('R');

        this.spawnTimer = this.time.addEvent({ delay: 900 / this.diffMult, callback: this.spawnEnemy, callbackScope: this, loop: true });
    }

    update(time, delta) {
        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.start('MenuScene');
            return;
        }

        this.stars.getChildren().forEach(s => { s.y += s.speed + (this.level * 0.2); if(s.y > 240) s.y = 0; });
        this.planet.y += 0.1;

        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-this.playerSpeed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(this.playerSpeed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-this.playerSpeed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(this.playerSpeed);

        if (this.hasShield) this.shieldAura.setPosition(this.player.x, this.player.y).setRotation(this.shieldAura.rotation + 0.05);

        this.enemies.children.each(e => {
            if (!e.active) return;
            if (e.enemyType === 'zigzag') e.x = e.startX + Math.sin((time - e.birthTime) / 200) * 40;
            else if (e.enemyType === 'hunter') {
                if (e.y < this.player.y) { if (e.x < this.player.x) e.body.velocity.x += 1.5; else if (e.x > this.player.x) e.body.velocity.x -= 1.5; }
            }
            if (e.y > 260) e.destroy();
        });

        if (this.fireKey.isDown && time > this.lastFired) {
            this.fireWeapon(); sfx('shoot');
            this.lastFired = time + 120;
        }
        if (Phaser.Input.Keyboard.JustDown(this.bombKey)) this.triggerBomb();

        this.bullets.children.each(b => { if(b.y < -20) { b.setActive(false).setVisible(false); b.body.enable = false; } });
        this.enemyBullets.children.each(eb => { if(eb.y > 260) { eb.setActive(false).setVisible(false); eb.body.enable = false; } });

        if (this.boss && this.boss.active) {
            if (this.boss.y < 60) this.boss.setVelocityY(40);
            else {
                this.boss.setVelocityY(0);
                this.boss.x = 160 + Math.sin(time/600) * (90 * this.diffMult);
                if (time > this.bossLastFired) {
                    this.fireBossProjectiles(); sfx('shoot');
                    this.bossLastFired = time + (800 / this.diffMult);
                }
            }
            this.drawBossHealthBar();
        }
    }

    fireWeapon() {
        const spawn = (x, y, vx, vy) => {
            let b = this.bullets.get(x, y);
            if (b) { b.setActive(true).setVisible(true).body.enable = true; b.setVelocity(vx, vy); b.setDepth(5); }
        };
        
        spawn(this.player.x, this.player.y - 12, 0, -400); 
        if (this.powerLevel >= 2) { spawn(this.player.x - 6, this.player.y - 8, 0, -400); spawn(this.player.x + 6, this.player.y - 8, 0, -400); }
        if (this.powerLevel >= 3) { spawn(this.player.x - 8, this.player.y, -100, -350); spawn(this.player.x + 8, this.player.y, 100, -350); }
        if (this.powerLevel >= 4) { spawn(this.player.x - 12, this.player.y + 4, -200, -300); spawn(this.player.x + 12, this.player.y + 4, 200, -300); }
        if (this.powerLevel >= 5) { spawn(this.player.x - 10, this.player.y + 10, -100, 200); spawn(this.player.x + 10, this.player.y + 10, 100, 200); }
    }

    fireBossProjectiles() {
        if (!this.boss || !this.boss.active) return;

        const spawnBossBullet = (vx, vy) => {
            let eb = this.enemyBullets.get(this.boss.x, this.boss.y + 24);
            if (eb) { eb.setActive(true).setVisible(true).body.enable = true; eb.setVelocity(vx, vy); }
        };

        let speed = 180 * this.diffMult;
        let angleToPlayer = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);

        if (this.level === 1) {
            spawnBossBullet(Math.cos(angleToPlayer) * speed, Math.sin(angleToPlayer) * speed);
        } else if (this.level === 2) {
            let offsets = [-0.2, 0, 0.2]; 
            for (let offset of offsets) {
                spawnBossBullet(Math.cos(angleToPlayer + offset) * speed, Math.sin(angleToPlayer + offset) * speed);
            }
        } else {
            let nightmareSpeed = speed * 1.2;
            let offsets = [-0.4, -0.2, 0, 0.2, 0.4]; 
            for (let offset of offsets) {
                spawnBossBullet(Math.cos(angleToPlayer + offset) * nightmareSpeed, Math.sin(angleToPlayer + offset) * nightmareSpeed);
            }
        }
    }

    triggerBomb() {
        if (this.bombs <= 0 || this.bombCooldown || this.isGameOver) return;
        this.bombs--; this.bombCooldown = true; this.updateUI(); sfx('boom');
        this.cameras.main.flash(400, 255, 255, 255); this.cameras.main.shake(400, 0.03);
        if (this.boss && this.boss.active) this.damageBoss(25);
        this.enemies.children.each(e => { if(e.active) { this.explosionEmitter.emitParticleAt(e.x, e.y, 15); e.destroy(); } });
        this.enemyBullets.children.each(eb => { eb.setActive(false).setVisible(false); eb.body.enable = false; });
        let t = this.add.text(160, 120, 'BOMB!', { fontSize: '20px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0, scale: 2, duration: 600, onComplete: () => t.destroy() });
        setTimeout(() => this.bombCooldown = false, 1500);
    }

    spawnEnemy() {
        if (this.isGameOver || (this.boss && this.boss.active)) return;
        
        if (this.level >= 2) { this.spawnBoss(); return; }

        let types = ['enemyImg', 'enemyZigZag', 'enemyHunter'];
        let picked = Phaser.Math.RND.pick(types);
        let e = this.enemies.create(Phaser.Math.Between(30, 290), -20, picked);
        e.enemyType = picked === 'enemyZigZag' ? 'zigzag' : (picked === 'enemyHunter' ? 'hunter' : 'standard');
        e.startX = e.x; e.birthTime = this.time.now;
        e.setVelocityY((100 + (this.level * 15)) * this.diffMult);
        
        if (this.score >= 1000 && !this.boss) this.spawnBoss(); 
    }

    spawnBoss() {
        this.centerText.setText(`WARNING: BOSS ${this.level}`).setVisible(true).setAlpha(1);
        this.tweens.add({ targets: this.centerText, alpha: 0, duration: 250, yoyo: true, repeat: 5, onComplete: () => this.centerText.setVisible(false) });
        
        this.bossMaxHP = (60 + (this.level * 40)) * this.diffMult;
        this.bossHP = this.bossMaxHP;
        this.boss = this.bossGroup.create(160, -60, 'bossImg').setDepth(20);
        this.boss.body.setSize(42, 42); 
        this.bossUI.setVisible(true);
        this.spawnTimer.paused = true;
    }

    drawBossHealthBar() {
        this.bossBar.clear();
        let width = Math.max(0, (this.bossHP / this.bossMaxHP) * 118);
        this.bossBar.fillStyle(0xff0055).fillRect(-59, 1, width, 6);
    }

    damageBoss(amount) {
        if (!this.boss || !this.boss.active) return;
        this.bossHP -= amount; sfx('boom');
        this.boss.setTint(0xffffff);
        this.time.delayedCall(50, () => { if(this.boss && this.boss.active) this.boss.clearTint(); });

        if (this.bossHP <= 0) {
            this.explosionEmitter.emitParticleAt(this.boss.x, this.boss.y, 100);
            this.cameras.main.shake(600, 0.04); sfx('boom');
            this.boss.destroy(); this.boss = null; this.bossUI.setVisible(false);
            
            this.score += 2000 * this.level; 
            this.level++; 
            this.bombs++; 
            
            if (this.level > 3) {
                this.triggerVictory();
            } else {
                this.spawnTimer.paused = false;
                this.centerText.setText(`LEVEL ${this.level}\nBOSS RUSH!`).setVisible(true).setAlpha(1);
                this.tweens.add({ targets: this.centerText, alpha: 0, delay: 1500, duration: 500, onComplete: () => this.centerText.setVisible(false) });
            }
            this.updateUI();
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.setActive(false).setVisible(false).body.enable = false;
        this.explosionEmitter.emitParticleAt(enemy.x, enemy.y, 10);
        if (Phaser.Math.Between(1, 100) <= 20) this.dropPowerup(enemy.x, enemy.y);
        enemy.destroy(); sfx('boom');
        this.score += 10 * this.diffMult; this.updateUI();
    }

    hitBoss(bullet, bossTarget) {
        bullet.setActive(false).setVisible(false).body.enable = false;
        this.damageBoss(1);
    }

    dropPowerup(x, y) {
        let types = ['powPower', 'powPower', 'powShield', 'powBomb', 'powScore', 'powScore', 'powLife'];
        let p = this.powerups.create(x, y, Phaser.Math.RND.pick(types));
        p.dropType = p.texture.key; p.setVelocityY(70);
    }

    collectPowerup(player, p) {
        sfx('powerup'); let label = "";
        if (p.dropType === 'powPower') { 
            if (this.powerLevel < 5) { this.powerLevel++; label = "POWER UP!"; } 
            else { this.score += 200; label = "MAX POWER! +200"; }
        }
        else if (p.dropType === 'powScore') { this.score += 500; label = "BONUS +500!"; }
        else if (p.dropType === 'powLife') { this.lives++; label = "1UP!"; }
        else if (p.dropType === 'powShield') { this.hasShield = true; this.shieldAura.setVisible(true); label = "ARMOR!"; }
        else if (p.dropType === 'powBomb') { this.bombs++; label = "BOMB+1"; }
        
        let ft = this.add.text(player.x, player.y - 20, label, { fontSize: '10px', fill: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: ft, y: player.y - 60, alpha: 0, duration: 800, onComplete: () => ft.destroy() });
        p.destroy(); this.updateUI();
    }

    hitPlayer(player, hazard) {
        if (this.isInvulnerable || this.isGameOver) return;
        sfx('boom');
        if (this.hasShield) {
            this.hasShield = false; this.shieldAura.setVisible(false);
            if(hazard.texture && hazard.texture.key === 'enemyBulletImg') hazard.destroy();
            this.makeInvulnerable(1500); return;
        }
        this.lives--; 
        this.powerLevel = Math.max(1, this.powerLevel - 1);
        this.updateUI(); 
        
        if (this.lives <= 0) {
            this.isGameOver = true; this.physics.pause(); this.engineTrail.stop();
            this.add.text(160, 120, 'GAME OVER\nPRESS R TO MENU', { fontSize: '20px', fill: '#ff0000', align: 'center', backgroundColor: '#000', fontStyle: 'bold' }).setOrigin(0.5);
            this.saveScoreToLeaderboard();
        } else {
            this.makeInvulnerable(2000); this.triggerBomb(); 
        }
    }

    makeInvulnerable(dur) {
        this.isInvulnerable = true;
        this.tweens.add({ targets: this.player, alpha: 0.2, duration: 100, yoyo: true, repeat: dur/200, onComplete: () => { this.player.alpha = 1; this.isInvulnerable = false; }});
    }

    saveScoreToLeaderboard() {
        let scores = JSON.parse(localStorage.getItem('neonLeaderboard')) || [0, 0, 0];
        scores.push(Math.floor(this.score));
        scores.sort((a, b) => b - a);
        scores = scores.slice(0, 3);
        localStorage.setItem('neonLeaderboard', JSON.stringify(scores));
    }

    triggerVictory() {
        this.isGameOver = true; this.physics.pause(); this.engineTrail.stop();
        this.saveScoreToLeaderboard();
        
        let victoryScreen = this.add.container(160, 120);
        let bg = this.add.graphics().fillStyle(0x000000, 0.8).fillRect(-160, -120, 320, 240);
        let title = this.add.text(0, -30, 'MISSION ACCOMPLISHED', { fontSize: '16px', fill: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
        let stats = this.add.text(0, 0, `FINAL SCORE: ${Math.floor(this.score)}`, { fontSize: '12px', fill: '#fff' }).setOrigin(0.5);
        let prompt = this.add.text(0, 40, 'PRESS R TO RETURN', { fontSize: '10px', fill: '#00ff00', align: 'center' }).setOrigin(0.5);
        
        this.tweens.add({ targets: prompt, alpha: 0, duration: 400, yoyo: true, repeat: -1 });
        victoryScreen.add([bg, title, stats, prompt]);
    }

    updateUI() {
        this.scoreText.setText(`SCORE: ${Math.floor(this.score)}`);
        this.statText.setText(`PWR: ${this.powerLevel}/5 | LIVES: ${this.lives} | BOMBS: ${this.bombs}\nLEVEL: ${this.level}`);
    }
}
