import { API_BASE_URL } from "./config.js";

export const Cadastro = {
  data() {
    return {
      form: {
        nome: '',
        tipo: '',
        data_aquisicao: '',
        data_vencimento: '',
        quantia: '' // armazenará como number
      },
      mensagem: ''
    };
  },
  template: `
    <div class="pagina-fadein fade-init">
      <div id="mensagem-sucesso" 
           class="mensagem-sucesso" 
           :class="{ show: mensagem }">
        {{ mensagem }}
      </div>
      <h1>Cadastrar Investimento</h1>
      <form @submit.prevent="salvar">
        <label>Nome:
          <input v-model="form.nome" required>
        </label>
        <label>Tipo:
          <select v-model="form.tipo" required>
            <option value="" disabled>Escolha um tipo</option>
            <option value="CRI">CRI</option>
            <option value="CRA">CRA</option>
            <option value="LCA">LCA</option>
            <option value="LCI">LCI</option>
            <option value="Debenture">Debenture</option>
            <option value="CDB">CDB</option>
            <option value="Fundo de Investimento">Fundo de Investimento</option>
            <option value="Moeda">Moeda</option>
          </select>
        </label>
        <label>Data de Aquisição:
          <input type="date" v-model="form.data_aquisicao" required>
        </label>
        <label>Data de Vencimento:
          <input type="date" v-model="form.data_vencimento" required>
        </label>
        <label>Quantia:
          <input type="text"
                 :value="formatCurrency(form.quantia)"
                 @input="updateCurrency($event)"
                 required>
        </label>
        <button type="submit">💾 Salvar Investimento</button>
      </form>
    </div>
  `,
  methods: {
    formatCurrency(value) {
      if (value === null || value === '') return '';
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
    updateCurrency(event) {
      let raw = event.target.value;

      // Remove tudo que não seja dígito
      raw = raw.replace(/\D/g, '');

      // Transformar em número com centavos
      let number = parseFloat(raw) / 100; // últimos dois dígitos são centavos
      if (isNaN(number)) number = 0;

      this.form.quantia = number;

      // Atualiza input formatado
      event.target.value = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    },
    async salvar() {
      try {
        const response = await fetch(`${API_BASE_URL}/investimentos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        await response.json();

        this.mensagem = "Investimento salvo com sucesso!";
        setTimeout(() => this.mensagem = "", 3000);

        this.form = { nome: '', tipo: '', data_aquisicao: '', data_vencimento: '', quantia: '' };
      } catch (err) {
        alert("Erro ao salvar: " + err.message);
      }
    }
  }
};
