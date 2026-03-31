import { Component } from '@angular/core';
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
          <span></span>
          <span></span>
          <span></span>
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
        <section class="hero" id="home">
          <div class="hero-content">
            <h1>Gestion d'auto-école</h1>
            <p>
              Une plateforme complète pour piloter vos élèves, moniteurs, examens et paiements
              en un seul endroit.
            </p>

            <div class="hero-actions">
              <a class="btn primary" routerLink="/login">Commencer</a>
              <a class="btn ghost" href="#features">En savoir plus</a>
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
              <h3>Gestion des élèves</h3>
              <p>Suivez l'avancement, les leçons planifiées et les notes de chaque élève à partir d'un tableau de bord unique.</p>
            </div>
            <div class="card">
              <h3>Planning des moniteurs</h3>
              <p>Organisez les rendez-vous et les sessions de formation avec un calendrier facile à utiliser.</p>
            </div>
            <div class="card">
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
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        color: #ffffff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, rgba(18, 27, 50, 0.9), rgba(10, 12, 25, 0.9)),
          url('https://templatemo.com/templates/templatemo_583_festava_live/assets/images/slide-01.jpg') center/cover no-repeat;
      }

      .navbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 2rem;
        backdrop-filter: blur(14px);
        background: rgba(0, 0, 0, 0.35);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .logo {
        width: 40px;
        height: 40px;
        border-radius: 14px;
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
      }

      .title {
        font-size: 1.15rem;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .nav-links a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        padding: 0.55rem 0.75rem;
        border-radius: 12px;
        transition: background 0.2s, color 0.2s;
        font-weight: 600;
      }

      .nav-links a:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      .nav-links a.btn.login {
        background: rgba(255, 255, 255, 0.18);
      }

      .nav-links a.btn.login:hover {
        background: rgba(255, 255, 255, 0.28);
      }

      .nav-auth {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .nav-auth .btn {
        border: none;
        border-radius: 999px;
        padding: 0.65rem 1.25rem;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .nav-auth .btn.login {
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.25);
      }

      .nav-auth .btn.login:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-1px);
      }

      .nav-auth .btn.signup {
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        color: #1a1a1a;
        box-shadow: 0 10px 25px rgba(255, 120, 110, 0.25);
      }

      .nav-auth .btn.signup:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(255, 120, 110, 0.35);
      }

      .mobile-toggle {
        display: none;
        flex-direction: column;
        gap: 5px;
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 0.3rem;
      }

      .mobile-toggle span {
        display: block;
        width: 24px;
        height: 2px;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 2px;
      }

      .mobile-menu {
        display: none;
      }

      main {
        padding: 0 2rem 4rem;
      }

      .hero {
        padding: 8rem 0 6rem;
        display: grid;
        place-items: center;
        text-align: center;
      }

      .hero-content {
        max-width: 720px;
      }

      .hero h1 {
        font-size: clamp(2.5rem, 4vw, 3.5rem);
        margin: 0 0 1rem;
        letter-spacing: 0.02em;
        line-height: 1.1;
      }

      .hero p {
        font-size: 1.05rem;
        line-height: 1.6;
        opacity: 0.85;
        margin: 0 auto 2.25rem;
        max-width: 560px;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
      }

      .btn {
        border: none;
        border-radius: 999px;
        padding: 0.95rem 1.8rem;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .btn.primary {
        background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
        color: #1a1a1a;
        box-shadow: 0 18px 38px rgba(255, 120, 110, 0.32);
      }

      .btn.ghost {
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 18px 38px rgba(0, 0, 0, 0.35);
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
      }

      .features {
        padding: 4rem 0 3rem;
      }

      .section-header {
        max-width: 720px;
        margin: 0 auto 2.5rem;
        text-align: center;
      }

      .section-header h2 {
        font-size: 2.1rem;
        margin: 0 0 0.75rem;
      }

      .section-header p {
        margin: 0;
        opacity: 0.85;
        line-height: 1.7;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
      }

      .card {
        padding: 1.75rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.11);
        border: 1px solid rgba(255, 255, 255, 0.14);
        backdrop-filter: blur(14px);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
      }

      .card h3 {
        margin: 0 0 0.75rem;
        font-size: 1.2rem;
      }

      .card p {
        margin: 0;
        opacity: 0.85;
        line-height: 1.6;
      }

      .cta {
        padding: 4rem 0 3.5rem;
        text-align: center;
        background: rgba(0, 0, 0, 0.25);
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      }

      .cta h2 {
        font-size: 2rem;
        margin: 0 0 0.75rem;
      }

      .cta p {
        margin: 0 0 1.75rem;
        opacity: 0.85;
        line-height: 1.6;
      }

      .footer {
        padding: 2.5rem 2rem;
        text-align: center;
        opacity: 0.75;
        font-size: 0.9rem;
      }

      @media (max-width: 820px) {
        .nav-links {
          display: none;
        }

        .mobile-toggle {
          display: flex;
        }

        .mobile-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 2rem 1.5rem;
          background: rgba(0, 0, 0, 0.55);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mobile-menu .btn {
          width: 100%;
          justify-content: center;
        }

        .mobile-menu .btn.login {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
        }

        .mobile-menu .btn.signup {
          background: linear-gradient(135deg, #ff7a6c 0%, #ffb86c 100%);
          color: #1a1a1a;
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
        }

        .hero {
          padding: 6.5rem 0 5.5rem;
        }
      }
    `
  ]
})
export class HomeComponent {
  menuOpen = false;
  currentYear = new Date().getFullYear();
}
