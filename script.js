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

let deferredPrompt = null; // For PWA install prompt

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

const launchConfetti = () => {
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 },
  });
};

const endGame = () => {
  setTimeout(() => {
    const newGameContainer = document.querySelector("#new-game-container");

    let finalMessage = "";
    let finalColor = "";

    if (userScore > compScore) {
      finalMessage = "🎉 You won the match!";
      finalColor = "green";
      launchConfetti();
    } else if (userScore < compScore) {
      finalMessage = "😢 Computer won the match!";
      finalColor = "red";
    } else {
      finalMessage = "😐 It's a draw!";
      finalColor = "#081B31";
    }

    msg.innerText = finalMessage;
    msg.style.backgroundColor = finalColor;

    choices.forEach((btn) => (btn.style.pointerEvents = "none"));
    newGameContainer.style.display = "inline-block";
    newGameContainer.style.marginLeft = "1rem";
  }, 500);
};

const playGame = (userChoice, clickedChoice) => {
  document.querySelector("#round-selector").disabled = true;

  if (round >= totalRounds) return;

  const compChoice = genCompChoice();
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  compImg.src = `./images/${compChoice}.png`;

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

// Game button listeners
choices.forEach((choice) => {
  choice.addEventListener("click", () => {
    if (round >= totalRounds) return;
    const userChoice = choice.getAttribute("id");
    playGame(userChoice, choice);
  });
});

document.querySelector("#reset").addEventListener("click", () => {
  resetGame();
  choices.forEach((btn) => (btn.style.pointerEvents = "auto"));
});

document.querySelector("#dark-mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  // Save mode to localStorage
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

document.querySelector("#new-game-btn").addEventListener("click", () => {
  resetGame();
  choices.forEach((btn) => (btn.style.pointerEvents = "auto"));
  document.querySelector("#new-game-container").style.display = "none";
});

document.querySelector("#round-selector").addEventListener("change", (e) => {
  totalRounds = parseInt(e.target.value);
  roundText.innerText = `Round: ${round} / ${totalRounds}`;
});

document.querySelector("#toggle-help").addEventListener("click", () => {
  document.querySelector("#help-content").classList.toggle("hidden");
});

// 🆕 Share Game
document.querySelector("#share-game")?.addEventListener("click", async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Rock Paper Scissors Game",
        text: "Play this fun Rock Paper Scissors game with me!",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!");
    }
  } catch (err) {
    console.error("Share failed:", err);
  }
});

// 🆕 Challenge Friend (copy link)
document.querySelector("#challenge-friend")?.addEventListener("click", () => {
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      showToast("Challenge link copied! Send it to your friend.");
    })
    .catch(() => {
      showToast("Failed to copy the link.");
    });
});

// 🆕 Add to Home Screen (A2HS)
const installBtn = document.getElementById("install-app");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  installBtn.style.display = "inline-block";
  installBtn.disabled = false;

  // Prevent adding the click event multiple times
  if (!installBtn._hasClickListener) {
    installBtn.addEventListener("click", () => {
      installBtn.style.display = "none";

      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log("A2HS response:", choiceResult.outcome);
          deferredPrompt = null;
        });
      }
    });

    installBtn._hasClickListener = true; // mark that listener was added
  }
});

const showToast = (message, type = "info", duration = 2500) => {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => (toast.className = "toast hidden"), 400);
  }, duration);
};
