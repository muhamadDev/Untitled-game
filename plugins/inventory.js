import PhaserTooltip from "./PhaserTooltip.js";

export default class Inventory {
    constructor(options, scene) {
        this.x = options.x || 90;
        this.y = options.y || 90;
        this.key = options.key;
        this.id = options.id || 0;
        this.space = options.space || 3;
        this.width = options.width || 100;
        this.height = options.height || this.width;
        this.padding = options.padding + this.width || 160;
        this.orientationY = options.orientationY || false;
        this.onClickCallback = options.onClickCallback;
        this.onDbClick = options.onDbClick;
        this.scrollFactor = options.scrollFactor || 0;
        this.tooltitOffset = options.tooltitOffset || 0;
        
        this.scene = scene;
        
        if (!options.inventorys) {
            this.inventorys = false
        } else if (!Array.isArray(options.inventorys)) {
            
            this.inventorys = [options.inventorys];
            
        } else {
            this.inventorys = options.inventorys
        }
        
        
        this.containerGroup = scene.physics.add.group();
        this.lastClickTime = 0;
        
        for (let i = 0; i < this.space; i++) {
            let posi = this.getDirection(i, this.space)
            
            let container = this.createPanel(scene, 0, 'text');
            container.setPosition(posi.x, posi.y).layout();
            container.setInteractive({ dropZone: true });
            
            this.containerGroup.add(container);
        }
        
        
        this.containerGroup.getChildren().forEach((container) => {
            this.setEvents(container.getElement('items'));
        });
        
        this.allToolTips = [];
        this.time = true
    }
    
    addItem(icon, itemInfo) {
        
        let notExist = 0;
        
        this.containerGroup.getChildren().forEach((container, index) => {
            
            let item = container.getElement('items')[0]
            if(item?.data.values.key === icon) {
                
                item.data.values.qountity += 1;
                
                let text = `${item.data.get("info").text} ${item.data.get("qountity")}`
                item.tooltip.destroy();
                item.tooltip = this.addTooltip(item, text, this.scrollFactor);
                
                return item;
            }
            
            notExist++
        });
        
        if (notExist <= this.space -1) return;
        
        let firstTime = true;
        
        let theContainer = null;
        this.containerGroup.getChildren().forEach((container, index) => {
            
            if (container.data.values.isFull) return;
            
            if(!firstTime) return;
            
            let posi = { x: container.x, y: container.y };
            
            container.data.values.isFull = true;
            container.destroy();
            
            container = this.createPanel(this, 1, icon, itemInfo)
            .setPosition(posi.x, posi.y).layout();
            
            container.setInteractive({ dropZone: true });
            
            this.setEvents(container.getElement('items'));
            this.containerGroup.add(container);
            firstTime = false;
            
            theContainer = container
            
        });
        
        return theContainer
    }
    
    removeItem(icon, qountity = 1) {
        let notExist = 0;
        
        this.containerGroup.getChildren().forEach((container, index) => {
            let item = container.getElement('items')[0];
            
            if (item?.data.values.key !== icon) {
                notExist++
                return
            };
            
            if (item.data.values.qountity <= 1) {
                container.remove(item, true);
                this.arrangeItems(container);
                container.data.values.isFull = false;
                return
            }
            
            item.data.values.qountity -= qountity;
            let text = `${item.data.get("info").text} ${item.data.get("qountity")}`
            item.tooltip.destroy();
            item.tooltip = this.addTooltip(item, text, this.scrollFactor);

            
            if (item.data.values.qountity <= 0) {
                container.remove(item, true);
                this.arrangeItems(container);
                container.data.values.isFull = false;
                return
            }
            
        });
        
    }


    createPanel(scene, itemCount = 0, text, itemInfo) {
        
        let sizer = this.scene.rexUI.add.sizer({
            width: this.width, height: this.height,
            orientation: 'y',
            space: { left: 6, right: 6, top: 6, bottom: 6, item: 1} 
        });
        
        sizer.setDepth(-1);
        sizer.addBackground(this.scene.add.image(0,0, this.key).setDepth(-1));
      
        sizer.setData('isFull', false)
        .setDepth(150)
        .setScrollFactor(this.scrollFactor)
        .setData('id', this.id)
        .text = text;
        
        for (let i = 0; i < itemCount; i++) {
            
            sizer.add(
                this.createLabel(scene, text, sizer, itemInfo).setDepth(155),
                {expand: true }
            );
            
        }
        this.scene.sizers.add(sizer);
        return sizer;
    }
    
    createLabel(scene, icon, parent, itemInfo) {
        const texture = this.scene.textures.get(icon);

        const width = texture.source[0].width;
        const height = texture.source[0].height;
        
        let scaleX = (this.width - 30) / width
        let scaleY = (this.height - 30) / height
        
        let label = this.scene.rexUI.add.label({
            icon: this.scene.add.image(0,0, icon).setScale(scaleX, scaleY),
            name: icon,
            width: this.width - 30,
            height: this.height - 30,
            align: 'center',
            space: {
                left: 5,
                right: 5,
                top: 5,
                bottom: 5 
            }
            
        });
        
        label.setData('qountity', itemInfo?.qountity || 1);
        label.setData('key', icon || 1);
        label.setData('info', itemInfo || {});
        label.name = icon;
        
        parent.data.values.isFull = true;
        return label;
    }
    
    setEvents(items) {
        
        items.forEach((item) => {
            item.setInteractive({ draggable: true });
            
            item.on('dragstart', (pointer, dragX, dragY) => {
                
              item.setData({ startX: item.x, startY: item.y });
              
            });
            
            item.on('drag', (pointer, dragX, dragY) => {
                
              item.setPosition(dragX, dragY);
              
            });
            
            item.on('dragend', (pointer, dragX, dragY, dropped) => {
                if (dropped) { 
                    return;
                }
                
                item.moveTo({
                    x: item.getData('startX'), y: item.getData('startY'),
                    speed: 800
                });
                
            });
            
            item.on('drop', (pointer, panel) => {
                if (item.getParentSizer().getData("id") !== panel.getData("id")) {
                    item.moveTo({
                        x: item.getData('startX'), y: item.getData('startY'),
                        speed: 300
                    });
                    
                    return
                }
                
                if (panel.data.values.isFull) {
                    
                    item.moveTo({
                        x: item.getData('startX'), y: item.getData('startY'),
                        speed: 300
                    });
                    
                    return
                    
                }
                
                // panel is new container of item;
                // but steal item is inside the same sizer

                let parent = item.getParentSizer();
                parent.data.values.isFull = false;
                parent.remove(item);
                this.arrangeItems(parent);
                
                
                let contain = panel.insertAtPosition(
                    pointer.x,
                    pointer.y,
                    item,
                    {expand: true,}
                );
                panel.data.values.isFull = true
                this.arrangeItems(panel);
                
            });
            
            item.on("pointerdown", (pointer, a,b,c) => {
                const currentTime = pointer.downTime;
                
                if (currentTime - this.lastClickTime < 300) {
                    this.handleDoubleClick(item, pointer);
                    return
                }
                
                this.lastClickTime = currentTime;
                this.onClickCallback.call(this.scene, item, pointer, a,b,c);
            });
            
            let text = `${item.data.get("info").text} ${item.data.get("qountity")}` 
            item.tooltip = this.addTooltip(item, text, this.scrollFactor);
            
        });
        
        
    }

    arrangeItems(panel) {
        let items = panel.getElement('items');
        
        items.forEach((item) => {
            item.setData({ startX: item.x, startY: item.y });
        });
        
        panel.layout();
        
        items.forEach((item) => {
            
            item.moveFrom({
                x: item.getData('startX'), y: item.getData('startY'),
                speed: 300 
            });
            
        });
    }
    
    getDirection(i, space) {
        let posi;
        if (this.orientationY) {
            posi = {
                x: this.x,
                y: this.y + (this.padding * i),
            };
            return posi;
        }
        
        posi = {
            x: this.x + (this.padding * i),
            y: this.y,
        };
        return posi;
        
        
        
    }
    
    addTooltip(item, content, setScrollFactor, scene = this.scene) {
        
        let tooltipID = scene.tooltipID = Math.random() * 10000;
        let toolTips = scene.tooltip.createTooltip({
            x: item.x - 70,
            y: item.y - 450,
            hasBackground: true,
            text: {
                text: content
            },
            background: {
                width: 50,
                height: 50
            },
            id: tooltipID,
            target: item
        });
        
        
        toolTips.setDepth(9000000)
        toolTips.setScrollFactor(setScrollFactor)
    
        scene.tooltip.hideTooltip(tooltipID);
    
        item.setInteractive();
    
        item.on('pointerover', (pointer, item) => {
            scene.tooltip.showTooltip(tooltipID, true);
        }, scene);
    
        item.on('pointerout', (pointer, item) => {
            scene.tooltip.hideTooltip(tooltipID, true);
        }, scene);
        
        this.allToolTips.push({
            item: toolTips,
            id: tooltipID,
        });
        
        return toolTips
    }
    
    update() {
        this.allToolTips.forEach((item, i) => {
            var pad = this.scene.tooltip.getPadding(item.id);
            var hPadding = pad.paddingLeft + pad.paddingRight;
            var targetX = this.scene.tooltip.getTarget(item.id).getBounds().centerX;
            
            if(this.orientationY) {
                item.item.x = (targetX - (item.item.getBounds().width + hPadding) * 1.5 ) -this.tooltitOffset.x;
                    
                item.item.y = this.scene.tooltip.getTarget(item.id).getBounds().y - this.tooltitOffset.y;
            } else {
                item.item.x = ( targetX - (item.item.getBounds().width + hPadding) * 0.5) -this.tooltitOffset.x;
                
                item.item.y = this.scene.tooltip.getTarget(item.id).getBounds().y -this.tooltitOffset.y;
                
            }
            
            
        })
    }
    
    handleDoubleClick(item, pointer) {
        let added = false;
        let parent = item.getParentSizer();
        
        this.scene.sizers.getChildren().forEach((sizer) => {
            if (sizer.getData("id") == parent.getData("id")) return;
            if (sizer.getData("isFull") == true) return;
            if (sizer.getData("hide") == true) return;
            if (!this.inventorys) return;
            if (added == true) return;
            
            this.inventorys.forEach((inventory) => {
                
                inventory.containerGroup.getChildren().forEach((child) => {
                    if (child !== sizer) return;
                    
                    inventory.addItem(item.name, {
                        qountity: item.getData("qountity"),
                        text: item.name
                    })
                    
                    this.removeItem(item.name, item.getData("qountity"))
                    
                }) 
                
            });
            this.onDbClick(item, pointer);
            added = true;
            
            
        })
        
    }
    
    close() {
        this.containerGroup.getChildren().forEach(container => {
            container.hide();
            container.setData("hide", true);
        });
        
    }
    
    open() {
        this.containerGroup.getChildren().forEach(container => {
            container.show();
            container.setData("hide", false);
        });
    }
    
    addInventorys(inventory) {
        if (!Array.isArray(this.inventorys)) {
            this.inventorys = []
        }
        this.inventorys.push(inventory);
    }
    
    
}

