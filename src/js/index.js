import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import ApiService from './api-service';
import createListTemplate from './templates/listTemplate.hbs';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formRef: document.querySelector('.search-form'),
  galleryRef: document.querySelector('.gallery-list'),
  observerRef: document.querySelector('.observer'),
};

refs.formRef.addEventListener('submit', onFormSubmit);

const apiService = new ApiService();
const lightbox = new SimpleLightbox('.gallery-link');
const observer = new IntersectionObserver(onScrollToEnd, {
  root: null,
  rootMargin: '50px',
  threshold: 1.0,
});

async function onFormSubmit(e) {
  e.preventDefault();
  observer.unobserve(refs.observerRef);

  const searchQuery = e.target.elements.searchQuery.value;

  if (searchQuery === apiService.getQuery() || searchQuery === '') {
    return;
  }

  clearGalleryMarkup();
  apiService.resetPage();
  apiService.changeQuery(searchQuery);

  try {
    const { hits, totalHits } = await apiService.getPhotos();

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notify.info(`Hooray! We found ${totalHits} images.`);

    const photosMarkup = createListTemplate(hits);
    appendPhotosMarkup(photosMarkup);

    if (totalHits > apiService.getItemsPerPage()) {
      observer.observe(refs.observerRef);
    }
  } catch (error) {
    Notify.failure(`Trouble! Error description: ${error.message}`);
  }

  lightbox.refresh();
  e.target.reset();
}

async function onScrollToEnd([entry]) {
  if (entry.isIntersecting) {
    apiService.incrementPage();

    try {
      const { hits } = await apiService.getPhotos();

      if (hits.length === 0) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        observer.unobserve(refs.observerRef);
        return;
      }

      const photosMarkup = createListTemplate(hits);
      appendPhotosMarkup(photosMarkup);
    } catch (error) {
      Notify.failure(`Trouble! Error description: ${error.message}`);
    }

    lightbox.refresh();
  }
}

function appendPhotosMarkup(photos) {
  refs.galleryRef.insertAdjacentHTML('beforeend', photos);
}

function clearGalleryMarkup() {
  refs.galleryRef.innerHTML = '';
}
