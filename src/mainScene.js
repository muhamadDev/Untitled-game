import Grid from "./grid.js";
import Player from "./player.js";

export default class Main extends Phaser.Scene {
    constructor() {
        super({ key: "scene" });
    }
    
    preload() {
        this.load.pack('assetPack', '../json/pack.json');
    }

    create() {
        this.input.addPointer(9);
        
        this.grid = new Grid(this, 32 * 1.5, 1280, 720)
        this.grid.show()
        
        this.createMap(1.5);
        
        this.createPlayer();
        
    }
    
    update(time, delta) {}
    
    createMap(scale) {
        const data = this.cache.json.get("map");
        
        this.plateform = this.physics.add.group();
        
        data.foreground.forEach((tile) => {
            
            for (let i = tile.col; i < tile.toCol + 1; i++) {
                
                const box = this.plateform.create(0, 0, "Tileset", tile.frame)
                
                box.setScale(scale).setPushable(false)
                
                this.grid.placeAt(i, tile.row, box)
                
            }
            
            
        })
        
    }
    
    createPlayer() {
        this.dude = new Player({
            x: 300,
            y: 300,
            key: "DudeIdle",
            speed: 120
        }, this)
        
        this.grid.placeAt(2, 8, this.dude)
        
        this.physics.add.collider(this.plateform, this.dude);
        
    }
    
}
