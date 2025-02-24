import { WORDS, KEYBOARD_LETTERS } from "./consts";

document.addEventListener("DOMContentLoaded", async function () {
  const button = document.getElementById("startGame");
  button.disabled = true;

  async function getRandomWord() {
    const apiURL = "https://random-word-api.vercel.app/api?words=100";
    try {
      const response = await fetch(apiURL);
      const data = await response.json();

      if (Array.isArray(data)) {
        WORDS.push(...data);
      } else {
        console.error("Unexpected data format:", data);
        document.body.innerHTML +=
          '<p class="error">Failed to fetch words. Unexpected data format.</p>';
      }
    } catch (error) {
      console.error("Error:", error);
      document.body.innerHTML +=
        '<p class="error">Failed to fetch words. Please try again later.</p>';
    } finally {
      button.disabled = false;
    }
  }

  await getRandomWord();
});


const gameDiv = document.getElementById("game");
const logoH1 = document.getElementById("logo");

let triesLeft;
let winCount;
const createPlaceholdersHTML = () => {
  const word = sessionStorage.getItem("word");
  const wordArr = Array.from(word);
  const placeholdersHTML = wordArr.reduce(
    (acc, curr, i) => acc + `<h1 id= "letter_${i}" class="letter">_</h1>`,
    ""
  );

  return `<div id="placeholders" class="placeholders-wrapper">${placeholdersHTML}</div>`;
};

const createKeyboard = () => {
  const keyboard = document.createElement("div");
  keyboard.classList.add("keyboard");
  keyboard.id = "keyboard";

  const keyboardHTML = KEYBOARD_LETTERS.reduce((acc, curr) => {
    return (
      acc +
      `<button class="button-primary keyboard-button" id="${curr}">${curr}</button>`
    );
  }, "");
  keyboard.innerHTML = keyboardHTML;
  return keyboard;
};

const createHangmanImg = () => {
  const image = document.createElement("img");
  image.src = "images/hg-0.png";
  image.alt = "hangman image";
  image.classList.add("hangman-img");
  image.id = "hangman-img";

  return image;
};

function playSound(soundId) {
  const sound = document.getElementById(soundId);
  sound.currentTime = 0;
  sound.play();
}

const checkLetter = (letter) => {
  const word = sessionStorage.getItem("word");
  const inputLetter = letter.toLowerCase();
  if (!word.includes(inputLetter)) {
    const triesCounter = document.getElementById("tries-left");
    playSound('wrongSound');
    triesLeft -= 1;
    triesCounter.innerText = triesLeft;

    const hangmanImg = document.getElementById("hangman-img");
    hangmanImg.src = `images/hg-${10 - triesLeft}.png`;

    if (triesLeft === 0) {
      stopGame("lose");
    }
  } else {
    const wordArray = Array.from(word);
    wordArray.forEach((currentLetter, i) => {
      if (currentLetter === inputLetter) {
        playSound('rightSound');
        winCount += 1;
        if (winCount === word.length) {
          stopGame("win");
          return;
        }
        document.getElementById(`letter_${i}`).innerText =
          inputLetter.toUpperCase();
      }
    });
  }
};

const stopGame = (status) => {
  document.getElementById("placeholders").remove();
  document.getElementById("tries").remove();
  document.getElementById("keyboard").remove();
  document.getElementById("quit").remove();

  const word = sessionStorage.getItem("word");
  if (status === "win") {
    document.getElementById("hangman-img").src = "images/hg-win.png";
    logoH1.classList.add("logo-win");
    document.getElementById("game").innerHTML +=
      `<h2 class="result-header win">You won!</h2><p class="result-text win"> The word was: <span class="result-word win">${word}</span></p>`;
      document.getElementById(
        "game"
      ).innerHTML += `<button id="play-again" class="button-win px-5 py-2 mt-5">Play again</button>`;
      document.getElementById("play-again").onclick = startGame;
  } else if (status === "lose") {
    logoH1.classList.add("logo-lose");
    document.getElementById("game").innerHTML +=
      `<h2 class="result-header lose">You lost :( </h2><p class="result-text lose"> The word was: <span class="result-word lose">${word}</span></p>`;
      document.getElementById(
        "game"
      ).innerHTML += `<button id="play-again" class="button-lost px-5 py-2 mt-5">Play again</button>`;
      document.getElementById("play-again").onclick = startGame;
  } else if (status === "quit") {
    logoH1.classList.remove("logo-sm");
    document.getElementById("hangman-img").remove();
    document.getElementById("game").innerHTML +=
    `<p class="result-text lose"> The word was: <span class="result-word lose">${word}</span></p>`;
    document.getElementById(
      "game"
    ).innerHTML += `<button id="play-again" class="button-primary px-5 py-2 mt-5">Play again</button>`;
    document.getElementById("play-again").onclick = startGame;
  }
};



export const startGame = () => {
  triesLeft = 10;
  winCount = 0;
  logoH1.classList.add("logo-sm");
  logoH1.classList.remove("logo-win", "logo-lose");
  

  const randomIndex = Math.floor(Math.random() * WORDS.length);
  const wordToGuess = WORDS[randomIndex];
  sessionStorage.setItem("word", wordToGuess);

  gameDiv.innerHTML = createPlaceholdersHTML();

  gameDiv.innerHTML += `<p id="tries" class="mt-2">TRIES LEFT: <span id="tries-left" class="font-medium text-red-600">10</span></p>`;

  const keyboardDiv = createKeyboard();
  keyboardDiv.addEventListener("click", function (event) {
    console.log(event.target.id);
    if (event.target.tagName.toLowerCase() === "button") {
      event.target.disabled = true;
      checkLetter(event.target.id);
    }
  });

  const hangmanImg = createHangmanImg();
  gameDiv.prepend(hangmanImg);

  gameDiv.appendChild(keyboardDiv);

  gameDiv.insertAdjacentHTML(
    "beforeend",
    '<button id="quit" class="button-secondary px-2 py-1 mt-4">Quit</button>'
  );
  document.getElementById("quit").onclick = () => {
    const isSure = confirm(
      "Are you sure you want to quit and lose your progress?"
    );
    if (isSure) {
      stopGame("quit");
    }
  };
};