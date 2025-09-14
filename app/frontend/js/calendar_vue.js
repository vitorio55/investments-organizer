import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const InvestmentCalendar = {
  props: ['lang'],
  data() {
    return {
      investments: [],
      calendar: null
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
      <h1>📅 {{ t.investmentCalendar }}</h1>
      <div id="calendar"></div>
    </div>
  `,
  methods: {
    async loadEventsForMonth(year, month) {
      try {
        const response = await fetch(`${API_BASE_URL}/investments/monthly?year=${year}&month=${month}`);
        if (!response.ok) throw new Error("HTTP error: " + response.status);
        const data = await response.json();
        this.investments = data.investments || [];

        if (this.calendar) {
          this.calendar.removeAllEvents();
          this.investments.forEach(inv => {
            this.calendar.addEvent({
              title: `${inv.name} (${inv.type})`,
              start: this.formatDateISO(inv.maturity_date),
              color: this.getColorByType(inv.type)
            });
          });
        }
      } catch (err) {
        console.error("Error loading investments:", err);
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
          if (titleEl) {
            let newMonthName = info.view.title.trim();
            newMonthName = newMonthName.charAt(0).toUpperCase() + newMonthName.slice(1);
            titleEl.textContent = newMonthName;
          }
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
    getColorByType(type) {
      const colors = {
        CRI: '#0077cc',
        CRA: '#28a745',
        LCA: '#ffc107',
        LCI: '#6f42c1',
        CDB: '#fd7e14',
        Debenture: '#dc3545',
        "Fundo de Investimento": '#20c997',
        Moeda: '#17a2b8',
        default: '#6c757d'
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
    }, 50);
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
