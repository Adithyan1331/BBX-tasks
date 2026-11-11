const destinationCards = document.querySelectorAll(".destination-card");
const topRatedGrid = document.getElementById("top-rated-grid");
const searchInput = document.getElementById("destination-search");
const seasonFilter = document.getElementById("season-filter");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const bookingForm = document.getElementById("booking-form");
const modalBackdrop = document.getElementById("modal-backdrop");
const packageModal = document.getElementById("package-modal");
const descriptionModal = document.getElementById("description-modal");
const journeyModal = document.getElementById("journey-modal");
const travelersInput = document.getElementById("travelers");
const moodChips = document.querySelectorAll(".mood-chip");

let activeDestination = null;
let packageForBooking = false;
let selectedPackage = null;
let galleryImages = [];
let galleryIndex = 0;

function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function getDestinationName(card) {
    return card.querySelector("h3").textContent.trim();
}

function getDestinationCost(card, packageType) {
    const costAttribute = packageType === "couple" ? "coupleCost" : "personCost";
    return Number(card.dataset[costAttribute]);
}

function createRatedCard(card) {
    const name = getDestinationName(card);
    const location = card.querySelector(".country-line").dataset.location;
    const season = card.dataset.season;
    const days = card.dataset.days;
    const personCost = getDestinationCost(card, "person");
    const coupleCost = getDestinationCost(card, "couple");
    const ratedCard = document.createElement("article");
    const imageWrap = document.createElement("div");
    const image = document.createElement("img");
    const badge = document.createElement("span");
    const body = document.createElement("div");
    const heading = document.createElement("h3");
    const locationLine = document.createElement("p");
    const details = document.createElement("div");
    const seasonItem = document.createElement("span");
    const personItem = document.createElement("span");
    const coupleItem = document.createElement("span");
    const daysItem = document.createElement("span");
    const button = document.createElement("button");

    ratedCard.className = "rated-card";
    imageWrap.className = "rated-image";
    image.src = card.querySelector(".destination-image").src;
    image.alt = card.querySelector(".destination-image").alt;
    image.loading = "lazy";
    badge.className = "rated-badge";
    badge.textContent = "★ Top rated · " + card.dataset.rating;
    body.className = "rated-body";
    heading.textContent = name;
    locationLine.className = "rated-location";
    locationLine.textContent = location;
    details.className = "rated-details";
    seasonItem.innerHTML = "Best season<strong>" + season.charAt(0).toUpperCase() + season.slice(1) + "</strong>";
    personItem.innerHTML = "Person package<strong>" + formatCurrency(personCost) + "</strong>";
    coupleItem.innerHTML = "Couple package<strong>" + formatCurrency(coupleCost) + "</strong>";
    daysItem.innerHTML = "Trip duration<strong>" + days + " days minimum</strong>";
    button.className = "button button-soft";
    button.type = "button";
    button.textContent = "View details";
    button.addEventListener("click", function () {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("is-highlighted");
        window.setTimeout(function () {
            card.classList.remove("is-highlighted");
        }, 2200);
    });

    imageWrap.append(image, badge);
    details.append(seasonItem, personItem, coupleItem, daysItem);
    body.append(heading, locationLine, details, button);
    ratedCard.append(imageWrap, body);
    topRatedGrid.append(ratedCard);
}

destinationCards.forEach(function (card) {
    if (card.dataset.topRated === "true") {
        createRatedCard(card);
    }

    card.addEventListener("click", function (event) {
        if (event.target.closest("button")) {
            return;
        }
        card.classList.toggle("is-selected");
    });

    const image = card.querySelector(".destination-image");
    image.addEventListener("mouseenter", function () {
        image.classList.add("is-hovering");
    });
    image.addEventListener("mouseleave", function () {
        image.classList.remove("is-hovering");
    });
    image.addEventListener("dblclick", function () {
        image.classList.toggle("is-enlarged");
    });

    const countryLine = card.querySelector(".country-line");
    countryLine.addEventListener("mouseenter", function () {
        countryLine.firstChild.textContent = countryLine.dataset.location + " ";
    });
    countryLine.addEventListener("mouseleave", function () {
        countryLine.firstChild.textContent = countryLine.dataset.country + " ";
    });

    const routeLine = card.querySelector(".route-line");
    const routeText = routeLine.textContent;
    routeLine.addEventListener("mouseenter", function () {
        routeLine.textContent = routeLine.dataset.route;
    });
    routeLine.addEventListener("mouseleave", function () {
        routeLine.textContent = routeText;
    });

    card.querySelector(".package-details-button").addEventListener("click", function () {
        openPackageModal(card, false);
    });
    card.querySelector(".description-button").addEventListener("click", function () {
        openDescriptionModal(card);
    });
    card.querySelector(".ready-button").addEventListener("click", function (event) {
        startBooking(card, event);
    });
});

function filterDestinations() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedSeason = seasonFilter.value;
    let visibleCount = 0;

    destinationCards.forEach(function (card) {
        const name = getDestinationName(card).toLowerCase();
        const location = card.querySelector(".country-line").dataset.location.toLowerCase();
        const country = card.querySelector(".country-line").dataset.country.toLowerCase();
        const matchesSearch = name.includes(searchTerm) || location.includes(searchTerm) || country.includes(searchTerm);
        const matchesSeason = selectedSeason === "all" || card.dataset.season === selectedSeason;
        const shouldShow = matchesSearch && matchesSeason;
        card.hidden = !shouldShow;
        if (shouldShow) {
            visibleCount += 1;
        }
    });

    resultsCount.textContent = visibleCount + (visibleCount === 1 ? " destination" : " destinations");
    emptyState.hidden = visibleCount !== 0;
}

searchInput.addEventListener("input", filterDestinations);
seasonFilter.addEventListener("change", function () {
    updateMoodSelection(seasonFilter.value);
    filterDestinations();
});
moodChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
        seasonFilter.value = chip.dataset.season;
        updateMoodSelection(chip.dataset.season);
        filterDestinations();
    });
});

function updateMoodSelection(season) {
    moodChips.forEach(function (chip) {
        const isActive = chip.dataset.season === season;
        chip.classList.toggle("is-active", isActive);
        chip.setAttribute("aria-pressed", isActive);
    });
}

updateMoodSelection(seasonFilter.value);
filterDestinations();

function showModal(modal) {
    modalBackdrop.hidden = false;
    packageModal.hidden = true;
    descriptionModal.hidden = true;
    journeyModal.hidden = true;
    modal.hidden = false;
    document.body.classList.add("modal-open");
}

function closeModal() {
    modalBackdrop.hidden = true;
    packageModal.hidden = true;
    descriptionModal.hidden = true;
    journeyModal.hidden = true;
    document.body.classList.remove("modal-open");
}

function openPackageModal(card, forBooking) {
    activeDestination = card;
    packageForBooking = forBooking;
    const name = getDestinationName(card);
    const typeSelect = document.getElementById("modal-package-type");
    const quantityInput = document.getElementById("modal-quantity");
    const daysInput = document.getElementById("modal-days");
    const confirmButton = packageModal.querySelector(".modal-confirm");

    packageModal.querySelector(".modal-destination").textContent = name;
    document.getElementById("package-modal-title").textContent = forBooking ? "Choose your package" : "Package details";
    confirmButton.hidden = !forBooking;
    typeSelect.value = selectedPackage && forBooking ? selectedPackage.type : "person";
    quantityInput.value = travelersInput.value || "1";
    daysInput.value = selectedPackage && forBooking ? selectedPackage.days : card.dataset.days;
    updatePackageEstimate();
    showModal(packageModal);
}

function updatePackageEstimate() {
    if (!activeDestination) {
        return;
    }
    const type = document.getElementById("modal-package-type").value;
    const quantityInput = document.getElementById("modal-quantity");
    const daysInput = document.getElementById("modal-days");
    const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
    const days = Math.max(1, Number.parseInt(daysInput.value, 10) || 1);
    const unitCost = getDestinationCost(activeDestination, type);
    document.getElementById("modal-unit-cost").textContent = formatCurrency(unitCost);
    document.getElementById("modal-total-cost").textContent = formatCurrency(unitCost * quantity * days);
}

document.getElementById("modal-package-type").addEventListener("change", updatePackageEstimate);
document.getElementById("modal-quantity").addEventListener("input", updatePackageEstimate);
document.getElementById("modal-days").addEventListener("input", updatePackageEstimate);

function openDescriptionModal(card) {
    activeDestination = card;
    const name = getDestinationName(card);
    const details = card.querySelector(".destination-details");
    const attractions = card.querySelectorAll(".attractions li");
    const gallerySources = document.querySelectorAll(".gallery-sources img");
    const modalAttractions = document.getElementById("description-attractions");

    document.getElementById("description-title").textContent = name;
    document.getElementById("description-copy").textContent = details.querySelector("p:first-child").textContent;
    document.getElementById("description-best-time").textContent = details.querySelector(".best-time").textContent;
    document.getElementById("description-tips").textContent = details.querySelector(".travel-tips").textContent;
    modalAttractions.textContent = "";
    attractions.forEach(function (attraction) {
        const item = document.createElement("li");
        item.textContent = attraction.textContent;
        modalAttractions.append(item);
    });

    galleryImages = [card.querySelector(".destination-image").src];
    gallerySources.forEach(function (image) {
        galleryImages.push(image.src);
    });
    galleryIndex = 0;
    renderGallery();
    showModal(descriptionModal);
}

function renderGallery() {
    const galleryImage = document.getElementById("gallery-image");
    const dots = document.getElementById("gallery-dots");
    galleryImage.src = galleryImages[galleryIndex];
    galleryImage.alt = getDestinationName(activeDestination) + " travel view " + (galleryIndex + 1);
    dots.textContent = "";

    galleryImages.forEach(function (image, index) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === galleryIndex ? "gallery-dot active" : "gallery-dot";
        dot.setAttribute("aria-label", "Show image " + (index + 1));
        dot.addEventListener("click", function () {
            galleryIndex = index;
            renderGallery();
        });
        dots.append(dot);
    });
}

function changeGalleryImage(direction) {
    galleryIndex += direction;
    if (galleryIndex < 0) {
        galleryIndex = galleryImages.length - 1;
    }
    if (galleryIndex >= galleryImages.length) {
        galleryIndex = 0;
    }
    renderGallery();
}

document.getElementById("gallery-previous").addEventListener("click", function () {
    changeGalleryImage(-1);
});
document.getElementById("gallery-next").addEventListener("click", function () {
    changeGalleryImage(1);
});
descriptionModal.querySelector(".description-ready").addEventListener("click", function (event) {
    startBooking(activeDestination, event);
});

function startBooking(card, event) {
    console.log("Event Type:", event.type);
    console.log("Target Element:", event.target);
    console.log("Target Element ID:", event.target.id);
    activeDestination = card;
    closeModal();
    document.getElementById("booking-destination").value = getDestinationName(card);
    document.getElementById("booking-summary").hidden = true;
    document.getElementById("confirmation-card").hidden = true;
    bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("choose-package").addEventListener("click", function () {
    if (!activeDestination) {
        setFieldError("booking-destination", "destination-error", "Choose a destination first.");
        return;
    }
    openPackageModal(activeDestination, true);
});

packageModal.querySelector(".modal-confirm").addEventListener("click", function () {
    const type = document.getElementById("modal-package-type").value;
    const days = Math.max(1, Number.parseInt(document.getElementById("modal-days").value, 10) || 1);
    const cost = getDestinationCost(activeDestination, type);
    selectedPackage = { type: type, days: days, cost: cost };
    document.getElementById("package-type").value = type === "person" ? "Person package" : "Couple package";
    document.getElementById("package-days").value = days + " days";
    document.getElementById("package-accommodation").value = "Included";
    document.getElementById("package-food").value = "Included";
    document.getElementById("package-cost").value = formatCurrency(cost);
    clearFieldError("package-error");
    updateBookingSummary();
    closeModal();
});

document.getElementById("booking-destination").addEventListener("click", function () {
    if (activeDestination) {
        activeDestination.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});

function calculateBookingTotal() {
    if (!selectedPackage) {
        return 0;
    }
    const travelers = Number.parseInt(travelersInput.value, 10) || 0;
    const quantity = selectedPackage.type === "couple" ? Math.ceil(travelers / 2) : travelers;
    return selectedPackage.cost * quantity * selectedPackage.days;
}

function updateBookingSummary() {
    const summary = document.getElementById("booking-summary");
    const totalCost = calculateBookingTotal();
    document.getElementById("total-cost").value = selectedPackage ? formatCurrency(totalCost) : "";
    if (!selectedPackage || !activeDestination) {
        summary.hidden = true;
        return;
    }
    const travelers = Number.parseInt(travelersInput.value, 10) || 0;
    const heading = document.createElement("h3");
    const grid = document.createElement("div");
    heading.textContent = "Booking summary";
    grid.className = "summary-grid";
    addSummaryItem(grid, "Destination", getDestinationName(activeDestination));
    addSummaryItem(grid, "Number of travelers", travelers);
    addSummaryItem(grid, "Package type", selectedPackage.type === "person" ? "Person package" : "Couple package");
    addSummaryItem(grid, "Number of days", selectedPackage.days + " days");
    addSummaryItem(grid, "Accommodation", "Included");
    addSummaryItem(grid, "Food", "Included");
    addSummaryItem(grid, "Package cost / unit", formatCurrency(selectedPackage.cost));
    addSummaryItem(grid, "Total cost", formatCurrency(totalCost));
    summary.textContent = "";
    summary.append(heading, grid);
    summary.hidden = false;
}

function addSummaryItem(container, label, value) {
    const item = document.createElement("div");
    const strong = document.createElement("strong");
    item.className = "summary-item";
    item.append(document.createTextNode(label), strong);
    strong.textContent = value;
    container.append(item);
}

travelersInput.addEventListener("input", updateBookingSummary);

function setFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    document.getElementById(errorId).textContent = message;
    if (field) {
        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");
    }
}

function clearFieldError(errorId) {
    document.getElementById(errorId).textContent = "";
    const field = document.querySelector('[aria-describedby="' + errorId + '"]');
    if (field) {
        field.classList.remove("invalid");
        field.removeAttribute("aria-invalid");
    }
}

const validationFields = [
    ["full-name", "name-error"],
    ["email", "email-error"],
    ["mobile", "mobile-error"],
    ["booking-destination", "destination-error"],
    ["travelers", "travelers-error"]
];

validationFields.forEach(function (fieldPair) {
    const field = document.getElementById(fieldPair[0]);
    field.setAttribute("aria-describedby", fieldPair[1]);
    field.addEventListener("input", function () {
        if (field.id === "travelers") {
            if (Number(field.value) > 0) {
                clearFieldError(fieldPair[1]);
            }
        } else if (field.value.trim()) {
            clearFieldError(fieldPair[1]);
        }
    });
});

function validateBooking() {
    let valid = true;
    const name = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const travelers = Number(document.getElementById("travelers").value);

    validationFields.forEach(function (fieldPair) {
        clearFieldError(fieldPair[1]);
    });
    clearFieldError("package-error");

    if (!name) {
        setFieldError("full-name", "name-error", "Please enter your full name.");
        valid = false;
    }
    if (!email.includes("@")) {
        setFieldError("email", "email-error", "Enter an email address containing @.");
        valid = false;
    }
    if (!/^\d{10}$/.test(mobile)) {
        setFieldError("mobile", "mobile-error", "Enter exactly 10 digits.");
        valid = false;
    }
    if (!activeDestination || !document.getElementById("booking-destination").value) {
        setFieldError("booking-destination", "destination-error", "Choose a destination.");
        valid = false;
    }
    if (!Number.isInteger(travelers) || travelers <= 0) {
        setFieldError("travelers", "travelers-error", "Enter at least one traveler.");
        valid = false;
    }
    if (!selectedPackage) {
        document.getElementById("package-error").textContent = "Choose a package to continue.";
        valid = false;
    }
    return valid;
}

bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateBooking()) {
        return;
    }
    const name = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const travelers = document.getElementById("travelers").value;
    const type = selectedPackage.type === "person" ? "Person package" : "Couple package";
    const confirmation = document.getElementById("confirmation-card");

    const confirmationHeading = document.createElement("h3");
    const confirmationGrid = document.createElement("div");
    const status = document.createElement("span");
    confirmationHeading.textContent = "Booking confirmed";
    confirmationGrid.className = "confirmation-grid";
    addConfirmationItem(confirmationGrid, "Customer name", name);
    addConfirmationItem(confirmationGrid, "Email address", email);
    addConfirmationItem(confirmationGrid, "Mobile number", mobile);
    addConfirmationItem(confirmationGrid, "Destination", getDestinationName(activeDestination));
    addConfirmationItem(confirmationGrid, "Package type", type);
    addConfirmationItem(confirmationGrid, "Number of days", selectedPackage.days + " days");
    addConfirmationItem(confirmationGrid, "Accommodation", "Included");
    addConfirmationItem(confirmationGrid, "Food", "Included");
    addConfirmationItem(confirmationGrid, "Number of travelers", travelers);
    addConfirmationItem(confirmationGrid, "Package cost / unit", formatCurrency(selectedPackage.cost));
    addConfirmationItem(confirmationGrid, "Total cost", formatCurrency(calculateBookingTotal()));
    addConfirmationItem(confirmationGrid, "Booking date & time", new Date().toLocaleString());
    status.className = "booking-status";
    status.textContent = "Confirmed";
    confirmation.textContent = "";
    confirmation.append(confirmationHeading, confirmationGrid, status);
    document.getElementById("booking-summary").hidden = true;
    confirmation.hidden = false;
    showModal(journeyModal);
});

function addConfirmationItem(container, label, value) {
    const item = document.createElement("div");
    const strong = document.createElement("strong");
    item.append(document.createTextNode(label), strong);
    strong.textContent = value;
    container.append(item);
}

bookingForm.addEventListener("reset", function () {
    window.setTimeout(function () {
        activeDestination = null;
        selectedPackage = null;
        document.getElementById("booking-summary").hidden = true;
        document.getElementById("confirmation-card").hidden = true;
        document.getElementById("total-cost").value = "";
        document.querySelectorAll(".field-error").forEach(function (fieldError) {
            fieldError.textContent = "";
        });
        document.querySelectorAll(".invalid").forEach(function (field) {
            field.classList.remove("invalid");
            field.removeAttribute("aria-invalid");
        });
    }, 0);
});

document.getElementById("modal-backdrop").addEventListener("click", function (event) {
    if (event.target === modalBackdrop || event.target.closest("[data-close]")) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modalBackdrop.hidden) {
        closeModal();
    }
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", function () {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", isOpen);
});
mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

window.addEventListener("load", function () {
    document.getElementById("page-date").textContent = new Date().toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
});
