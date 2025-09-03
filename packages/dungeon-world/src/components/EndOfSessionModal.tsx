import './EndOfSessionModal.css';

import React, { useState } from 'react';

import { Character } from '../models/Character';
import { EndOfSessionResult,SpecialMovesService } from '../services/SpecialMovesService';

interface EndOfSessionModalProps {
  isOpen: boolean;
  character: Character;
  onConfirm: (result: EndOfSessionResult) => void;
  onCancel: () => void;
}

const EndOfSessionModal: React.FC < EndOfSessionModalProps> = ({
  isOpen,
  character,
  onConfirm,
  onCancel,
}) => {
  const [answers, setAnswers] = useState < boolean[]>([]);
  const [result, setResult] = useState < EndOfSessionResult | null>(null);

  const questions = [
    'Did we learn something new and important about the world?',
    'Did we overcome a notable monster or enemy?',
    'Did we loot a memorable treasure?',
    'Did we learn something new and important about another character?',
    'Did we learn something new and important about our character?',
    'Did we see the effects of our actions?',
    'Did we overcome a notable monster or enemy?',
    'Did we overcome the environment?',
  ];

  const handleAnswerChange = (index: number, value: boolean) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleConfirm = () => {
    const sessionResult = SpecialMovesService.endOfSession(character, answers);
    setResult(sessionResult);
    onConfirm(sessionResult);
  };

  const handleCancel = () => {
    setAnswers([]);
    setResult(null);
    onCancel();
  };

  if (!isOpen) return null;

  const xpGained = answers.filter(a => a).length;
  const totalXP = character.xp + xpGained;

  return (
    <div className="modal-overlay">
      <div className="end-of-session-modal">
        <div className="modal-header">
          <h2>🏁 End of Session</h2>
          <button className="modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {!result ? (
            <>
              <div className="session-intro">
                <h3 > Session Review</h3>
                <p > Answer the following questions to determine XP gained from this session.</p>
                <p className="character-info">
                  <strong>{character.name}</strong > currently has < strong>{character.xp} XP</strong>
                </p>
              </div>

              <div className="questions-section">
                <h3 > Session Questions</h3>
                <div className="questions-list">
                  {questions.map((question, index) => (
                    <div key={index} className="question-item">
                      <label className="question-label">
                        <input
                          type="checkbox"
                          checked={answers[index] || false}
                          onChange={(e) => handleAnswerChange(index, e.target.checked)}
                        />
                        <span className="question-text">{question}</span>
                      </label>
                      <div className="question-xp">+1 XP</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="xp-summary">
                <div className="xp-summary-item">
                  <span className="xp-label">Current XP:</span>
                  <span className="xp-value">{character.xp}</span>
                </div>
                <div className="xp-summary-item">
                  <span className="xp-label">XP Gained:</span>
                  <span className="xp-value gained">+{xpGained}</span>
                </div>
                <div className="xp-summary-item total">
                  <span className="xp-label">Total XP:</span>
                  <span className="xp-value">{totalXP}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="session-result">
              <h3 > Session Complete!</h3>
              <div className="result-summary">
                <div className="result-item">
                  <span className="result-label">XP Gained:</span>
                  <span className="result-value success">+{result.xpGained}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">New Total:</span>
                  <span className="result-value">{result.totalXP}</span>
                </div>
              </div>

              <div className="answered-questions">
                <h4 > Your Answers:</h4>
                <div className="question-results">
                  {result.questions.map((q, index) => (
                    <div key={index} className={`question-result ${q.answered ? 'answered' : 'unanswered'}`}>
                      <span className="question-result-text">{q.question}</span>
                      <span className="question-result-status">
                        {q.answered ? '✓ +1 XP' : '✗ No XP'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!result ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
              >
                End Session
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleCancel}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndOfSessionModal;



