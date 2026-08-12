const DataStore = (() => {
  const establishments = [
    "Supermercado Central",
    "Auto Center Brasil",
    "Loja Tech",
    "Restaurante Paulista",
    "Farmacia Saude",
    "Posto Avenida",
    "Padaria Vila Nova",
    "Mercado Boa Compra",
    "Clinica Horizonte",
    "Papelaria Nacional",
    "Academia Prime Fit",
    "Pet Shop Alameda",
  ];

  const brands = ["Visa", "Mastercard", "Elo", "Hipercard", "Amex"];
  const types = ["Credito", "Debito", "PIX", "Voucher"];
  const statuses = ["APROVADA", "NEGADA", "TIMEOUT", "CANCELADA", "PENDENTE"];
  const statusWeights = ["APROVADA", "APROVADA", "APROVADA", "APROVADA", "APROVADA", "NEGADA", "TIMEOUT", "CANCELADA", "PENDENTE"];
  const services = ["TEF Authorization", "Capture API", "POS Gateway", "Settlement Worker", "SOAP Adapter", "AntiFraud Proxy"];
  const hosts = ["tef-auth-01", "tef-auth-02", "capture-api-01", "pos-gw-03"];

  const state = {
    transactions: [],
    terminals: [
      { id: "POS-001", status: "ONLINE", latency: 82, lastTransaction: new Date(Date.now() - 42000), ip: "192.168.10.21", establishment: "Supermercado Central" },
      { id: "POS-002", status: "ONLINE", latency: 114, lastTransaction: new Date(Date.now() - 88000), ip: "192.168.10.22", establishment: "Auto Center Brasil" },
      { id: "POS-003", status: "OFFLINE", latency: 0, lastTransaction: new Date(Date.now() - 8 * 60000), ip: "192.168.10.23", establishment: "Loja Tech" },
      { id: "POS-004", status: "INSTAVEL", latency: 340, lastTransaction: new Date(Date.now() - 230000), ip: "192.168.10.24", establishment: "Restaurante Paulista" },
      { id: "POS-005", status: "ONLINE", latency: 91, lastTransaction: new Date(Date.now() - 112000), ip: "192.168.10.25", establishment: "Farmacia Saude" },
      { id: "POS-006", status: "ONLINE", latency: 126, lastTransaction: new Date(Date.now() - 53000), ip: "192.168.10.26", establishment: "Posto Avenida" },
      { id: "POS-007", status: "ONLINE", latency: 77, lastTransaction: new Date(Date.now() - 19000), ip: "192.168.10.27", establishment: "Padaria Vila Nova" },
      { id: "POS-008", status: "INSTAVEL", latency: 286, lastTransaction: new Date(Date.now() - 310000), ip: "192.168.10.28", establishment: "Mercado Boa Compra" },
    ],
    incidents: [
      { id: "INC-10291", severity: "CRITICO", service: "TEF Authorization", description: "Alta taxa de timeout", status: "Em investigacao", owner: "Marina Lopes", openedAt: "12/08/2026 10:18", sla: "18 min" },
      { id: "INC-10277", severity: "ALTA", service: "POS Gateway", description: "Oscilacao em terminais da rede leste", status: "Mitigado", owner: "Bruno Silva", openedAt: "12/08/2026 08:42", sla: "52 min" },
      { id: "INC-10261", severity: "MEDIA", service: "SOAP Adapter", description: "Fila de conciliacao acima do normal", status: "Aberto", owner: "Rafael Costa", openedAt: "11/08/2026 17:05", sla: "4 h" },
      { id: "INC-10230", severity: "BAIXA", service: "Settlement Worker", description: "Atraso em relatorio D-1", status: "Resolvido", owner: "Patricia Nunes", openedAt: "11/08/2026 09:12", sla: "Resolvido" },
    ],
    logs: [],
    notifications: [
      { type: "warning", title: "Terminal POS-003 esta offline.", time: "agora", read: false },
      { type: "error", title: "Aumento de transacoes com timeout.", time: "2 min atras", read: false },
      { type: "success", title: "Sistema de autorizacao normalizado.", time: "9 min atras", read: false },
    ],
    hourly: {
      labels: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
      approved: [410, 284, 215, 342, 782, 1190, 1392, 1284, 1475, 1650, 1324, 899],
      denied: [12, 9, 7, 14, 29, 38, 44, 40, 50, 61, 46, 31],
      timeout: [3, 4, 2, 5, 9, 12, 14, 16, 18, 22, 15, 9],
    },
    volume: {
      labels: ["Qui", "Sex", "Sab", "Dom", "Seg", "Ter", "Hoje"],
      values: [638200, 721300, 590120, 412000, 778940, 802510, 842390.52],
    },
    lastUpdatedAt: new Date(),
  };

  const statusMeta = {
    APROVADA: { code: "00", message: "Transacao aprovada", response: [90, 190] },
    NEGADA: { code: "51", message: "Saldo insuficiente", response: [150, 420] },
    TIMEOUT: { code: "96", message: "Tempo limite excedido no autorizador", response: [2600, 6100] },
    CANCELADA: { code: "17", message: "Cancelamento solicitado pelo portador", response: [180, 520] },
    PENDENTE: { code: "91", message: "Autorizador temporariamente indisponivel", response: [900, 1800] },
  };

  const nextNsu = () => String(Utils.randomInt(180000, 989999));

  const buildTimeline = (createdAt, status) => {
    const base = new Date(createdAt);
    const add = (seconds) => new Date(base.getTime() + seconds * 1000);
    const lastMessage = status === "APROVADA" ? "Transacao aprovada" : `Transacao ${status.toLowerCase()}`;
    return [
      { time: Utils.formatTime(base), message: "Transacao iniciada" },
      { time: Utils.formatTime(add(1)), message: "Requisicao enviada ao servidor" },
      { time: Utils.formatTime(add(2)), message: status === "TIMEOUT" ? "Sem resposta do autorizador" : "Autorizacao recebida" },
      { time: Utils.formatTime(add(2)), message: lastMessage },
    ];
  };

  const createTransaction = (date = new Date()) => {
    const terminal = Utils.pick(state.terminals);
    const status = Utils.pick(statusWeights);
    const meta = statusMeta[status];
    const responseTime = Utils.randomInt(meta.response[0], meta.response[1]);
    const value = Number(Utils.randomFloat(12, 1290).toFixed(2));
    const transaction = {
      nsu: nextNsu(),
      transactionCode: `TX-${Utils.randomInt(2026081200, 2026089999)}`,
      createdAt: new Date(date),
      terminal: terminal.id,
      establishment: terminal.establishment || Utils.pick(establishments),
      brand: Utils.pick(brands),
      type: Utils.pick(types),
      value,
      status,
      responseTime,
      ip: terminal.ip,
      host: Utils.pick(hosts),
      returnCode: meta.code,
      returnMessage: meta.message,
      endpoint: `/api/v1/tef/authorize/${terminal.id.toLowerCase()}`,
      latency: responseTime,
      attempt: status === "TIMEOUT" ? Utils.randomInt(2, 3) : 1,
    };
    transaction.timeline = buildTimeline(transaction.createdAt, transaction.status);
    return transaction;
  };

  const createLog = (transaction = null) => {
    const levels = transaction?.status === "TIMEOUT" ? ["ERROR", "CRITICAL", "WARNING"] : ["INFO", "INFO", "WARNING"];
    const level = Utils.pick(levels);
    const terminal = transaction?.terminal || Utils.pick(state.terminals).id;
    const service = Utils.pick(services);
    const messages = {
      INFO: ["Authorization request processed", "Terminal heartbeat received", "Capture payload validated"],
      WARNING: ["Latency above baseline threshold", "Retry scheduled for terminal request", "Issuer response slower than expected"],
      ERROR: ["Timeout waiting issuer authorization", "Host TEF returned transient failure", "Capture authorization failed"],
      CRITICAL: ["Timeout burst detected on authorization cluster", "POS Gateway unavailable for selected route"],
    };
    return {
      timestamp: new Date(),
      level,
      service,
      terminal,
      message: Utils.pick(messages[level]),
    };
  };

  const seedTransactions = () => {
    for (let i = 0; i < 32; i += 1) {
      const minutesAgo = Utils.randomInt(2, 800);
      state.transactions.push(createTransaction(new Date(Date.now() - minutesAgo * 60000)));
    }
    state.transactions.sort((a, b) => b.createdAt - a.createdAt);
  };

  const seedLogs = () => {
    for (let i = 0; i < 55; i += 1) {
      const log = createLog();
      log.timestamp = new Date(Date.now() - Utils.randomInt(1, 280) * 60000);
      state.logs.push(log);
    }
    state.logs.sort((a, b) => b.timestamp - a.timestamp);
  };

  const addRealtimeTransaction = () => {
    const transaction = createTransaction(new Date());
    state.transactions.unshift(transaction);
    state.transactions = state.transactions.slice(0, 80);

    const terminal = state.terminals.find((item) => item.id === transaction.terminal);
    if (terminal) {
      terminal.lastTransaction = new Date();
      terminal.latency = transaction.status === "TIMEOUT" ? Utils.randomInt(280, 480) : Utils.randomInt(70, 170);
      if (transaction.status === "TIMEOUT" && Math.random() > 0.55) terminal.status = "INSTAVEL";
      if (terminal.status !== "OFFLINE" && transaction.status === "APROVADA" && Math.random() > 0.75) terminal.status = "ONLINE";
    }

    const hourIndex = Math.min(11, Math.floor(new Date().getHours() / 2));
    if (transaction.status === "APROVADA") state.hourly.approved[hourIndex] += 1;
    if (transaction.status === "NEGADA") state.hourly.denied[hourIndex] += 1;
    if (transaction.status === "TIMEOUT") state.hourly.timeout[hourIndex] += 1;
    if (transaction.status === "APROVADA") state.volume.values[state.volume.values.length - 1] += transaction.value;

    state.logs.unshift(createLog(transaction));
    state.logs = state.logs.slice(0, 120);

    if (transaction.status === "TIMEOUT") {
      addNotification("error", `Timeout registrado no ${transaction.terminal}.`);
    } else if (transaction.status === "NEGADA" && Math.random() > 0.55) {
      addNotification("warning", `Negativa acima da media em ${transaction.brand}.`);
    }

    state.lastUpdatedAt = new Date();
    return transaction;
  };

  const mutateTerminals = () => {
    state.terminals.forEach((terminal) => {
      if (Math.random() > 0.72) {
        terminal.status = Utils.pick(["ONLINE", "ONLINE", "ONLINE", "INSTAVEL", "OFFLINE"]);
        terminal.latency = terminal.status === "OFFLINE" ? 0 : terminal.status === "INSTAVEL" ? Utils.randomInt(230, 470) : Utils.randomInt(65, 165);
        if (terminal.status !== "OFFLINE") terminal.lastTransaction = new Date(Date.now() - Utils.randomInt(10, 220) * 1000);
      }
    });
  };

  const addNotification = (type, title) => {
    state.notifications.unshift({ type, title, time: "agora", read: false });
    state.notifications = state.notifications.slice(0, 12);
  };

  const getMetrics = () => {
    const total = 12482 + state.transactions.length;
    const approved = 11932 + state.transactions.filter((item) => item.status === "APROVADA").length;
    const denied = 421 + state.transactions.filter((item) => item.status === "NEGADA").length;
    const timeout = 129 + state.transactions.filter((item) => item.status === "TIMEOUT").length;
    const volume = 842390.52 + state.transactions.filter((item) => item.status === "APROVADA").reduce((sum, item) => sum + item.value, 0);
    return { total, approved, denied, timeout, volume };
  };

  seedTransactions();
  seedLogs();

  return {
    state,
    establishments,
    brands,
    types,
    statuses,
    getMetrics,
    addRealtimeTransaction,
    mutateTerminals,
    addNotification,
  };
})();
