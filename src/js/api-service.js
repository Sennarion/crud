import axios from 'axios';

export default class ApiService {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '31430528-1a800584242396ee95291d1e0';

  constructor() {
    this.page = 1;
    this.searchQuery = '';
    this.itemsPerPage = 40;
  }

  async getPhotos() {
    const params = new URLSearchParams({
      key: this.#API_KEY,
      page: this.page,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: this.itemsPerPage,
    });

    const response = await axios.get(`${this.#BASE_URL}?${params}`);
    return response.data;
  }

  getPage() {
    return this.page;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  getQuery() {
    return this.searchQuery;
  }

  changeQuery(query) {
    this.searchQuery = query;
  }

  getItemsPerPage() {
    return this.itemsPerPage;
  }
}
