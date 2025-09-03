/**
 * Move Library Panel-Comprehensive move search and browsing interface
 */

import './MoveLibraryPanel.css';

import React, { useState } from 'react';

import { MoveSearch } from '../../components/MoveSearch';
import { MoveIndexEntry } from '../../services/MoveIndexService';
import { useGameStore } from '../../store/GameStore';

export const MoveLibraryPanel: React.FC = () => {
  const { state } = useGameStore();
  const currentCharacter = state.activeCharacterId ? state.characters[state.activeCharacterId] : null;
  const [selectedMove, setSelectedMove] = useState < MoveIndexEntry | null>(null);
  const [showMoveDetails, setShowMoveDetails] = useState(false);

  const handleMoveSelect = (move: MoveIndexEntry) => {
    setSelectedMove(move);
    setShowMoveDetails(true);
  };

  const handleCloseDetails = () => {
    setShowMoveDetails(false);
    setSelectedMove(null);
  };

  const renderMoveDetails = () => {
    if (!selectedMove || !showMoveDetails) return null;

    return (
      <div className="move-details-overlay" onClick={handleCloseDetails}>
        <div className="move-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="move-details-header">
            <h2>{selectedMove.name}</h2>
            <button className="close-button" onClick={handleCloseDetails}>
              ×
            </button>
          </div>

          <div className="move-details-content">
            <div className="move-meta-info">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className={`meta-value category ${selectedMove.category}`}>
                  {selectedMove.category}
                </span>
              </div>

              {selectedMove.class && (
                <div className="meta-item">
                  <span className="meta-label">Class:</span>
                  <span className="meta-value">{selectedMove.class}</span>
                </div>
              )}

              {selectedMove.level && (
                <div className="meta-item">
                  <span className="meta-label">Level:</span>
                  <span className="meta-value">{selectedMove.level}</span>
                </div>
              )}

              {selectedMove.rollStat && (
                <div className="meta-item">
                  <span className="meta-label">Roll Stat:</span>
                  <span className="meta-value stat">{selectedMove.rollStat}</span>
                </div>
              )}

              <div className="meta-item">
                <span className="meta-label">Source:</span>
                <span className="meta-value">{selectedMove.source}</span>
                {selectedMove.page && (
                  <span className="meta-value page">p.{selectedMove.page}</span>
                )}
              </div>
            </div>

            <div className="move-description-full">
              <h3 > Description</h3>
              <p>{selectedMove.description}</p>
            </div>

            {selectedMove.tags.length > 0 && (
              <div className="move-tags-section">
                <h3 > Tags</h3>
                <div className="tags-list">
                  {selectedMove.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedMove.prerequisites && selectedMove.prerequisites.length > 0 && (
              <div className="move-prerequisites">
                <h3 > Prerequisites</h3>
                <ul>
                  {selectedMove.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMove.crossReferences.length > 0 && (
              <div className="move-cross-references">
                <h3 > Related Moves</h3>
                <p > This move references or is related to {selectedMove.crossReferences.length} other moves.</p>
              </div>
            )}

            {currentCharacter && (
              <div className="move-character-context">
                <h3 > Character Context</h3>
                <div className="character-info">
                  <p><strong > Current Level:</strong> {currentCharacter.level}</p>
                  <p><strong > Class:</strong> {currentCharacter.class}</p>
                  <p><strong > Known Moves:</strong> {currentCharacter.knownMoves?.length || 0}</p>
                </div>

                {selectedMove.class && selectedMove.class !== currentCharacter.class && (
                  <div className="multiclass-note">
                    <p>💡 This is a {selectedMove.class} move. You could learn this through multiclassing.</p>
                  </div>
                )}

                {selectedMove.level && selectedMove.level > currentCharacter.level && (
                  <div className="level-note">
                    <p>📈 This move requires level {selectedMove.level}. You're currently level {currentCharacter.level}.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="move-library-panel">
      <div className="panel-header">
        <h1>📚 Move Library</h1>
        <p className="panel-subtitle">
          Search and browse all available moves from the Dungeon World rules
        </p>
      </div>

      <div className="panel-content">
        <MoveSearch
          onMoveSelect={handleMoveSelect}
          showFilters={true}
          showStats={true}
          className="move-search-container"
        />
      </div>

      {renderMoveDetails()}
    </div>
  );
};

export default MoveLibraryPanel;



