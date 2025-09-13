import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Delete = {
  props: ['lang'],
  data() {
    return {
      investmentId: '',
      successMessage: '',
      errorMessage: ''
    };
  },
  computed: {
    t() {
      return messages[this.lang];
    }
  },
  template: `
    <div class="pagina-fadein fade-init">
      <div id="mensagem-sucesso" class="mensagem-sucesso" :class="{ show: successMessage }">
        {{ successMessage }}
      </div>
      <div id="mensagem-erro" class="mensagem-erro" :class="{ show: errorMessage }">
        {{ errorMessage }}
      </div>

      <h1>{{ t.deleteInvestment }}</h1>

      <div class="deletar-container">
        <label>{{ t.investmentId }}:
          <input type="text" v-model="investmentId" :placeholder="t.enterId">
        </label>
        <button @click="deletion">🗑️ {{ t.delete }}</button>
      </div>      
    </div>
  `,
  methods: {
    async deletion() {
      if (!this.investmentId.trim()) return;

      try {
        const response = await fetch(`${API_BASE_URL}/investments/${this.investmentId}`, {
          method: 'DELETE'
        });

        if (response.status === 404) {
          this.errorMessage = this.t.investmentNotFound;
          setTimeout(() => this.errorMessage = "", 3000);
          return;
        }

        if (response.status === 400) {
          this.errorMessage = this.t.invalidIdFormat;
          setTimeout(() => this.errorMessage = "", 3000);
          return;
        }

        this.successMessage = this.t.investmentDeletedSuccessfully;
        setTimeout(() => this.successMessage = "", 3000);
        this.investmentId = '';
      } catch (err) {
        this.errorMessage = this.t.errorDeletingInvestment;
        setTimeout(() => this.errorMessage = "", 3000);
      }
    }
  },
  mounted() {
    this.style = document.createElement("link");
    this.style.rel = "stylesheet";
    this.style.href = "css/delete.css";
    document.head.appendChild(this.style);
  },
  unmounted() {
    if (this.style) {
      document.head.removeChild(this.style);
    }
  }
};
