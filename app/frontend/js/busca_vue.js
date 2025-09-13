import { API_BASE_URL } from "./config.js";

export const Busca = {
  data() {
    return {
      investimentoId: '',
      resultado: null,
      mensagemErro: ''
    };
  },
  template: `
    <div class="pagina-fadein fade-init">
      <div id="mensagem-erro" class="mensagem-erro" :class="{ show: mensagemErro }">
        {{ mensagemErro }}
      </div>

      <h1>Buscar Investimento</h1>

      <div class="buscar-container">
        <label>ID do Investimento:
          <input type="text" v-model="investimentoId" @keypress.enter.prevent="buscar" placeholder="Digite o ID">
        </label>
        <button @click="buscar">🔍 Buscar</button>
      </div>

      <pre v-if="resultado" id="resultado">{{ resultado }}</pre>
    </div>
  `,
  methods: {
    async buscar() {
      if (!this.investimentoId.trim()) return;

      this.resultado = null;
      this.mensagemErro = '';

      try {
        const response = await fetch(`${API_BASE_URL}/investimentos/${this.investimentoId.trim()}`);

        if (response.status === 404) {
          this.mensagemErro = "Investimento não encontrado!";
          setTimeout(() => this.mensagemErro = '', 3000);
          return;
        }

        if (response.status === 400) {
          this.mensagemErro = "Formato inválido de ID!";
          setTimeout(() => this.mensagemErro = '', 3000);
          return;
        }

        const data = await response.json();
        this.resultado = JSON.stringify(data, null, 2);

      } catch (err) {
        this.mensagemErro = "Erro ao buscar investimento!";
        setTimeout(() => this.mensagemErro = '', 3000);
      }
    }
  },
  mounted() {
    this.estilo = document.createElement("link");
    this.estilo.rel = "stylesheet";
    this.estilo.href = "css/busca.css";
    document.head.appendChild(this.estilo);
  },
  unmounted() {
    if (this.estilo) {
      document.head.removeChild(this.estilo);
    }
  }
};
