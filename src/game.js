function sleep (ms) {
  return new Promise(r => setTimeout(r, ms));
}

let deckEnemy;
let deckPlayer;
let selectedEnemy;
let selectedPlayer;
let playing = false;

async function fetchCharacters() {
  const res = await fetch("./characters.json");
  const data = await res.json();
  console.log(data.length);
  return data;
}


async function startGame(){
  playing = false;
  const characters = await fetchCharacters();
  const limit = document.getElementById("limit").value;
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
    
    const meter = button.querySelector('meter');
    meter.min = 0;
    meter.max = character.rainbowHP;
    meter.low = character.rainbowHP/3;
    meter.high = 2*character.rainbowHP/3;
    meter.value = character.rainbowHP;
    meter.optimum = character.rainbowHP;

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
  if(checkMatchEnd()){
    console.log('PLAYER WON');
    return;
  }
  await enemyAttack();
  if(checkMatchEnd()){
    console.log('ENEMY WON');
    return;
  }
  playing = false;
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
  let playerAlive = false;
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

  let enemyAlive = false;
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