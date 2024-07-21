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
        
        PhaserHealth.AddTo(this, this.health, this.minHealth, this.maxHealth);
        
        this
        .setDepth(4)
        .setCollideWorldBounds(true)
        .setPushable(false)
        .setSize(50,80)
        .setOffset(80, 60)
        .setScale(1.3)
        
        this.isJumping = false;
        
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
        
        this.scene.physics.add.collider(this.scene.plateform, this, () => {
            this.anims.resume();
        })
    }
    
    Movement() {
        
        let graphics = this.scene.add.graphics();
        graphics.fillStyle(0x888888, 1);
        graphics.fillRoundedRect(-100, -40, 200, 80, 30);
        graphics.setDepth(100)
        
        this.joyStick = this.scene.plugins.get('rexvirtualjoystickplugin')
        .add(this, {
            x: 200,
            y: 600,
            radius: 100,
            base: graphics,
            thumb: this.scene.add.circle(0, 0, 50, 0xcccccc).setDepth(100),
            dir: 'left&right',
        })
        .on('update', dumpJoyStickState, this);
        
        // this.scene.add.circle(0, 0, 80, 0x888888)
        
        function dumpJoyStickState() {
            const cursorKeys = this.joyStick.createCursorKeys();
            
            if (cursorKeys.left.isDown) {
                this.setVelocityX(-this.speed)
                
                if (!this.isJumping) {
                    this.play("DudeRun")
                    this.Flip(true)
                }
                
            }
            
            if (cursorKeys.right.isDown) {
                this.setVelocityX(this.speed)
                
                if(!this.isJumping) {
                    this.play("DudeRun")
                    this.Flip(false)
                }
                
            }
            
            if(cursorKeys.right.isUp && cursorKeys.left.isUp) {
                this.setVelocityX(0)
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
        this.JumpButton = this.scene.add.circle(1100, 600, 50, 0xcccccc);
        
        this.JumpButton
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(100);
        
        this.JumpButton.on("pointerdown", (pointer) => {
            if(!this.body.touching.down) return;
            this.setVelocityY(-300)
            this.anims.pause();
            this.isJumping = true;
            // in line 44 the anims will "resume" when the player touches groud
        });
        
        this.JumpButton.on("pointerup", (pointer) => {
            this.setVelocityY(0)
            this.isJumping = false;
        })
        
        this.on('animationcomplete-DudeJump', () => {
            this.play("DudeRun")
        });
    }
    
    Flip(flip) {
        
        if (flip) {
            this.setFlipX(true);
            this.setOffset(90, 60)
            return 
        } 
        
        this.setFlipX(false);
        this.setOffset(80, 60)
    }
    
}