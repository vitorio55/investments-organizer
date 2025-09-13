import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Register = {
  props: ['lang'],
  data() {
    return {
      form: {
        name: '',
        type: '',
        acquisitionDate: '',
        maturityDate: '',
        amount: '',
      },
      message: ''
    };
  },
  computed: {
    t() {
      return messages[this.lang];
    }
  },
  template: `
    <div class="pagina-fadein fade-init">
      <div id="mensagem-sucesso" 
           class="mensagem-sucesso" 
           :class="{ show: message }">
        {{ message }}
      </div>
      <h1>{{ t.registerInvestment }}</h1>
      <form @submit.prevent="save">
        <label>{{ t.name }}:
          <input v-model="form.name" required>
        </label>
        <label>{{ t.type }}:
          <select v-model="form.type" required>
            <option value="" disabled>{{ t.chooseAType }}</option>
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
        <label>{{ t.acquisitionDate }}:
          <input type="date" v-model="form.acquisitionDate" required>
        </label>
        <label>{{ t.maturityDate }}:
          <input type="date" v-model="form.maturityDate" required>
        </label>
        <label>{{ t.amount }}:
          <input type="text"
                 :value="formatCurrency(form.amount)"
                 @input="updateCurrency($event)"
                 required>
        </label>
        <button type="submit">💾 {{ t.saveInvestment }}</button>
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

      // Remove all that is not a digit
      raw = raw.replace(/\D/g, '');

      // Transform in number with cents
      let number = parseFloat(raw) / 100; // Last two digits are cents
      if (isNaN(number)) number = 0;

      this.form.amount = number;

      // Update formatted input
      event.target.value = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(number);
    },
    async save() {
      try {
        const response = await fetch(`${API_BASE_URL}/investments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        await response.json();

        this.message = this.t.investmentSavedSuccessfully;
        setTimeout(() => this.message = "", 3000);

        this.form = { name: '', type: '', acquisitionDate: '', maturityDate: '', amount: '' };
      } catch (err) {
        alert("Error saving: " + err.message);
      }
    }
  }
};
