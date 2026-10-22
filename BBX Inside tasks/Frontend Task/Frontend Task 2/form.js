
const form = document.querySelector("#registration-form");
const steps = [...document.querySelectorAll(".step")];
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const submit = document.querySelector("#submit");
const formError = document.querySelector("#form-error");
let currentStep = 0;

function showStep(index) {
  currentStep = index;

  steps.forEach((step, i) => {
    step.hidden = i !== currentStep;
  });

  previous.hidden = currentStep === 0;
  next.hidden = currentStep === steps.length - 1;
  submit.hidden = currentStep !== steps.length - 1;

  steps[currentStep].querySelector("h2").focus();
}

steps.forEach(step => {
  step.querySelector("h2").tabIndex = -1;
});

function errorElement(field) {
  const describedBy = field.getAttribute("aria-describedby") || "";
  const id = describedBy.split(/\s+/).find(item => item.endsWith("-error"));
  return id ? document.getElementById(id) : null;
}

function setError(field, message) {
  field.setAttribute("aria-invalid", String(Boolean(message)));
  const output = errorElement(field);
  if (output) output.textContent = message;
}

function validateField(field) {
  let message = "";

  if (field.type === "checkbox" && field.name === "interests") {
    const checked = form.querySelectorAll(
      'input[name="interests"]:checked'
    );
    message = checked.length ? "" : "Choose at least one interest.";
  } else if (field.type === "file" && field.files.length) {
    const file = field.files[0];
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      message = "Only PDF files are accepted.";
    } else if (file.size > 2 * 1024 * 1024) {
      message = "The file must be no larger than 2 MB.";
    }
  } else if (!field.checkValidity()) {
    message = field.validationMessage;
  }

  setError(field, message);
  return !message;
}

function validateStep(index) {
  let valid = true;
  const fields = [...steps[index].querySelectorAll("input")];

  fields.forEach(field => {
    if (field.type === "hidden") return;
    if (!validateField(field)) valid = false;
  });

  return valid;
}

next.addEventListener("click", () => {
  if (validateStep(currentStep)) {
    showStep(Math.min(currentStep + 1, steps.length - 1));
  } else {
    steps[currentStep].querySelector('[aria-invalid="true"]')?.focus();
  }
});

previous.addEventListener("click", () => {
  showStep(Math.max(currentStep - 1, 0));
});

form.addEventListener("submit", event => {
  let firstInvalid = null;

  // Check every step, including fields not currently visible.
  steps.forEach((step, index) => {
    step.hidden = false;
    step.querySelectorAll("input").forEach(field => {
      if (field.type === "hidden") return;
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });
  });

  if (firstInvalid) {
    event.preventDefault();
    const stepIndex = steps.findIndex(step => step.contains(firstInvalid));
    showStep(stepIndex);
    firstInvalid.focus();
    formError.textContent = "Please correct the highlighted fields.";
  } else {
    formError.textContent = "";
  }
});

form.querySelectorAll("input").forEach(field => {
  field.addEventListener("input", () => validateField(field));
  field.addEventListener("change", () => validateField(field));
});

showStep(0);
