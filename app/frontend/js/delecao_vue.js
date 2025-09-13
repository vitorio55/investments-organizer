import { API_BASE_URL } from "./config.js";

export const Delecao = {
  data() {
    return {
      investimentoId: '',
      mensagemSucesso: '',
      mensagemErro: ''
    };
  },
  template: `
    <div class="pagina-fadein fade-init">
      <div id="mensagem-sucesso" class="mensagem-sucesso" :class="{ show: mensagemSucesso }">
        {{ mensagemSucesso }}
      </div>
      <div id="mensagem-erro" class="mensagem-erro" :class="{ show: mensagemErro }">
        {{ mensagemErro }}
      </div>

      <h1>Deletar Investimento</h1>

      <div class="deletar-container">
        <label>ID do Investimento:
          <input type="text" v-model="investimentoId" placeholder="Digite o ID">
        </label>
        <button @click="deletar">🗑️ Deletar</button>
      </div>      
    </div>
  `,
  methods: {
    async deletar() {
      if (!this.investimentoId.trim()) return;

      try {
        const response = await fetch(`${API_BASE_URL}/investimentos/${this.investimentoId}`, {
          method: 'DELETE'
        });

        if (response.status === 404) {
          this.mensagemErro = "Investimento não encontrado!";
          setTimeout(() => this.mensagemErro = "", 3000);
          return;
        }

        if (response.status === 400) {
          this.mensagemErro = "Formato inválido de ID para exclusão!";
          setTimeout(() => this.mensagemErro = "", 3000);
          return;
        }

        this.mensagemSucesso = "Investimento deletado com sucesso!";
        setTimeout(() => this.mensagemSucesso = "", 3000);
        this.investimentoId = '';
      } catch (err) {
        this.mensagemErro = "Erro ao deletar!";
        setTimeout(() => this.mensagemErro = "", 3000);
      }
    }
  },
  mounted() {
    this.estilo = document.createElement("link");
    this.estilo.rel = "stylesheet";
    this.estilo.href = "css/delecao.css";
    document.head.appendChild(this.estilo);
  },
  unmounted() {
    if (this.estilo) {
      document.head.removeChild(this.estilo);
    }
  }
};
