import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const InvestmentCalendar = {
  props: ['lang'],
  data() {
    return {
      events: [],
      calendar: null,
      totals: {
        interest: 0,
        amortization: 0,
        maturity: 0
      }
    };
  },
  computed: {
    t() {
      return messages[this.lang];
    }
  },
  watch: {
    lang(newLang) {
      if (this.calendar) {
        this.calendar.setOption("locale", newLang === "pt" ? "pt-br" : "en");
      }
    }
  },
  template: `
    <div class="fadein-page fade-init">
      <div>
        <h1>📅 {{ t.investmentCalendar }}</h1>
        <div id="calendar"></div>
      </div>
      <div class="totals-table">
        <h2>{{ t.monthlySummary }}</h2>
        <table>
          <thead>
            <tr>
              <th>{{ t.entryTypes['interest'] }}</th>
              <th>{{ t.entryTypes['amortization'] }}</th>
              <th>{{ t.maturity }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ formatCurrency(totals.interest) }}</td>
              <td>{{ formatCurrency(totals.amortization) }}</td>
              <td>{{ formatCurrency(totals.maturity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  methods: {
    async loadEventsForMonth(year, month) {
      try {
        const response = await fetch(`${API_BASE_URL}/investments/monthly?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        const data = await response.json();
        this.events = data.events || [];

        this.totals.interest = data.total_interest || 0;
        this.totals.amortization = data.total_amortization || 0;
        this.totals.maturity = data.total_maturity_amount || 0;

        if (this.calendar) {
          this.calendar.removeAllEvents();
          this.events.forEach(inv => {
            const translatedType = this.t.entryTypes[inv.type] || inv.type;

            this.calendar.addEvent({
              title: `[${translatedType}] ${inv.name}`,
              start: this.formatDateISO(inv.maturity_date),
              color: this.getColorByType(inv.type),
              amount: inv.amount
            });
          });
        }
      } catch (err) {
        console.error("Error loading events:", err);
      }
    },
    renderCalendar() {
      if (this.calendar) {
        this.calendar.destroy();
      }

      this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialView: 'dayGridMonth',
        initialDate: new Date(),
        locale: this.lang === "pt" ? "pt-br" : "en",
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        },
        nowIndicator: true,
        events: [],
        height: '100%',
        contentHeight: '100%',
        expandRows: true,
        titleFormat: {
          year: 'numeric',
          month: 'long'
        },
        datesSet: (info) => {
          const titleEl = document.querySelector('.fc-toolbar-title');
          let viewDate = info.start;
          let monthNumber = 1;
          if (titleEl) {
            let newMonthName = info.view.title.trim();
            monthNumber = this.getMonthNumberFromName(newMonthName.split(" ")[0]);
            newMonthName = newMonthName.charAt(0).toUpperCase() + newMonthName.slice(1);
            titleEl.textContent = newMonthName;
          }
          this.loadEventsForMonth(viewDate.getFullYear(), monthNumber);
        },
        eventDidMount: (info) => {
          tippy(info.el, {
            content: `
              <strong>${info.event.title}</strong><br>
              Valor: ${this.formatCurrency(info.event.extendedProps.amount || 0)}
            `,
            allowHTML: true,
            theme: 'light-border',
          });
        }
      });
      this.calendar.render();

      const today = new Date();
      this.loadEventsForMonth(today.getFullYear(), today.getMonth() + 1);
    },
    formatDateISO(dateStr) {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    },
    formatCurrency(value) {
      return new Intl.NumberFormat(this.lang === "pt" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: "BRL"
      }).format(value);
    },
    getMonthNumberFromName(monthName) {
      const months = {
        pt: [
          "janeiro", "fevereiro", "março", "abril", "maio", "junho",
          "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ],
        en: [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ]
     };

      const index = months[this.lang]?.findIndex(
        m => m.toLowerCase() === monthName.toLowerCase()
      );

      return index !== -1 ? index + 1 : null;
    },
    getColorByType(type) {
      const colors = {
        // CRI: '#0077cc',
        // CRA: '#28a745',
        // LCA: '#ffc107',
        // LCI: '#6f42c1',
        // CDB: '#fd7e14',
        // Debenture: '#dc3545',
        // "Fundo de Investimento": '#20c997',
        // Moeda: '#17a2b8',
        maturity: '#dc3545',
        interest: '#0077cc',
        amortization: '#fd7e14',
        default: '#6c757d',
      };
      return colors[type] || colors.default;
    }
  },
  mounted() {
    this.renderCalendar();

    this.style = document.createElement("link");
    this.style.rel = "stylesheet";
    this.style.href = "css/calendar.css";
    document.head.appendChild(this.style);

    setTimeout(() => {
      if (this.calendar) this.calendar.updateSize();
    }, 25);
  },
  unmounted() {
    if (this.style) {
      document.head.removeChild(this.style);
    }
    if (this.calendar) {
      this.calendar.destroy();
      this.calendar = null;
    }
  }
};
