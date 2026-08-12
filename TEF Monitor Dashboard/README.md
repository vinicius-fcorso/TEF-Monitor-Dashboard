# TEF Monitor Dashboard

Frontend portfolio project that simulates a professional TEF payment monitoring platform. The dashboard was designed for support, operations, infrastructure and payment systems teams that need to follow transaction health, POS status, incidents, logs and financial volume.

## Features

- Dark/light mode with preference saved in localStorage
- Collapsible sidebar and responsive mobile navigation
- Real-time simulated TEF activity without backend
- KPI cards for total transactions, approvals, denials, timeouts and volume
- Chart.js line, doughnut and bar charts
- Transaction table with search, filters and CSV export
- Detailed transaction modal with technical data and timeline
- POS terminal monitoring with online, unstable and offline states
- Incident page with severity, ownership and SLA information
- Observability-style logs console with level filters
- Notification panel with simulated operational alerts

## Technologies

- HTML5
- CSS3
- JavaScript ES6+
- Chart.js
- Lucide Icons
- Google Fonts: Inter

## Screenshots

Screenshots can be added to the `screenshots/` folder.

```text
screenshots/
  dashboard-dark.png
  transactions-light.png
  mobile-dashboard.png
```

## Architecture

```text
tef-monitor-dashboard/
|
|-- index.html
|-- README.md
|
|-- css/
|   |-- style.css
|   |-- dashboard.css
|   |-- components.css
|   `-- responsive.css
|
|-- js/
|   |-- app.js
|   |-- data.js
|   |-- dashboard.js
|   |-- transactions.js
|   |-- terminals.js
|   |-- incidents.js
|   |-- logs.js
|   |-- charts.js
|   |-- filters.js
|   `-- utils.js
|
|-- assets/
|   |-- icons/
|   `-- images/
|
`-- screenshots/
```

The JavaScript is split by responsibility. `data.js` owns the fictitious data and real-time simulation, `charts.js` manages Chart.js instances, `transactions.js` handles table rendering and the modal, and `app.js` coordinates navigation, theme, notifications and simulation lifecycle.

## How to Run

This is a pure frontend project. Open `index.html` directly in a browser or use a local static server such as Live Server.

No backend, database or build step is required.

## Future Improvements

- ASP.NET Core API
- SQL Server persistence
- JWT authentication
- WebSocket updates
- Real payment infrastructure monitoring
- Database integration
- Docker deployment

## Author

Add your GitHub profile here:

```text
https://github.com/your-username
```
