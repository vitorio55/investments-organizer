import { Register } from './register_vue.js';
import { Search } from './search_vue.js';
import { Delete } from './delete_vue.js';
import { Listing } from './listing_vue.js';
import { Statistics } from "./statistics_vue.js";
import { messages } from "./i18n.js";

const { createApp } = Vue;

const app = createApp({
  data() {
    return {
        currentLang: 'pt',
        page: 'register'
    };
  },
  computed: {
    pageComponent() {
      if (this.page === 'register') return Register;
      if (this.page === 'search') return Search;
      if (this.page === 'delete') return Delete;
      if (this.page === 'listing') return Listing;
      if (this.page === 'statistics') return Statistics;
    },
    t() {
      return messages[this.currentLang];
    }
  }
});

app.mount('#app');
