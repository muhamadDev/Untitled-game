export default class Grid {
    
    constructor(scene, cellSize, worldWidth, worldHeight) {
        this.scene = scene;
        this.cellSize = cellSize;
        this.worldWidth = worldWidth || 1280;
        this.worldHeight = worldHeight || 720;
        
        this.rows = worldHeight / cellSize;
        this.cols = worldWidth / cellSize;
        
    }
    
    show() {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xFF0000);
        
        for (let row = 0; row < this.rows; row++) {
            
            for (let col = 0; col < this.cols; col++) {
                
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                graphics.strokeRect(x, y, this.cellSize, this.cellSize);
                
                
                this.scene.add.text(
                    x+5, y +5, `${col},${row}`, 
                    { fontSize: '13px', fill: '#fff' }
                );
            }
            
        }
    }
    
    placeAt(col, row, object) {
        let x = col * this.cellSize + this.cellSize / 2;
        let y = row * this.cellSize + this.cellSize / 2;
        // const y = col * this.cellHeight;
        
        object.setOrigin(0.5, 0.5)
        object.setPosition(x,y)
    }
}