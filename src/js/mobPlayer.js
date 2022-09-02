/** @format */
class MobPlayer extends Mob {
	constructor(pos) {
		super(pos, vec2(0.6, 0.8), tileNumbers_player);
		// your object init code here

		this.miniFace = miniTileNumbers_miniFacePlayer;

		this._walkCycleFrames = 20;

		this.setCollision(true, true);
		this.mass = 1;
		this.damping = 0.95;
		this.mirror = false;
		this.gun = undefined;

		this.ammoBullets = 3;
		this.ammoShells = 0;
		this.ammoRifle = 0;

		this.hp = 1;

		this.soundScream = soundPlayerScream;
	}

	getAmmoForGunType(gunType) {
		switch (gunType) {
			case tileNumbers_shotgun:
				return this.ammoShells;
			case tileNumbers_rifle:
				return this.ammoRifle;
			default:
				return this.ammoBullets;
		}
	}

	update() {
		const speed = 0.01;

		super.update(); // update object physics and position

		if (this.hp > 0) {
			let dx = 0;
			let dy = 0;

			if (g_state == STATE_PLAYING) {
				if (keyIsDown(38)) {
					// key w
					dy = speed;
				}
				if (keyIsDown(37)) {
					// key a
					dx = -speed;
				}
				if (keyIsDown(40)) {
					// key s
					dy = -speed;
				}
				if (keyIsDown(39)) {
					// key d
					dx = speed;
				}
			}

			this.applyForce(new Vector2(dx, dy));

			this.applyDrag(1.1);
		} else {
			if (this.gun) {
				this.gun.owner = null;
				this.gun = null;
			}
			this.applyDrag(1.7);
		}
	}

	collideWithObject(o) {
		if (
			(o instanceof Vampire && o.transformed) ||
			o instanceof Zombie ||
			o instanceof Ghost ||
			o instanceof BossZombie ||
			o instanceof Boulder
		) {
			let v = this.pos.subtract(o.pos);
			let d = v.length();
			if (d < 0.5) {
				if (!g_CHEATMODE) this.hp--;
				v.normalize(0.01);
				this.applyForce(v);

				makeParticles(this.pos, 0.05);
				if (Math.random() < 0.3) {
					this.splatter(this.pos.copy());
				}

				if (this.hp == 0) {
					for (let i = 0; i < 10; i++) {
						this.splatter(this.pos);
						makeParticles(this.pos, rand(1));
					}

					this.angle = PI / 2;
					this.color = new Color(0.7, 0.5, 0.5);
					this.soundScream.play(this.pos);
				}
			}
		}

		return false; // no auto resolve of collision
	}

	render() {
		super.render(); // draw object as a sprite

		if (this.hp > 0) {
			// arms
			drawLine(
				this.pos.add(vec2(3 / 12, 2 / 16 + this.bumpWalk)),
				this.gun.pos,
				1 / 12,
				new Color(172 / 255, 50 / 255, 50 / 255),
				!!glEnable
			);
			drawLine(
				this.pos.add(vec2(-3 / 12, 2 / 16 + this.bumpWalk)),
				this.gun.pos,
				1 / 12,
				new Color(172 / 255, 50 / 255, 50 / 255),
				!!glEnable
			);
		}
	}

	postRender() {
		// draw face
		let toCursor = mousePos.subtract(this.pos);
		if (toCursor.y <= 0) {
			drawTile(
				this.pos.add(vec2((toCursor.x > 0 ? 1 : 0) / 12, 3 / 12 + this.bumpWalk)),
				vec2(1 / 3),
				this.miniFace,
				MINI_TILE_SIZE
			);
		}
	}
}
