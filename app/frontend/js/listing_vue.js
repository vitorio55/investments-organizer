import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Listing = {
  props: ['lang'],
  data() {
    return {
      investments: [],
      skip: 0,
      limit: 5,
      totalInvestments: 0,
      currentPage: 1,
      expandById: {}
    };
  },
  template: `
    <div class="pagina-fadein fade-init">

      <h1>{{ t.investments }}</h1>

      <div class="listagem-botoes fade-init">
        <button @click="list('prev')" :disabled="currentPage === 1">⬅️ {{ t.previous }}</button>
        <button @click="list('next')" :disabled="currentPage === totalPages">{{ t.next }} ➡️</button>
      </div>
      
      <div id="cards-container" class="fade-init">
        <div v-for="inv in investments" :key="inv.id" class="investimento-card fade-in">
          <h3>{{ inv.nome }}</h3>
          <p><strong>{{ t.type }}</strong><br>{{ inv.type }}</p>
          <p><strong>{{ t.acquisitionDate }}</strong><br>{{ formatDate(inv.acquisition_date) }}</p>
          <p><strong>{{ t.maturityDate}}</strong><br>{{ formatDate(inv.maturity_date) }}</p>
          <p><strong>{{ t.amount }}</strong><br>R$ {{ formatNumber(inv.amount) }}</p>
          <p><strong>ID</strong><br>{{ inv.id }}</p>

          <button @click="toggleExpand(inv.id)">
            {{ expandById[inv.id] ? t.hidePayments : t.viewPayments }}
          </button>

          <ul v-if="expandById[inv.id]">
            <li v-for="periodic_payment in inv.periodic_payments" :key="periodic_payment.payment_date">
              <ul class="pagamento">
                <li>💰 {{ formatDate(periodic_payment.payment_date) }}</li>
                <li>{{ periodic_payment.type }}</li>
                <li>R$ {{ formatNumber(periodic_payment.amount) }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <!-- Paginação -->
      <div class="paginacao fade-init">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="{ ativo: page === currentPage }"
        >
          {{ page }}
        </button>
      </div>
    </div>
  `,
  computed: {
    totalPages() {
      return Math.ceil(this.totalInvestments / this.limit);
    },
    t() {
      return messages[this.lang];
    }
  },
  methods: {
    async list(action) {
      if (action === "next") this.currentPage++;
      if (action === "prev") this.currentPage = Math.max(1, this.currentPage - 1);

      this.skip = (this.currentPage - 1) * this.limit;

      const container = document.getElementById("cards-container");
      if (container) {
        const cardsAtuais = Array.from(container.children);
        cardsAtuais.forEach(card => card.classList.add("fade-out"));
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      try {
        const response = await fetch(`${API_BASE_URL}/investments?skip=${this.skip}&limit=${this.limit}`);
        const data = await response.json();
        this.investments = Array.isArray(data) ? data : data.investments;
        this.totalInvestments = data.total ?? this.investments.length;
      } catch (err) {
        console.error("Error listing investments:", err);
      }
    },
    goToPage(page) {
      this.currentPage = page;
      this.list()
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    },
    formatNumber(valor) {
      return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    },
    toggleExpand(id) {
      this.expandById[id] = !this.expandById[id];
    }
  },
  mounted() {
    this.list('prev');
    this.style = document.createElement("link");
    this.style.rel = "stylesheet";
    this.style.href = "css/listing.css";
    document.head.appendChild(this.style);
  },
  unmounted() {
    if (this.style) {
      document.head.removeChild(this.style);
    }
  }
};
