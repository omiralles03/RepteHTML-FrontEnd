function sleep (ms) {
  return new Promise(r => setTimeout(r, ms));
}

let deckEnemy;
let deckPlayer;
let selectedEnemy;
let selectedPlayer;
let playing = false;
let playerAlive;
let enemyAlive;

const board = document.getElementById('board');
board.style.display = "none";

const gameMenu = document.getElementById('game-menu');

gameMenu.style.display = "flex";
const atkBTN = document.getElementById('atkBTN');

const textCPU = document.getElementById('CPU');
const textPLAYER = document.getElementById('PLAYER');

const matchResults = document.getElementById('match-results');
const messageResults = document.getElementById('message-results');

matchResults.style.display = "none";

async function fetchCharacters() {
  const res = await fetch("./characters.json");
  const data = await res.json();
  console.log(data.length);
  return data;
}


async function startGame(limit = 7){
  board.style.display = "grid";
  gameMenu.style.display = "none";
  textPLAYER.style.color = "red";

  playing = false;
  const characters = await fetchCharacters();
  //const limit = document.getElementById("limit").value;
  deckEnemy = getDeck(characters, limit);
  deckPlayer = getDeck(characters, limit);

  const section1 = document.getElementById("deck1");
  const section2 = document.getElementById("deck2");
  fillBoard(deckEnemy, section1);
  fillBoard(deckPlayer, section2);
  // Fill the clone template with Character info
}

function fillBoard(deck, section){
  section.innerHTML="";
  const template = document.getElementById("card-template");
  deck.forEach((character, index) => { // index = index of each iteration
    const button = template.content.cloneNode(true);
    button.querySelector('button').setAttribute('data-id', index);
    button.querySelector('button').classList.add(character.type);
    button.querySelector('img').src=character.imageURL; 
    button.querySelector('h3').innerText=character.name;

    const tds = button.querySelectorAll('td');
    tds[0].innerText=character.rainbowHP;
    tds[1].innerText=character.rainbowAttack;
    tds[2].innerText=character.rainbowDefense;
    
    //document.getElementById('atk').style.color = "red";
    //document.getElementById('def').style.color = "blue";
    
    const meter = Array.from(button.querySelectorAll('meter'));
    console.log(meter)
    meter[0].min = 0;
    meter[0].max = character.rainbowHP;
    meter[0].low = character.rainbowHP/3;
    meter[0].high = 2*character.rainbowHP/3;
    meter[0].value = character.rainbowHP;
    meter[0].optimum = character.rainbowHP;
    meter[1].max = 24000;
    meter[1].value = character.rainbowAttack;
    meter[2].max = 24000;
    meter[2].value = character.rainbowDefense;

    section.appendChild(button); // Add the cloned card to the section in HTML
    //console.log(character);
  })
}

function getDeck(arr, size) {
  let deck = [];
  for (let i = 0; i < size; i++){
    deck.push(arr[Math.floor(Math.random() * arr.length)]); // Get random character from the fetched array
  }
  return deck;  
}

function selectCard(card){
  if (playing)
    return;
  
  if(card.parentNode.getAttribute('id') == "deck1") {
    selectedEnemy?.classList.remove('selected');  // Remove previous selection
    if(card === selectedEnemy) {
      selectedEnemy = undefined;
      return; // If new selected card and previous are the same, unselect previous card and break funct.
    }
    selectedEnemy = card;
  } else {
    selectedPlayer?.classList.remove('selected');  // Remove previous selection
    if(card === selectedPlayer) {
      selectedPlayer = undefined;
      return; // If new selected card and previous are the same, unselect previous card and break funct.
    }
    selectedPlayer = card;
  }

  card.classList.add('selected'); // Mark the card as selected (green)
}

async function playerAttack(){
  if(playing)
    return;

  if(!selectedEnemy || !selectedPlayer)
    return;

  const enemy = deckEnemy[selectedEnemy.getAttribute('data-id')];
  const player = deckPlayer[selectedPlayer.getAttribute('data-id')];
  playing = true;
  attack(player, selectedPlayer, enemy, selectedEnemy)
  textPLAYER.style.color = "white";
  atkBTN.disabled = true;
  if(checkMatchEnd()){
    matchEND();
  }
  textCPU.style.color = "red";
  await enemyAttack();
  if(checkMatchEnd()){
    matchEND();
  }
  atkBTN.disabled = false;
  textPLAYER.style.color = "red";
  textCPU.style.color = "white";
  playing = false;
}

function matchEND(){
  board.style.display = "none";
  matchResults.style.display = "flex";
  
  if (messageResults) {
      const resultMessage = playerAlive ? "VICTORY" : "DEFEAT";
      messageResults.innerText = resultMessage;
      const color = playerAlive ? "cyan" : "red";
      const shadowColor = playerAlive ? "darkcyan" : "darkred";
      messageResults.style.textShadow = `1px 1px 2px rgba(255, 255, 255, .1), 0 0 1em ${color}, 0 0 0.2em ${shadowColor}`;
  } else {
      console.error('Element with ID message-results not found.');
  }
  return;
}

function playAGAIN(){
  matchResults.style.display = 'none';
  gameMenu.style.display = 'flex';
  playing = true;
  atkBTN.disabled = false;

}

async function enemyAttack(){

  await sleep(500);
  await enemySelect();
  await sleep(1000);
  const enemy = deckEnemy[selectedEnemy.getAttribute('data-id')];
  const player = deckPlayer[selectedPlayer.getAttribute('data-id')];
  attack(enemy, selectedEnemy, player, selectedPlayer);
}

function updateCharacter(card, character){

  const tds = card.querySelectorAll('td');
  tds[0].innerText=character.rainbowHP;
  tds[1].innerText=character.rainbowAttack;
  tds[2].innerText=character.rainbowDefense;

  card.querySelector('meter').value = character.rainbowHP;
}

async function enemySelect(){

  const enemySection = document.getElementById("deck1");
  const playerSection = document.getElementById("deck2");

  const enemyCards = Array.from(enemySection.querySelectorAll('button'));
  const playerCards = Array.from(playerSection.querySelectorAll('button'));
  
  selectedEnemy = enemyCards.sort((a, b) => { // a, b are buttons
    const characterA = deckEnemy[a.getAttribute('data-id')];
    const characterB = deckEnemy[b.getAttribute('data-id')];
    return characterB.rainbowAttack - characterA.rainbowAttack; // return negative if A > B
  }).find((card) => deckEnemy[card.getAttribute('data-id')].rainbowHP > 0); // Pick the highest attacking character if not dead.
  
  console.log(enemyCards)
  selectedEnemy.classList.add('selected');
  await sleep(1000);

  selectedPlayer = playerCards.sort((a, b) => { // a, b are buttons
    const characterA = deckPlayer[a.getAttribute('data-id')];
    const characterB = deckPlayer[b.getAttribute('data-id')];
    return characterA.rainbowHP - characterB.rainbowHP;
  }).find((card) => deckPlayer[card.getAttribute('data-id')].rainbowHP > 0); // Sort from lowest to highest HP and pick first HP avobe 0
  
  console.log(playerCards);
  console.log(selectedPlayer);
  selectedPlayer.classList.add('selected');

}

function attack(attacker, attackerCard, defender, defenderCard){
  
  defender.rainbowHP -= Math.max(attacker.rainbowAttack - defender.rainbowDefense, 0);
  console.log(defender.rainbowHP);

  if(defender.rainbowHP <= 0){
    console.log('character defeated');
    defender.rainbowHP = 0;
    defenderCard.disabled = true; // Disable button
    defenderCard.setAttribute('data-dead', true);
  }

  updateCharacter(defenderCard, defender);

  selectedPlayer.classList.remove('selected');
  selectedEnemy.classList.remove('selected');
  selectedPlayer = undefined; 
  selectedEnemy = undefined; 
}

function checkMatchEnd(){
  playerAlive = false;
  for(let card of deckPlayer){
    console.log('CHECK CARD: ', card);
    if (card.rainbowHP > 0) {
      console.log('MATCH CHECK PLAYER: ', card.rainbowHP);
      playerAlive = true;
      break;
    }
  }

  if(!playerAlive){
    return true;
  }

  enemyAlive = false;
  for(let card of deckEnemy){
    if (card.rainbowHP > 0) {
      enemyAlive = true;
      break;
    }
  }

  if(!enemyAlive){
    return true;
  }

  return false;
}