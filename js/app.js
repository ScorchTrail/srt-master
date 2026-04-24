(function () {
  'use strict';

  const BUSINESS_PAGE_URL =
    window.location.protocol === 'file:' ? './html/business.html' : '/html/business.html';

  const UI = {
    init() {
      this.bindTiltEffect();
      this.bindNavigation();
      this.warmBusinessPage();
    },

    bindTiltEffect() {
      const cards = document.querySelectorAll('.card');
      cards.forEach((card) => {
        card.addEventListener('mousemove', this.handleMouseMove);
        card.addEventListener('mouseleave', this.handleMouseLeave);
      });
    },

    handleMouseMove(e) {
      const card = this;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -2;
      const rotateY = ((x - cx) / cx) * 2;

      card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    },

    handleMouseLeave() {
      this.style.transform = '';
      this.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    },

    bindNavigation() {
      document.getElementById('btn-resume')?.addEventListener('click', (e) => {
        e.preventDefault();
      });
    },

    warmBusinessPage() {
      const cta = document.getElementById('btn-business');
      if (!cta) {
        return;
      }

      if (window.location.protocol === 'file:') {
        cta.addEventListener('click', (event) => {
          event.preventDefault();
          window.location.href = BUSINESS_PAGE_URL;
        });
        return;
      }

      let hasPrefetched = false;

      const prefetchBusinessPage = () => {
        if (hasPrefetched) {
          return;
        }

        hasPrefetched = true;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'document';
        link.href = BUSINESS_PAGE_URL;
        document.head.appendChild(link);
      };

      cta.addEventListener('pointerenter', prefetchBusinessPage, { once: true });
      cta.addEventListener('focus', prefetchBusinessPage, { once: true });

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(prefetchBusinessPage, { timeout: 1500 });
        return;
      }

      window.setTimeout(prefetchBusinessPage, 1200);
    }
  };

  document.addEventListener('DOMContentLoaded', () => UI.init());
})();
