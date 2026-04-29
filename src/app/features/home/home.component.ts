import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <header class="navbar">
        <div class="brand">
          <span class="logo"></span>
          <span class="title">AutoÉcole SaaS</span>
        </div>
        <nav class="nav-links">
          <a routerLink="/" fragment="home">Accueil</a>
          <a routerLink="/" fragment="features">Fonctionnalités</a>
          <a routerLink="/" fragment="pricing">Tarification</a>
          <div class="nav-auth">
            <a routerLink="/login" class="btn login">Se connecter</a>
            <a routerLink="/register" class="btn signup">S'inscrire</a>
          </div>
        </nav>
        <button class="mobile-toggle" aria-label="Ouvrir le menu" (click)="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </header>

      <div class="mobile-menu" *ngIf="menuOpen">
        <a routerLink="/" fragment="home" (click)="menuOpen = false">Accueil</a>
        <a routerLink="/" fragment="features" (click)="menuOpen = false">Fonctionnalités</a>
        <a routerLink="/" fragment="pricing" (click)="menuOpen = false">Tarification</a>
        <a routerLink="/login" (click)="menuOpen = false" class="btn login">Se connecter</a>
        <a routerLink="/register" (click)="menuOpen = false" class="btn signup">S'inscrire</a>
      </div>

      <main>
        <!-- HERO with background image slider -->
        <section class="hero" id="home">
          <!-- Background images -->
          <div class="hero-bg-layer" *ngFor="let slide of slides; let i = index"
               [class.active]="i === currentSlide"
               [style.background-image]="'url(' + slide.image + ')'">
          </div>
          <div class="hero-overlay"></div>

          <!-- Arrows -->
          <button class="hero-arrow left" (click)="prevSlide()" aria-label="Précédent">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="hero-arrow right" (click)="nextSlide()" aria-label="Suivant">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <!-- Hero content -->
          <div class="hero-content">
            <h1>Gestion d'auto-école</h1>
            <p class="hero-subtitle">
              Une plateforme complète pour piloter vos élèves, moniteurs, examens et paiements
              en un seul endroit.
            </p>

            <div class="hero-actions">
              <a class="btn primary" routerLink="/login">Commencer</a>
              <a class="btn ghost" href="#features">En savoir plus</a>
            </div>

            <!-- Feature slide text -->
            <div class="feature-slide-text">
              <div class="feature-slide-inner" *ngFor="let slide of slides; let i = index"
                   [class.active]="i === currentSlide">
                <span class="feature-badge">{{ slide.badge }}</span>
                <h3>{{ slide.title }}</h3>
                <p>{{ slide.description }}</p>
              </div>
            </div>

            <!-- Dots -->
            <div class="hero-dots">
              <button *ngFor="let slide of slides; let i = index"
                      class="dot" [class.active]="i === currentSlide"
                      (click)="goToSlide(i)">
              </button>
            </div>
          </div>
        </section>

        <section class="features" id="features">
          <div class="section-header">
            <h2>Tout ce dont vous avez besoin</h2>
            <p>Des outils pensés pour simplifier la gestion quotidienne et améliorer l'expérience des élèves.</p>
          </div>
          <div class="cards">
            <div class="card">
              <div class="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>Gestion des élèves</h3>
              <p>Suivez l'avancement, les leçons planifiées et les notes de chaque élève à partir d'un tableau de bord unique.</p>
            </div>
            <div class="card">
              <div class="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3>Planning des moniteurs</h3>
              <p>Organisez les rendez-vous et les sessions de formation avec un calendrier facile à utiliser.</p>
            </div>
            <div class="card">
              <div class="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Facturation & paiements</h3>
              <p>Automatisez les factures, suivez les paiements et retrouvez l'historique financier en un clic.</p>
            </div>
          </div>
        </section>

        <section class="cta" id="pricing">
          <h2>Prêt à démarrer ?</h2>
          <p>Essayez la plateforme dès aujourd'hui. Aucune carte de crédit requise.</p>
          <a class="btn primary" routerLink="/login">Créer un compte</a>
        </section>
      </main>

      <footer class="footer">
        <span>© {{ currentYear }} AutoÉcole SaaS. Tous droits réservés.</span>
      </footer>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    :host {
      display: block;
      min-height: 100vh;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* ── NAVBAR ── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 2.5rem;
      backdrop-filter: blur(16px);
      background: rgba(0,0,0,0.3);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .brand { display: flex; align-items: center; gap: .65rem; font-weight: 700; }
    .logo {
      width: 40px; height: 40px; border-radius: 14px;
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      box-shadow: 0 8px 18px rgba(0,0,0,0.35);
    }
    .title { font-size: 1.15rem; }
    .nav-links { display: flex; align-items: center; gap: 1.25rem; }
    .nav-links a {
      color: rgba(255,255,255,.8); text-decoration: none;
      padding: .55rem .75rem; border-radius: 12px;
      transition: background .2s, color .2s; font-weight: 600;
    }
    .nav-links a:hover { background: rgba(255,255,255,.12); color: #fff; }
    .nav-auth { display: flex; align-items: center; gap: .75rem; }
    .nav-auth .btn {
      border: none; border-radius: 999px; padding: .65rem 1.25rem;
      font-weight: 700; font-size: .9rem; cursor: pointer;
      text-decoration: none; display: inline-flex; align-items: center;
      transition: transform .18s, box-shadow .18s;
    }
    .nav-auth .btn.login {
      background: rgba(255,255,255,.15); color: rgba(255,255,255,.9);
      border: 1px solid rgba(255,255,255,.25);
    }
    .nav-auth .btn.login:hover { background: rgba(255,255,255,.25); transform: translateY(-1px); }
    .nav-auth .btn.signup {
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      color: #1a1a1a; box-shadow: 0 10px 25px rgba(255,120,110,.25);
    }
    .nav-auth .btn.signup:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(255,120,110,.35); }
    .mobile-toggle {
      display: none; flex-direction: column; gap: 5px;
      border: none; background: transparent; cursor: pointer; padding: .3rem;
    }
    .mobile-toggle span { display: block; width: 24px; height: 2px; background: rgba(255,255,255,.85); border-radius: 2px; }
    .mobile-menu { display: none; }

    /* ── HERO ── */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* Background image layers */
    .hero-bg-layer {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transform: scale(1.08);
      transition: opacity 1s ease, transform 7s ease-out;
      z-index: 0;
    }
    .hero-bg-layer.active {
      opacity: 1;
      transform: scale(1);
      z-index: 1;
    }

    /* Dark overlay on top of images */
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        180deg,
        rgba(10,12,30,0.65) 0%,
        rgba(10,12,30,0.5) 40%,
        rgba(10,12,30,0.75) 100%
      );
      z-index: 2;
    }

    /* Hero content on top */
    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 780px;
      padding: 6rem 2rem 3rem;
    }

    .hero h1 {
      font-size: clamp(2.5rem, 5vw, 3.8rem);
      margin: 0 0 1.2rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1.1;
      text-shadow: 0 4px 30px rgba(0,0,0,0.4);
    }

    .hero-subtitle {
      font-size: 1.1rem;
      line-height: 1.65;
      opacity: .9;
      margin: 0 auto 2.5rem;
      max-width: 560px;
      text-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }

    .hero-actions {
      display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;
      margin-bottom: 3rem;
    }

    /* Feature slide text area */
    .feature-slide-text {
      position: relative;
      min-height: 140px;
      margin-bottom: 1.5rem;
    }

    .feature-slide-inner {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: none;
    }

    .feature-slide-inner.active {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .feature-badge {
      display: inline-block;
      padding: .3rem .9rem;
      border-radius: 999px;
      background: rgba(255,122,108,0.18);
      border: 1px solid rgba(255,122,108,0.35);
      color: #ffb86c;
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      margin-bottom: .8rem;
    }

    .feature-slide-inner h3 {
      font-size: 1.45rem;
      margin: 0 0 .6rem;
      font-weight: 700;
    }

    .feature-slide-inner p {
      margin: 0;
      font-size: .92rem;
      line-height: 1.65;
      opacity: .8;
      max-width: 500px;
    }

    /* Arrows */
    .hero-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 20;
      width: 52px; height: 52px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      color: #fff;
      cursor: pointer;
      display: grid; place-items: center;
      transition: all .25s ease;
    }
    .hero-arrow:hover {
      background: rgba(255,122,108,0.3);
      border-color: rgba(255,122,108,0.6);
      box-shadow: 0 8px 30px rgba(255,122,108,0.25);
      transform: translateY(-50%) scale(1.1);
    }
    .hero-arrow.left { left: 2rem; }
    .hero-arrow.right { right: 2rem; }

    /* Dots */
    .hero-dots {
      display: flex; justify-content: center; gap: .65rem;
    }
    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.4);
      background: transparent; cursor: pointer;
      transition: all .3s ease; padding: 0;
    }
    .dot.active {
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      border-color: #ff7a6c;
      box-shadow: 0 0 14px rgba(255,122,108,0.5);
      transform: scale(1.3);
    }

    /* ── BUTTONS ── */
    .btn {
      border: none; border-radius: 999px; padding: .95rem 1.8rem;
      font-weight: 700; font-size: 1rem; cursor: pointer;
      transition: transform .18s, box-shadow .18s;
      text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    }
    .btn.primary {
      background: linear-gradient(135deg, #ff7a6c, #ffb86c);
      color: #1a1a1a;
      box-shadow: 0 18px 38px rgba(255,120,110,.32);
    }
    .btn.ghost {
      background: rgba(255,255,255,.15);
      color: rgba(255,255,255,.9);
      box-shadow: 0 18px 38px rgba(0,0,0,.35);
      border: 1px solid rgba(255,255,255,.2);
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 20px 45px rgba(0,0,0,.35); }

    /* ── FEATURES SECTION ── */
    .features {
      padding: 5rem 2rem 4rem;
      background: linear-gradient(160deg, #0f1628, #1a1035 40%, #0d1a2d);
    }
    .section-header { max-width: 720px; margin: 0 auto 3rem; text-align: center; }
    .section-header h2 { font-size: 2.1rem; margin: 0 0 .75rem; }
    .section-header p { margin: 0; opacity: .85; line-height: 1.7; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      max-width: 960px;
      margin: 0 auto;
    }
    .card {
      padding: 2rem;
      border-radius: 20px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(14px);
      box-shadow: 0 18px 40px rgba(0,0,0,0.25);
      transition: transform .3s ease, box-shadow .3s ease;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 50px rgba(0,0,0,0.35);
    }
    .card-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: linear-gradient(135deg, rgba(255,122,108,0.15), rgba(255,184,108,0.15));
      border: 1px solid rgba(255,122,108,0.2);
      display: grid; place-items: center;
      margin-bottom: 1.25rem;
      color: #ffb86c;
    }
    .card h3 { margin: 0 0 .75rem; font-size: 1.2rem; }
    .card p { margin: 0; opacity: .8; line-height: 1.6; font-size: .92rem; }

    /* ── CTA ── */
    .cta {
      padding: 4rem 2rem 3.5rem; text-align: center;
      background: rgba(0,0,0,.4);
      border-top: 1px solid rgba(255,255,255,.08);
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .cta h2 { font-size: 2rem; margin: 0 0 .75rem; }
    .cta p { margin: 0 0 1.75rem; opacity: .85; line-height: 1.6; }

    /* ── FOOTER ── */
    .footer {
      padding: 2.5rem 2rem; text-align: center; opacity: .75; font-size: .9rem;
      background: linear-gradient(160deg, #0f1628, #0d1a2d);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 820px) {
      .nav-links { display: none; }
      .mobile-toggle { display: flex; }
      .mobile-menu {
        display: flex; flex-direction: column; gap: .5rem;
        padding: 1rem 2rem 1.5rem;
        background: rgba(0,0,0,.65);
        border-bottom: 1px solid rgba(255,255,255,.12);
        position: fixed; top: 65px; left: 0; right: 0; z-index: 40;
      }
      .mobile-menu a {
        color: rgba(255,255,255,.85); text-decoration: none;
        padding: .6rem .75rem; border-radius: 10px; font-weight: 600;
      }
      .mobile-menu .btn.login {
        background: rgba(255,255,255,.15); color: rgba(255,255,255,.9);
        border: 1px solid rgba(255,255,255,.25); padding: .65rem 1.25rem; font-size: .9rem;
        text-align: center; justify-content: center;
      }
      .mobile-menu .btn.signup {
        background: linear-gradient(135deg, #ff7a6c, #ffb86c);
        color: #1a1a1a; padding: .65rem 1.25rem; font-size: .9rem;
        text-align: center; justify-content: center;
      }
      .hero-arrow { width: 40px; height: 40px; }
      .hero-arrow.left { left: 1rem; }
      .hero-arrow.right { right: 1rem; }
      .hero-arrow svg { width: 22px; height: 22px; }
    }

    @media (max-width: 480px) {
      .navbar { padding: 1rem 1.25rem; }
      .hero-content { padding: 5rem 1.25rem 2.5rem; }
      .hero-arrow { width: 36px; height: 36px; }
      .hero-arrow.left { left: .5rem; }
      .hero-arrow.right { right: .5rem; }
      .hero-arrow svg { width: 18px; height: 18px; }
      .feature-slide-inner h3 { font-size: 1.2rem; }
      .feature-slide-inner p { font-size: .85rem; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  menuOpen = false;
  currentYear = new Date().getFullYear();
  currentSlide = 0;
  private autoPlayInterval: any;

  slides = [
    {
      title: 'Gestion des élèves',
      badge: 'Élèves',
      description: 'Suivez l\'avancement de chaque élève en temps réel : leçons planifiées, résultats d\'examens, heures de conduite et notes personnalisées depuis un tableau de bord unique.',
      image: 'images/students.jpg'
    },
    {
      title: 'Planning des moniteurs',
      badge: 'Moniteurs',
      description: 'Organisez les emplois du temps de vos moniteurs, attribuez des créneaux de formation et optimisez la répartition des séances pour une efficacité maximale.',
      image: 'images/monitors.jpg'
    },
    {
      title: 'Facturation & paiements',
      badge: 'Finances',
      description: 'Automatisez la génération de factures, suivez les paiements en temps réel et retrouvez l\'historique financier complet de votre auto-école en un clic.',
      image: 'images/pay.jpg'
    }
  ];

  ngOnInit() {
    this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
  }

  ngOnDestroy() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.restartAutoPlay();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.restartAutoPlay();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.restartAutoPlay();
  }

  private restartAutoPlay() {
    if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
    this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
  }
}
