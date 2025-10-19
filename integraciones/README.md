# Integraciones — Banco de Semillas

Incluye:
- **Semillas_Sheets_Template.xlsx** (Ticket, Quiz, Dashboard)
- **AppsScript_Semillas.gs** (ruteo por `type`, CORS, API Key opcional)

## Pasos
1. Crea un Google Sheet y (opcional) importa la plantilla XLSX. Copia su **ID** de la URL.
2. En Apps Script: pega `AppsScript_Semillas.gs` y reemplaza `SHEET_ID`. (Opcional) define `API_KEY`.
3. Publica como **Aplicación web** (acceso: cualquiera con el enlace) y copia la URL.
4. En el sitio → **⚙️ Ajustes**: pega la URL y la API Key si usaste una. Presiona *Probar envío*.
5. Los envíos desde 🎟️ Ticket y 🧪 Quiz llegarán a las pestañas respectivas. Sin red, quedan en cola local y se reintentan.
