/**
 * BFBella card marquee (task 0037): opens a marquee card's photo in a larger view.
 *
 * The native marquee script clones the cards to fill the track, so clicks are handled by
 * delegation on this wrapper rather than per card. Previous/next steps through the distinct
 * photos in their original order, ignoring the clones.
 */
class BfbellaCardMarquee extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('.bfbella-card-marquee__dialog');
    this.figure = this.querySelector('[data-bfbella-figure]');
    if (!this.dialog || !this.figure) return;

    this.fullImage = document.createElement('img');
    this.fullImage.className = 'bfbella-card-marquee__full';
    this.figure.appendChild(this.fullImage);

    this.addEventListener('click', this.#handleClick);
    this.dialog.addEventListener('keydown', this.#handleKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
    this.dialog?.removeEventListener('keydown', this.#handleKeydown);
  }

  /** @type {{ src: string, alt: string }[]} */
  #photos = [];
  #index = 0;

  get photos() {
    const seen = new Set();
    const photos = [];

    for (const card of this.querySelectorAll('[data-bfbella-full-src]')) {
      const src = card.getAttribute('data-bfbella-full-src');
      if (!src || seen.has(src)) continue;
      seen.add(src);
      photos.push({ src, alt: card.getAttribute('data-bfbella-full-alt') || '' });
    }

    return photos;
  }

  /** @param {MouseEvent} event */
  #handleClick = (event) => {
    const target = /** @type {HTMLElement} */ (event.target);

    if (target === this.dialog || target === this.figure || target.closest('[data-bfbella-close]')) {
      this.dialog.close();
      return;
    }

    const step = target.closest('[data-bfbella-step]');
    if (step) {
      this.#show(this.#index + Number(step.getAttribute('data-bfbella-step')));
      return;
    }

    const card = target.closest('[data-bfbella-full-src]');
    if (!card) return;

    this.#photos = this.photos;
    this.dialog.toggleAttribute('data-multiple', this.#photos.length > 1);
    this.#show(this.#photos.findIndex((photo) => photo.src === card.getAttribute('data-bfbella-full-src')));
    this.dialog.showModal();
  };

  /** @param {KeyboardEvent} event */
  #handleKeydown = (event) => {
    if (event.key === 'ArrowLeft') this.#show(this.#index - 1);
    if (event.key === 'ArrowRight') this.#show(this.#index + 1);
  };

  /** @param {number} index */
  #show(index) {
    const count = this.#photos.length;
    if (count === 0) return;

    this.#index = ((index % count) + count) % count;
    const photo = this.#photos[this.#index];
    this.fullImage.src = photo.src;
    this.fullImage.alt = photo.alt;
  }
}

if (!customElements.get('bfbella-card-marquee')) {
  customElements.define('bfbella-card-marquee', BfbellaCardMarquee);
}
