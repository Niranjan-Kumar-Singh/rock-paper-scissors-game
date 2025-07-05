let userScore = 0;
let compScore = 0;
let round = 0;
let totalRounds = parseInt(document.querySelector("#round-selector").value);

const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");
const userScorePara = document.querySelector("#user-score");
const compScorePara = document.querySelector("#comp-score");
const compImg = document.querySelector("#comp-img");
const roundText = document.querySelector("#round-text");

const resetGame = () => {
  document.querySelector("#round-selector").disabled = false;
  userScore = 0;
  compScore = 0;
  round = 0;
  totalRounds = parseInt(document.querySelector("#round-selector").value);
  userScorePara.innerText = 0;
  compScorePara.innerText = 0;
  msg.innerText = "Play your move";
  msg.style.backgroundColor = "#081B31";
  roundText.innerText = `Round: ${round} / ${totalRounds}`;
  compImg.src = "./images/question.png";
};

const genCompChoice = () => {
  const options = ["rock", "paper", "scissor"];
  const randomIdx = Math.floor(Math.random() * 3);
  return options[randomIdx];
};

const drawGame = (compChoice) => {
  msg.innerText = `DRAW!!!😥 Both selected ${compChoice}`;
  msg.style.backgroundColor = "#081B31";
};

const showWinner = (userWin, userChoice, compChoice) => {
  if (userWin) {
    userScore++;
    userScorePara.innerText = userScore;
    msg.innerText = `You Win 👍 ${userChoice} beats ${compChoice}`;
    msg.style.backgroundColor = "green";
  } else {
    compScore++;
    compScorePara.innerText = compScore;
    msg.innerText = `You Lost 👎 ${compChoice} beats ${userChoice}`;
    msg.style.backgroundColor = "red";
  }
};

const endGame = () => {
  setTimeout(() => {
    const newGameContainer = document.querySelector("#new-game-container");
    const msgElement = document.querySelector("#msg");

    let finalMessage = "";
    let finalColor = "";

    if (userScore > compScore) {
      finalMessage = "🎉 You won the match!";
      finalColor = "green";
      confetti({
        particleCount: 200, // Big burst
        spread: 100,
        origin: { y: 0.6 },
      });
    } else if (userScore < compScore) {
      finalMessage = "😢 Computer won the match!";
      finalColor = "red";
    } else {
      finalMessage = "😐 It's a draw!";
      finalColor = "#081B31";
    }

    msgElement.innerText = finalMessage;
    msgElement.style.backgroundColor = finalColor;

    document
      .querySelectorAll(".choice")
      .forEach((btn) => (btn.style.pointerEvents = "none"));

    // Show "new game" beside the message
    newGameContainer.style.display = "inline-block";
    newGameContainer.style.marginLeft = "1rem"; // some spacing
  }, 500);
};

const playGame = (userChoice, clickedChoice) => {
  document.querySelector("#round-selector").disabled = true;

  if (round > totalRounds) return;

  const compChoice = genCompChoice();
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  compImg.src = `./images/${compChoice}.png`;

  // animation
  clickedChoice.classList.add("selected");
  setTimeout(() => clickedChoice.classList.remove("selected"), 500);

  if (userChoice === compChoice) {
    drawGame(compChoice);
  } else {
    let userWin = true;
    if (userChoice === "rock") userWin = compChoice === "paper" ? false : true;
    else if (userChoice === "paper")
      userWin = compChoice === "scissor" ? false : true;
    else userWin = compChoice === "rock" ? false : true;
    showWinner(userWin, userChoice, compChoice);
  }

  round++;
  roundText.innerText = `Round: ${Math.min(
    round,
    totalRounds
  )} / ${totalRounds}`;

  if (round >= totalRounds) endGame();
};

// Event listeners
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    if (round >= totalRounds) return;
    const userChoice = choice.getAttribute("id");
    playGame(userChoice, choice);
  });
});

document.querySelector("#reset").addEventListener("click", () => {
  resetGame();
  document
    .querySelectorAll(".choice")
    .forEach((btn) => (btn.style.pointerEvents = "auto"));
});

document.querySelector("#dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

document.querySelector("#new-game-btn").addEventListener("click", () => {
  resetGame();
  document
    .querySelectorAll(".choice")
    .forEach((btn) => (btn.style.pointerEvents = "auto"));
  document.querySelector("#new-game-container").style.display = "none";
});

document.querySelector("#round-selector").addEventListener("change", (e) => {
  totalRounds = parseInt(e.target.value);
  roundText.innerText = `Round: ${round} / ${totalRounds}`;
});
