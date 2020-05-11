import * as ROT from "rot-js";
import { game, rand, pop_random } from "./main.ts";
import { Player, Rat, Snake } from "./creature.ts";

const MAP_WIDTH = 15;
const MAP_HEIGHT = 15;
const DISPLAY_WIDTH = 40;
const DISPLAY_HEIGHT = 25;

export class Map {
    display: any;
    width: number;
    height: number;
    layer: {};
    shadow: {};
    agents: Array<any>;

    constructor() {
        this.display = new ROT.Display({
            width: DISPLAY_WIDTH,
            height: DISPLAY_HEIGHT,
            fontSize: 24,            
            fontFamily: 'sans-serif',
        });
        document.body.appendChild(this.display.getContainer());
        
        this.width = MAP_WIDTH;
        this.height = MAP_HEIGHT;
        this.layer = {};
        this.shadow = {};
        let free_cells = [];
        let digger = new ROT.Map.Digger(this.width, this.height);
        digger.create((x, y, value) => {
            if (value) return; 
            var key = x + "," + y;
            this.layer[key] = "　";
            free_cells.push([x, y]);
        });

        let p = pop_random(free_cells);
        game.player = new Player(p[0], p[1]);

        this.agents = Array<any>();
        this.agents.push(game.player);
        
        for (let i=0;i<20;++i) {            
            let p = pop_random(free_cells);
            let r = new Rat(p[0], p[1]);
            console.log(p);
            this.agents.push(r);
        }
    }
    light(key) {        
        let t = this.layer[key];
        return t === "　";        
    }
    gen_shadow(p: Player, color: string) {
        let fov = new ROT.FOV.RecursiveShadowcasting((x, y) => {
            const key = x+','+y; 
            return this.light(key);
        });

        fov.compute90(p.x, p.y, 9, p.dir, (x, y, r, visibility) => {            
            const key = x+','+y;   
            this.shadow[key] = color;
        });
    }
    draw_tile_at(x, y, key) {
        if (this.layer[key] === '　') {
            this.display.draw(x, y, this.layer[key]);
        } else {
            if (this.shadow[key]) {
                this.display.draw(x, y, "墻", this.shadow[key]);
            } else {
                this.display.draw(x, y, null);
            }
        }
    }    
    draw() {
        const o = this.display.getOptions(); 
        let w = o.width, h = o.height; 
        this.gen_shadow(game.player, '#fff');
        for (let x=0;x<w;++x) {
        	for (let y=0;y<h;++y) {
                let xx = x + game.camera.x - game.camera.ox;
                let yy = y + game.camera.y - game.camera.oy;
                let key = xx+','+yy;
                this.draw_tile_at(x, y, key);
        	}
        }

        for (let i=0;i<this.agents.length;++i) {
            this.agents[i].draw();
        }
        this.gen_shadow(game.player, '#555');
    }
}
