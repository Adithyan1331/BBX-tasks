const typeToggle = document.querySelector(".type-toggle");
const modal = document.querySelector("[data-modal]");
const openModalButton = document.querySelector("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
let previouslyFocusedElement;

typeToggle.addEventListener("click", () => {
    const isLarge = typeToggle.getAttribute("aria-pressed") !== "true";
    typeToggle.setAttribute("aria-pressed", String(isLarge));
    typeToggle.querySelector(".type-toggle-label").textContent = isLarge ? "Reset to default" : "24px type test";
    document.documentElement.style.fontSize = isLarge ? "24px" : "";
});

function openModal() {
    previouslyFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector("[data-close-modal]").focus();
}

function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    previouslyFocusedElement?.focus();
}

openModalButton.addEventListener("click", openModal);
closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
    }
});
