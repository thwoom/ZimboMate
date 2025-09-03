/**
 * BondTracker Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BondTracker } from '../../src/components/BondTracker';
import { bondService } from '../../src/services/BondService';
import { BondStatus, BondResolutionType } from '../../src/types/Bond';

// Mock the GameStore
vi.mock('../../src/store/GameStore', () => ({
  useGameStore: () => ({
    characters: [
      { id: 'char1', name: 'Aragorn', class: 'Fighter', alignment: 'Good' },
      { id: 'char2', name: 'Gandalf', class: 'Wizard', alignment: 'Good' },
      { id: 'char3', name: 'Legolas', class: 'Ranger', alignment: 'Neutral' }
    ],
    currentCharacter: { id: 'char1', name: 'Aragorn', class: 'Fighter', alignment: 'Good' }
  })
}));

// Mock the BondService
vi.mock('../../src/services/BondService', () => ({
  bondService: {
    getBondsForCharacter: vi.fn(),
    getBondsTargetingCharacter: vi.fn(),
    getBondStats: vi.fn(),
    createBond: vi.fn(),
    resolveBond: vi.fn(),
    deleteBond: vi.fn(),
    getBondTemplates: vi.fn()
  }
}));

describe('BondTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (bondService.getBondsForCharacter as any).mockReturnValue([]);
    (bondService.getBondsTargetingCharacter as any).mockReturnValue([]);
    (bondService.getBondStats as any).mockReturnValue({
      totalBonds: 0,
      activeBonds: 0,
      resolvedBonds: 0,
      totalXPEarned: 0,
      averageResolutionTime: 0
    });
    (bondService.getBondTemplates as any).mockReturnValue([
      {
        id: 'mentor-student',
        name: 'Mentor & Student',
        description: 'I am teaching {target} the ways of my class',
        characterClasses: ['Fighter'],
        targetClasses: ['Fighter', 'Wizard'],
        tags: ['mentorship'],
        xpTrigger: 'When {target} successfully uses a move I taught them'
      }
    ]);
  });

  describe('Rendering', () => {
    it('renders the bond tracker with header', () => {
      render(<BondTracker />);
      
      expect(screen.getByText('Bond Tracker')).toBeInTheDocument();
      expect(screen.getByText('Create Bond')).toBeInTheDocument();
    });

    it('shows bond statistics', () => {
      (bondService.getBondStats as any).mockReturnValue({
        totalBonds: 2,
        activeBonds: 1,
        resolvedBonds: 1,
        totalXPEarned: 1,
        averageResolutionTime: 1000
      });

      render(<BondTracker />);
      
      expect(screen.getByText('Active Bonds:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Resolved:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows empty state when no bonds exist', () => {
      render(<BondTracker />);
      
      expect(screen.getByText('No bonds found. Create your first bond to start earning XP!')).toBeInTheDocument();
    });
  });

  describe('Bond Display', () => {
    it('displays active bonds correctly', () => {
      const mockBonds = [
        {
          id: 'bond1',
          characterId: 'char1',
          targetCharacterId: 'char2',
          description: 'I am teaching Gandalf the ways of combat',
          status: BondStatus.ACTIVE,
          createdAt: new Date(),
          resolvedAt: null,
          xpAwarded: false,
          notes: '',
          tags: ['mentorship']
        }
      ];

      (bondService.getBondsForCharacter as any).mockReturnValue(mockBonds);

      render(<BondTracker />);
      
      expect(screen.getByText('I am teaching Gandalf the ways of combat')).toBeInTheDocument();
      expect(screen.getByText('Gandalf')).toBeInTheDocument();
      expect(screen.getByText('Resolve')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('displays resolved bonds correctly', () => {
      const mockBonds = [
        {
          id: 'bond1',
          characterId: 'char1',
          targetCharacterId: 'char2',
          description: 'I am teaching Gandalf the ways of combat',
          status: BondStatus.RESOLVED,
          createdAt: new Date(),
          resolvedAt: new Date(),
          xpAwarded: true,
          notes: 'Successfully completed training',
          tags: ['mentorship']
        }
      ];

      (bondService.getBondsForCharacter as any).mockReturnValue(mockBonds);

      render(<BondTracker />);
      
      expect(screen.getByText('I am teaching Gandalf the ways of combat')).toBeInTheDocument();
      expect(screen.getByText('Successfully completed training')).toBeInTheDocument();
      expect(screen.getByText('✨ XP Awarded')).toBeInTheDocument();
    });

    it('displays bonds targeting the character', () => {
      const mockTargetingBonds = [
        {
          id: 'bond2',
          characterId: 'char2',
          targetCharacterId: 'char1',
          description: 'Gandalf is teaching me magic',
          status: BondStatus.ACTIVE,
          createdAt: new Date(),
          resolvedAt: null,
          xpAwarded: false,
          notes: '',
          tags: ['learning']
        }
      ];

      (bondService.getBondsTargetingCharacter as any).mockReturnValue(mockTargetingBonds);

      render(<BondTracker />);
      
      expect(screen.getByText('Bonds Targeting Me (1)')).toBeInTheDocument();
      expect(screen.getByText('Gandalf → Me')).toBeInTheDocument();
      expect(screen.getByText('Gandalf is teaching me magic')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters bonds by status', () => {
      const mockBonds = [
        {
          id: 'bond1',
          characterId: 'char1',
          targetCharacterId: 'char2',
          description: 'Active bond',
          status: BondStatus.ACTIVE,
          createdAt: new Date(),
          resolvedAt: null,
          xpAwarded: false,
          notes: '',
          tags: []
        },
        {
          id: 'bond2',
          characterId: 'char1',
          targetCharacterId: 'char3',
          description: 'Resolved bond',
          status: BondStatus.RESOLVED,
          createdAt: new Date(),
          resolvedAt: new Date(),
          xpAwarded: true,
          notes: '',
          tags: []
        }
      ];

      (bondService.getBondsForCharacter as any).mockReturnValue(mockBonds);

      render(<BondTracker />);
      
      // Initially shows all bonds
      expect(screen.getByText('Active bond')).toBeInTheDocument();
      expect(screen.getByText('Resolved bond')).toBeInTheDocument();

      // Filter to active bonds only
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: BondStatus.ACTIVE } });

      expect(screen.getByText('Active bond')).toBeInTheDocument();
      expect(screen.queryByText('Resolved bond')).not.toBeInTheDocument();
    });
  });

  describe('Bond Creation', () => {
    it('opens create bond form when button is clicked', () => {
      render(<BondTracker />);
      
      const createButton = screen.getByText('Create Bond');
      fireEvent.click(createButton);
      
      expect(screen.getByText('Create New Bond')).toBeInTheDocument();
      expect(screen.getByText('Target Character:')).toBeInTheDocument();
      expect(screen.getByText('Bond Description:')).toBeInTheDocument();
    });

    it('creates a bond when form is submitted', async () => {
      (bondService.createBond as any).mockReturnValue({
        id: 'new-bond',
        characterId: 'char1',
        targetCharacterId: 'char2',
        description: 'New bond description',
        status: BondStatus.ACTIVE,
        createdAt: new Date(),
        resolvedAt: null,
        xpAwarded: false,
        notes: '',
        tags: []
      });

      render(<BondTracker />);
      
      // Open create form
      fireEvent.click(screen.getByText('Create Bond'));
      
      // Fill form
      const targetSelect = screen.getByLabelText('Target Character:');
      fireEvent.change(targetSelect, { target: { value: 'char2' } });
      
      const descriptionTextarea = screen.getByLabelText('Bond Description:');
      fireEvent.change(descriptionTextarea, { target: { value: 'New bond description' } });
      
      // Submit form
      fireEvent.click(screen.getByText('Create Bond'));
      
      await waitFor(() => {
        expect(bondService.createBond).toHaveBeenCalledWith(
          'char1',
          'char2',
          'New bond description',
          undefined
        );
      });
    });
  });

  describe('Bond Resolution', () => {
    it('opens resolve bond form when resolve button is clicked', () => {
      const mockBonds = [
        {
          id: 'bond1',
          characterId: 'char1',
          targetCharacterId: 'char2',
          description: 'Test bond',
          status: BondStatus.ACTIVE,
          createdAt: new Date(),
          resolvedAt: null,
          xpAwarded: false,
          notes: '',
          tags: []
        }
      ];

      (bondService.getBondsForCharacter as any).mockReturnValue(mockBonds);

      render(<BondTracker />);
      
      const resolveButton = screen.getByText('Resolve');
      fireEvent.click(resolveButton);
      
      expect(screen.getByText('Resolve Bond')).toBeInTheDocument();
      expect(screen.getByText('Test bond')).toBeInTheDocument();
    });

    it('resolves a bond when form is submitted', async () => {
      const mockBonds = [
        {
          id: 'bond1',
          characterId: 'char1',
          targetCharacterId: 'char2',
          description: 'Test bond',
          status: BondStatus.ACTIVE,
          createdAt: new Date(),
          resolvedAt: null,
          xpAwarded: false,
          notes: '',
          tags: []
        }
      ];

      (bondService.getBondsForCharacter as any).mockReturnValue(mockBonds);
      (bondService.resolveBond as any).mockReturnValue({
        id: 'bond-bond1',
        type: 'bond_resolution',
        characterId: 'char1',
        amount: 1,
        description: 'Bond resolved: Test bond',
        timestamp: new Date()
      });

      render(<BondTracker />);
      
      // Open resolve form
      fireEvent.click(screen.getByText('Resolve'));
      
      // Fill form
      const resolutionTypeSelect = screen.getByLabelText('Resolution Type:');
      fireEvent.change(resolutionTypeSelect, { target: { value: BondResolutionType.FULFILLED } });
      
      const descriptionTextarea = screen.getByLabelText('Resolution Description:');
      fireEvent.change(descriptionTextarea, { target: { value: 'Successfully completed the bond' } });
      
      // Submit form
      fireEvent.click(screen.getByText('Resolve Bond (+1 XP)'));
      
      await waitFor(() => {
        expect(bondService.resolveBond).toHaveBeenCalledWith('bond1', {
          type: BondResolutionType.FULFILLED,
          description: 'Successfully completed the bond',
          timestamp: expect.any(Date),
          xpAwarded: true,
          notes: undefined
        });
      });
    });
  });

  describe('Bond Deletion', () => {
    it('deletes a bond when delete button is clicked', async () => {
      const mockBonds = [
        {
          id: 'bond1',
          characterId: 'char1',
          targetCharacterId: 'char2',
          description: 'Test bond',
          status: BondStatus.ACTIVE,
          createdAt: new Date(),
          resolvedAt: null,
          xpAwarded: false,
          notes: '',
          tags: []
        }
      ];

      (bondService.getBondsForCharacter as any).mockReturnValue(mockBonds);
      (bondService.deleteBond as any).mockReturnValue(true);

      // Mock confirm dialog
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<BondTracker />);
      
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this bond?');
      
      await waitFor(() => {
        expect(bondService.deleteBond).toHaveBeenCalledWith('bond1');
      });

      confirmSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('handles missing character gracefully', () => {
      // Mock GameStore to return no current character
      vi.mocked(require('../../src/store/GameStore').useGameStore).mockReturnValue({
        characters: [],
        currentCharacter: null
      });

      render(<BondTracker />);
      
      expect(screen.getByText('No Character Selected')).toBeInTheDocument();
      expect(screen.getByText('Please select a character to view their bonds.')).toBeInTheDocument();
    });

    it('handles bond service errors gracefully', () => {
      (bondService.getBondsForCharacter as any).mockImplementation(() => {
        throw new Error('Service error');
      });

      // Should not crash the component
      expect(() => render(<BondTracker />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<BondTracker />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Bond' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<BondTracker />);
      
      const createButton = screen.getByText('Create Bond');
      createButton.focus();
      
      expect(createButton).toHaveFocus();
    });
  });
});
