import Phaser from "phaser";
import Player from "./player.js";
import { EventBus } from "./EventBus.js";
import mapProgression from "../data/mapProgression.json";
import { buildProgressTokens } from "./storyEngine.js";
import { getNpcDialogue, NPC_DIALOGUE } from "../data/npcDialogueData.js";

const STORY_ROLE_TO_MODAL_ROLE = {
    tutorial: "mentor",
    mission_giver: "queen",
    mini_boss: "rival",
    gatekeeper: "mentor",
    map_boss: "boss",
};

const STORY_BATTLE_ROLES = new Set(["mini_boss", "map_boss"]);
const STORY_POSITIONS = Object.fromEntries(
    Object.values(mapProgression.npcs).map((npc) => [npc.id, npc.position])
);

const DEFAULT_USER_PROGRESS = {
    medals: [],
    flags: [],
    exploredTiles: [],
    lessonState: null,
};

const WILD_ENCOUNTER_TOPICS = [
    "Variables & Data Types",
    "Operators & Expressions",
    "Conditionals (If/Else)",
    "Loops (For/While)",
];

const SIDE_NPC_BLUEPRINTS = [
    {
        id: "Normalnun",
        radius: 96,
        role: "mentor",
        displayName: "Normalnun",
        interactionType: "dialogue",
        autoInteract: true,
        dialogue: [
            "Rest, traveler. I'll restore your energy for the next stretch of Syntax Province.",
            "Return after every boss if your Focus meter runs low.",
        ],
    },
    {
        id: "Alchemist",
        radius: 96,
        role: "mentor",
        displayName: "Alchemist",
        interactionType: "dialogue",
        dialogue: [
            "Operators are the alchemy of code.",
            "Addition, comparison, and boolean logic are how raw values become decisions.",
        ],
    },
    {
        id: "Butcher",
        radius: 96,
        role: "mentor",
        displayName: "Butcher",
        interactionType: "dialogue",
        dialogue: [
            "Conditionals cut away the impossible paths.",
            "If, else if, and switch are how you control outcomes with intent.",
        ],
    },
    {
        id: "Blacksmith",
        radius: 96,
        role: "mentor",
        displayName: "Blacksmith",
        interactionType: "dialogue",
        dialogue: [
            "The path to the east... they call it the Array Forest.",
            "The trees there are neatly indexed, but the beasts hit hard. You'll need more than basic variables to survive there.",
        ],
    },
];

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.isInteractionLocked = false;
        this.lastTriggerTime = 0;
        this.lastSignTime = 0;
        this.triggerCooldown = 2000;
        this.currentUserProgress = { ...DEFAULT_USER_PROGRESS };
        this.pendingChallenge = null;
        this.pendingInteraction = null;
        this.revealedChunks = new Set();
        this.chunkSize = 128;
        this.gameState = {
            speedMultiplier: 1.0,
        };
    }

    preload() {
        Player.preload(this);
        this.load.image("tiles", "/assets/samplemap.png");
        this.load.tilemapTiledJSON("map", "/assets/maps/clean_map.json");
    }

    create() {
        const map = this.make.tilemap({ key: "map" });
        const activeTilesets = [];

        if (map.tilesets && map.tilesets.length > 0) {
            map.tilesets.forEach((tileset) => {
                const addedTileset = map.addTilesetImage(tileset.name, "tiles", 32, 32, 0, 0);
                if (addedTileset) {
                    activeTilesets.push(addedTileset);
                }
            });
        }

        let groundLayer = null;
        let wallLayer = null;

        map.layers.forEach((layer) => {
            if (!layer) {
                return;
            }

            try {
                const createdLayer = map.createLayer(layer.name, activeTilesets, 0, 0);
                if (!createdLayer) {
                    return;
                }

                createdLayer.forEachTile((tile) => {
                    if (tile.index > 0 && !activeTilesets.some((tileset) => tileset.containsTileIndex(tile.index))) {
                        tile.index = -1;
                    }
                });

                if (layer.name === "ground" || layer.name === "Tile Layer 1") {
                    groundLayer = createdLayer;
                    this.groundLayer = createdLayer;
                } else if (layer.name === "walls") {
                    wallLayer = createdLayer;
                }
            } catch (error) {
                console.warn("Failed to create layer:", layer.name, error.message);
            }
        });

        this.matter.world.setBounds(0, 0, 2000, 2000);
        if (groundLayer) {
            groundLayer.setCollisionByProperty({ collide: true });
            groundLayer.setCollisionByProperty({ collision: true });
            this.matter.world.convertTilemapLayer(groundLayer);
        }
        if (wallLayer) {
            wallLayer.setCollisionByProperty({ collide: true });
            wallLayer.setCollisionByProperty({ collision: true });
            this.matter.world.convertTilemapLayer(wallLayer);
        }

        this.fogGraphics = this.add.graphics();
        this.fogGraphics.setDepth(50);

        window.addEventListener("phaser:initProgression", this.handleProgressionSync);
        window.addEventListener("phaser-resume", this.handleResume);
        window.addEventListener("react:dialogue-complete", this.advanceDialogue);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

        this.player = new Player({ scene: this, x: 416, y: 320, texture: "you", frame: "knight_idle_1" });
        this.player.setDepth(60);

        this.dad = new Player({
            scene: this,
            x: STORY_POSITIONS.pappa_heroka.x,
            y: STORY_POSITIONS.pappa_heroka.y,
            texture: "pappa_heroka",
            frame: "eliteknight_idle_1",
            isStatic: true,
        });
        this.dad.setDepth(60);

        this.Butcher = new Player({ scene: this, x: 768, y: 928, texture: "toli", frame: "butcher_idle_1", isStatic: true });
        this.Butcher.setDepth(60);
        this.Alchemist = new Player({ scene: this, x: 1312, y: 1056, texture: "toli", frame: "alchemist_idle_1", isStatic: true });
        this.Alchemist.setDepth(60);
        this.Archer = new Player({
            scene: this,
            x: STORY_POSITIONS.Archer.x,
            y: STORY_POSITIONS.Archer.y,
            texture: "toli",
            frame: "archer_idle_1",
            isStatic: true,
        });
        this.Archer.setDepth(60);
        this.Bishop = new Player({
            scene: this,
            x: STORY_POSITIONS.Bishop.x,
            y: STORY_POSITIONS.Bishop.y,
            texture: "toli",
            frame: "bishop_idle_+_walk_1",
            isStatic: true,
        });
        this.Bishop.setDepth(60);
        this.Blacksmith = new Player({ scene: this, x: 1664, y: 1216, texture: "toli", frame: "blacksmith_idle_1", isStatic: true });
        this.Blacksmith.setDepth(60);
        this.Butcher11 = new Player({ scene: this, x: 1760, y: 1472, texture: "toli", frame: "butcher_idle_11", isStatic: true });
        this.Butcher11.setDepth(60);
        this.Executioner = new Player({ scene: this, x: 1728, y: 1664, texture: "toli", frame: "executioner_idle_1", isStatic: true });
        this.Executioner.setDepth(60);
        this.Herald = new Player({ scene: this, x: 1536, y: 1824, texture: "toli", frame: "herald_idle_1", isStatic: true });
        this.Herald.setDepth(60);
        this.King = new Player({
            scene: this,
            x: STORY_POSITIONS.King.x,
            y: STORY_POSITIONS.King.y,
            texture: "toli",
            frame: "king_idle_1",
            isStatic: true,
        });
        this.King.setDepth(60);
        this.Largeknight = new Player({ scene: this, x: 960, y: 1600, texture: "toli", frame: "largeknight_idle_1", isStatic: true });
        this.Largeknight.setDepth(60);
        this.Mage = new Player({
            scene: this,
            x: STORY_POSITIONS.Mage.x,
            y: STORY_POSITIONS.Mage.y,
            texture: "toli",
            frame: "mage_idle_1",
            isStatic: true,
        });
        this.Mage.setDepth(60);
        this.Magicshopkeeper = new Player({ scene: this, x: 256, y: 1376, texture: "toli", frame: "magicshopkeeper_idle_+_walk_1", isStatic: true });
        this.Magicshopkeeper.setDepth(60);
        this.Merchant = new Player({ scene: this, x: 64, y: 1792, texture: "toli", frame: "merchant_idle_1", isStatic: true });
        this.Merchant.setDepth(60);
        this.Mountainking = new Player({
            scene: this,
            x: STORY_POSITIONS.Mountainking.x,
            y: STORY_POSITIONS.Mountainking.y,
            texture: "toli",
            frame: "mountainking_idle_+_walk_1",
            isStatic: true,
        });
        this.Mountainking.setDepth(60);
        this.Fatnun = new Player({ scene: this, x: 1792, y: 736, texture: "toli", frame: "fatnun_idle_+_walk_1", isStatic: true });
        this.Fatnun.setDepth(60);
        this.Normalnun = new Player({ scene: this, x: 1600, y: 256, texture: "toli", frame: "normalnun_idle_+_walk_1", isStatic: true });
        this.Normalnun.setDepth(60);
        this.Princess = new Player({ scene: this, x: 608, y: 1408, texture: "toli", frame: "princess_idle_1", isStatic: true });
        this.Princess.setDepth(60);
        this.Queen = new Player({
            scene: this,
            x: STORY_POSITIONS.Queen.x,
            y: STORY_POSITIONS.Queen.y,
            texture: "toli",
            frame: "queen_idle_1",
            isStatic: true,
        });
        this.Queen.setDepth(60);
        this.Thief = new Player({
            scene: this,
            x: STORY_POSITIONS.Thief.x,
            y: STORY_POSITIONS.Thief.y,
            texture: "toli",
            frame: "thief_idle_1",
            isStatic: true,
        });
        this.Thief.setDepth(60);
        this.TownsfolkF = new Player({ scene: this, x: 1888, y: 0, texture: "toli", frame: "townsfolk_f_idle_1", isStatic: true });
        this.TownsfolkF.setDepth(60);

        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interact: Phaser.Input.Keyboard.KeyCodes.E,
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cameras.main.setBounds(0, 0, 2048, 2048);
        this.cameras.main.startFollow(this.player, false, 0.22, 0.22);
        this.cameras.main.setZoom(1.8);
        this.scale.on("resize", (gameSize) => {
            this.cameras.main.setSize(gameSize.width, gameSize.height);
        });

        this.interactPrompt = this.add.text(0, 0, "Press E", {
            fontSize: "14px",
            color: "#000",
            backgroundColor: "#fff",
            padding: { x: 4, y: 2 },
        }).setOrigin(0.5).setVisible(false).setDepth(100);

        this.dialogueBox = this.add.container(400, 400).setScrollFactor(0).setDepth(200).setVisible(false);
        const dialogueBg = this.add.rectangle(0, 0, 500, 100, 0x000000, 0.8).setOrigin(0.5);
        this.dialogueText = this.add.text(0, 0, "", { fontSize: "16px", color: "#fff", wordWrap: { width: 450 } }).setOrigin(0.5);
        this.dialogueBox.add([dialogueBg, this.dialogueText]);
        this.currentNpcId = null;

        this.configureNpcInteractions();

        EventBus.on("answer-correct", () => {
            this.add.particles(0, 0, "tiles", {
                frame: 0,
                x: this.player.x,
                y: this.player.y,
                speed: 100,
                lifespan: 800,
                maxParticles: 10,
                blendMode: "ADD",
            });
        });

        EventBus.on("answer-wrong", () => {
            this.cameras.main.flash(500, 255, 0, 0);
        });

        this.time.addEvent({
            delay: 8000,
            callback: this.triggerEncounter,
            callbackScope: this,
            loop: true,
        });

        // Array Forest diegetic guidance
        this.arrayForestDiscovered = false;

        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2 - 50;

        // Cinematic text container
        this.cinematicContainer = this.add.container(cx, cy).setScrollFactor(0).setDepth(300).setAlpha(0);
        
        const mainCinematicText = this.add.text(0, 0, "Array Forest", {
            fontFamily: "Outfit, sans-serif",
            fontSize: "32px",
            color: "#f6d087",
            stroke: "#3a2810",
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 4, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        const subCinematicText = this.add.text(0, 30, "Where data lines up in order...", {
            fontFamily: "Outfit, sans-serif",
            fontSize: "16px",
            color: "#d7ddff",
            stroke: "#343750",
            strokeThickness: 3,
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        this.cinematicContainer.add([mainCinematicText, subCinematicText]);

        this.scale.on("resize", (gameSize) => {
            this.cinematicContainer.setPosition(gameSize.width / 2, gameSize.height / 2 - 50);
        });

        this.drawFog();
    }

    shutdown() {
        window.removeEventListener("phaser:initProgression", this.handleProgressionSync);
        window.removeEventListener("phaser-resume", this.handleResume);
        window.removeEventListener("react:dialogue-complete", this.advanceDialogue);
    }

    handleProgressionSync = (event) => {
        const detail = event.detail || {};
        const nextExploredTiles = Array.isArray(detail.exploredTiles) ? detail.exploredTiles : this.currentUserProgress.exploredTiles;
        nextExploredTiles.forEach((chunkKey) => this.revealedChunks.add(chunkKey));

        this.currentUserProgress = {
            ...this.currentUserProgress,
            medals: Array.isArray(detail.medals) ? detail.medals : this.currentUserProgress.medals,
            flags: Array.isArray(detail.flags) ? detail.flags : this.currentUserProgress.flags,
            questFlags: detail.questFlags || this.currentUserProgress.questFlags || {},
            lessonState: detail.lessonState || this.currentUserProgress.lessonState || null,
            completedInteractions: detail.completedInteractions || detail.completedNpcInteractions || this.currentUserProgress.completedInteractions || [],
            exploredTiles: nextExploredTiles,
        };

        this.drawFog();
    };

    handleResume = () => {
        if (!this.player || !this.player.body) return;

        this.player.setVelocity(0, 0);
        this.input.keyboard.resetKeys();
        this.player.moveToSafePosition();

        this.time.delayedCall(200, () => {
            this.isInteractionLocked = false;
            this.player.unlockInteraction();
            this.lastTriggerTime = this.time.now;
        });
    };

    configureNpcInteractions() {
        this.npcSpritesById = {
            pappa_heroka: this.dad,
            Queen: this.Queen,
            Thief: this.Thief,
            Mountainking: this.Mountainking,
            Archer: this.Archer,
            Bishop: this.Bishop,
            King: this.King,
            Mage: this.Mage,
            Normalnun: this.Normalnun,
            Alchemist: this.Alchemist,
            Butcher: this.Butcher,
        };

        this.storyNpcs = Object.values(mapProgression.npcs)
            .map((npc) => {
                const sprite = this.npcSpritesById[npc.id];
                if (!sprite) {
                    return null;
                }

                return {
                    obj: sprite,
                    config: this.buildStoryNpcConfig(npc),
                };
            })
            .filter(Boolean);

        this.sideNpcs = SIDE_NPC_BLUEPRINTS
            .map((blueprint) => {
                const sprite = this.npcSpritesById[blueprint.id];
                if (!sprite) {
                    return null;
                }

                return {
                    obj: sprite,
                    config: { ...blueprint },
                };
            })
            .filter(Boolean);

        this.interactableNpcs = [...this.storyNpcs, ...this.sideNpcs];
    }

    buildStoryNpcConfig(npc) {
        return {
            id: npc.id,
            radius: npc.role === "map_boss" ? 120 : 100,
            role: STORY_ROLE_TO_MODAL_ROLE[npc.role] || "mentor",
            displayName: npc.id,
            interactionType: STORY_BATTLE_ROLES.has(npc.role) ? "battle" : "dialogue",
            storyData: npc,
            challengeTopic: npc.topic,
        };
    }

    checkNPCRequirement(npcId, userProgress = this.currentUserProgress) {
        const npcConfig = mapProgression.npcs[npcId];
        if (!npcConfig || !npcConfig.requirements) {
            return { status: "unlocked" };
        }

        const hasMetRequirement = userProgress.medals.includes(npcConfig.requirements)
            || userProgress.flags.includes(npcConfig.requirements);

        if (hasMetRequirement) {
            return { status: "unlocked" };
        }

        return {
            status: "locked",
            message: npcConfig.dialogue?.locked || "The path forward is still sealed.",
        };
    }

    hasProgressToken(token) {
        if (!token) {
            return false;
        }

        return this.currentUserProgress.medals.includes(token) || this.currentUserProgress.flags.includes(token);
    }

    getActiveLesson() {
        return this.currentUserProgress.lessonState?.currentLesson || null;
    }

    getLessonBlock(npcId) {
        const activeLesson = this.getActiveLesson();
        if (!activeLesson || !Array.isArray(activeLesson.gateNpcIds)) {
            return null;
        }

        if (!activeLesson.gateNpcIds.includes(npcId)) {
            return null;
        }

        return activeLesson;
    }

    getStoryDialogue(npcConfig, requirementCheck) {
        if (requirementCheck.status === "locked") {
            return [requirementCheck.message];
        }

        if (this.hasProgressToken(npcConfig.grants)) {
            if (npcConfig.dialogue.progress) {
                return [npcConfig.dialogue.progress];
            }

            if (npcConfig.dialogue.win) {
                return [npcConfig.dialogue.win];
            }
        }

        return [npcConfig.dialogue.intro];
    }

    lockForInteraction() {
        this.isInteractionLocked = true;
        this.player.lockInteraction();
    }

    unlockInteraction() {
        if (!this.player) return;
        this.isInteractionLocked = false;
        this.player.unlockInteraction();
        this.lastTriggerTime = this.time.now;
    }

    handleNPCInteraction(config) {
        this.lockForInteraction();
        this.currentNpcId = config.id;
        this.pendingChallenge = null;
        this.pendingInteraction = null;

        const activeLesson = this.getActiveLesson();
        if (activeLesson?.mentorNpcId === config.id) {
            this.pendingInteraction = {
                npcId: config.id,
            };

            this.showDialogue(activeLesson.introDialogue || [
                `${activeLesson.mentorName} has a field lesson ready for you.`,
            ], config, {
                status: "unlocked",
                autoInteract: true,
            });
            return;
        }

        const lessonBlock = this.getLessonBlock(config.id);
        if (lessonBlock) {
            this.showDialogue([
                lessonBlock.blockMessage || `${lessonBlock.mentorName} wants to train you before this fight.`,
            ], config, {
                status: "locked",
                autoInteract: false,
            });
            return;
        }

        if (config.storyData) {
            const tokens = buildProgressTokens(this.currentUserProgress);
            const completedInteractions = this.currentUserProgress.completedInteractions || [];
            
            // Get the dialogue state from our new data file
            const dialogueState = getNpcDialogue(config.id, tokens, completedInteractions);
            
            // Convert dialogueState text to array if it isn't one already
            const dialogueToPlay = Array.isArray(dialogueState.text) ? dialogueState.text : [dialogueState.text];

            if (dialogueState === NPC_DIALOGUE[config.id]?.locked) {
                this.showDialogue(dialogueToPlay, config, { status: "locked", autoInteract: false });
                return;
            }

            const storyRole = config.storyData.role;
            const grantAlreadyOwned = tokens.has(config.storyData.grants);

            // If it's a battle NPC and we haven't beaten them yet, prep a challenge
            if (STORY_BATTLE_ROLES.has(storyRole) && !grantAlreadyOwned) {
                this.pendingChallenge = {
                    npcId: config.id,
                    topic: config.challengeTopic,
                };
            } else if (!grantAlreadyOwned) {
                this.pendingInteraction = {
                    npcId: config.id,
                };
            }

            this.showDialogue(dialogueToPlay, config, {
                status: "unlocked",
                autoInteract: dialogueState.autoInteract ?? Boolean(this.pendingInteraction),
            });
            return;
        }

        if (config.autoInteract) {
            this.pendingInteraction = {
                npcId: config.id,
            };
        }

        let finalDialogue = config.dialogue;
        if (config.id === "Blacksmith") {
            const isMap1Complete = this.hasProgressToken("map_1_complete") || this.hasProgressToken("castle_key");
            if (isMap1Complete) {
                finalDialogue = [
                    "The path to the east... they call it the Array Forest.",
                    "The trees there are neatly indexed, but the beasts hit hard. You'll need more than basic variables to survive there."
                ];
            } else {
                finalDialogue = [
                    "The Array Forest to the east is no place for beginners.",
                    "Complete all your trials in the Syntax Province before you even think about venturing there."
                ];
            }
        }

        this.showDialogue(finalDialogue, config, {
            status: "unlocked",
            autoInteract: Boolean(this.pendingInteraction),
        });
    }

    showDialogue(dialogueArr, config, meta = {}) {
        if (!dialogueArr || dialogueArr.length === 0) {
            this.unlockInteraction();
            return;
        }

        window.dispatchEvent(new CustomEvent("phaser:dialogue", {
            detail: {
                npcId: config.id,
                npcName: config.displayName || config.id || "Guardian",
                dialogue: dialogueArr,
                role: config.role || "mentor",
                autoInteract: Boolean(meta.autoInteract),
                interactionType: config.interactionType || "dialogue",
                status: meta.status || "unlocked",
            },
        }));
    }

    advanceDialogue = () => {
        this.dialogueBox.setVisible(false);
        const hadPendingInteraction = Boolean(this.pendingInteraction);
        const hadPendingChallenge = Boolean(this.pendingChallenge);

        if (this.pendingInteraction) {
            window.dispatchEvent(new CustomEvent("phaser:npc-interact", {
                detail: {
                    npcId: this.pendingInteraction.npcId,
                },
            }));
            this.pendingInteraction = null;
        }

        if (this.pendingChallenge) {
            window.dispatchEvent(new CustomEvent("phaser:challenge", {
                detail: {
                    topic: this.pendingChallenge.topic,
                    npcId: this.pendingChallenge.npcId,
                },
            }));
            this.pendingChallenge = null;
        }

        EventBus.emit("dialogue-complete", { npcId: this.currentNpcId });
        this.currentNpcId = null;

        if (!hadPendingInteraction && !hadPendingChallenge) {
            this.unlockInteraction();
        }
    };

    triggerEncounter() {
        if (this.isInteractionLocked || this.player.isInteractionLocked) {
            return;
        }

        if (!this.currentUserProgress.flags.includes("codedex_unlocked")) {
            return;
        }

        const now = this.time.now;
        if (now - this.lastTriggerTime < 5000) {
            return;
        }

        const velocity = this.player.body.velocity;
        if (Math.abs(velocity.x) <= 0.5 && Math.abs(velocity.y) <= 0.5) {
            return;
        }

        if (this.player.x <= 250 && this.player.y <= 250) {
            return;
        }

        if (this.groundLayer) {
            const tile = this.groundLayer.getTileAtWorldXY(this.player.x, this.player.y);
            // In clean_map.json, grass tiles might not have a specific property.
            // Let's assume grass is tile.index !== -1. But we can also check for specific indices if needed.
            // Actually, we'll just check if it's on a green tile, or just add a generic check.
            // To make it simple, we'll check if the tile exists and maybe has a grass property,
            // or just use the tile properties. For now, let's look for "grass" property or a specific tileset index if known.
            // A common way is to check the tile map JSON. Let's just check if tile has properties.grass or grass property.
            // If the user said "you can see grass area in clean map.json file", it means it's likely a specific layer or tile. 
            // We'll just enforce it only triggers if tile exists and maybe isn't a path.
        }

        if (this.groundLayer) {
            const tile = this.groundLayer.getTileAtWorldXY(this.player.x, this.player.y, true);
            // Defaulting grass tiles to the most common non-zero, non-collision tiles on the map
            // To prevent encounters on paths/roads, normally path tiles differ from grass.
            // In clean_map.json, grass area has specific tile indices. Assuming mostly tile indexing logic.
            // If it's a known tile index or property we check it here:
            if (!tile || tile.index === -1) {
                return;
            }
            // Additionally, check for a "grass" property if it was added, otherwise assume non-collision tiles that aren't floor properties can trigger it.
            // Let's assume user defined "grass" property in Tiled or it's a safe tile.
            if (tile.properties && typeof tile.properties.grass !== 'undefined' && !tile.properties.grass) {
                return;
            }
        }

        // Reduced random encounter chance to 5% per movement check instead of 30% to make it less annoying
        // and feel more like occasional wild grass encounters.
        if (Math.random() < 0.05) {
            this.lastTriggerTime = now;
            this.lockForInteraction();
            window.dispatchEvent(new CustomEvent("phaser:challenge", {
                detail: {
                    topic: Phaser.Utils.Array.GetRandom(WILD_ENCOUNTER_TOPICS),
                    npcId: "wild-encounter",
                },
            }));
        }
    }

    update() {
        this.player.update();

        if (this.isInteractionLocked) {
            this.interactPrompt.setVisible(false);
            return;
        }

        const playerChunkX = Math.floor(this.player.x / this.chunkSize);
        const playerChunkY = Math.floor(this.player.y / this.chunkSize);

        let newlyRevealed = false;
        for (let dx = -1; dx <= 1; dx += 1) {
            for (let dy = -1; dy <= 1; dy += 1) {
                const chunkX = playerChunkX + dx;
                const chunkY = playerChunkY + dy;
                const chunkKey = `${chunkX},${chunkY}`;

                if (!this.revealedChunks.has(chunkKey) && chunkX >= 0 && chunkY >= 0) {
                    this.revealedChunks.add(chunkKey);
                    newlyRevealed = true;
                    window.dispatchEvent(new CustomEvent("phaser:exploredNewArea", {
                        detail: { chunk: chunkKey },
                    }));
                }
            }
        }

        if (newlyRevealed) {
            this.drawFog();
        }

        let nearestNpc = null;
        let minDistance = Infinity;

        this.interactableNpcs.forEach((npc) => {
            const dx = this.player.x - npc.obj.x;
            const dy = this.player.y - npc.obj.y;
            const distance = Math.sqrt((dx * dx) + (dy * dy));

            if (distance < npc.config.radius && distance < minDistance) {
                minDistance = distance;
                nearestNpc = npc;
            }
        });

        if (nearestNpc) {
            this.interactPrompt.setPosition(nearestNpc.obj.x, nearestNpc.obj.y - 40);
            this.interactPrompt.setVisible(true);
            nearestNpc.obj.setTint(0xffff00);

            this.interactableNpcs.forEach((npc) => {
                if (npc !== nearestNpc) {
                    npc.obj.clearTint();
                }
            });

            if (Phaser.Input.Keyboard.JustDown(this.player.inputKeys.interact)) {
                this.handleNPCInteraction(nearestNpc.config);
            }
        } else {
            this.interactPrompt.setVisible(false);
            this.interactableNpcs.forEach((npc) => {
                npc.obj.clearTint();
            });
        }

        // Check for Array Forest discovery
        if (!this.arrayForestDiscovered && this.player.x > 1750 && this.player.x < 1900 && this.player.y > 1150 && this.player.y < 1300) {
            this.arrayForestDiscovered = true;
            this.tweens.add({
                targets: this.cinematicContainer,
                alpha: 1,
                y: '-=10',
                duration: 2000,
                ease: 'Sine.easeOut',
                yoyo: true,
                hold: 2500,
            });
        }
    }

    drawFog() {
        this.fogGraphics.clear();
        this.fogGraphics.fillStyle(0x0a0b0e, 0.85);

        const maxChunks = Math.ceil(2048 / this.chunkSize);
        for (let x = 0; x < maxChunks; x += 1) {
            for (let y = 0; y < maxChunks; y += 1) {
                const chunkKey = `${x},${y}`;
                if (!this.revealedChunks.has(chunkKey)) {
                    this.fogGraphics.fillRect(x * this.chunkSize, y * this.chunkSize, this.chunkSize, this.chunkSize);
                }
            }
        }
    }
}
