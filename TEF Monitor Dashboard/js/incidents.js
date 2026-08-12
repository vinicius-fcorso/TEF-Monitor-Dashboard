const Incidents = (() => {
  const render = () => {
    const body = document.getElementById("incidentsBody");
    if (!body) return;
    body.innerHTML = DataStore.state.incidents
      .map(
        (incident) => `
          <tr>
            <td><strong>${Utils.sanitize(incident.id)}</strong></td>
            <td><span class="badge badge--${Utils.statusClass(incident.severity)}">${Utils.sanitize(incident.severity)}</span></td>
            <td>${Utils.sanitize(incident.service)}</td>
            <td>${Utils.sanitize(incident.description)}</td>
            <td><span class="badge badge--${Utils.statusClass(incident.status)}">${Utils.sanitize(incident.status)}</span></td>
            <td>${Utils.sanitize(incident.owner)}</td>
            <td>${Utils.sanitize(incident.openedAt)}</td>
            <td>${Utils.sanitize(incident.sla)}</td>
          </tr>
        `
      )
      .join("");
  };

  return { render };
})();
