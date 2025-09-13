import { Cadastro } from './cadastro_vue.js';
import { Busca } from './busca_vue.js';
import { Delecao } from './delecao_vue.js';
import { Listagem } from './listagem_vue.js';
import { Estatisticas } from "./estatisticas_vue.js";

const { createApp } = Vue;

const app = createApp({
  data() {
    return { pagina: 'cadastro' };
  },
  computed: {
    paginaComponent() {
      if (this.pagina === 'cadastro') return Cadastro;
      if (this.pagina === 'busca') return Busca;
      if (this.pagina === 'delecao') return Delecao;
      if (this.pagina === 'listagem') return Listagem;
      if (this.pagina === 'estatisticas') return Estatisticas;
    }
  }
});

app.mount('#app');
