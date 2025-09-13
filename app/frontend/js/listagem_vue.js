import { API_BASE_URL } from "./config.js";

export const Listagem = {
  data() {
    return {
      investimentos: [],
      skip: 0,
      limit: 5,
      totalInvestimentos: 0,
      paginaAtual: 1,
      expandirPorId: {}  // <-- adiciona isso
    };
  },
  template: `
    <div class="pagina-fadein fade-init">
      <h1>Investimentos</h1>

      <div class="listagem-botoes fade-init">
        <button @click="listar('prev')" :disabled="paginaAtual === 1">⬅️ Anterior</button>
        <button @click="listar('next')" :disabled="paginaAtual === totalPaginas">Próximo ➡️</button>
      </div>
      
      <div id="cards-container" class="fade-init">
        <div v-for="inv in investimentos" :key="inv.id" class="investimento-card fade-in">
          <h3>{{ inv.nome }}</h3>
          <p><strong>Tipo</strong><br>{{ inv.tipo }}</p>
          <p><strong>Data de Aquisição</strong><br>{{ formatDate(inv.data_aquisicao) }}</p>
          <p><strong>Data de Vencimento</strong><br>{{ formatDate(inv.data_vencimento) }}</p>
          <p><strong>Quantia</strong><br>R$ {{ formatNumber(inv.quantia) }}</p>
          <p><strong>ID</strong><br>{{ inv.id }}</p>

          <button @click="toggleExpandir(inv.id)">
            {{ expandirPorId[inv.id] ? 'Ocultar pagamentos' : 'Ver pagamentos' }}
          </button>

          <ul v-if="expandirPorId[inv.id]">
            <li v-for="pagamento_periodico in inv.pagamentos_periodicos" :key="pagamento_periodico.data">
              <ul class="pagamento">
                <li>💰 {{ formatDate(pagamento_periodico.data) }}</li>
                <li>{{ pagamento_periodico.tipo }}</li>
                <li>R$ {{ formatNumber(pagamento_periodico.quantia) }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <!-- Paginação -->
      <div class="paginacao fade-init">
        <button
          v-for="pagina in totalPaginas"
          :key="pagina"
          @click="irParaPagina(pagina)"
          :class="{ ativo: pagina === paginaAtual }"
        >
          {{ pagina }}
        </button>
      </div>
    </div>
  `,
  computed: {
    totalPaginas() {
      return Math.ceil(this.totalInvestimentos / this.limit);
    }
  },
  methods: {
    async listar(action) {
      if (action === "next") this.paginaAtual++;
      if (action === "prev") this.paginaAtual = Math.max(1, this.paginaAtual - 1);

      this.skip = (this.paginaAtual - 1) * this.limit;

      // FADE OUT dos cards antigos
      const container = document.getElementById("cards-container");
      if (container) {
        const cardsAtuais = Array.from(container.children);
        cardsAtuais.forEach(card => card.classList.add("fade-out"));
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      try {
        const response = await fetch(`${API_BASE_URL}/investimentos?skip=${this.skip}&limit=${this.limit}`);
        const data = await response.json();
        // Se sua API retorna { investimentos: [], total: 100 }
        this.investimentos = Array.isArray(data) ? data : data.investimentos;
        this.totalInvestimentos = data.total ?? this.investimentos.length;
      } catch (err) {
        console.error("Erro ao listar investimentos:", err);
      }
    },
    irParaPagina(pagina) {
      this.paginaAtual = pagina;
      this.listar()
    },
    formatDate(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    },
    formatNumber(valor) {
      return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    },
    toggleExpandir(id) {
      this.expandirPorId[id] = !this.expandirPorId[id];
    }
  },
  mounted() {
    this.listar('prev');
    this.estilo = document.createElement("link");
    this.estilo.rel = "stylesheet";
    this.estilo.href = "css/listagem.css";
    document.head.appendChild(this.estilo);
  },
  unmounted() {
    if (this.estilo) {
      document.head.removeChild(this.estilo);
    }
  }
};
