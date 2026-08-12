const Utils = (() => {
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const number = new Intl.NumberFormat("pt-BR");
  const dateTime = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const pad = (value) => String(value).padStart(2, "0");
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => Math.random() * (max - min) + min;

  const formatCurrency = (value) => brl.format(value);
  const formatNumber = (value) => number.format(value);
  const formatPercent = (value) => `${value.toFixed(1).replace(".", ",")}%`;
  const formatDateTime = (date) => dateTime.format(new Date(date));
  const formatDateInput = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const formatTime = (date) => {
    const d = new Date(date);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const sanitize = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const normalize = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const statusClass = (status) => {
    const key = normalize(status);
    const map = {
      aprovada: "approved",
      negada: "denied",
      timeout: "timeout",
      cancelada: "cancelled",
      pendente: "pending",
      online: "online",
      instavel: "unstable",
      offline: "offline",
      aberto: "open",
      "em investigacao": "investigating",
      mitigado: "mitigated",
      resolvido: "resolved",
      critico: "critical",
      alta: "warning",
      media: "info",
      baixa: "approved",
      info: "info",
      warning: "warning",
      error: "error",
      critical: "critical",
    };
    return map[key] || "info";
  };

  const createIcon = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const downloadText = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    pick,
    randomInt,
    randomFloat,
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDateTime,
    formatDateInput,
    formatTime,
    sanitize,
    normalize,
    statusClass,
    createIcon,
    downloadText,
  };
})();
