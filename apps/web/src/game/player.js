export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, isStatic } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        var playerCollider = Bodies.circle(this.x, this.y, 6, { isSensor: false, label: 'playerCollider' });
        var playerSensor = Bodies.circle(this.x, this.y, 30, { isSensor: true, label: 'playerSensor' });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.12,
            isStatic: isStatic || false
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();

        // Interaction lock state
        this.isInteractionLocked = false;
        this.lastSafePosition = { x: this.x, y: this.y };
        this.resumeCooldown = false;
    }

    lockInteraction() {
        if (!this.body) return;
        this.isInteractionLocked = true;
        this.lastSafePosition = { x: this.x, y: this.y };
        this.setVelocity(0, 0);
    }

    unlockInteraction() {
        if (!this.body) return;
        this.resumeCooldown = true;
        this.isInteractionLocked = false;
        this.setVelocity(0, 0);

        // Reset keyboard state globally so no key gets stuck in held-down state.
        this.scene.input.keyboard.resetKeys();

        // Short cooldown before fully unlocking
        this.scene.time.delayedCall(80, () => {
            this.resumeCooldown = false;
        });
    }

    moveToSafePosition() {
        if (this.lastSafePosition && this.body) {
            this.setPosition(this.lastSafePosition.x, this.lastSafePosition.y);
            this.setVelocity(0, 0);
        }
    }

    static preload(scene) {
        scene.load.atlas('you', '/assets/you.png', '/assets/you_atlas.json');
        scene.load.animation('you_anim', '/assets/you_anim.json');
        scene.load.atlas('pappa_heroka', '/assets/pappa_heroka.png', '/assets/pappa_heroka_atlas.json');
        scene.load.atlas('toli', '/assets/toli.png', '/assets/toli_atlas.json');
    }

    get Velocity() {
        return this.body.velocity;
    }

    update() {
        if (!this.inputKeys) return;

        // If locked, stop all movement and return immediately
        if (this.isInteractionLocked || this.resumeCooldown) {
            this.setVelocity(0, 0);
            this.anims.play('hero_idle', true);
            return;
        }

        const baseSpeed = 5;
        const multiplier = this.scene.gameState?.speedMultiplier || 1.0;
        const speed = baseSpeed * multiplier;

        const targetVelocity = new Phaser.Math.Vector2();
        if (this.inputKeys.left.isDown) {
            targetVelocity.x = -1;
        } else if (this.inputKeys.right.isDown) {
            targetVelocity.x = 1;
        }
        if (this.inputKeys.up.isDown) {
            targetVelocity.y = -1;
        } else if (this.inputKeys.down.isDown) {
            targetVelocity.y = 1;
        }

        targetVelocity.normalize();
        targetVelocity.scale(speed);

        const currentVelocity = this.body.velocity;
        const acceleration = 0.25;
        const deceleration = 0.2;
        const smoothing = targetVelocity.lengthSq() > 0 ? acceleration : deceleration;

        const nextX = Phaser.Math.Linear(currentVelocity.x, targetVelocity.x, smoothing);
        const nextY = Phaser.Math.Linear(currentVelocity.y, targetVelocity.y, smoothing);
        this.setVelocity(nextX, nextY);

        // Update last safe position while moving normally
        if (Math.abs(nextX) > 0.1 || Math.abs(nextY) > 0.1) {
            this.lastSafePosition = { x: this.x, y: this.y };
        }

        if ((Math.abs(this.Velocity.x) > 0.1) || (Math.abs(this.Velocity.y) > 0.1)) {
            this.anims.play('hero_walk', true);
        } else {
            this.anims.play('hero_idle', true);
        }
    }

}