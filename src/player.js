export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(options, scene) {
        super(scene, options.x, options.y, options.key, 1);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setGravityY(300)
        
        this.speed = options.speed || 100;
        this.scene.cameras.main.startFollow(this);
        
        this.scene.physics.world.setBounds(0, 0, 1280, 720);
        this.scene.cameras.main.setBounds(0, 0, 1280, 720);
        this.scene.cameras.main.setFollowOffset(-250, 0)
        
        PhaserHealth.AddTo(this, this.health, this.minHealth, this.maxHealth);
        
        this
        .setDepth(4)
        .setCollideWorldBounds(true)
        .setPushable(false)
        .setSize(22,38)
        .setOffset(43, 42)
        .setScale(1.8)
        
        this.isMoving = false;
        this.isAttacking = false;
        this.canAttack = true;
        this.randomAnimation = 0;
        
        this.on('die', (spr) => {
            
            this.scene.cameras.main.fadeOut(350, 0, 0, 0);
            
            this.scene.cameras.main.on(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                
                this.scene.scene.start('SceneLost');
                
            });
        });
        
        this.Movement()
        this.Animation()
        this.Jump();
        this.CreateAttackBtn();
        
        this.play("DudeIdle")
        
    }
    
    Movement() {
        
        let graphics = this.scene.add.graphics();
        graphics.fillStyle(0x888888, 1);
        graphics.fillRoundedRect(-100, -35, 200, 70, 30);
        graphics.setDepth(100)
        
        this.joyStick = this.scene.plugins.get('rexvirtualjoystickplugin')
        .add(this, {
            x: 200,
            y: 630,
            radius: 100,
            base: graphics,
            thumb: this.scene.add.circle(0, 0, 50, 0xcccccc).setDepth(100),
            dir: 'left&right',
        })
        .on('update', dumpJoyStickState, this);
        
        
        function dumpJoyStickState() {
            const cursorKeys = this.joyStick.createCursorKeys();
            
            if (cursorKeys.left.isDown) {
                this.setVelocityX(-this.speed * 0.6)
                this.isMoving = true;
                
                if (this.body.touching.down) {
                    this.setVelocityX(-this.speed)
                    this.play("DudeRun")
                    this.Flip(true)
                }
                
            }
            
            if (cursorKeys.right.isDown) {
                this.setVelocityX(this.speed * 0.6)
                this.isMoving = true;
                
                if(this.body.touching.down) {
                    this.setVelocityX(this.speed)
                    this.play("DudeRun")
                    this.Flip(false)
                }
                
            }
            
            if(cursorKeys.right.isUp && cursorKeys.left.isUp) {
                this.setVelocityX(0)
                this.isMoving = false;
                
                if(!this.body.touching.down) return;
                
                this.play("DudeIdle")
            }
        }
    }
    
    Animation() {
        const data = this.scene.cache.json.get("animation");
        
        data.player.forEach(anims => {
            
            
            this.scene.anims.create({
                key: anims.key,
                frames: this.scene.anims.generateFrameNumbers(anims.spriteKey),
                frameRate: anims.frameRate,
                repeat: anims.repeat,
            });
        })
        
        
    }
    
    Jump() {
        // TODO: add kaioty time to player jump: a delay thenplayer can jump
        
        this.JumpButton = this.scene.add.circle(1100, 630, 50, 0xcccccc);
        
        this.JumpButton
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(100);
        
        this.JumpButton.on("pointerdown", (pointer) => {
            if(!this.body.touching.down) return;
            
            this.setVelocityY(-280)
            
            this.play("DudeJump")
            
        });
        
        this.on('animationcomplete-DudeJump', () => {
            this.play("DudeFall")
            const whenDudeTouchesGround = () => {
                
                if (this.body.touching.down) {
                    
                    if (this.isMoving) {
                        this.play("DudeRun")
                        return
                    }
                    
                    this.play("DudeIdle");
                    return
                }
                requestAnimationFrame(whenDudeTouchesGround);
            }
            
            whenDudeTouchesGround()
            
        });
    }
    
    CreateAttackBtn() {
        this.AttackBtn = this.scene.add.circle(1200, 560, 55, 0xcccccc);
        
        this.AttackBtn
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(100);
        
        
        this.AttackBtn.on("pointerdown", (pointer) => {
            if (!this.canAttack) return;
            
            this.isAttacking = true;
            this.canAttack = false
            
            this.randomAnimation = Phaser.Math.Between(1, 2);
            
            
            this.play(`DudeAttack${this.randomAnimation}`)
        })
        
        this.AttackBtn.on("pointerup", (pointer) => {
            
            this.scene.time.delayedCall(1300, () => {
                
                this.isAttacking = false;
                this.canAttack = true;
                
            });
            
        })
        
        for (var i = 1; i < 3; i++) {
            
            this.on(`animationcomplete-DudeAttack${i}`, () => {
                
                this.scene.time.delayedCall(300, () => {
                    
                    if (this.isMoving) {
                        this.play("DudeRun")
                        return
                    }
                    
                    this.play("DudeIdle")
                });
                
            });
        }
    }
    
    Flip(flip) {
        
        if (flip) {
            this.setFlipX(true);
            this.setOffset(53, 42)
            return 
        } 
        
        this.setFlipX(false);
        this.setOffset(43, 42)
    }
    
    
}

