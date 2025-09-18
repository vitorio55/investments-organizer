import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Statistics = {
  props: ["lang"],
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
              <tr @click="toggleExpand(inv)" style="cursor:pointer">
                <td>
                  {{ inv.name }}
                  <span v-if="inv.periodic_payments && inv.periodic_payments.length > 0">
                    ▶
                  </span>
                </td>
                <td>{{ t.investmentTypes[inv.type] }}</td>
                <td>R$ {{ formatNumber(inv.amount) }}</td>
                <td>{{ formatDate(inv.acquisition_date) }}</td>
                <td>{{ formatDate(inv.maturity_date) }}</td>
              </tr>

              <transition-group name="expand" tag="tbody" class="payments-body">
                <tr 
                  v-for="(payment, idx) in inv.periodic_payments" 
                  v-show="inv.expanded"
                  :key="payment.payment_date"
                  :class="['payment-row', idx % 2 === 0 ? 'even' : 'odd']"
                >
                  <td colspan="5" style="padding-left: 30px;">
                    <span v-if="isPast(payment.payment_date)"> ✅</span> 💰 {{ formatDate(payment.payment_date) }} — 
                    {{ t.entryTypes[payment.type] }} — 
                    R$ {{ formatNumber(payment.amount) }}
                  </td>
                </tr>
              </transition-group>
            </template>
          </tbody>
        </table>
        ✅ = {{ t.creditedPayments }}
      </div>

      <div class="statistics-card">
        <h2>💰 {{ t.investmentsMaturitiesSum }}</h2>
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

        this.investments = (data.investments || []).map(inv => ({
          ...inv,
          expanded: false
        }));

        this.sum = data.sum || 0;
      } catch (err) {
        this.error = "Error loading statistics!";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    toggleExpand(inv) {
      if (inv.periodic_payments && inv.periodic_payments.length > 0) {
        inv.expanded = !inv.expanded;
      }
    },
    formatNumber(valor) {
      return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    },
    isPast(date) {
      const today = new Date();
      const paymentDate = new Date(date);
      return paymentDate < today;
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
