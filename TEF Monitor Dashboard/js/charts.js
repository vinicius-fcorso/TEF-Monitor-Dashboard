const Charts = (() => {
  const instances = {};

  const colors = () => ({
    text: getComputedStyle(document.documentElement).getPropertyValue("--muted").trim(),
    border: getComputedStyle(document.documentElement).getPropertyValue("--border").trim(),
    approved: "#32d583",
    denied: "#f04438",
    timeout: "#fdb022",
    cancelled: "#53b1fd",
    accent: "#23b7d9",
  });

  const commonOptions = () => {
    const palette = colors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: palette.text,
            usePointStyle: true,
            boxWidth: 8,
            font: { family: "Inter", size: 12 },
          },
        },
        tooltip: {
          backgroundColor: "#101923",
          borderColor: "#263749",
          borderWidth: 1,
          titleFont: { family: "Inter" },
          bodyFont: { family: "Inter" },
        },
      },
      scales: {
        x: {
          ticks: { color: palette.text, font: { family: "Inter" } },
          grid: { color: "transparent" },
        },
        y: {
          ticks: { color: palette.text, font: { family: "Inter" } },
          grid: { color: palette.border },
        },
      },
    };
  };

  const init = () => {
    if (!window.Chart) return;
    const palette = colors();

    instances.hourly = new Chart(document.getElementById("hourlyChart"), {
      type: "line",
      data: {
        labels: DataStore.state.hourly.labels,
        datasets: [
          {
            label: "Aprovadas",
            data: DataStore.state.hourly.approved,
            borderColor: palette.approved,
            backgroundColor: "rgba(50, 213, 131, 0.12)",
            borderWidth: 2,
            tension: 0.38,
            fill: true,
          },
          {
            label: "Negadas",
            data: DataStore.state.hourly.denied,
            borderColor: palette.denied,
            backgroundColor: "rgba(240, 68, 56, 0.12)",
            borderWidth: 2,
            tension: 0.38,
          },
          {
            label: "Timeout",
            data: DataStore.state.hourly.timeout,
            borderColor: palette.timeout,
            backgroundColor: "rgba(253, 176, 34, 0.12)",
            borderWidth: 2,
            tension: 0.38,
          },
        ],
      },
      options: commonOptions(),
    });

    instances.status = new Chart(document.getElementById("statusChart"), {
      type: "doughnut",
      data: {
        labels: ["Aprovadas", "Negadas", "Timeout", "Canceladas"],
        datasets: [
          {
            data: getStatusValues(),
            backgroundColor: [palette.approved, palette.denied, palette.timeout, palette.cancelled],
            borderColor: getComputedStyle(document.documentElement).getPropertyValue("--surface").trim(),
            borderWidth: 4,
          },
        ],
      },
      options: {
        ...commonOptions(),
        cutout: "68%",
        scales: undefined,
      },
    });

    instances.volume = new Chart(document.getElementById("volumeChart"), {
      type: "bar",
      data: {
        labels: DataStore.state.volume.labels,
        datasets: [
          {
            label: "Volume",
            data: DataStore.state.volume.values,
            backgroundColor: "rgba(35, 183, 217, 0.72)",
            borderColor: palette.accent,
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        ...commonOptions(),
        plugins: {
          ...commonOptions().plugins,
          tooltip: {
            ...commonOptions().plugins.tooltip,
            callbacks: {
              label: (ctx) => Utils.formatCurrency(ctx.raw),
            },
          },
        },
        scales: {
          ...commonOptions().scales,
          y: {
            ...commonOptions().scales.y,
            ticks: {
              ...commonOptions().scales.y.ticks,
              callback: (value) => `R$ ${Math.round(value / 1000)}k`,
            },
          },
        },
      },
    });
  };

  const getStatusValues = () => {
    const transactions = DataStore.state.transactions;
    return [
      transactions.filter((item) => item.status === "APROVADA").length + 11932,
      transactions.filter((item) => item.status === "NEGADA").length + 421,
      transactions.filter((item) => item.status === "TIMEOUT").length + 129,
      transactions.filter((item) => item.status === "CANCELADA").length + 53,
    ];
  };

  const update = () => {
    if (!instances.hourly) return;
    instances.hourly.data.datasets[0].data = DataStore.state.hourly.approved;
    instances.hourly.data.datasets[1].data = DataStore.state.hourly.denied;
    instances.hourly.data.datasets[2].data = DataStore.state.hourly.timeout;
    instances.status.data.datasets[0].data = getStatusValues();
    instances.volume.data.datasets[0].data = DataStore.state.volume.values;
    Object.values(instances).forEach((chart) => chart.update("none"));
  };

  const refreshTheme = () => {
    Object.values(instances).forEach((chart) => chart.destroy());
    init();
  };

  return { init, update, refreshTheme };
})();
