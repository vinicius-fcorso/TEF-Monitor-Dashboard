const Logs = (() => {
  let activeLevel = "ALL";
  const levels = ["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"];

  const init = () => {
    const control = document.getElementById("logLevelFilters");
    if (!control) return;
    control.innerHTML = levels.map((level) => `<button type="button" data-log-level="${level}">${level}</button>`).join("");
    control.addEventListener("click", (event) => {
      const button = event.target.closest("[data-log-level]");
      if (!button) return;
      activeLevel = button.dataset.logLevel;
      render();
    });
  };

  const render = () => {
    const consoleEl = document.getElementById("logsConsole");
    const control = document.getElementById("logLevelFilters");
    if (!consoleEl) return;
    const logs = DataStore.state.logs.filter((log) => activeLevel === "ALL" || log.level === activeLevel);
    consoleEl.innerHTML = logs
      .map(
        (log) => `
          <div class="log-line log-line--${log.level}">
            <span>${Utils.formatDateTime(log.timestamp)}</span>
            <span class="log-level log-level--${log.level}">${log.level}</span>
            <span>${Utils.sanitize(log.service)}</span>
            <span>${Utils.sanitize(log.terminal)}</span>
            <span>${Utils.sanitize(log.message)}</span>
          </div>
        `
      )
      .join("");
    control?.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.logLevel === activeLevel);
    });
  };

  return { init, render };
})();
