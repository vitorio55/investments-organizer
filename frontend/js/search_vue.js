import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Search = {
  props: ['lang'],
  data() {
    return {
      investmentId: '',
      result: null,
      errorMessage: ''
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
          <input type="text" v-model="investmentId" @keypress.enter.prevent="search" :placeholder="t.enterId">
        </label>
        <button @click="search">🔍 {{ t.search }} </button>
      </div>

      <pre v-if="result" id="result">{{ result }}</pre>
    </div>
  `,
  methods: {
    async search() {
      if (!this.investmentId.trim()) return;

      this.result = null;
      this.errorMessage = '';

      try {
        const response = await fetch(`${API_BASE_URL}/investments/${this.investmentId.trim()}`);

        if (response.status === 404) {
          this.errorMessage = this.t.investmentNotFound;
          setTimeout(() => this.errorMessage = '', 3000);
          return;
        }

        if (response.status === 400) {
          this.errorMessage = this.t.invalidIdFormat;
          setTimeout(() => this.errorMessage = '', 3000);
          return;
        }

        const data = await response.json();
        this.result = JSON.stringify(data, null, 2);

      } catch (err) {
        this.errorMessage = this.t.investmentSearchError;
        setTimeout(() => this.errorMessage = '', 3000);
      }
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
