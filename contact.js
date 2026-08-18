document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const messageEl = form.querySelector(".form-message");
    const originalLabel = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.className = "form-message";
    }

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/info@yniidi.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `GymOS Demo Request - ${payload.gym_name || "New lead"}`,
          _template: "table",
          _captcha: "false",
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send right now.");
      }

      form.reset();
      if (messageEl) {
        messageEl.textContent = "Thanks. We received your request and will contact you shortly.";
        messageEl.classList.add("success");
      }
    } catch {
      if (messageEl) {
        messageEl.textContent = "Unable to send right now. Please email info@yniidi.com directly.";
        messageEl.classList.add("error");
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
});
