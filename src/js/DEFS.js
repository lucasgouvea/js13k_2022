/** @format */

const STATE_CLICK_TO_START = 0;
const STATE_PLAYING = 1;
const STATE_DEAD = 2;
const STATE_CLEARED = 3;

const TILE_SIZE = vec2(12);
const MINI_TILE_SIZE = vec2(4);
const MOB_SIZE = vec2(0.6, 0.8);
const TILES_PER_SCREEN = 13;

fontDefault = "Courier New";

// "Courier";
// "American Typewriter";
// "Courier New";
// "Luminari"

const g_CHEATMODE = 0;
let g_score = 0;
let g_level = 0;
let g_levelDef = undefined;

let g_screenShake = vec2(0);

const tileNumbers_player = 0;
const tileNumbers_zombie = 1;
const tileNumbers_vampire = 2;
const tileNumbers_bat = 3;
const tileNumbers_ghost = 4;
const tileNumbers_beefyZombie = 5;
const tileNumbers_bossPlaceholder = 4;
const tileNumbers_facePlayer = 5;
const tileNumbers_faceZombie = 6;
const tileNumbers_faceVampire = 7;
const tileNumbers_pistol = 15;
const tileNumbers_shotgun = 16;
const tileNumbers_shellIcon = 17;
const tileNumbers_bulletIcon = 18;
const tileNumbers_rifleAmmoIcon = 19;
const tileNumbers_rifle = 20;
const tileNumbers_smg = 25;
const tileNumbers_boxBullets = 21;
const tileNumbers_boxShells = 22;
const tileNumbers_boxRifleAmmo = 23;
const tileNumbers_floorStone = 12;
const tileNumbers_door = 11;

let g_player = null;

var g_difficulty = 0;

var g_enemies = [];
var g_doors = {};
var g_splatter = [];
var g_holes = [];
var g_corpses = [];
var g_shells = [];
var g_moss = [];
var g_shadows = {};
var g_transforms = [];

var colorBlack = new Color(0, 0, 0);
var colorWhite = new Color();
var colorGrey = colorWhite.scale(0.5);

var colorBlood = new Color(172 / 255, 50 / 255, 50 / 255);
var colorBullet = new Color(217 / 255, 160 / 255, 102 / 255);
//var colorScoreText = new Color(106 / 255, 190 / 255, 48 / 255);
var colorShell = new Color(217 / 255, 87 / 255, 99 / 255);
var colorRifleRound = new Color(99 / 255, 155 / 255, 255 / 255);

var colorSpark = new Color(251 / 255, 242 / 255, 54 / 255);

var colorEarth = colorBullet; // new Color(143 / 255, 86 / 255, 59 / 255);

var colorZombie = new Color(55 / 255, 148 / 255, 110 / 255);

var g_state = STATE_CLICK_TO_START;

const miniTileNumbers_miniFacePlayer = 18 * 15 + 0;
const miniTileNumbers_miniFaceZombie = 18 * 15 + 1;
const miniTileNumbers_miniFaceVampire = 18 * 15 + 2;
const miniTileNumbers_miniFaceGhost = 18 * 15 + 3;
const miniTileNumbers_miniFaceBoss = 9;
const miniTileNumbers_miniFaceBossAngry = 19;
const miniTileNumbers_moss = 18 * 15 + 4;

const mobDefs = {
	Zombie: {
		hp: 2,
		hpGainPerlevel: 0,
		maxSpeed: 0.06,
	},
	BossZombie: {
		hp: 22,
		hpGainPerlevel: 5,
		maxSpeed: 0.5,
	},
	Vampire: {
		hp: 1,
		hpGainPerlevel: 0,
		maxSpeed: 0.2,
		addTransformHp: 5,
	},
	Ghost: {
		hp: 1,
		hpGainPerlevel: 0,
		maxSpeed: 0.05,
	},
};

const levelDefs = [
	{
		// start
		map: 0,
		enemiesToSpawn: 10,
		enemiesMaxAlive: 3,
		spawns: [{ chance: 1 }],
	},
	{
		// graveyard
		map: 1,
		enemiesToSpawn: 12,
		enemiesMaxAlive: 3,
		spawns: [{ chance: 1 }],
	},
	{
		// intro to vampires
		map: 3,
		enemiesToSpawn: 15,
		enemiesMaxAlive: 4,
		spawns: [{ chance: 0.5 }, { type: "v", chance: 0.5 }],
	},
	{
		// intro to ghosts
		map: 4,
		enemiesToSpawn: 15,
		enemiesMaxAlive: 4,
		spawns: [{ chance: 0.5 }, { type: "g", chance: 0.5 }],
	},
	{
		// final boss
		map: 2,
		enemiesToSpawn: Infinity,
		enemiesMaxAlive: 5,
		spawns: [{ chance: 0.4 }, { type: "v", chance: 0.3 }, { type: "g", chance: 0.3 }],
	},
];
