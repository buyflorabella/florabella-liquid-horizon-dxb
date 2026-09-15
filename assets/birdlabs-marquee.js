/**
 * BirdLabs marquee: holds the track at rest for a configurable delay, then
 * plays a single scroll pass, then repeats — replacing the old fixed
 * 15%-of-loop CSS keyframe hold (which couldn't be made merchant-adjustable:
 * keyframe stops are static CSS and can't be templated per section setting,
 * see .claude/CLAUDE.md). Delay and scroll speed are now fully independent.
 *
 * Only active when the `delay` attribute is present (i.e. marquee mode is
 * on) — sections/birdlabs-announcement-bar.liquid always wraps its markup in
 * this element regardless of mode, because Shopify only allows one
 * {% content_for 'blocks' %} call per section file, so there's no separate
 * branch to opt out of rendering this tag in slideshow mode. Wrapping is
 * unconditional; the behavior is not.
 *
 * Uses a plain querySelector rather than this theme's `ref` system: the
 * track sits inside a nested <announcement-bar-component>, itself a
 * Component, and ref resolution against "the nearest ancestor Component"
 * would be ambiguous with two Components nested and a ref in between.
 */
class BirdlabsMarquee extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('delay')) return;

    this.track = this.querySelector('.birdlabs-announcement-bar__slides');
    if (!this.track) return;

    this.delay = Number(this.getAttribute('delay')) || 0;
    this.track.classList.add('birdlabs-announcement-bar__slides--marquee');
    this.track.addEventListener('animationend', this.#handleAnimationEnd);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.#scheduleScroll();
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.track?.removeEventListener('animationend', this.#handleAnimationEnd);
  }

  /** @type {number|undefined} */
  #timer;

  #scheduleScroll = () => {
    this.#timer = setTimeout(() => {
      this.track.classList.add('birdlabs-announcement-bar__slides--scrolling');
    }, this.delay * 1000);
  };

  #handleAnimationEnd = () => {
    this.track.classList.remove('birdlabs-announcement-bar__slides--scrolling');
    this.#scheduleScroll();
  };
}

if (!customElements.get('birdlabs-marquee')) {
  customElements.define('birdlabs-marquee', BirdlabsMarquee);
}
