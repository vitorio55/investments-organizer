import { API_BASE_URL } from "./config.js";
import { messages } from "./i18n.js";

export const Register = {
  props: ['lang'],
  data() {
    return {
      form: {
        name: '',
        type: '',
        acquisition_date: '',
        maturity_date: '',
        amount: '',
        periodic_payments: []
      },
      newPayment: { type: '', amount: '', payment_date: '' },
      message: ''
    };
  },
  computed: {
    t() {
      return messages[this.lang];
    }
  },
  template: `
    <div class="fadein-page fade-init">
      <div id="success-message" 
           class="success-message" 
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
            <option value="CDB">{{ t.investmentTypes["CDB"] }}</option>
            <option value="CRA">{{ t.investmentTypes["CRA"] }}</option>
            <option value="CRI">{{ t.investmentTypes["CRI"] }}</option>
            <option value="LCA">{{ t.investmentTypes["LCA"] }}</option>
            <option value="LCI">{{ t.investmentTypes["LCI"] }}</option>
            <option value="Debenture">{{ t.investmentTypes["Debenture"] }}</option>
            <option value="FundoDeInvestimento">{{ t.investmentTypes["FundoDeInvestimento"] }}</option>
            <option value="Moeda">{{ t.investmentTypes["Moeda"] }}</option>
            <option value="TesouroDireto">{{ t.investmentTypes["TesouroDireto"] }}</option>
          </select>
        </label>
        <label>{{ t.acquisitionDate }}:
          <input type="date" v-model="form.acquisition_date" required>
        </label>
        <label>{{ t.maturityDate }}:
          <input type="date" v-model="form.maturity_date" required>
        </label>
        <label>{{ t.amount }}:
          <input type="text"
                 :value="formatCurrency(form.amount)"
                 @input="updateCurrency($event)"
                 required>
        </label>

        <h2>{{ t.periodicPayments }}</h2>
        <div v-for="(p, index) in form.periodic_payments" :key="index" class="payment-row">
          <span>{{ t.entryTypes[p.type] }} - {{ formatCurrency(p.amount) }} - {{ p.payment_date }}</span>
          <button type="button" @click="removePayment(index)">❌</button>
        </div>

        <div class="new-payment">
          <select v-model="newPayment.type">
            <option value="" disabled>{{ t.chooseEntryType }}</option>
            <option value="interest">{{ t.entryTypes['interest'] }}</option>
            <option value="amortization">{{ t.entryTypes['amortization'] }}</option>
          </select>
          <input type="text"
                 :placeholder="t.amount"
                 :value="formatCurrency(newPayment.amount)"
                 @input="updatePaymentCurrency($event)">
          <input type="date" v-model="newPayment.payment_date">
          <button type="button" @click="addPayment">➕ {{ t.addPayment }}</button>
        </div>

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
      let raw = event.target.value.replace(/\D/g, '');
      let number = parseFloat(raw) / 100;
      if (isNaN(number)) number = 0;
      this.form.amount = number;
      event.target.value = this.formatCurrency(number);
    },
    updatePaymentCurrency(event) {
      let raw = event.target.value.replace(/\D/g, '');
      let number = parseFloat(raw) / 100;
      if (isNaN(number)) number = 0;
      this.newPayment.amount = number;
      event.target.value = this.formatCurrency(number);
    },
    addPayment() {
      if (!this.newPayment.type || !this.newPayment.amount || !this.newPayment.payment_date) {
        alert(this.t.fillAllFields);
        return;
      }
      this.form.periodic_payments.push({ ...this.newPayment });
      this.newPayment = { type: '', amount: '', payment_date: '' };
    },
    removePayment(index) {
      this.form.periodic_payments.splice(index, 1);
    },
    async save() {
      try {
        const response = await fetch(`${API_BASE_URL}/investments/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form)
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        await response.json();

        this.message = this.t.investmentSavedSuccessfully;
        setTimeout(() => this.message = "", 3000);

        this.form = {
          name: '',
          type: '',
          acquisition_date: '',
          maturity_date: '',
          amount: '',
          periodic_payments: []
        };
      } catch (err) {
        alert("Error saving: " + err.message);
      }
    }
  }
};
