#!/usr/bin/env tsx

import { chromium, Browser, Page } from 'playwright';
import { resolve, dirname } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';

interface SectionFlags {
  hasTitle: boolean;
  hasIntent: boolean;
  hasSteps: boolean;
  hasAcceptance: boolean;
  hasArtifacts: boolean;
  hasActions: boolean;
}

interface ModalAnalysis {
  modalVisible: boolean;
  modalWidth: number;
  modalHeight: number;
  contentLength: number;
  contentPreview: string;
  htmlPreview: string;
  sections: SectionFlags;
  buttonsInModal: number;
}

interface TextReport {
  summary: string[];
  issues: string[];
  suggestions: string[];
  details: ModalAnalysis;
}

async function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function getDashboardUrl(): string {
  const envUrl = process.env.BASE_URL?.trim();
  if (envUrl) return envUrl;
  const fileUrl = 'file://' + resolve(process.cwd(), 'dashboard.html').replace(/\\/g, '/');
  return fileUrl;
}

async function navigateToDashboard(page: Page) {
  const url = getDashboardUrl();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('body', { timeout: 15000 });
  await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {});
}

async function openTaskModal(page: Page) {
  // Prefer test ids if available
  const t196 = page.getByTestId('task-T-196');
  if (await t196.count().catch(() => 0)) {
    await t196.first().click().catch(() => {});
  } else {
    // Fallback: look for known task items
    const items = await page.$$('.task-item');
    if (items.length > 0) {
      await items[0].click();
    } else {
      // Last resort: any button hinting at a task
      const alt = await page.$$('[onclick*="Task"], [onclick*="openTaskModal"], button');
      if (alt.length > 0) {
        await alt[0].click().catch(() => {});
      }
    }
  }

  // Wait for a modal-like element
  const candidates = ['#taskModal', '.modal', '[role="dialog"]'];
  for (const sel of candidates) {
    const found = await page.locator(sel).first();
    const count = await found.count();
    if (count > 0) {
      await found.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      break;
    }
  }
}

async function analyzeModal(page: Page): Promise<ModalAnalysis> {
  const analysis = await page.evaluate(() => {
    const modal = document.querySelector('#taskModal') || document.querySelector('.modal') || document.querySelector('[role="dialog"]');
    const content = document.querySelector('#modal-content') || modal;
    const getText = (el: Element | null) => (el?.textContent || '').trim();
    const getHTML = (el: Element | null) => (el ? (el as HTMLElement).innerHTML : '');

    const text = getText(content as Element);
    const html = getHTML(content as Element);
    const style = modal ? window.getComputedStyle(modal as Element) : null;
    const rect = (modal as HTMLElement | null)?.getBoundingClientRect();

    const sections = {
      hasTitle: html.includes('📋') && html.toLowerCase().includes('title'),
      hasIntent: html.includes('🎯') && html.includes('What This Task Is About'),
      hasSteps: html.includes('📝') && html.includes('Implementation Steps'),
      hasAcceptance: html.includes('✅') && html.includes('Acceptance Criteria'),
      hasArtifacts: html.includes('📦') && html.includes('Expected Artifacts'),
      hasActions: html.includes('Task Actions') || html.toLowerCase().includes('actions')
    };

    const buttonsInModal = modal ? (modal as HTMLElement).querySelectorAll('button').length : 0;

    return {
      modalVisible: !!modal && !!style && style.display !== 'none' && style.visibility !== 'hidden',
      modalWidth: rect ? Math.round(rect.width) : 0,
      modalHeight: rect ? Math.round(rect.height) : 0,
      contentLength: text.length,
      contentPreview: text.substring(0, 400),
      htmlPreview: html.substring(0, 800),
      sections,
      buttonsInModal
    } as ModalAnalysis;
  });

  return analysis;
}

function buildTextReport(analysis: ModalAnalysis): TextReport {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!analysis.modalVisible) issues.push('Modal is not visible');
  if (analysis.modalWidth && analysis.modalWidth < 800) suggestions.push('Increase modal width for better content display');
  if (analysis.contentLength < 300) issues.push('Modal content appears sparse');

  const req: Array<[keyof SectionFlags, string, string]> = [
    ['hasIntent', 'Task Intent section', 'What This Task Is About'],
    ['hasSteps', 'Implementation Steps section', 'Implementation Steps'],
    ['hasAcceptance', 'Acceptance Criteria section', 'Acceptance Criteria'],
    ['hasArtifacts', 'Expected Artifacts section', 'Expected Artifacts'],
    ['hasActions', 'Action buttons section', 'Task Actions']
  ];
  for (const [key, label] of req) {
    if (!analysis.sections[key]) issues.push(`Missing ${label}`);
  }

  if (analysis.buttonsInModal < 3) suggestions.push('Add more clear action buttons in modal');

  const summary: string[] = [
    `Modal visible: ${analysis.modalVisible}`,
    `Size: ${analysis.modalWidth}x${analysis.modalHeight}`,
    `Content length: ${analysis.contentLength}`,
    `Buttons: ${analysis.buttonsInModal}`
  ];

  return { summary, issues, suggestions, details: analysis };
}

function writeArtifacts(reportDir: string, result: TextReport) {
  ensureDir(reportDir);
  const jsonPath = resolve(reportDir, 'modal-analysis.json');
  const mdPath = resolve(reportDir, 'modal-analysis.md');

  writeFileSync(jsonPath, JSON.stringify(result, null, 2));

  const md = [
    '# Modal Analysis Report',
    '',
    '## Summary',
    ...result.summary.map(s => `- ${s}`),
    '',
    '## Issues',
    ...(result.issues.length ? result.issues.map(i => `- ${i}`) : ['- None found']),
    '',
    '## Suggestions',
    ...(result.suggestions.length ? result.suggestions.map(s => `- ${s}`) : ['- None']),
    '',
    '## Content Preview',
    '```',
    result.details.contentPreview,
    '```'
  ].join('\n');

  writeFileSync(mdPath, md);

  return { jsonPath, mdPath };
}

async function main() {
  const artifactsRoot = resolve(process.cwd(), 'artifacts', 'playwright');
  await ensureDir(artifactsRoot);

  const headless = process.env.PW_HEADLESS !== 'false';
  const browser: Browser = await chromium.launch({ headless });
  const page: Page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(20000);

  // Mirror useful logs to stdout for Cursor-friendly visibility
  page.on('console', (msg) => {
    // Keep only text to remain concise
    console.log(`[browser] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.error(`[pageerror] ${err.message}`);
  });

  try {
    await navigateToDashboard(page);
    await openTaskModal(page);
    const analysis = await analyzeModal(page);
    const report = buildTextReport(analysis);

    // Always emit concise console output for Cursor
    console.log('Modal Analysis Summary:');
    for (const s of report.summary) console.log(`- ${s}`);
    if (report.issues.length) {
      console.log('Issues:');
      for (const i of report.issues) console.log(`- ${i}`);
    }
    if (report.suggestions.length) {
      console.log('Suggestions:');
      for (const s of report.suggestions) console.log(`- ${s}`);
    }

    const out = writeArtifacts(artifactsRoot, report);
    console.log(`Artifacts written:\n- ${out.jsonPath}\n- ${out.mdPath}`);

    // Optionally capture a screenshot if explicitly requested
    if (process.env.PW_SCREENSHOT === '1') {
      const shotPath = resolve(artifactsRoot, 'modal.png');
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`Screenshot saved: ${shotPath}`);
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error('Playwright modal analysis failed:', err);
  process.exitCode = 1;
});


