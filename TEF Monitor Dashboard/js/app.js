const App = (() => {
  const titles = {
    dashboard: ["Dashboard", "Operacoes / Dashboard"],
    transactions: ["Transacoes", "Operacoes / Transacoes"],
    terminals: ["Terminais", "Infraestrutura / Terminais"],
    incidents: ["Incidentes", "Suporte / Incidentes"],
    reports: ["Relatorios", "Gestao / Relatorios"],
    logs: ["Logs", "Observabilidade / Logs"],
    settings: ["Configuracoes", "Sistema / Configuracoes"],
  };
  let simulationTimer = null;
  let updateTimer = null;

  const init = () => {
    applyStoredTheme();
    bindNavigation();
    bindLayout();
    bindNotifications();
    bindSearch();
    bindSettings();

    Filters.init();
    Transactions.init();
    Logs.init();
    Charts.init();
    routeTo(location.hash.replace("#", "") || "dashboard");
    Dashboard.renderAll();
    renderNotifications();
    startSimulation();
    Utils.createIcon();
  };

  const bindNavigation = () => {
    document.body.addEventListener("click", (event) => {
      const link = event.target.closest("[data-route]");
      if (!link) return;
      event.preventDefault();
      routeTo(link.dataset.route);
      history.replaceState(null, "", `#${link.dataset.route}`);
    });
    window.addEventListener("hashchange", () => routeTo(location.hash.replace("#", "") || "dashboard"));
  };

  const routeTo = (route) => {
    const next = titles[route] ? route : "dashboard";
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === next);
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.route === next);
    });
    document.getElementById("pageTitle").textContent = titles[next][0];
    document.getElementById("breadcrumb").textContent = titles[next][1];
    document.getElementById("sidebar").classList.remove("is-open");
    document.getElementById("mobileOverlay").classList.remove("is-open");
  };

  const bindLayout = () => {
    const appShell = document.getElementById("appShell");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("mobileOverlay");
    document.getElementById("sidebarToggle")?.addEventListener("click", () => {
      appShell.classList.toggle("is-collapsed");
      const icon = appShell.classList.contains("is-collapsed") ? "panel-left-open" : "panel-left-close";
      document.getElementById("sidebarToggle").innerHTML = `<i data-lucide="${icon}"></i>`;
      Utils.createIcon();
    });
    document.getElementById("mobileMenu")?.addEventListener("click", () => {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-open");
    });
    overlay?.addEventListener("click", () => {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
    });
  };

  const bindNotifications = () => {
    const panel = document.getElementById("notificationsPanel");
    document.getElementById("notificationButton")?.addEventListener("click", () => {
      panel.classList.toggle("is-open");
    });
    document.getElementById("markNotificationsRead")?.addEventListener("click", () => {
      DataStore.state.notifications.forEach((item) => {
        item.read = true;
      });
      renderNotifications();
    });
    document.addEventListener("click", (event) => {
      const isInside = event.target.closest("#notificationsPanel") || event.target.closest("#notificationButton");
      if (!isInside) panel.classList.remove("is-open");
    });
  };

  const renderNotifications = () => {
    const list = document.getElementById("notificationList");
    const unread = DataStore.state.notifications.filter((item) => !item.read).length;
    document.getElementById("notificationCount").textContent = String(unread);
    document.getElementById("notificationCount").hidden = unread === 0;
    list.innerHTML = DataStore.state.notifications
      .map(
        (item) => `
          <article class="notification-item">
            <strong><span class="badge badge--${Utils.statusClass(item.type)}">${item.type.toUpperCase()}</span> ${Utils.sanitize(item.title)}</strong>
            <span>${Utils.sanitize(item.time)}</span>
          </article>
        `
      )
      .join("");
  };

  const bindSearch = () => {
    document.getElementById("globalSearch")?.addEventListener("input", (event) => {
      const value = event.target.value.trim();
      Filters.setSearch(value);
      Transactions.render();
      if (value) routeTo("transactions");
    });
  };

  const bindSettings = () => {
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
    document.getElementById("settingsThemeToggle")?.addEventListener("click", toggleTheme);
    document.getElementById("simulationToggle")?.addEventListener("change", (event) => {
      if (event.target.checked) startSimulation();
      else stopSimulation();
    });
  };

  const applyStoredTheme = () => {
    const theme = localStorage.getItem("tef-monitor-theme") || "dark";
    document.documentElement.dataset.theme = theme;
    syncThemeButton();
  };

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("tef-monitor-theme", next);
    syncThemeButton();
    Charts.refreshTheme();
    Dashboard.renderAll();
  };

  const syncThemeButton = () => {
    const isLight = document.documentElement.dataset.theme === "light";
    const button = document.getElementById("themeToggle");
    if (button) {
      button.innerHTML = `<i data-lucide="${isLight ? "sun" : "moon"}"></i><span>${isLight ? "Light" : "Dark"}</span>`;
    }
    Utils.createIcon();
  };

  const startSimulation = () => {
    stopSimulation();
    simulationTimer = setInterval(() => {
      DataStore.addRealtimeTransaction();
      DataStore.mutateTerminals();
      Dashboard.renderAll();
      renderNotifications();
    }, 4200);
    updateTimer = setInterval(Dashboard.renderLastUpdate, 1000);
  };

  const stopSimulation = () => {
    if (simulationTimer) clearInterval(simulationTimer);
    if (updateTimer) clearInterval(updateTimer);
  };

  return { init, routeTo, renderNotifications };
})();

document.addEventListener("DOMContentLoaded", App.init);
