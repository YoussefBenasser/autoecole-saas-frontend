import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface QuestionOption {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  category: string;
  questionText: string;
  imageUrl?: string;
  difficulty?: string;
  options: QuestionOption[];
}

interface AnswerCorrection {
  questionId: string;
  questionText: string;
  category: string;
  imageUrl?: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  explanation?: string;
}

interface MockTestResult {
  id?: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  takenAt?: string;
  corrections?: AnswerCorrection[];
}

interface StartMockTestResponse {
  mockTestId: string;
  questions: Question[];
}

type ExamPhase = 'loading' | 'intro' | 'exam' | 'submitting' | 'result' | 'correction' | 'error';

@Component({
  selector: 'app-theoretical-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="exam-container">

      <!-- ===== LOADING PHASE ===== -->
      <div *ngIf="phase === 'loading'" class="loading-state">
        <svg class="spinner" style="color: var(--color-accent)" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>

      <!-- ===== ERROR PHASE ===== -->
      <div *ngIf="phase === 'error'" class="error-card">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Impossible de charger l'examen</h2>
        <p class="error-text">{{ errorMsg }}</p>
        <button (click)="restartExam()" class="retry-btn">🔄 Réessayer</button>
      </div>

      <!-- ===== INTRO PHASE ===== -->
      <div *ngIf="phase === 'intro'" class="intro-card">
        <div class="intro-icon">📝</div>
        <h1 class="intro-title">Examen Théorique (Code)</h1>
        <p class="intro-subtitle">Test de connaissance — {{ questions.length }} questions</p>
        
        <div class="intro-stats">
          <div class="stat-box">
            <div class="stat-value">{{ questions.length }}</div>
            <div class="stat-label">Questions</div>
          </div>
          <div class="stat-box">
            <div class="stat-value success">75%</div>
            <div class="stat-label">Score minimum</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">∞</div>
            <div class="stat-label">Temps libre</div>
          </div>
        </div>

        <button (click)="startExam()" class="start-btn">🚀 Commencer l'examen</button>
      </div>

      <!-- ===== EXAM PHASE ===== -->
      <div *ngIf="phase === 'exam'" class="exam-phase">
        <!-- Header -->
        <div class="exam-header">
          <div>
            <h1 class="exam-title">Examen Théorique</h1>
            <p class="exam-subtitle">Répondez à toutes les questions avant de soumettre</p>
          </div>
          <div class="question-progress">
            <div class="progress-number">{{ currentQuestionIndex + 1 }}<span class="progress-total">/{{ questions.length }}</span></div>
            <div class="progress-answered">{{ answeredCount }} répondu(s)</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar-container">
          <div class="progress-bar-fill" [style.width]="progressPercent + '%'"></div>
        </div>

        <!-- Question Card -->
        <div class="question-card">
          <!-- Category tag -->
          <div class="question-meta">
            <span class="category-tag">{{ currentQuestion.category || 'Général' }}</span>
            <span *ngIf="currentQuestion.difficulty" class="difficulty-tag"
                  [ngClass]="'diff-' + currentQuestion.difficulty">
              {{ getDifficultyLabel(currentQuestion.difficulty || 'medium') }}
            </span>
          </div>

          <!-- Image if present -->
          <div *ngIf="currentQuestion.imageUrl" class="question-image-wrapper">
            <img [src]="currentQuestion.imageUrl" alt="Question image" class="question-image"/>
          </div>

          <!-- Question text -->
          <h3 class="question-text">{{ currentQuestion.questionText }}</h3>

          <!-- Options -->
          <div class="options-container">
            <label *ngFor="let option of currentQuestion.options; let i = index"
                   class="option-label"
                   [class.selected]="answers[currentQuestion.id] === option.id"
                   (click)="selectAnswer(currentQuestion.id, option.id)">
              <!-- Radio circle -->
              <div class="radio-circle" [class.selected]="answers[currentQuestion.id] === option.id"></div>
              <!-- Option letter + text -->
              <div class="option-content">
                <span class="option-letter">{{ ['A','B','C','D'][i] }}</span>
                <span class="option-text">{{ option.optionText }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Navigation -->
        <div class="nav-controls">
          <button (click)="previousQuestion()" [disabled]="currentQuestionIndex === 0" class="nav-btn nav-prev">
            ← Précédent
          </button>

          <!-- Question dot navigation -->
          <div class="question-dots">
            <button *ngFor="let q of questions; let i = index"
                    (click)="goToQuestion(i)"
                    class="dot"
                    [class.current]="i === currentQuestionIndex"
                    [class.answered]="answers[q.id]">
              {{ i + 1 }}
            </button>
          </div>

          <div class="nav-right">
            <button *ngIf="currentQuestionIndex < questions.length - 1"
                    (click)="nextQuestion()"
                    class="nav-btn nav-next">
              Suivant →
            </button>

            <button *ngIf="currentQuestionIndex === questions.length - 1 || answeredCount === questions.length"
                    (click)="submitTest()"
                    [disabled]="answeredCount === 0"
                    class="submit-btn">
              ✅ Soumettre ({{ answeredCount }}/{{ questions.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- ===== SUBMITTING PHASE ===== -->
      <div *ngIf="phase === 'submitting'" class="submitting-state">
        <svg class="spinner" style="color: #4ade80" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="submitting-text">Correction en cours...</p>
      </div>

      <!-- ===== RESULT PHASE ===== -->
      <div *ngIf="phase === 'result' && result" class="result-card">
        <!-- Big emoji result -->
        <div class="result-emoji" [class.passed]="result.passed">
          {{ result.passed ? '🎉' : '📖' }}
        </div>

        <!-- Result title -->
        <h2 class="result-title">
          {{ result.passed ? 'Félicitations !' : 'Continuez vos révisions !' }}
        </h2>
        <p class="result-message">
          {{ result.passed ? "Vous avez réussi l'examen théorique." : "Vous pouvez repasser l'examen à tout moment." }}
        </p>

        <!-- Score display -->
        <div class="score-display">
          <div class="score-item">
            <div class="score-number" [class.passed]="result.passed">{{ result.score }}</div>
            <div class="score-label">Score</div>
          </div>
          <div class="score-divider">/</div>
          <div class="score-item">
            <div class="score-number">{{ result.totalQuestions }}</div>
            <div class="score-label">Total</div>
          </div>
          <div class="score-divider-vertical"></div>
          <div class="score-item">
            <div class="score-number" [class.passed]="result.passed">{{ getScorePercent() }}%</div>
            <div class="score-label">Résultat</div>
          </div>
        </div>

        <!-- Badge -->
        <span class="result-badge" [class.passed]="result.passed">
          {{ result.passed ? '✅ ADMIS (≥ 75%)' : '❌ REFUSÉ (< 75%)' }}
        </span>

        <!-- Actions -->
        <div class="result-actions">
          <button *ngIf="result.corrections && result.corrections.length > 0"
                  (click)="showCorrection()"
                  class="action-btn correction-btn">📋 Voir la correction</button>
          <button (click)="restartExam()" class="action-btn retry-btn">🔄 Repasser l'examen</button>
          <a routerLink="/student/exams" class="action-btn back-btn">← Retour aux examens</a>
        </div>
      </div>

      <!-- ===== CORRECTION PHASE ===== -->
      <div *ngIf="phase === 'correction' && result" class="correction-phase">
        <div class="correction-header">
          <div>
            <h1 class="correction-title">📋 Correction détaillée</h1>
            <p class="correction-subtitle">
              Score : <strong>{{ result.score }}/{{ result.totalQuestions }}</strong> —
              <span [class.text-passed]="result.passed" [class.text-failed]="!result.passed">
                {{ result.passed ? 'ADMIS' : 'REFUSÉ' }}
              </span>
            </p>
          </div>
          <button (click)="phase = 'result'" class="nav-btn">← Retour au résultat</button>
        </div>

        <div class="corrections-list">
          <div *ngFor="let c of result.corrections; let i = index"
               class="correction-card"
               [class.correct]="c.isCorrect"
               [class.incorrect]="!c.isCorrect">
            <div class="correction-number">
              <span class="q-num">Q{{ i + 1 }}</span>
              <span class="q-status" [class.correct]="c.isCorrect" [class.incorrect]="!c.isCorrect">
                {{ c.isCorrect ? '✓' : '✗' }}
              </span>
            </div>

            <div class="correction-body">
              <span class="correction-category">{{ c.category }}</span>

              <div *ngIf="c.imageUrl" class="correction-image-wrapper">
                <img [src]="c.imageUrl" alt="Question image" class="correction-image"/>
              </div>

              <p class="correction-question">{{ c.questionText }}</p>

              <div class="answer-row">
                <div class="answer-block your-answer" [class.wrong]="!c.isCorrect">
                  <div class="answer-label">Votre réponse</div>
                  <div class="answer-value">{{ c.selectedOptionText }}</div>
                </div>
                <div *ngIf="!c.isCorrect" class="answer-block correct-answer">
                  <div class="answer-label">Bonne réponse</div>
                  <div class="answer-value">{{ c.correctOptionText }}</div>
                </div>
              </div>

              <div *ngIf="c.explanation" class="explanation-box">
                <div class="explanation-icon">💡</div>
                <p class="explanation-text">{{ c.explanation }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="correction-footer">
          <button (click)="restartExam()" class="action-btn retry-btn">🔄 Repasser l'examen</button>
          <a routerLink="/student/dashboard" class="action-btn back-btn">← Tableau de bord</a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .exam-container {
      padding: 2rem;
      max-width: 56rem;
      margin: 0 auto;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
    }

    .spinner {
      width: 2.5rem;
      height: 2.5rem;
      margin-bottom: 1rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: var(--color-text-muted);
      font-weight: 500;
      margin: 0;
    }

    /* Error Card */
    .error-card,
    .intro-card {
      padding: 2rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .error-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      border-color: rgba(239, 68, 68, 0.2);
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-title,
    .intro-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }

    .error-title {
      color: #f87171;
    }

    .error-text,
    .intro-subtitle {
      color: var(--color-text-muted);
      margin: 0 0 1.5rem;
      font-size: 0.95rem;
    }

    .retry-btn,
    .start-btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-block;
    }

    .retry-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
    }

    /* Intro Phase */
    .intro-icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .intro-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-box {
      padding: 1.5rem;
      border-radius: 0.875rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .stat-value.success {
      color: #4ade80;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    .start-btn {
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      color: #ffffff;
      padding: 1rem 3rem;
      font-size: 1rem;
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
    }

    .start-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(79, 70, 229, 0.45);
    }

    /* Exam Phase */
    .exam-phase {
      animation: slideUp 0.4s ease-out;
    }

    .exam-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .exam-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.25rem;
    }

    .exam-subtitle {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    .question-progress {
      text-align: right;
    }

    .progress-number {
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
    }

    .progress-total {
      color: var(--color-text-muted);
    }

    .progress-answered {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }

    /* Progress Bar */
    .progress-bar-container {
      width: 100%;
      height: 6px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #4f46e5, #06b6d4);
      box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Question Card */
    .question-card {
      padding: 2rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin-bottom: 2rem;
    }

    .question-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .category-tag {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 0.625rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.1));
      color: #818cf8;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    .difficulty-tag {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .diff-easy {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .diff-medium {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.2);
    }

    .diff-hard {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .question-image-wrapper {
      margin-bottom: 1.5rem;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .question-image {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      display: block;
      background: rgba(0, 0, 0, 0.2);
    }

    .question-text {
      font-size: 1.2rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }

    /* Options */
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .option-label {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.875rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .option-label:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .option-label.selected {
      background: rgba(79, 70, 229, 0.12);
      border-color: rgba(79, 70, 229, 0.5);
    }

    .radio-circle {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      flex-shrink: 0;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .radio-circle.selected {
      border-color: #818cf8;
      background: rgba(79, 70, 229, 0.3);
      box-shadow: inset 0 0 4px rgba(129, 140, 248, 0.5);
    }

    .radio-circle.selected::after {
      content: '';
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: #818cf8;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .option-letter {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
    }

    .option-text {
      color: #ffffff;
      font-size: 0.95rem;
    }

    /* Navigation Controls */
    .nav-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .nav-btn {
      padding: 0.65rem 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .question-dots {
      display: none;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 300px;
    }

    @media (min-width: 768px) {
      .question-dots {
        display: flex;
      }
    }

    .dot {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 0.375rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dot:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .dot.current {
      background: rgba(79, 70, 229, 0.5);
      color: #ffffff;
      border-color: rgba(79, 70, 229, 0.5);
    }

    .dot.answered {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.3);
    }

    .nav-right {
      display: flex;
      gap: 0.75rem;
    }

    .nav-next {
      background: rgba(79, 70, 229, 0.4);
      border-color: rgba(79, 70, 229, 0.4);
    }

    .nav-next:hover {
      background: rgba(79, 70, 229, 0.6);
      border-color: rgba(79, 70, 229, 0.6);
    }

    .submit-btn {
      padding: 0.65rem 1.5rem;
      border: none;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
      white-space: nowrap;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(34, 197, 94, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Submitting State */
    .submitting-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
    }

    .submitting-text {
      color: #ffffff;
      font-weight: 600;
      margin-top: 1rem;
    }

    /* Result Card */
    .result-card {
      padding: 2rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideUp 0.4s ease-out;
    }

    .result-emoji {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      display: block;
    }

    .result-emoji.passed {
      animation: bounce 0.6s ease-out;
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .result-title {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.75rem;
    }

    .result-message {
      color: var(--color-text-muted);
      margin: 0 0 2rem;
      font-size: 0.95rem;
    }

    /* Score Display */
    .score-display {
      display: inline-flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem 2rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.5rem;
    }

    .score-item {
      text-align: center;
    }

    .score-number {
      font-size: 2.25rem;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 0.375rem;
    }

    .score-number.passed {
      color: #4ade80;
    }

    .score-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    .score-divider {
      font-size: 1.5rem;
      color: var(--color-text-muted);
    }

    .score-divider-vertical {
      width: 1px;
      height: 60px;
      background: rgba(255, 255, 255, 0.08);
    }

    /* Result Badge */
    .result-badge {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.25);
      margin-bottom: 1.5rem;
    }

    .result-badge.passed {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.25);
    }

    /* Result Actions */
    .result-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-block;
    }

    .action-btn.retry-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    }

    .action-btn.retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
    }

    .action-btn.correction-btn {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1));
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .action-btn.correction-btn:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.15));
      transform: translateY(-2px);
    }

    .action-btn.back-btn {
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .action-btn.back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.15);
    }

    /* ===== CORRECTION PHASE ===== */
    .correction-phase {
      animation: slideUp 0.4s ease-out;
    }

    .correction-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .correction-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.25rem;
    }

    .correction-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    .text-passed { color: #4ade80; font-weight: 700; }
    .text-failed { color: #f87171; font-weight: 700; }

    .corrections-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .correction-card {
      display: flex;
      gap: 1.25rem;
      padding: 1.5rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6));
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.2s ease;
    }

    .correction-card.correct {
      border-left: 4px solid #22c55e;
    }

    .correction-card.incorrect {
      border-left: 4px solid #ef4444;
    }

    .correction-number {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .q-num {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
    }

    .q-status {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 900;
    }

    .q-status.correct {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    .q-status.incorrect {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .correction-body {
      flex: 1;
      min-width: 0;
    }

    .correction-category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: rgba(79, 70, 229, 0.15);
      color: #818cf8;
      margin-bottom: 0.75rem;
    }

    .correction-image-wrapper {
      margin-bottom: 0.75rem;
      border-radius: 0.5rem;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .correction-image {
      width: 100%;
      max-height: 200px;
      object-fit: contain;
      display: block;
      background: rgba(0, 0, 0, 0.15);
    }

    .correction-question {
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 1rem;
      line-height: 1.5;
    }

    .answer-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .answer-block {
      flex: 1;
      min-width: 180px;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .answer-block.your-answer.wrong {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.2);
    }

    .answer-block.correct-answer {
      background: rgba(34, 197, 94, 0.08);
      border-color: rgba(34, 197, 94, 0.2);
    }

    .answer-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: 0.25rem;
    }

    .answer-value {
      font-size: 0.9rem;
      color: #ffffff;
      font-weight: 500;
    }

    .explanation-box {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      background: rgba(251, 191, 36, 0.06);
      border: 1px solid rgba(251, 191, 36, 0.15);
    }

    .explanation-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .explanation-text {
      font-size: 0.85rem;
      color: #fbbf24;
      margin: 0;
      line-height: 1.5;
    }

    .correction-footer {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .exam-container {
        padding: 1rem;
      }

      .exam-header {
        flex-direction: column;
        gap: 1rem;
      }

      .question-card {
        padding: 1.5rem;
      }

      .score-display {
        flex-direction: column;
        gap: 1rem;
      }

      .score-divider-vertical {
        width: 100%;
        height: 1px;
      }

      .nav-controls {
        flex-direction: column;
      }

      .nav-right {
        width: 100%;
        flex-direction: column;
      }

      .nav-btn,
      .submit-btn {
        width: 100%;
      }

      .correction-card {
        flex-direction: column;
      }

      .correction-number {
        flex-direction: row;
      }
    }
  `]
})
export class TheoreticalExamComponent implements OnInit {
  phase: ExamPhase = 'loading';
  loadingMessage = 'Chargement du profil...';
  errorMsg = '';

  questions: Question[] = [];
  currentQuestionIndex = 0;
  // Map of questionId -> selectedOptionId (UUID-based, not text-based)
  answers: { [questionId: string]: string } = {};

  studentId = '';
  testId = '';
  result: MockTestResult | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.phase = 'loading';
    this.loadingMessage = 'Chargement du profil...';
    this.http.get<any>(`${environment.apiUrl}/profile/me`).subscribe({
      next: (profile) => {
        if (profile.studentId) {
          this.studentId = profile.studentId;
          this.loadQuestions();
        } else {
          this.phase = 'error';
          this.errorMsg = 'Profil élève introuvable. Vérifiez votre compte.';
        }
      },
      error: () => {
        this.phase = 'error';
        this.errorMsg = 'Impossible de récupérer votre profil. Vérifiez votre connexion.';
      }
    });
  }

  private loadQuestions(): void {
    this.loadingMessage = 'Préparation de l\'examen...';
    this.http.post<StartMockTestResponse>(
      `${environment.apiUrl}/student/mock-tests/start?studentId=${this.studentId}`,
      {}
    ).subscribe({
      next: (response) => {
        this.testId = response.mockTestId;
        const hardcodedQuestions: Question[] = [
          {
            id: 'a1111111-1111-1111-1111-111111111111',
            category: 'CIRCULATION',
            questionText: 'Je peux dépasser par la droite :',
            difficulty: 'easy',
            options: [
              { id: 'b1111111-1111-1111-1111-111111111111', optionText: 'Oui' },
              { id: 'b1111112-1111-1111-1111-111111111111', optionText: 'Non' }
            ]
          },
          {
            id: 'a2222222-2222-2222-2222-222222222222',
            category: 'SECURITY',
            questionText: 'Le taux dalcoolémie maximal autorisé pour un conducteur novice est de :',
            difficulty: 'easy',
            options: [
              { id: 'b2222221-2222-2222-2222-222222222222', optionText: '0.2 g/l' },
              { id: 'b2222222-2222-2222-2222-222222222222', optionText: '0.5 g/l' }
            ]
          },
          {
            id: 'a3333333-3333-3333-3333-333333333333',
            category: 'CIRCULATION',
            questionText: 'La distance de sécurité minimale en agglomération dépend :',
            difficulty: 'easy',
            options: [
              { id: 'b3333331-3333-3333-3333-333333333333', optionText: 'De la vitesse' },
              { id: 'b3333332-3333-3333-3333-333333333333', optionText: 'Du marquage' }
            ]
          },
          {
            id: 'a4444444-4444-4444-4444-444444444444',
            category: 'SIGNALISATION',
            questionText: 'Que signifie ce panneau ? (Octogone rouge)',
            difficulty: 'easy',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Zeichen_206_-_Halt%21_Vorfahrt_gew%C3%A4hren%21%2C_StVO_1970.svg/200px-Zeichen_206_-_Halt%21_Vorfahrt_gew%C3%A4hren%21%2C_StVO_1970.svg.png',
            options: [
              { id: 'b4444441-4444-4444-4444-444444444444', optionText: 'Cédez le passage' },
              { id: 'b4444442-4444-4444-4444-444444444444', optionText: 'Arrêt obligatoire (STOP)' }
            ]
          },
          {
            id: 'a5555555-5555-5555-5555-555555555555',
            category: 'SECURITY',
            questionText: "L'utilisation du téléphone au volant est autorisée avec :",
            difficulty: 'easy',
            options: [
              { id: 'b5555551-5555-5555-5555-555555555555', optionText: 'Le système Bluetooth intégré' },
              { id: 'b5555552-5555-5555-5555-555555555555', optionText: 'Des écouteurs' }
            ]
          },
          {
            id: 'a6666666-6666-6666-6666-666666666666',
            category: 'CIRCULATION',
            questionText: 'هل يمكن تجاوز سيارة من اليمين في تونس؟',
            difficulty: 'easy',
            options: [
              { id: 'b6666661-6666-6666-6666-666666666666', optionText: 'نعم' },
              { id: 'b6666662-6666-6666-6666-666666666666', optionText: 'لا' }
            ]
          },
          {
            id: 'a7777777-7777-7777-7777-777777777777',
            category: 'CIRCULATION',
            questionText: 'ما هي السرعة القصوى داخل المناطق العمرانية؟',
            difficulty: 'easy',
            options: [
              { id: 'b7777771-7777-7777-7777-777777777777', optionText: '50 كم/س' },
              { id: 'b7777772-7777-7777-7777-777777777777', optionText: '70 كم/س' }
            ]
          },
          {
            id: 'a8888888-8888-8888-8888-888888888888',
            category: 'SECURITY',
            questionText: 'متى يجب استعمال حزام الأمان؟',
            difficulty: 'easy',
            options: [
              { id: 'b8888881-8888-8888-8888-888888888888', optionText: 'في جميع الأوقات' },
              { id: 'b8888882-8888-8888-8888-888888888888', optionText: 'فقط في الطرق السريعة' }
            ]
          },
          {
            id: 'a9999999-9999-9999-9999-999999999999',
            category: 'SIGNALISATION',
            questionText: 'ما معنى الضوء الأحمر في إشارة المرور؟',
            difficulty: 'easy',
            options: [
              { id: 'b9999991-9999-9999-9999-999999999999', optionText: 'التوقف' },
              { id: 'b9999992-9999-9999-9999-999999999999', optionText: 'المرور بحذر' }
            ]
          },
          {
            id: 'a10101010-1010-1010-1010-101010101010',
            category: 'SECURITY',
            questionText: 'هل يمكن السياقة بدون رخصة؟',
            difficulty: 'easy',
            options: [
              { id: 'b10101011-1010-1010-1010-101010101010', optionText: 'نعم' },
              { id: 'b10101012-1010-1010-1010-101010101010', optionText: 'لا' }
            ]
          },
          {
            id: 'a11111111-1111-1111-1111-111111111112',
            category: 'SIGNALISATION',
            questionText: 'ماذا تعني علامة ممنوع الوقوف؟',
            difficulty: 'easy',
            options: [
              { id: 'b11111112-1111-1111-1111-111111111112', optionText: 'ممنوع الوقوف والتوقف' },
              { id: 'b11111113-1111-1111-1111-111111111112', optionText: 'مسموح الوقوف' }
            ]
          },
          {
            id: 'a12121212-1212-1212-1212-121212121212',
            category: 'SECURITY',
            questionText: 'متى يجب تشغيل الأضواء؟',
            difficulty: 'easy',
            options: [
              { id: 'b12121213-1212-1212-1212-121212121212', optionText: 'في الليل أو عند ضعف الرؤية' },
              { id: 'b12121214-1212-1212-1212-121212121212', optionText: 'فقط في النهار' }
            ]
          },
          {
            id: 'a13131313-1313-1313-1313-131313131313',
            category: 'CIRCULATION',
            questionText: 'ما هي الأولوية عند مفترق الطرق؟',
            difficulty: 'medium',
            options: [
              { id: 'b13131314-1313-1313-1313-131313131313', optionText: 'الأولوية لليمين' },
              { id: 'b13131315-1313-1313-1313-131313131313', optionText: 'الأولوية لليسار' }
            ]
          },
          {
            id: 'a14141414-1414-1414-1414-141414141414',
            category: 'SECURITY',
            questionText: 'هل يجب احترام إشارات المرور دائماً؟',
            difficulty: 'easy',
            options: [
              { id: 'b14141415-1414-1414-1414-141414141414', optionText: 'نعم' },
              { id: 'b14141416-1414-1414-1414-141414141414', optionText: 'لا' }
            ]
          },
          {
            id: 'a15151515-1515-1515-1515-151515151515',
            category: 'CIRCULATION',
            questionText: 'ما هو الحد الأقصى للسرعة في الطرقات السيارة؟',
            difficulty: 'medium',
            options: [
              { id: 'b15151516-1515-1515-1515-151515151515', optionText: '110 كم/س' },
              { id: 'b15151517-1515-1515-1515-151515151515', optionText: '130 كم/س' }
            ]
          }
        ];
        
        // Only add hardcoded questions that are NOT already returned by the backend (avoid duplicates)
        const backendIds = new Set(response.questions.map((q: Question) => q.id));
        const newQuestions = hardcodedQuestions.filter(q => !backendIds.has(q.id));
        this.questions = [...response.questions, ...newQuestions];
        
        if (this.questions.length === 0) {
          this.phase = 'error';
          this.errorMsg = 'Aucune question disponible pour le moment. Contactez votre auto-école.';
          return;
        }
        // Reset state
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.result = null;
        this.phase = 'intro';
      },
      error: (err) => {
        this.phase = 'error';
        this.errorMsg = 'Impossible de charger les questions: ' + (err.error?.message || err.message || 'Erreur serveur');
      }
    });
  }

  startExam(): void {
    this.phase = 'exam';
    this.currentQuestionIndex = 0;
  }

  restartExam(): void {
    this.loadProfile();
  }

  showCorrection(): void {
    this.phase = 'correction';
  }

  // ─── Navigation ────────────────────────────────────────
  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  get progressPercent(): number {
    return this.questions.length ? (this.answeredCount / this.questions.length) * 100 : 0;
  }

  selectAnswer(questionId: string, optionId: string): void {
    this.answers[questionId] = optionId;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) this.currentQuestionIndex--;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) this.currentQuestionIndex++;
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  getScorePercent(): number {
    if (!this.result) return 0;
    return Math.round((this.result.score / this.result.totalQuestions) * 100);
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return difficulty;
    }
  }

  // ─── Submission ─────────────────────────────────────────
  submitTest(): void {
    if (this.answeredCount === 0) return;
    if (!confirm(`Soumettre vos ${this.answeredCount} réponse(s) sur ${this.questions.length} pour correction ?`)) return;

    this.phase = 'submitting';

    // answers is Map<questionId, selectedOptionId> — matching the new backend contract
    const payload = { answers: this.answers };
    this.http.post<MockTestResult>(`${environment.apiUrl}/student/mock-tests/${this.testId}/submit`, payload).subscribe({
      next: (res) => {
        this.result = res;
        this.phase = 'result';
      },
      error: (err) => {
        this.phase = 'error';
        this.errorMsg = 'Erreur lors de la soumission: ' + (err.error?.message || err.message || 'Erreur serveur');
      }
    });
  }
}
