import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PRDParser, loadPRD } from '../src/lib/prd';
import { writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

describe('PRD Parser', () => {
  const testPrdPath = resolve(process.cwd(), 'test-prd.md');

  const samplePRD = `# Test Product Requirements Document

## Overview
This is a test PRD for unit testing the parser.

## Product Vision
A simple test product that demonstrates parser functionality.

## Core Features

### Task Management
- Create and update tasks
- Assign priorities
- Track status

### User Interface
- Clean design
- Responsive layout
- Dark mode

## Technical Requirements

### Performance
- Fast loading
- Efficient processing
- Scalable architecture

### Security
- User authentication
- Data encryption

## Success Metrics
- 90% completion rate
- User satisfaction > 4.5/5
- 50% efficiency improvement

## Timeline
- Phase 1: Core features (Q1)
- Phase 2: Advanced features (Q2)
- Phase 3: Enterprise features (Q3)`;

  beforeEach(() => {
    // Create test PRD file
    writeFileSync(testPrdPath, samplePRD);
  });

  afterEach(() => {
    // Clean up test file
    try {
      unlinkSync(testPrdPath);
    } catch (error) {
      // File might not exist, ignore
    }
  });

  describe('PRDParser', () => {
    it('should parse a valid PRD file', () => {
      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      expect(prd.title).toBe('Test Product Requirements Document');
      expect(prd.overview).toContain('test PRD for unit testing');
      expect(prd.productVision).toContain('simple test product');
      expect(prd.coreFeatures).toHaveLength(2);
      expect(prd.technicalRequirements).toHaveLength(2);
      expect(prd.successMetrics).toHaveLength(3);
      expect(prd.timeline).toHaveLength(3);
    });

    it('should extract core features correctly', () => {
      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      const taskManagement = prd.coreFeatures.find(
        (f) => f.name === 'Task Management',
      );
      expect(taskManagement).toBeDefined();
      expect(taskManagement?.requirements).toHaveLength(3);
      expect(taskManagement?.requirements).toContain('Create and update tasks');

      const userInterface = prd.coreFeatures.find(
        (f) => f.name === 'User Interface',
      );
      expect(userInterface).toBeDefined();
      expect(userInterface?.requirements).toHaveLength(3);
      expect(userInterface?.requirements).toContain('Clean design');
    });

    it('should extract technical requirements correctly', () => {
      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      const performance = prd.technicalRequirements.find(
        (r) => r.category === 'Performance',
      );
      expect(performance).toBeDefined();
      expect(performance?.requirements).toHaveLength(3);
      expect(performance?.requirements).toContain('Fast loading');

      const security = prd.technicalRequirements.find(
        (r) => r.category === 'Security',
      );
      expect(security).toBeDefined();
      expect(security?.requirements).toHaveLength(2);
      expect(security?.requirements).toContain('User authentication');
    });

    it('should extract success metrics correctly', () => {
      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      expect(prd.successMetrics).toHaveLength(3);

      const completionRate = prd.successMetrics.find(
        (m) => m.name === '90% completion rate',
      );
      expect(completionRate).toBeDefined();
      expect(completionRate?.target).toBe('');

      const satisfaction = prd.successMetrics.find(
        (m) => m.name === 'User satisfaction > 4.5/5',
      );
      expect(satisfaction).toBeDefined();
      expect(satisfaction?.target).toBe('');
    });

    it('should extract timeline correctly', () => {
      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      expect(prd.timeline).toHaveLength(3);

      const phase1 = prd.timeline.find((t) => t.phase === 'Phase 1');
      expect(phase1).toBeDefined();
      expect(phase1?.description).toBe('Core features');
      expect(phase1?.timeframe).toBe('Q1');

      const phase2 = prd.timeline.find((t) => t.phase === 'Phase 2');
      expect(phase2).toBeDefined();
      expect(phase2?.description).toBe('Advanced features');
      expect(phase2?.timeframe).toBe('Q2');
    });

    it('should validate required fields', () => {
      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      expect(() => parser.validate(prd)).not.toThrow();
    });

    it('should throw error for missing title', () => {
      const invalidPRD = `## Overview
This is a test PRD without a title.`;

      writeFileSync(testPrdPath, invalidPRD);

      const parser = new PRDParser(testPrdPath);
      expect(() => parser.parse()).toThrow(
        'PRD must have a title starting with #',
      );
    });

    it('should throw error for missing required section', () => {
      const invalidPRD = `# Test PRD

## Overview
This is a test PRD without required sections.`;

      writeFileSync(testPrdPath, invalidPRD);

      const parser = new PRDParser(testPrdPath);
      expect(() => parser.parse()).toThrow(
        "Required section 'Product Vision' not found in PRD",
      );
    });

    it('should throw error for empty core features', () => {
      const invalidPRD = `# Test PRD

## Overview
Test overview.

## Product Vision
Test vision.

## Core Features

## Technical Requirements

### Performance
- Fast loading

## Success Metrics
- 90% completion rate

## Timeline
- Phase 1: Core features (Q1)`;

      writeFileSync(testPrdPath, invalidPRD);

      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();
      expect(() => parser.validate(prd)).toThrow(
        'PRD must have at least one core feature',
      );
    });
  });

  describe('loadPRD function', () => {
    it('should load and parse PRD with default path', () => {
      // This test uses the actual docs/PRD.md file
      const prd = loadPRD();

      expect(prd.title).toBe('Dungeon World Digital Control Panel Design');
      expect(prd.coreFeatures).toHaveLength(6);
      expect(prd.technicalRequirements).toHaveLength(3);
      expect(prd.successMetrics).toHaveLength(4);
      expect(prd.timeline).toHaveLength(8);
    });

    it('should load and parse PRD with custom path', () => {
      const prd = loadPRD(testPrdPath);

      expect(prd.title).toBe('Test Product Requirements Document');
      expect(prd.coreFeatures).toHaveLength(2);
    });

    it('should validate PRD when loading', () => {
      const invalidPRD = `# Test PRD

## Overview
Test.

## Product Vision
Test.

## Core Features

## Technical Requirements

## Success Metrics

## Timeline`;

      writeFileSync(testPrdPath, invalidPRD);

      expect(() => loadPRD(testPrdPath)).toThrow(
        'PRD must have at least one core feature',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle PRD with single feature', () => {
      const singleFeaturePRD = `# Single Feature PRD

## Overview
Test.

## Product Vision
Test.

## Core Features

### Single Feature
- Only one requirement

## Technical Requirements

### Performance
- Fast loading

## Success Metrics
- 90% completion rate

## Timeline
- Phase 1: Core features (Q1)`;

      writeFileSync(testPrdPath, singleFeaturePRD);

      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      expect(prd.coreFeatures).toHaveLength(1);
      expect(prd.coreFeatures[0].name).toBe('Single Feature');
      expect(prd.coreFeatures[0].requirements).toHaveLength(1);
    });

    it('should handle PRD with complex success metrics', () => {
      const complexMetricsPRD = `# Complex Metrics PRD

## Overview
Test.

## Product Vision
Test.

## Core Features

### Feature
- Requirement

## Technical Requirements

### Performance
- Fast loading

## Success Metrics
- Metric 1: Target value 1
- Metric 2: Target value 2 with : colon
- Metric 3: No target specified

## Timeline
- Phase 1: Core features (Q1)`;

      writeFileSync(testPrdPath, complexMetricsPRD);

      const parser = new PRDParser(testPrdPath);
      const prd = parser.parse();

      expect(prd.successMetrics).toHaveLength(3);
      expect(prd.successMetrics[0].name).toBe('Metric 1');
      expect(prd.successMetrics[0].target).toBe('Target value 1');
      expect(prd.successMetrics[1].name).toBe('Metric 2');
      expect(prd.successMetrics[1].target).toBe('Target value 2 with : colon');
      expect(prd.successMetrics[2].name).toBe('Metric 3');
      expect(prd.successMetrics[2].target).toBe('No target specified');
    });
  });
});
