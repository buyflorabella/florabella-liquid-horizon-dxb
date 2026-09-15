import { Component } from '@theme/component';

/**
 * BirdLabs marquee: holds the track at rest for a configurable delay, then
 * plays a single scroll pass, then repeats — replacing the old fixed
 * 15%-of-loop CSS keyframe hold (which couldn't be made merchant-adjustable:
 * keyframe stops are static CSS and can't be templated per section setting,
 * see .claude/CLAUDE.md). Delay and scroll speed are now fully independent —
 * speed still drives animation-duration via CSS, delay is a plain seconds
 * value read off this element's own attribute.
 *
 * @typedef {object} Refs
 * @property {HTMLElement} track - The scrolling track element.
 *
 * @extends Component<Refs>
 */
class BirdlabsMarquee extends Component {
  requiredRefs = ['track'];

  connectedCallback() {
    super.connectedCallback();

    this.#delay = Number(this.getAttribute('delay')) || 0;
    this.refs.track.addEventListener('animationend', this.#handleAnimationEnd);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.#scheduleScroll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#timer);
    this.refs.track.removeEventListener('animationend', this.#handleAnimationEnd);
  }

  /** @type {number} */
  #delay = 0;

  /** @type {number|undefined} */
  #timer;

  #scheduleScroll = () => {
    this.#timer = setTimeout(() => {
      this.refs.track.classList.add('birdlabs-marquee__track--scrolling');
    }, this.#delay * 1000);
  };

  #handleAnimationEnd = () => {
    this.refs.track.classList.remove('birdlabs-marquee__track--scrolling');
    this.#scheduleScroll();
  };
}

if (!customElements.get('birdlabs-marquee')) {
  customElements.define('birdlabs-marquee', BirdlabsMarquee);
}
