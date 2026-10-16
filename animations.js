(() => {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const menu = document.querySelector('#site-menu');
	const menuTrigger = document.querySelector('[data-menu-open]');
	const menuBackdrop = document.querySelector('.site-menu-backdrop');

	if (menu && menuTrigger && menuBackdrop) {
		let closeTimer;
		const pageRegions = document.querySelectorAll('body > header, body > main, body > footer');

		const closeMenu = () => {
			if (menu.hidden) return;
			menu.classList.remove('is-open');
			menuBackdrop.classList.remove('is-open');
			menuTrigger.setAttribute('aria-expanded', 'false');
			document.body.classList.remove('menu-open');
			pageRegions.forEach((region) => { region.inert = false; });
			menuTrigger.focus();
			window.clearTimeout(closeTimer);
			closeTimer = window.setTimeout(() => {
				menu.hidden = true;
				menuBackdrop.hidden = true;
			}, prefersReducedMotion ? 0 : 280);
		};

		menuTrigger.addEventListener('click', () => {
			window.clearTimeout(closeTimer);
			menu.hidden = false;
			menuBackdrop.hidden = false;
			document.body.classList.add('menu-open');
			pageRegions.forEach((region) => { region.inert = true; });
			menuTrigger.setAttribute('aria-expanded', 'true');
			window.requestAnimationFrame(() => {
				menu.classList.add('is-open');
				menuBackdrop.classList.add('is-open');
				menu.querySelector('.site-menu-close').focus();
			});
		});

		menu.querySelectorAll('[data-menu-close]').forEach((button) => button.addEventListener('click', closeMenu));
		menuBackdrop.addEventListener('click', closeMenu);
		menu.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeMenu();
				return;
			}
			if (event.key !== 'Tab') return;

			const focusableElements = [...menu.querySelectorAll('button:not([disabled]), a[href]')];
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];
			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		});
	}

	const feedbackForm = document.querySelector('[data-feedback-form]');
	const feedbackSuccess = document.querySelector('[data-feedback-success]');
	if (feedbackForm && feedbackSuccess) {
		const closeButton = feedbackSuccess.querySelector('[data-feedback-close]');
		closeButton.addEventListener('click', () => feedbackSuccess.close());

		const showFeedbackSuccess = () => {
				feedbackForm.reset();
				feedbackSuccess.showModal();
		};

		feedbackForm.addEventListener('submit', (event) => {
				event.preventDefault();
				showFeedbackSuccess();
		});
	}

	const characterCarousel = document.querySelector('[data-character-carousel]');
	if (characterCarousel) {
		const characterImage = characterCarousel.querySelector('.character-image-frame img');
		const characterName = characterCarousel.querySelector('.character-name');
		const characterPosition = characterCarousel.querySelector('[data-character-position]');
		const previousButton = characterCarousel.querySelector('[data-character-previous]');
		const nextButton = characterCarousel.querySelector('[data-character-next]');
		const characters = [
			{
				name: 'Doctor Jacinto',
				image: 'images/doctor-jacinto.png',
				alt: 'Doctor Jacinto, personaje de Clínica Maravillosa'
			},
			{
				name: 'Secretaria',
				image: 'images/secretaria.png',
				alt: 'Secretaria de Clínica Maravillosa'
			},
			{
				name: 'Denis',
				image: 'images/denis.png',
				alt: 'Denis, personaje de Clínica Maravillosa'
			},
			{
				name: 'Dalia',
				image: 'images/dalia.png',
				alt: 'Dalia, personaje de Clínica Maravillosa'
			},
			{
				name: 'Maite',
				image: 'images/maite.png',
				alt: 'Maite, personaje de Clínica Maravillosa'
			},
			{
				name: 'Fer',
				image: 'images/fer.png',
				alt: 'Fer, personaje de Clínica Maravillosa'
			}
		];
		let activeCharacter = 0;
		let isTransitioning = false;
		let carouselTimer;

		const showCharacter = async (offset) => {
			if (isTransitioning) return;
			isTransitioning = true;

			const nextIndex = (activeCharacter + offset + characters.length) % characters.length;
			const character = characters[nextIndex];
			const nextImage = new Image();
			nextImage.src = character.image;

			try {
				await nextImage.decode();
				if (prefersReducedMotion || !Element.prototype.animate) {
					characterImage.src = character.image;
					characterImage.alt = character.alt;
					characterImage.classList.toggle('is-maite', character.name === 'Maite');
					characterImage.classList.toggle('is-fer', character.name === 'Fer');
					characterName.textContent = character.name;
					activeCharacter = nextIndex;
					characterPosition.textContent = `${activeCharacter + 1} / ${characters.length}`;
					return;
				}

				const distance = offset > 0 ? -24 : 24;
				const exitAnimation = characterImage.animate([
					{ opacity: 1, transform: 'translateX(0)' },
					{ opacity: 0, transform: `translateX(${distance}px)` }
				], { duration: 220, easing: 'ease-in', fill: 'forwards' });
				await exitAnimation.finished;
				exitAnimation.cancel();

				characterImage.src = character.image;
				characterImage.alt = character.alt;
				characterImage.classList.toggle('is-maite', character.name === 'Maite');
				characterImage.classList.toggle('is-fer', character.name === 'Fer');
				characterName.textContent = character.name;
				activeCharacter = nextIndex;
				characterPosition.textContent = `${activeCharacter + 1} / ${characters.length}`;

				const enterAnimation = characterImage.animate([
					{ opacity: 0, transform: `translateX(${-distance}px)` },
					{ opacity: 1, transform: 'translateX(0)' }
				], { duration: 260, easing: 'ease-out' });
				await enterAnimation.finished;
				enterAnimation.cancel();
			} catch (error) {
				console.error(`No se pudo mostrar el personaje "${character.name}".`, error);
			} finally {
				isTransitioning = false;
			}
		};

		const stopCarousel = () => {
			window.clearInterval(carouselTimer);
		};
		const startCarousel = () => {
			stopCarousel();
			if (!document.hidden && !characterCarousel.matches(':hover')) {
				carouselTimer = window.setInterval(() => showCharacter(1), 4500);
			}
		};

		previousButton.addEventListener('click', () => showCharacter(-1));
		nextButton.addEventListener('click', () => showCharacter(1));
		characterCarousel.addEventListener('mouseenter', stopCarousel);
		characterCarousel.addEventListener('mouseleave', startCarousel);
		document.addEventListener('visibilitychange', startCarousel);
		startCarousel();
	}

	if (prefersReducedMotion || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

	const revealTargets = document.querySelectorAll([
		'.site-header',
		'main > section',
		'footer',
		'.hero-copy',
		'.hero-art',
		'.search',
		'.manifesto-grid > *',
		'.story-copy',
		'.team-photo-slot',
		'.product-featured-heading > *',
		'.product-grid > article',
		'.product-cta',
		'.help > *',
		'.inner-hero > *',
		'.about-block > *',
		'.identity-pillars > article',
		'.values-grid > article',
		'.about-quote > *',
		'.game-hero > *',
		'.game-web-image',
		'.game-web-copy',
		'.game-intro-grid > *',
		'.game-features > *',
		'.feature-grid > article',
		'.how-to > *',
		'.how-to ol > li',
		'.support-grid > article',
		'.faq-row',
		'.coming-soon-card > *'
	].join(','));
	const delayByParent = new Map();

	const observer = new IntersectionObserver((entries, currentObserver) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;

			const target = entry.target;
			const parent = target.parentElement;
			const index = delayByParent.get(parent) || 0;
			delayByParent.set(parent, index + 1);
			target.classList.add('is-visible');

			const animation = target.animate([
				{ opacity: 0, transform: 'translate3d(0, 24px, 0)' },
				{ opacity: 1, transform: 'translate3d(0, 0, 0)' }
			], {
				duration: 700,
				delay: Math.min(index, 5) * 85,
				easing: 'cubic-bezier(.2,.7,.2,1)',
				fill: 'both'
			});
			animation.onfinish = () => animation.cancel();
			currentObserver.unobserve(target);
		});
	}, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

	revealTargets.forEach((target) => observer.observe(target));
})();
