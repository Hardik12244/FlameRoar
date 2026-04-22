import MainScene from "./MainScene.js";
export function initGame(parentContainerId) {
    if (window.__PHASER_GAME__) {
        const existingParent = window.__PHASER_GAME__.config.parent;
        if (existingParent !== parentContainerId) {
            window.__PHASER_GAME__.destroy(true);
            window.__PHASER_GAME__ = null;
        } else {
            return window.__PHASER_GAME__;
        }
    }

    const matterCollisionPlugin =
        (window.PhaserMatterCollisionPlugin && window.PhaserMatterCollisionPlugin.default) || window.PhaserMatterCollisionPlugin;
    if (!matterCollisionPlugin) {
        console.warn('PhaserMatterCollisionPlugin not found. Check the script tag in index.html.');
    }
    const config = {
        width: 1280,
        height: 720,
        backgroundColor: '#0a0b0e',
        type: Phaser.AUTO,
        parent: parentContainerId,
        scene: [MainScene],
        pixelArt: true,
        antialias: false,
        roundPixels: true,
        powerPreference: 'high-performance',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            zoom: 1,
        },
        fps: {
            target: 60,
            min: 30,
            forceSetTimeOut: true
        },
        physics: {
            default: 'matter',
            matter: {
                debug: false,
                gravity: { y: 0 },
            }
        },
        plugins: {
            scene: [
                {
                    plugin: matterCollisionPlugin,
                    key: 'matterCollision',
                    mapping: 'matterCollision'
                }
            ]
        }
    };
    const game = new Phaser.Game(config);
    window.__PHASER_GAME__ = game;
    return game;
}
