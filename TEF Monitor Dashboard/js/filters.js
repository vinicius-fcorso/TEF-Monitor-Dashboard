const Filters = (() => {
  const state = {
    status: "",
    brand: "",
    type: "",
    terminal: "",
    date: "",
    minValue: "",
    maxValue: "",
    search: "",
  };

  const fillSelect = (selector, values) => {
    const select = document.querySelector(selector);
    if (!select) return;
    const first = select.querySelector("option")?.outerHTML || "";
    select.innerHTML = first + values.map((value) => `<option value="${value}">${value}</option>`).join("");
  };

  const init = () => {
    fillSelect("#statusFilter", DataStore.statuses);
    fillSelect("#brandFilter", DataStore.brands);
    fillSelect("#typeFilter", DataStore.types);
    fillSelect("#terminalFilter", DataStore.state.terminals.map((item) => item.id));

    document.getElementById("applyFilters")?.addEventListener("click", applyFromControls);
    document.getElementById("clearFilters")?.addEventListener("click", clear);
    document.getElementById("transactionSearch")?.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      Transactions.render();
    });

    ["statusFilter", "brandFilter", "typeFilter", "terminalFilter", "dateFilter", "minValueFilter", "maxValueFilter"].forEach((id) => {
      document.getElementById(id)?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") applyFromControls();
      });
    });
  };

  const applyFromControls = () => {
    state.status = document.getElementById("statusFilter").value;
    state.brand = document.getElementById("brandFilter").value;
    state.type = document.getElementById("typeFilter").value;
    state.terminal = document.getElementById("terminalFilter").value;
    state.date = document.getElementById("dateFilter").value;
    state.minValue = document.getElementById("minValueFilter").value;
    state.maxValue = document.getElementById("maxValueFilter").value;
    state.search = document.getElementById("transactionSearch").value.trim();
    Transactions.render();
  };

  const clear = () => {
    Object.keys(state).forEach((key) => {
      state[key] = "";
    });
    ["statusFilter", "brandFilter", "typeFilter", "terminalFilter", "dateFilter", "minValueFilter", "maxValueFilter", "transactionSearch"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });
    Transactions.render();
  };

  const filterTransactions = (transactions) => {
    const query = Utils.normalize(state.search);
    return transactions.filter((item) => {
      const matchesSelects =
        (!state.status || item.status === state.status) &&
        (!state.brand || item.brand === state.brand) &&
        (!state.type || item.type === state.type) &&
        (!state.terminal || item.terminal === state.terminal);
      const matchesDate = !state.date || Utils.formatDateInput(item.createdAt) === state.date;
      const matchesMin = !state.minValue || item.value >= Number(state.minValue);
      const matchesMax = !state.maxValue || item.value <= Number(state.maxValue);
      const haystack = Utils.normalize(`${item.nsu} ${item.terminal} ${item.establishment} ${item.brand}`);
      const matchesSearch = !query || haystack.includes(query);
      return matchesSelects && matchesDate && matchesMin && matchesMax && matchesSearch;
    });
  };

  const setSearch = (value) => {
    state.search = value;
    const field = document.getElementById("transactionSearch");
    if (field) field.value = value;
  };

  return { init, state, filterTransactions, setSearch };
})();
