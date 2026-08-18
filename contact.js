const params = new URLSearchParams(window.location.search);
const sent = params.get("sent") === "1";

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const messageEl = form.querySelector(".form-message");
  const submitButton = form.querySelector('button[type="submit"]');

  if (sent && messageEl) {
    messageEl.textContent = "Thanks. Your demo request was sent to info@yniidi.com.";
    messageEl.classList.add("success");
  }

  form.addEventListener("submit", () => {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }
  });
});
