// Apply saved dark mode preference immediately to prevent flashing
if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
}
