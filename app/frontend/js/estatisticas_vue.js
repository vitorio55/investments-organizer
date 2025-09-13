import { API_BASE_URL } from "./config.js";

export const Estatisticas = {
  data() {
    return {
      investimentos: [],
      soma: 0,
      carregando: true,
      erro: null
    };
  },
  template: `
    <div class="pagina-fadein fade-init">
      <h1>📊 Estatísticas de Investimentos</h1>

      <div v-if="carregando" class="loading">Carregando estatísticas...</div>
      <div v-else-if="erro" class="mensagem-erro show">{{ erro }}</div>
      
      <div v-else class="estatisticas-container">

        <!-- Tabela de investimentos -->
        <table class="tabela-investimentos">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Quantia</th>
              <th>Data de Aquisição</th>
              <th>Data de Vencimento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in investimentos" :key="inv.id">
              <td>{{ inv.nome }}</td>
              <td>{{ inv.tipo }}</td>
              <td>R$ {{ formatNumber(inv.quantia) }}</td>
              <td>{{ formatDate(inv.data_aquisicao) }}</td>
              <td>{{ formatDate(inv.data_vencimento) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Caixa da soma total -->
      <div class="estatisticas-card soma-total">
        <h2>💰 Soma total dos investimentos</h2>
        <p class="valor-total">R$ {{ formatNumber(soma) }}</p>
      </div>
    </div>
  `,
  methods: {
    async carregarEstatisticas() {
      try {
        const response = await fetch(`${API_BASE_URL}/investimentos/estatisticas`);
        if (!response.ok) throw new Error("Erro ao buscar estatísticas");
        const data = await response.json();

        this.investimentos = data.investimentos || [];
        this.soma = data.soma || 0;
      } catch (err) {
        this.erro = "Erro ao carregar estatísticas!";
        console.error(err);
      } finally {
        this.carregando = false;
      }
    },
    formatNumber(valor) {
      return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    },
  },
  mounted() {
    this.carregarEstatisticas();
    this.estilo = document.createElement("link");
    this.estilo.rel = "stylesheet";
    this.estilo.href = "css/estatisticas.css";
    document.head.appendChild(this.estilo);
  },
  unmounted() {
    if (this.estilo) {
      document.head.removeChild(this.estilo);
    }
  }
};
