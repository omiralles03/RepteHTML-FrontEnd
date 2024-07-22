async function fetchCharacters() {
  const res = await fetch("./characters.json");
  const data = await res.json();
  console.log(data.length)
  return data;
}

async function startGame(){
  const characters = await fetchCharacters();
  const limit = document.getElementById("limit").value;
  const deck1 = getDeck(characters, limit);
  const deck2 = getDeck(characters, limit);
  console.log(deck1);
  console.log(deck2);

  const section1 = document.getElementById("deck1");
  const section2 = document.getElementById("deck2");
  fillBoard(deck1, section1);
  fillBoard(deck2, section2);
  // Fill the clone template with Character info
}

function fillBoard(deck, section){
  section.innerHTML="";
  const template = document.getElementById("card-template");
  deck.forEach((card) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('img').src=card.imageURL || ''; // Empty URL if not found
    clone.querySelector('h3').innerText=card.name;
    const tds = clone.querySelectorAll('td');
    tds[0].innerText=card.rainbowHP;
    tds[1].innerText=card.rainbowAttack;
    tds[2].innerText=card.rainbowDefense;
    section.appendChild(clone); // Add the cloned card to the section in HTML
  })
}

function getDeck(arr, size) {
  let deck = [];
  for (let i = 0; i < size; i++){
    deck.push(arr[Math.floor(Math.random() * arr.length - 1)]) // Get random character from the fetched array
  }
  return deck;  
}

let selected1;
let selected2;
let playing = false;
let activeTurn = true;

function selectCard(card){
  if (playing)
    return;

  if(!activeTurn)
    return
  
  if(card.parentNode.getAttribute('id') == "deck1") {
    selected1 = card;
  } else {
    selected2 = card;
  }

  if (selected1 && selected2) {
    playGame();
  }
}

function playGame(){
  
}

