import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Statistics = {
  props: ['lang'],
  data() {
    return {
      investments: [],
      sum: 0,
      loading: true,
      error: null
    };
  },
  computed: {
    t() {
      return messages[this.lang];
    }
  },
  template: `
    <div class="fadein-page fade-init">

      <h1>📊 {{ t.investmentsStatistics }}</h1>

      <div v-if="loading" class="loading">{{ t.loadingStatistics }}</div>
      <div v-else-if="error" class="error-message show">{{ error }}</div>
      
      <div v-else class="statistics-container">

        <table class="investments-table">
          <thead>
            <tr>
              <th>{{ t.name }}</th>
              <th>{{ t.type }}</th>
              <th>{{ t.amount }}</th>
              <th>{{ t.acquisitionDate }}</th>
              <th>{{ t.maturityDate }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="inv in investments" :key="inv.id">
              <tr>
                <td>{{ inv.name }}</td>
                <td>{{ t.investmentTypes[inv.type] }}</td>
                <td>R$ {{ formatNumber(inv.amount) }}</td>
                <td>{{ formatDate(inv.acquisition_date) }}</td>
                <td>{{ formatDate(inv.maturity_date) }}</td>
              </tr>

              <tr v-for="payment in inv.periodic_payments" :key="payment.payment_date">
                <td colspan="5" style="padding-left: 30px; background: #f5f5f5;">
                  💰 {{ formatDate(payment.payment_date) }} — {{ t.entryTypes[payment.type] }} — R$ {{ formatNumber(payment.amount) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="statistics-card">
        <h2>💰 {{ t.investmentsTotalSum }}</h2>
        <p class="total-sum">R$ {{ formatNumber(sum) }}</p>
      </div>
    </div>
  `,
  methods: {
    async loadStatistics() {
      try {
        const response = await fetch(`${API_BASE_URL}/investments/statistics`);
        if (!response.ok) throw new Error("Error fetching statistics");
        const data = await response.json();

        this.investments = data.investments || [];
        this.sum = data.sum || 0;
      } catch (err) {
        this.error = "Error loading statistics!";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    formatNumber(valor) {
      return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    }
  },
  mounted() {
    this.loadStatistics();
    this.style = document.createElement("link");
    this.style.rel = "stylesheet";
    this.style.href = "css/statistics.css";
    document.head.appendChild(this.style);
  },
  unmounted() {
    if (this.style) {
      document.head.removeChild(this.style);
    }
  }
};
