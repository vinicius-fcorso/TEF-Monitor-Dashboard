const Transactions = (() => {
  const rowTemplate = (transaction) => `
    <tr>
      <td><strong>${Utils.sanitize(transaction.nsu)}</strong></td>
      <td>${Utils.formatDateTime(transaction.createdAt)}</td>
      <td>${Utils.sanitize(transaction.terminal)}</td>
      <td>${Utils.sanitize(transaction.establishment)}</td>
      <td>${Utils.sanitize(transaction.brand)}</td>
      <td>${Utils.sanitize(transaction.type)}</td>
      <td>${Utils.formatCurrency(transaction.value)}</td>
      <td><span class="badge badge--${Utils.statusClass(transaction.status)}">${Utils.sanitize(transaction.status)}</span></td>
      <td>${transaction.responseTime}ms</td>
      <td>
        <button class="icon-button" type="button" data-action="details" data-nsu="${transaction.nsu}" aria-label="Ver detalhes da transacao ${transaction.nsu}">
          <i data-lucide="eye"></i>
        </button>
      </td>
    </tr>
  `;

  const renderRecent = () => {
    const body = document.getElementById("recentTransactionsBody");
    if (!body) return;
    body.innerHTML = DataStore.state.transactions.slice(0, 15).map(rowTemplate).join("");
    Utils.createIcon();
  };

  const render = () => {
    const body = document.getElementById("transactionsTableBody");
    if (!body) return;
    const filtered = Filters.filterTransactions(DataStore.state.transactions);
    body.innerHTML = filtered.map(rowTemplate).join("");
    document.getElementById("transactionsCount").textContent = String(filtered.length);
    document.getElementById("transactionsEmpty").hidden = filtered.length > 0;
    Utils.createIcon();
  };

  const openModal = (nsu) => {
    const transaction = DataStore.state.transactions.find((item) => item.nsu === nsu);
    if (!transaction) return;
    document.getElementById("modalTitle").textContent = `NSU ${transaction.nsu}`;
    document.getElementById("modalBody").innerHTML = `
      <section class="panel">
        <div class="panel-header"><h2>Informacoes da transacao</h2></div>
        <div class="detail-grid">
          ${detail("NSU", transaction.nsu)}
          ${detail("Codigo da transacao", transaction.transactionCode)}
          ${detail("Terminal", transaction.terminal)}
          ${detail("Estabelecimento", transaction.establishment)}
          ${detail("Bandeira", transaction.brand)}
          ${detail("Tipo", transaction.type)}
          ${detail("Valor", Utils.formatCurrency(transaction.value))}
          ${detail("Status", `<span class="badge badge--${Utils.statusClass(transaction.status)}">${transaction.status}</span>`, true)}
          ${detail("Data", new Date(transaction.createdAt).toLocaleDateString("pt-BR"))}
          ${detail("Hora", Utils.formatTime(transaction.createdAt))}
          ${detail("Tempo de resposta", `${transaction.responseTime}ms`)}
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Informacoes tecnicas</h2></div>
        <div class="detail-grid">
          ${detail("IP do terminal", transaction.ip)}
          ${detail("Host TEF", transaction.host)}
          ${detail("Codigo de retorno", transaction.returnCode)}
          ${detail("Mensagem de retorno", transaction.returnMessage)}
          ${detail("Endpoint utilizado", transaction.endpoint)}
          ${detail("Latencia", `${transaction.latency}ms`)}
          ${detail("Numero da tentativa", transaction.attempt)}
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Timeline</h2></div>
        <ul class="timeline">
          ${transaction.timeline.map((item) => `<li><time>${item.time}</time><span>${Utils.sanitize(item.message)}</span></li>`).join("")}
        </ul>
      </section>
    `;
    const modal = document.getElementById("transactionModal");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    Utils.createIcon();
  };

  const detail = (label, value, raw = false) => `
    <div class="detail-item">
      <span>${Utils.sanitize(label)}</span>
      <strong>${raw ? value : Utils.sanitize(value)}</strong>
    </div>
  `;

  const closeModal = () => {
    const modal = document.getElementById("transactionModal");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  const init = () => {
    document.body.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action='details']");
      if (button) openModal(button.dataset.nsu);
    });
    document.getElementById("closeModal")?.addEventListener("click", closeModal);
    document.getElementById("transactionModal")?.addEventListener("click", (event) => {
      if (event.target.id === "transactionModal") closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
    document.getElementById("exportTransactions")?.addEventListener("click", exportCsv);
  };

  const exportCsv = () => {
    const rows = Filters.filterTransactions(DataStore.state.transactions);
    const header = ["NSU", "Data/Hora", "Terminal", "Estabelecimento", "Bandeira", "Tipo", "Valor", "Status", "Tempo de resposta"];
    const lines = rows.map((item) =>
      [
        item.nsu,
        Utils.formatDateTime(item.createdAt),
        item.terminal,
        item.establishment,
        item.brand,
        item.type,
        item.value.toFixed(2),
        item.status,
        `${item.responseTime}ms`,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";")
    );
    Utils.downloadText("tef-transacoes.csv", [header.join(";"), ...lines].join("\n"));
  };

  return { init, render, renderRecent, openModal };
})();
