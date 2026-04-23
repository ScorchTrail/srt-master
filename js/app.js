(function () {
  'use strict';

  const UI = {
    init() {
      this.bindTiltEffect();
      this.bindNavigation();
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
      const navigate = (route) => console.log(`Navigating to route: /${route}`);

      document.getElementById('btn-business')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('business');
      });

      document.getElementById('btn-resume')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('resume');
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => UI.init());
})();
