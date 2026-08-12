const Terminals = (() => {
  const statusDot = (status) => {
    if (status === "ONLINE") return "status-dot--online";
    if (status === "INSTAVEL") return "status-dot--warning";
    return "status-dot--offline";
  };

  const communicationText = (date) => {
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    if (seconds < 60) return `${seconds}s atras`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min atras`;
  };

  const card = (terminal) => `
    <article class="terminal-card">
      <div class="terminal-card__head">
        <div>
          <h3>${Utils.sanitize(terminal.id)}</h3>
          <span class="caption">${Utils.sanitize(terminal.establishment)}</span>
        </div>
        <span class="badge badge--${Utils.statusClass(terminal.status)}">
          <span class="status-dot ${statusDot(terminal.status)}"></span>${Utils.sanitize(terminal.status)}
        </span>
      </div>
      <dl>
        <div><dt>Latencia</dt><dd>${terminal.status === "OFFLINE" ? "sem sinal" : `${terminal.latency}ms`}</dd></div>
        <div><dt>Ultima transacao</dt><dd>${communicationText(terminal.lastTransaction)}</dd></div>
        <div><dt>IP</dt><dd>${Utils.sanitize(terminal.ip)}</dd></div>
      </dl>
    </article>
  `;

  const render = () => {
    const grid = document.getElementById("terminalsGrid");
    const summary = document.getElementById("terminalSummary");
    const sorted = [...DataStore.state.terminals].sort((a, b) => {
      const priority = { OFFLINE: 0, INSTAVEL: 1, ONLINE: 2 };
      return priority[a.status] - priority[b.status];
    });
    if (grid) grid.innerHTML = sorted.map(card).join("");
    if (summary) summary.innerHTML = sorted.slice(0, 4).map(card).join("");
  };

  return { render };
})();
