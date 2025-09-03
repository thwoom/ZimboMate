import { readFileSync } from 'fs';
import { resolve } from 'path';

// Types for the PRD structure
export interface PRD {
  title: string;
  overview: string;
  productVision: string;
  coreFeatures: Feature[];
  technicalRequirements: TechnicalRequirement[];
  successMetrics: SuccessMetric[];
  timeline: TimelineItem[];
}

export interface Feature {
  name: string;
  description: string;
  requirements: string[];
}

export interface TechnicalRequirement {
  category: string;
  requirements: string[];
}

export interface SuccessMetric {
  name: string;
  target: string;
}

export interface TimelineItem {
  phase: string;
  description: string;
  timeframe: string;
}

// Parser class
export class PRDParser {
  private prdPath: string;

  constructor(prdPath = 'docs/PRD.md') {
    this.prdPath = resolve(process.cwd(), prdPath.replace(/[^a-zA-Z0-9/._-]/g, ''));
  }

  /**
   * Parse the PRD markdown file into a structured object
   */
  parse(): PRD {
    const content = readFileSync(this.prdPath, 'utf8');
    const lines = content.split('\n');

    return {
      title: this.extractTitle(lines),
      overview: this.extractSection(lines, 'Overview'),
      productVision: this.extractSection(lines, 'Product Vision'),
      coreFeatures: this.extractFeatures(lines),
      technicalRequirements: this.extractTechnicalRequirements(lines),
      successMetrics: this.extractSuccessMetrics(lines),
      timeline: this.extractTimeline(lines),
    };
  }

  /**
   * Extract the main title from the first line
   */
  private extractTitle(lines: string[]): string {
    const titleLine = lines.find((line) => line.startsWith('# '));
    if (!titleLine) {
      throw new Error('PRD must have a title starting with #');
    }
    return titleLine.replace('# ', '').trim();
  }

  /**
   * Extract content from a specific section
   */
  private extractSection(lines: string[], sectionName: string): string {
    const sectionStart = lines.findIndex((line) =>
      line.startsWith(`## ${sectionName}`),
    );

    if (sectionStart === -1) {
      throw new Error(`Required section '${sectionName}' not found in PRD`);
    }

    const sectionEnd = lines.findIndex(
      (line, index) => index > sectionStart && line.startsWith('## '),
    );

    const sectionLines = sectionEnd === -1
        ? lines.slice(sectionStart + 1)
        : lines.slice(sectionStart + 1, sectionEnd);

    return sectionLines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }

  /**
   * Extract core features from the PRD
   */
  private extractFeatures(lines: string[]): Feature[] {
    const featuresSection = this.extractSection(lines, 'Core Features');
    const featureBlocks = this.splitIntoBlocks(featuresSection);

    return featureBlocks.map((block) => {
      const lines = block.split('\n');
      const name = lines[0].replace('### ', '').trim();
      const requirements = lines
        .slice(1)
        .filter((line) => line.startsWith('- '))
        .map((line) => line.replace('- ', '').trim());

      return {
        name,
        description: requirements.join(' '),
        requirements,
      };
    });
  }

  /**
   * Extract technical requirements from the PRD
   */
  private extractTechnicalRequirements(
    lines: string[],
  ): TechnicalRequirement[] {
    const techSection = this.extractSection(lines, 'Technical Requirements');
    const requirementBlocks = this.splitIntoBlocks(techSection);

    return requirementBlocks.map((block) => {
      const lines = block.split('\n');
      const _category = lines[0].replace('### ', '').trim();
      const requirements = lines
        .slice(1)
        .filter((line) => line.startsWith('- '))
        .map((line) => line.replace('- ', '').trim());

      return {
        category,
        requirements,
      };
    });
  }

  /**
   * Extract success metrics from the PRD
   */
  private extractSuccessMetrics(lines: string[]): SuccessMetric[] {
    const metricsSection = this.extractSection(lines, 'Success Metrics');
    const metricLines = metricsSection
      .split('\n')
      .filter((line) => line.startsWith('- '))
      .map((line) => line.replace('- ', '').trim());

    return metricLines.map((metric) => {
      // Parse metrics like "User satisfaction > 4.5 / 5" or "90% completion rate"
      const colonIndex = metric.indexOf(':');
      if (colonIndex !== -1) {
        return {
          name: metric.slice(0, Math.max(0, colonIndex)).trim(),
          target: metric.slice(Math.max(0, colonIndex + 1)).trim(),
        };
      }
      return {
        name: metric,
        target: '',
      };
    });
  }

  /**
   * Extract timeline from the PRD
   */
  private extractTimeline(lines: string[]): TimelineItem[] {
    const timelineSection = this.extractSection(lines, 'Timeline');
    const timelineLines = timelineSection
      .split('\n')
      .filter((line) => line.startsWith('- '))
      .map((line) => line.replace('- ', '').trim());

    return timelineLines.map((item) => {
      // Parse timeline items like "Phase 1: Core task management (Q1)"
      const match = item.match(/^(.+?):\s*(.+?)\s*\((.+?)\)$/);
      if (match) {
        return {
          phase: match[1].trim(),
          description: match[2].trim(),
          timeframe: match[3].trim(),
        };
      }
      return {
        phase: item,
        description: '',
        timeframe: '',
      };
    });
  }

  /**
   * Split a section into blocks based on ### headers
   */
  private splitIntoBlocks(content: string): string[] {
    const blocks = content.split('\n### ');
    return blocks
      .filter((block) => block.trim().length > 0)
      .map((block) => block.trim());
  }

  /**
   * Validate that all required fields are present and not null
   */
  validate(prd: PRD): void {
    if (!prd.title) throw new Error('PRD title is required');
    if (!prd.overview) throw new Error('PRD overview is required');
    if (!prd.productVision) throw new Error('PRD product vision is required');
    if (!prd.coreFeatures || prd.coreFeatures.length === 0) {
      throw new Error('PRD must have at least one core feature');
    }
    if (!prd.technicalRequirements || prd.technicalRequirements.length === 0) {
      throw new Error('PRD must have at least one technical requirement');
    }
    if (!prd.successMetrics || prd.successMetrics.length === 0) {
      throw new Error('PRD must have at least one success metric');
    }
    if (!prd.timeline || prd.timeline.length === 0) {
      throw new Error('PRD must have at least one timeline item');
    }
  }
}

// Main function to load and parse PRD
export function loadPRD(prdPath?: string): PRD {
  const parser = new PRDParser(prdPath);
  const prd = parser.parse();
  parser.validate(prd);
  return prd;
}



