// Handle Dark Mode Toggle globally
document.addEventListener("DOMContentLoaded", () => {
    // Attach listener to all possible toggles (header or main body)
    const toggleBtns = document.querySelectorAll("#dark-mode-toggle, .dark-mode-toggle");
    toggleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            if (document.documentElement.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
            } else {
                localStorage.setItem("theme", "light");
            }
        });
    });

    // Initialize Toast Container if missing
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement('div');
        toast.id = "toast";
        toast.className = "toast hidden";
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
});

// Toast Notification System — exposed globally so script.js can call it
window.showToast = function(message, type = "info", duration = 2500) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    // Cancel any existing timer
    if (toast._hideTimer) clearTimeout(toast._hideTimer);

    // Reset to fresh state
    toast.className = "toast";
    toast.textContent = message;

    // Force reflow so animation restarts cleanly
    void toast.offsetWidth;

    // Show with animation
    toast.classList.add("show", type);

    toast._hideTimer = setTimeout(() => {
        toast.classList.remove("show");
        toast._hideTimer = setTimeout(() => {
            toast.className = "toast hidden";
        }, 400);
    }, duration);
};

// Global Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log("✅ Service Worker registered"))
            .catch(err => console.error("❌ Service Worker registration failed:", err));
    });
}
