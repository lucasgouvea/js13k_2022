/** @format */
class Mob extends EngineObject {
	constructor(pos, size, tileIndex) {
		super(pos, size, tileIndex, vec2(11, 12));

		this.walkCyclePlace = 0;
		this._walkCycleFrames = 60;
		this._hitbox = vec2(0.5);

		this.miniFace = undefined;
		this.setCollision(true, true);
		this.mass = 1;
		this.damping = 1;
		this.elasticity = 0.5;

		this._maxSpeed = 0.4;

		this.bumpWalk = 0;
		this.mirror = false;
		this.hp = 3;

		this.blood = [];

		// for arms
		this.pointingAngle = rand(2 * PI);
		this._myColor = undefined;

		this.enemyToTarget = undefined;
		this.soundGroan = undefined;
	}

	applyDrag(dragConst) {
		let speed = this.velocity.length();

		let drag = speed * speed * dragConst;

		if (drag > speed) drag = speed;

		let dragForce = this.velocity.normalize(drag);

		this.velocity = this.velocity.subtract(dragForce);
	}

	groan(chance, strength) {
		if (rand(1) > chance) return;

		const MAX_VOL = 0.5;

		let vol = MAX_VOL;

		if (this.enemyToTarget) {
			let d = this.enemyToTarget.length() / 10;
			vol = d < 1 ? MAX_VOL : MAX_VOL / (d * d);
		}

		this.soundGroan.play(this.pos, strength * vol, strength * rand(1, 2), 0.5);
	}

	update() {
		if (this.velocity.length() > 0.01) {
			this.walkCyclePlace = (this.walkCyclePlace + 1) % this._walkCycleFrames;
			this.mirror = this.walkCyclePlace > this._walkCycleFrames / 2 ? true : false;
			this.bumpWalk = this.walkCyclePlace > this._walkCycleFrames / 2 ? 1 / 12 : 0;
		} else {
			this.walkCyclePlace = 0;
			this.mirror = false;
		}

		if (this.bloodEmitter) this.bloodEmitter.pos = this.pos;

		super.update(); // update object physics and position
	}

	render() {
		drawTile(
			vec2(this.pos.x, this.pos.y + this.bumpWalk),
			this.size,
			this.tileIndex,
			this.tileSize,
			this.color,
			this.angle,
			this.mirror
		);
		this.postRender();
	}

	postRender() {
		// draw face
		if (this.miniFace && this.enemyToTarget && this.enemyToTarget.y <= 0) {
			drawTile(
				this.pos.add(vec2((this.enemyToTarget.x > 0 ? 1 : 0) / 12, 3 / 12 + this.bumpWalk)),
				vec2(1 / 6),
				this.miniFace,
				MINI_TILE_SIZE
			);
		}
		this.drawBlood();
	}

	drawBlood() {
		// blood
		for (let i = 0; i < this.blood.length; i++) {
			let blood = this.blood[i];
			for (let j = 0; j < blood.pattern.length; j++) {
				if (blood.pattern[j]) {
					let x = this.pos.x + blood.pos.x - (j % 2) / 12;
					let y = this.pos.y + blood.pos.y - Math.floor(j / 2) / 12;
					drawRect(vec2(x, y), vec2(1 / 12), g_game.colorBlood);
				}
			}
		}
	}

	splatter(pos) {
		// splatter on floor
		let rando = Math.random();
		let splatterPattern = {
			pos: pos.add(randInCircle(0.2)),
			color: new Color(rando / 2, rando / 10, rando / 10),
			pattern: [],
		};
		for (let i = 0; i < 16; i++) {
			splatterPattern.pattern.push(Math.random() > 0.5 ? 1 : 0);
		}
		g_game.splatter.push(splatterPattern);
	}

	hit(velocity, pos) {
		this.hp--;

		this.applyForce(velocity.scale(2));

		this.bloodEmitter = makeParticles(this.pos, rand(1));

		if (this.hp == 0) {
			let corpse = new Corpse(this.pos.copy(), this.size.copy(), this.tileIndex, this.tileSize);
			corpse.push(velocity);
			g_game.corpses.push(corpse);
			this.destroy();

			let i = g_game.enemies.indexOf(this);
			g_game.enemies.splice(i, 1);

			g_score++;
			return true;
		}

		this.splatter(pos);

		// splatter on mob
		let wound = { pos: vec2((pos.x - this.pos.x) / 3, (pos.y - this.pos.y) / 3), pattern: [] };
		for (let i = 0; i < 4; i++) {
			wound.pattern.push(Math.random() > 0.5 ? 1 : 0);
		}
		this.blood.push(wound);

		return false;
	}

	drawReachingArms() {
		const armLenght = 4 / 12;

		let toPlayer = this.enemyToTarget || g_game.player.pos.subtract(this.pos);
		let toPlayerAngle = toPlayer.angle();

		this.pointingAngle += turnTowards(toPlayerAngle - this.pointingAngle, (2 * PI) / 100); //turnTowards(this.pointingAngle, toPlayerAngle, rand(2 * PI) / 100);
		let pointing = vec2(1).setAngle(this.pointingAngle, armLenght);

		// draw arms
		let pos = this.pos.add(vec2(3 / 12, 2.3 / 12 + this.bumpWalk));
		drawLine(pos, pos.add(pointing), 1.2 / 12, this._myColor, !!glEnable);
		pos = this.pos.add(vec2(-3 / 12, 2.3 / 12 + this.bumpWalk));
		drawLine(pos, pos.add(pointing), 1.2 / 12, this._myColor, !!glEnable);
	}
}
