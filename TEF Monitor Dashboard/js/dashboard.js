const Dashboard = (() => {
  const renderMetrics = () => {
    const metrics = DataStore.getMetrics();
    const total = metrics.total || 1;
    const cards = [
      {
        label: "Total de transacoes",
        value: Utils.formatNumber(metrics.total),
        delta: "+8,4% hoje",
        deltaClass: "is-positive",
        icon: "activity",
      },
      {
        label: "Transacoes aprovadas",
        value: Utils.formatNumber(metrics.approved),
        delta: Utils.formatPercent((metrics.approved / total) * 100),
        deltaClass: "is-positive",
        icon: "circle-check",
      },
      {
        label: "Transacoes negadas",
        value: Utils.formatNumber(metrics.denied),
        delta: Utils.formatPercent((metrics.denied / total) * 100),
        deltaClass: "is-danger",
        icon: "circle-x",
      },
      {
        label: "Timeouts",
        value: Utils.formatNumber(metrics.timeout),
        delta: Utils.formatPercent((metrics.timeout / total) * 100),
        deltaClass: "is-warning",
        icon: "timer-off",
      },
      {
        label: "Volume transacionado",
        value: Utils.formatCurrency(metrics.volume),
        delta: "+6,1% vs. ontem",
        deltaClass: "is-positive",
        icon: "landmark",
      },
    ];

    document.getElementById("metricsGrid").innerHTML = cards
      .map(
        (card) => `
          <article class="metric-card">
            <div class="metric-card__top">
              <span class="metric-card__label">${card.label}</span>
              <span class="metric-card__icon"><i data-lucide="${card.icon}"></i></span>
            </div>
            <strong>${card.value}</strong>
            <span class="metric-card__delta ${card.deltaClass}">${card.delta}</span>
          </article>
        `
      )
      .join("");
    Utils.createIcon();
  };

  const renderReports = () => {
    const metrics = DataStore.getMetrics();
    const online = DataStore.state.terminals.filter((item) => item.status === "ONLINE").length;
    const reports = [
      { title: "Aprovacao media", value: Utils.formatPercent((metrics.approved / metrics.total) * 100), label: "autorizador TEF" },
      { title: "Latencia media", value: `${Math.round(avgLatency())}ms`, label: "terminais online" },
      { title: "Terminais ativos", value: `${online}/${DataStore.state.terminals.length}`, label: "rede operacional" },
      { title: "Ticket medio", value: Utils.formatCurrency(metrics.volume / metrics.approved), label: "transacoes aprovadas" },
      { title: "Incidentes abertos", value: String(DataStore.state.incidents.filter((item) => item.status !== "Resolvido").length), label: "fila de sustentacao" },
      { title: "Logs criticos", value: String(DataStore.state.logs.filter((item) => item.level === "CRITICAL").length), label: "ultimas horas" },
    ];
    document.getElementById("reportsGrid").innerHTML = reports
      .map(
        (report) => `
          <article class="report-card">
            <div class="report-card__head">
              <h3>${report.title}</h3>
              <i data-lucide="trending-up"></i>
            </div>
            <strong>${report.value}</strong>
            <span class="caption">${report.label}</span>
          </article>
        `
      )
      .join("");
  };

  const avgLatency = () => {
    const active = DataStore.state.terminals.filter((item) => item.status !== "OFFLINE");
    return active.reduce((sum, item) => sum + item.latency, 0) / Math.max(1, active.length);
  };

  const renderLastUpdate = () => {
    const seconds = Math.max(0, Math.floor((Date.now() - DataStore.state.lastUpdatedAt.getTime()) / 1000));
    document.getElementById("lastUpdate").innerHTML = `<span></span> Atualizado ha ${seconds} segundo${seconds === 1 ? "" : "s"}`;
  };

  const renderAll = () => {
    renderMetrics();
    renderReports();
    renderLastUpdate();
    Transactions.renderRecent();
    Transactions.render();
    Terminals.render();
    Incidents.render();
    Logs.render();
    Charts.update();
    Utils.createIcon();
  };

  return { renderAll, renderMetrics, renderReports, renderLastUpdate };
})();
