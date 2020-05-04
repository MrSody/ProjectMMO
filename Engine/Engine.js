const Player = require('./Modules/Player.js').Player; // Player class
const World = require('./Modules/World.js').World;
const Npc = require('./Modules/Npc.js').Npc;

var fs = require('fs');

/* ------------------------------ *
    VARIABLES
* ------------------------------ */
let	towers,
    spriteMap,
	enemies,	// Array de los enemigos
	items,		// Array de los items
    jutsusList, // Array de los jutsus
	world,		// Array de el mapa
	collisionMap,
	worldSize,
    tileSize;
    
const clsWorld = new World();

let players = [],	// Array de los jugadores conectados
	npcs = [];  // Array de los NPC

class Engine {

    // Inizializa
    init () {
        // Carga el mundo
        this.loadWorld();
    }

    loadWorld () {
        // MUNDO
        world = clsWorld.getWorld();
    
        // TAMAÑO DEL MUNDO Y TILESIZE
        worldSize = clsWorld.getWorldSize();
        tileSize = clsWorld.getTileSize();
    
        // spriteMap
        spriteMap = fs.readFileSync('./Engine/Sprite/Mapa.txt', 'utf-8');

        // Cargado el mundo
        console.log("Completado: Se han cargado el mundo...");
    }

/* ------------------------------ *
    FUNCIONES DE AYUDA
* ------------------------------ */
    // SEARCH THE PLAYER FOR THE ID - 100%
    playerById (ID) {
        for (let player of players) {
            if (player.getID() == ID) {
                return player;
            }
        }
        return false;
    }

    npcById (ID) {
        for (let npc of npcs) {
            if (npc.getID() == ID) {
                return npc;
            }
        }
        return false;
    }

    // BUSCAR IDMAPA EN EL MUNDO - 100%
    searchIDMap (IDmap) {
        let X, Y;
        for(Y = 0; Y < worldSize; Y++) {
            X = world[Y].indexOf(IDmap);
            if(X != -1) {
                return {x: X, y: Y};
            }
        }
        return false;
    }

    // Actualiza la posicion
    updatePos (posX, posY, posMap) {
        console.log("updatePos X:"+ posX +"-"+ posY +"posMap"+ posMap.x +"-"+ posMap.y);
        let idMap;

        if(posX < 0) {
            posX = 31;
            idMap = world[posMap.y][posMap.x - 1];
        } else if(posX > 32) {
            posX = 0;
            idMap = world[posMap.y][posMap.x + 1];
        } else if(posY < 0) {
            posY = 31;
            idMap = world[posMap.y - 1][posMap.x];
        } else if(posY > 32) {
            posY = 0;
            idMap = world[posMap.y + 1][posMap.x];
        } else {
            idMap = world[posMap.y][posMap.x];
        }

        return {idMap: idMap, x: posX, y: posY};
    }

/* ------------------------------ *
    FUNCIONES - NPC
* ------------------------------ */
    addNPC (dataNPC) {
        let posMap = this.searchIDMap(dataNPC.IDMap);
        let posX = Math.floor((posMap.x * tileSize) + dataNPC.PosX);
        let posY = Math.floor((posMap.y * tileSize) + dataNPC.PosY);

        // Sprite Npc
        let skinNpc = fs.readFileSync(`./Engine/Sprite/Npc/${dataNPC.Skin}`, 'utf-8');

        npcs.push(new Npc(dataNPC, posX, posY, skinNpc));
    }

    NPCCercanos (player) {
        let posWorld = player.getPosWorld();
        let NPCCercanos = [];

        console.log("3: "+ player.getPosWorld().x +" -- "+ player.getPosWorld().y);

        let initPosWorld = {x: posWorld.x - ((32 * 3) / 2), y: posWorld.y - ((32 * 3) / 2)};
        let endPosWorld = {x: posWorld.x + ((32 * 3) / 2), y: posWorld.y + ((32 * 3) / 2)};

        for (let y = initPosWorld.y; y < endPosWorld.y; y++) {
            for (let x = initPosWorld.x; x < endPosWorld.x; x++) {
                npcs.forEach((npc) => {
                    let NPCPos = npc.getPos();
                    
                    if (NPCPos.x == x && NPCPos.y == y) {
                        NPCCercanos.push(npc);
                    }
                });
            }
        }

        return NPCCercanos;
    }

/* ------------------------------ *
    FUNCIONES - PLAYER
* ------------------------------ */
    addPlayer (idClient, results) {
        // Search position the player in the map
        let posMap = this.searchIDMap(results[0].Nmap);

        let posX = Math.floor((posMap.x * tileSize) + results[0].X);
        let posY = Math.floor((posMap.y * tileSize) + results[0].Y);

        // Sprite player
        let skinBase = fs.readFileSync(`./Engine/Sprite/Player/Base/${results[0].skinBase}.txt`, 'utf-8');

        let player =  new Player(idClient, results[0], posX, posY, skinBase, "");

        players.push(player);

        return player;
    }

    movePlayer (player, data) {

        let pos = player.getPos(),
            posWorld = player.getPosWorld(),
            posMap = this.searchIDMap(player.getIDmap()),
            newPos = this.updatePos((pos.x + data.x), (pos.y + data.y), posMap);

        console.log("antes: "+ player.getPosWorld().x +" -- "+ player.getPosWorld().y);

        console.log("Player X: "+ Math.floor(pos.x + data.x) +" - "+ Math.floor(pos.y + data.y) +" idMap: "+ newPos.idMap +" dir: "+ data.dir);

        player.setPos(newPos.x, newPos.y);
        player.setDirection(data.dir);
        player.setIDMap(newPos.idMap);
        player.setPosWorld((posWorld.x + data.x), (posWorld.y + data.y));

        console.log("ahora: "+ player.getPosWorld().x +" -- "+ player.getPosWorld().y);
    }

    playerDisconnect (id) {
        let player = this.playerById(id);

        console.log("se desconecto "+ player.getName());

        players.splice(players.indexOf(player), 1);
        
        return player;
    }

/* ------------------------------ *
    GETTERS
* ------------------------------ */
    getTileSize () {
        return tileSize;
    }

    getSpriteMap () {
        return spriteMap;
    }

    getMap (player, width, height) {
        const   pos = player.getPos(),
                posMap = this.searchIDMap(player.getIDmap());

        //Carga las capas del mapa y las colisiones
        return clsWorld.getMap(width, height, pos, posMap);
    }

    getPlayers () {
        return players;
    }

}

exports.Engine = Engine;