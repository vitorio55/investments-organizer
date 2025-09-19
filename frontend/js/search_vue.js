import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Search = {
  props: ["lang"],
  data() {
    return {
      investmentId: "",
      result: null,
      errorMessage: "",
      expandPayments: false
    };
  },
  computed: {
    t() {
      return messages[this.lang];
    }
  },
  template: `
    <div class="fadein-page fade-init">
      <div id="error-message" class="error-message" :class="{ show: errorMessage }">
        {{ errorMessage }}
      </div>

      <h1>{{ t.searchInvestment }}</h1>

      <div class="search-container">
        <label>{{ t.investmentId }}:
          <input 
            type="text" 
            v-model="investmentId" 
            @keypress.enter.prevent="search" 
            :placeholder="t.enterId">
        </label>
        <button @click="search">🔍 {{ t.search }}</button>
      </div>

      <div v-if="result" class="investment-card fade-in">
        <h3>{{ result.name }}</h3>
        <p><strong>{{ t.type }}</strong><br>{{ t.investmentTypes[result.type] }}</p>
        <p><strong>{{ t.acquisitionDate }}</strong><br>{{ formatDate(result.acquisition_date) }}</p>
        <p><strong>{{ t.maturityDate }}</strong><br>{{ formatDate(result.maturity_date) }}</p>
        <p><strong>{{ t.amount }}</strong><br>R$ {{ formatNumber(result.amount_invested) }}</p>
        <p><strong>ID</strong><br>{{ result.id }}</p>

        <button 
          v-if="result.periodic_payments && result.periodic_payments.length > 0"
          @click="expandPayments = !expandPayments"
        >
          {{ expandPayments ? t.hidePayments : t.viewPayments }}
        </button>

        <ul v-if="expandPayments">
          <li 
            v-for="payment in result.periodic_payments" 
            :key="payment.payment_date"
          >
            <ul class="periodic-payment">
              <li><span v-if="isPast(payment.payment_date)"> ✅</span>💰 {{ formatDate(payment.payment_date) }}</li>
              <li>{{ t.entryTypes[payment.type] }}</li>
              <li>R$ {{ formatNumber(payment.amount_invested) }}</li>
            </ul>
          </li>
          ✅ = {{ t.creditedPayments }}
        </ul>
      </div>
    </div>
  `,
  methods: {
    async search() {
      if (!this.investmentId.trim()) return;

      this.result = null;
      this.errorMessage = "";

      try {
        const response = await fetch(
          `${API_BASE_URL}/investments/${this.investmentId.trim()}`
        );

        if (response.status === 404) {
          this.errorMessage = this.t.investmentNotFound;
          setTimeout(() => (this.errorMessage = ""), 3000);
          return;
        }

        if (response.status === 400) {
          this.errorMessage = this.t.invalidIdFormat;
          setTimeout(() => (this.errorMessage = ""), 3000);
          return;
        }

        const data = await response.json();
        this.result = data;

      } catch (err) {
        this.errorMessage = this.t.investmentSearchError;
        setTimeout(() => (this.errorMessage = ""), 3000);
      }
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    },
    formatNumber(valor) {
      return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    },
    isPast(date) {
      const today = new Date();
      const paymentDate = new Date(date);
      return paymentDate < today;
    }
  },
  mounted() {
    this.estilo = document.createElement("link");
    this.estilo.rel = "stylesheet";
    this.estilo.href = "css/search.css";
    document.head.appendChild(this.estilo);
  },
  unmounted() {
    if (this.estilo) {
      document.head.removeChild(this.estilo);
    }
  }
};
