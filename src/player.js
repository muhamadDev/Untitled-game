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
        .setSize(20,30)
        .setOffset(3,18)
        .setScale(2)
        
        this.isJumping = false;
        this.isMoving = false;
        
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
                
                if (!this.isJumping) {
                    this.setVelocityX(-this.speed)
                    this.play("DudeRun")
                    this.Flip(true)
                }
                
            }
            
            if (cursorKeys.right.isDown) {
                this.setVelocityX(this.speed * 0.6)
                this.isMoving = true;
                
                if(!this.isJumping) {
                    this.setVelocityX(this.speed)
                    this.play("DudeRun")
                    this.Flip(false)
                }
                
            }
            
            if(cursorKeys.right.isUp && cursorKeys.left.isUp) {
                this.setVelocityX(0)
                this.play("DudeIdle")
                this.isMoving = false;
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
            this.isJumping = true;
            
        });
        
        this.JumpButton.on("pointerup", (pointer) => {
            this.setVelocityY(0)
            this.setGravityY(420)
            this.isJumping = false;
            
            this.scene.time.delayedCall(3000,() => {
                this.setGravityY(300)
            });
            
        })
        
        this.on('animationcomplete-DudeJump', () => {
            
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
    
    Flip(flip) {
        
        if (flip) {
            this.setFlipX(true);
            this.setOffset(24,18)
            return 
        } 
        
        this.setFlipX(false);
        this.setOffset(3,18)
    }
    
}