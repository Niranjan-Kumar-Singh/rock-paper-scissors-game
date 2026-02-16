let userScore = 0;
let compScore = 0;
let round = 0;
let totalRounds = parseInt(document.querySelector("#round-selector").value, 10);
let targetScore = null; // Track the score to beat
let isHardMode = false;
let playerHistory = { rock: 0, paper: 0, scissor: 0 };

const choices = document.querySelectorAll(".choice");
const msg = document.querySelector("#msg");
const userScorePara = document.querySelector("#user-score");
const compScorePara = document.querySelector("#comp-score");
const compImg = document.querySelector("#comp-img");
const roundText = document.querySelector("#round-text");

// Persistence State
let highStreak = localStorage.getItem("highStreak") || 0;
let totalHighScore = localStorage.getItem("totalHighScore") || 0;
let currentStreak = 0;

document.querySelector("#high-streak").innerText = highStreak;
document.querySelector("#total-high-score").innerText = totalHighScore;

let deferredPrompt = null; // For PWA install prompt
let helpAdPushed = false;
let bottomAdPushed = false;

const resetGame = () => {
  document.querySelector("#round-selector").disabled = false;
  userScore = 0;
  compScore = 0;
  round = 0;
  totalRounds = parseInt(document.querySelector("#round-selector").value, 10);
  userScorePara.innerText = 0;
  compScorePara.innerText = 0;
  msg.innerText = "Play your move";
  msg.style.backgroundColor = "#081B31";
  roundText.innerText = `Round: ${round} / ${totalRounds}`;
  compImg.src = "./images/question.png";
};

const genCompChoice = () => {
  const options = ["rock", "paper", "scissor"];

  if (isHardMode) {
    // AI Logic: Find player's most frequent move
    let mostFreq = "rock";
    if (playerHistory.paper > playerHistory[mostFreq]) mostFreq = "paper";
    if (playerHistory.scissor > playerHistory[mostFreq]) mostFreq = "scissor";

    // Pick move that beats mostFreq (80% of the time)
    if (Math.random() < 0.8) {
      if (mostFreq === "rock") return "paper";
      if (mostFreq === "paper") return "scissor";
      return "rock";
    }
  }

  const randomIdx = Math.floor(Math.random() * 3);
  return options[randomIdx];
};

const drawGame = (compChoice) => {
  msg.innerText = `DRAW!!!😥 Both selected ${compChoice}`;
  msg.style.backgroundColor = "#081B31";
  currentStreak = 0; // Reset streak on draw
};

const updateStats = () => {
  if (userScore > totalHighScore) {
    totalHighScore = userScore;
    localStorage.setItem("totalHighScore", totalHighScore);
    document.querySelector("#total-high-score").innerText = totalHighScore;
  }
  if (currentStreak > highStreak) {
    highStreak = currentStreak;
    localStorage.setItem("highStreak", highStreak);
    document.querySelector("#high-streak").innerText = highStreak;
  }
}

const showWinner = (userWin, userChoice, compChoice) => {
  if (userWin) {
    userScore++;
    currentStreak++;
    userScorePara.innerText = userScore;
    msg.innerText = `You Win 👍 ${userChoice} beats ${compChoice}`;
    msg.style.backgroundColor = "green";
  } else {
    compScore++;
    currentStreak = 0; // Reset streak on loss
    compScorePara.innerText = compScore;
    msg.innerText = `You Lost 👎 ${compChoice} beats ${userChoice}`;
    msg.style.backgroundColor = "red";
  }
  updateStats();
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

      // Mission check
      if (targetScore !== null) {
        if (userScore > targetScore) {
          finalMessage = `🔥 EPIC! You beat the challenge of ${targetScore}!`;
          launchConfetti(); // Double confetti for challenge win
        } else {
          finalMessage = `🥈 Good try! But you didn't beat the score of ${targetScore}.`;
        }
      }
    } else if (userScore < compScore) {
      finalMessage = "😢 Computer won the match!";
      finalColor = "red";

      if (targetScore !== null) {
        finalMessage = `💔 Failed! You needed ${targetScore + 1} to beat the challenge.`;
      }
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
  document.querySelector("#hard-mode-toggle").disabled = true;

  if (round >= totalRounds) return;

  // Track player move for AI
  playerHistory[userChoice]++;

  // Add Suspense Shaking
  msg.innerText = "Wait for it...";
  msg.style.backgroundColor = "#666";
  compImg.src = "./images/rock.png"; // Shaking rock is classic
  compImg.classList.add("shaking");
  clickedChoice.querySelector('img').classList.add("shaking");

  setTimeout(() => {
    // Remove Shaking
    compImg.classList.remove("shaking");
    clickedChoice.querySelector('img').classList.remove("shaking");

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
  }, 800); // 800ms of shaking suspense
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
  totalRounds = parseInt(e.target.value, 10);
  roundText.innerText = `Round: ${round} / ${totalRounds}`;
});

document.querySelector("#toggle-help").addEventListener("click", () => {
  const helpContent = document.querySelector("#help-content");
  helpContent.classList.toggle("hidden");

  // Lazy load AdSense only when help is visible and ad hasn't been pushed yet
  if (!helpContent.classList.contains("hidden") && !helpAdPushed) {
    const helpAdIns = helpContent.querySelector(".adsbygoogle");
    if (helpAdIns && helpAdIns.offsetWidth > 0) {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
        helpAdPushed = true;
        console.log("✅ Help ad pushed");
      } catch (e) {
        console.error("❌ AdSense help-ad push error:", e);
      }
    }
  }
});

// 🆕 Share Game
document.querySelector("#share-game")?.addEventListener("click", async () => {
  const shareUrl = new URL(window.location.origin + window.location.pathname);
  if (userScore > 0) shareUrl.searchParams.set("score", userScore);

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Rock Paper Scissors Game",
        text: userScore > 0 ? `I scored ${userScore} in Rock Paper Scissors! Can you beat me?` : "Play this fun Rock Paper Scissors game with me!",
        url: shareUrl.toString(),
      });
    } else {
      await navigator.clipboard.writeText(shareUrl.toString());
      showToast("Link copied to clipboard!");
    }
  } catch (err) {
    console.error("Share failed:", err);
  }
});

// 🆕 Challenge Friend (copy link)
document.querySelector("#challenge-friend")?.addEventListener("click", () => {
  const challengeUrl = new URL(window.location.href.split('?')[0]);
  challengeUrl.searchParams.set("score", userScore);

  navigator.clipboard.writeText(challengeUrl.toString())
    .then(() => {
      showToast(`Challenge link copied! Scoring ${userScore}. Send it to your friend.`, "success");
    })
    .catch(() => {
      showToast("Failed to copy the link.", "error");
    });
});

// 🆕 Hard Mode Toggle
document.querySelector("#hard-mode-toggle")?.addEventListener("change", (e) => {
  isHardMode = e.target.checked;
  const container = document.querySelector(".ai-mode-container");
  const compBox = document.querySelector(".comp-choice");

  if (isHardMode) {
    container.classList.add("ai-mode-active");
    compBox.classList.add("ai-hard");
    showToast("Hard Mode Active! The AI is watching you...", "warning");
  } else {
    container.classList.remove("ai-mode-active");
    compBox.classList.remove("ai-hard");
  }
});

// 🆕 Detect Challenge on Load
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const challengedScore = urlParams.get("score");

  if (challengedScore !== null) {
    targetScore = parseInt(challengedScore, 10);
    const badge = document.getElementById("challenge-badge");
    if (badge) {
      badge.innerText = `Target: ${targetScore}`;
      badge.classList.remove("hidden");
    }

    // Small delay to ensure the UI is ready and toast container exists
    setTimeout(() => {
      showToast(`🏆 Challenge! A friend scored ${challengedScore}. Can you beat them?`, "success", 5000);
    }, 1500);
  }

  // Lazy load the bottom ad after a short delay to ensure layout is settled
  setTimeout(() => {
    if (!bottomAdPushed) {
      const bottomAdIns = document.querySelector(".adsbygoogle[data-ad-slot='PLACEHOLDER_SLOT_ID']"); // or identifying selector
      // More generic check: find the one that isn't pushed yet and has width
      const allAds = document.querySelectorAll(".adsbygoogle");
      allAds.forEach(ad => {
        if (!ad.hasAttribute("data-adsbygoogle-status") && ad.offsetWidth > 0) {
          try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            if (ad.closest("#help-content")) helpAdPushed = true;
            else bottomAdPushed = true;
            console.log("✅ AdSense push successful for an available slot");
          } catch (e) {
            console.warn("⚠️ AdSense push warning:", e);
          }
        }
      });
    }
  }, 3000); // Increased delay slightly
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
