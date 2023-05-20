import { Howl, Howler } from "howler";

// +--------------------------+ //
// |DECLARATION DES CONSTANTES| //
// +--------------------------+ //
const VIESMAX = 5;
let vies = VIESMAX;
let niveau = 1; //potentiellement plus
const NIVEAUMAX = 1;
let ennemisRestants = 6;
let combo = 0;
let boucleDeJeu;

// Tableau des positions (top, left) ennemies
const POSITIONS = [
  [0, 0],
  [12, 730],
  [250, 320],
  [24, 592],
  [268, 422],
  [104, 101],
  [312, 5],
  [297, 549],
  [116, 637],
  [8, 58],
  [155, 67],
  [91, 553]
];
let positionsCadavres = [];
let positionEnnemi;

// Selecteurs
const ECRANDEJEU = document.querySelector("#ecranJeu");
const BOUTON_LANCERPARTIE = document.querySelector("#lancerPartie");
let ZONEDESPAWN;
let VIES_HTML;
let ENNEMIS_RESTANTS_HTML;

// Templates
const ecranDeJeuTemplate = `<header>Vies : <span id="vies">?</span> | Ennemis restants :
                        <span id="ennemisRestants">?</span>
                        </header>
                        <div id="zoneDeSpawn"></div>`;

const ecranLevelUp2Template = `<header>Prêt pour la prochaine manche, CONNARD ?</header>
                              <div class="imagelvl imagelvl-2">NIVEAU 2</div>
                              <button id="lancerPartie" type="button">Prochain round</button>`;

const ecranLevelUp3Template = `<header>TU VA CREVER CONNARD !</header>
                              <div class="imagelvl imagelvl-3">NIVEAU 3</div>
                              <button id="lancerPartie" type="button">Prochain round</button>`;
const ecranGameOverTemplate = `<header> Oups, t'es mort ...</header>
                              <div class="imagelvl imagelvl-gameover"><div class="title">GAME OVER</div></div>
                              <button id="lancerPartie" type="button">FUIR!</button>`;
// Si vie < vieMax
// Ennemi touché = +1
// Ennemi raté = vie en moins = combo reset
// combo = 3 = bonus

// +-------------------------+ //
// |DÉCLARATION DES FONCTIONS| //
// +-------------------------+ //

// ======== écran de jeu ========

// Retourne la position de l'ennemi
const nouvellePositionEnnemi = () => {
  let p;
  while (true) {
    let surPositionEnnemi = false;
    // On choisi une position
    p = POSITIONS[random(0, 11)];

    // On parcours chaque position des cadavres.
    positionsCadavres.forEach((pos) => {
      // Si position est égale à une position d'un cadavre
      // surPositionEnnemi vaut true
      if (p === pos) {
        surPositionEnnemi = true;
      }
    });

    // Si la position est différente, on sort de la boucle
    if (positionEnnemi !== p && surPositionEnnemi === false) {
      positionEnnemi = p;
      break;
    }
  }

  return p;
};

BOUTON_LANCERPARTIE.addEventListener("click", () => {
  console.log("Lancement partie");
  lancerJeu();
});

// va chercher la valeur minimale dans le tableau "position" 0 = min et 5 max
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Lancer le jeu
const lancerJeu = () => {
  ECRANDEJEU.innerHTML = ecranDeJeuTemplate;

  sound_ambiance.play();
  sound_vinyl.stop();

  ZONEDESPAWN = document.querySelector("#zoneDeSpawn");
  VIES_HTML = document.querySelector("#vies");
  ENNEMIS_RESTANTS_HTML = document.querySelector("#ennemisRestants");

  render();
  // Masquage du bouton joueur
  BOUTON_LANCERPARTIE.classList.add("hidden");
  let i = 0;
  // Boucle du jeu
  boucleDeJeu = setInterval(() => {
    // Après le premier tour de boucle, on supprime l'ennemi précédant
    if (i > 0) supprimerUnEnnemi();
    // On choisi une position
    nouvellePositionEnnemi();
    // On créé un ennemi
    creeUnEnnemi();
    // Incrémentation de la boucle
    i++;
  }, 950);
};

/// Détection du clique sur l'ennemi
ECRANDEJEU.addEventListener("click", (e) => {
  // Si on touche un ennemi
  if (e.target.id === "ennemi") {
    console.log("touché batard : " + positionEnnemi);
    // Disparition de l'ennemi
    e.target.classList.add("hidden");
    // Apparition d'un cadavre
    sound_shot.play();
    let ennemiMort = document.createElement("div");
    ennemiMort.setAttribute("id", "ennemi_mort_" + ennemisRestants);
    ennemiMort.setAttribute("class", "ennemi_mort");
    ZONEDESPAWN.appendChild(ennemiMort);
    // On affiche un ennemi à cette position
    document.querySelector("#ennemi_mort_" + ennemisRestants).style.left =
      positionEnnemi[0] + "px";
    document.querySelector("#ennemi_mort_" + ennemisRestants).style.top =
      positionEnnemi[1] + "px";
    // On change sa taille en fonction de sa position Y
    let zoom = positionEnnemi[1] / 5 / 100 + 1;
    document.querySelector("#ennemi_mort_" + ennemisRestants).style.transform =
      "scale(" + zoom + ")";
    // Ajout de sa position dans un array cadavre
    positionsCadavres.push(positionEnnemi);

    // on retire un ennemi
    ennemisRestants--;
    // Si il n'y a plus d'ennemi
    if (ennemisRestants === 0) {
      sound_ambiance.stop();
      sound_leveling2.play();
      // Stopper la boucle
      clearInterval(boucleDeJeu);
      // Afficher ecran level-up
      ECRANDEJEU.innerHTML = ecranLevelUp2Template;
    }

    // Si cible ratée
  } else {
    console.log("Bigleu lol");
    sound_shot.play();

    supprimerVie();
  }

  render();
});
// cible ratée => supprimer une vie
const supprimerVie = () => {
  // Si vie suppérieur à zero, on enlève une vie
  if (vies > 1) {
    vies--;

    // Sinon, perdu
  } else {
    gameOver();
  }
};

// Stop la boucle et affiche l'écran de game over
const gameOver = () => {
  sound_ambiance.stop();
  sound_gameover.play();
  sound_rire_gameover.play();
  sound_shot.stop();
  // Stopper la boucle
  clearInterval(boucleDeJeu);
  // Afficher ecran Game Over
  ECRANDEJEU.innerHTML = ecranGameOverTemplate;
};

// Mise à jour du texte dans l'HTML
const render = () => {
  VIES_HTML.innerHTML = vies + "/" + VIESMAX;
  ENNEMIS_RESTANTS_HTML.innerHTML = ennemisRestants;
};

// Création d'un ennemi sur une position
const creeUnEnnemi = () => {
  // Creation de l'ennemi
  let ennemi = document.createElement("div");
  ennemi.setAttribute("id", "ennemi");
  ennemi.setAttribute("class", "ennemi");
  ZONEDESPAWN.appendChild(ennemi);
  // On affiche un ennemi à cette position
  document.querySelector("#ennemi").style.left = positionEnnemi[0] + "px";
  document.querySelector("#ennemi").style.top = positionEnnemi[1] + "px";
  // On change sa taille en fonction de sa position Y
  let zoom = positionEnnemi[1] / 5 / 100 + 1;
  document.querySelector("#ennemi").style.transform = "scale(" + zoom + ")";
};

// Suppression d'un ennemi
const supprimerUnEnnemi = () => {
  document.querySelector("#ennemi").remove();
};

// **** // ecran victoire

// **** // ecran de looser

// **** // ecran inter-level

// +--------------------------+ //
// |-----------SONS-----------| //
// +--------------------------+ //
let sound_ambiance = new Howl({
  src: ["src/sounds/MSG_grisly_reminder.mp3"],
  volume: 0.1,
  loop: true
});

let sound_vinyl = new Howl({
  src: ["src/sounds/vynil_effect.mp3"],
  volume: 0.02,
  loop: true
});

let sound_rire_gameover = new Howl({
  src: ["src/sounds/rire.mp3"],
  volume: 0.05
});

let sound_gameover = new Howl({
  src: ["src/sounds/creepy.mp3"],
  loop: true,
  volume: 0.04
});

let sound_leveling2 = new Howl({
  src: ["src/sounds/leveling2.mp3"]
});

let sound_leveling3 = new Howl({
  src: ["src/sounds/leveling3.mp3"]
});

let sound_shot = new Howl({
  src: ["src/sounds/pistol.mp3"],
  volume: 0.02
});

const init = () => {
  sound_vinyl.play();
};

init();
