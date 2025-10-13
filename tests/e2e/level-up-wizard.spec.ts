import { expect, test } from '@playwright/test'

const persistedCharacters = {
  state: {
    characters: [
      {
        id: 'char-fighter',
        name: 'Gareth Ironshield',
        class: 'Fighter',
        race: 'Human',
        level: 4,
        alignment: 'Lawful',
        attributes: {
          STR: 16,
          DEX: 13,
          CON: 15,
          INT: 12,
          WIS: 14,
          CHA: 11,
        },
        debilities: {
          weak: false,
          shaky: false,
          sick: false,
          stunned: false,
          confused: false,
          scarred: false,
        },
        hp: { current: 28, max: 32 },
        armor: 2,
        baseArmor: 2,
        damageDie: 'd10',
        xp: 9,
        load: { current: 10, max: 18 },
        baseLoad: 12,
        coin: 120,
        bonds: [],
        advancements: [],
        knownMoves: [],
        knownSpells: [],
        preparedSpells: [],
        conditions: [],
        availableMoves: [],
        createdAt: '2025-10-01T12:00:00.000Z',
        updatedAt: '2025-10-01T12:00:00.000Z',
      },
      {
        id: 'char-wizard',
        name: 'Eldara Moonwhisper',
        class: 'Wizard',
        race: 'Elf',
        level: 5,
        alignment: 'Good',
        attributes: {
          STR: 12,
          DEX: 14,
          CON: 13,
          INT: 18,
          WIS: 16,
          CHA: 15,
        },
        debilities: {
          weak: false,
          shaky: false,
          sick: false,
          stunned: false,
          confused: false,
          scarred: false,
        },
        hp: { current: 18, max: 25 },
        armor: 1,
        baseArmor: 0,
        damageDie: 'd6',
        xp: 11,
        load: { current: 8, max: 12 },
        baseLoad: 7,
        coin: 80,
        bonds: [],
        advancements: [],
        knownMoves: [],
        knownSpells: [
          'light',
          'unseen_servant',
          'magic_missile',
          'fireball',
          'invisibility',
        ],
        preparedSpells: ['magic_missile', 'fireball'],
        conditions: [],
        availableMoves: [],
        createdAt: '2025-10-01T12:00:00.000Z',
        updatedAt: '2025-10-01T12:00:00.000Z',
      },
    ],
    activeCharacterId: 'char-fighter',
    isLoading: false,
    error: null as string | null,
    pendingAdvancements: {} as Record<string, unknown>,
  },
  version: 2,
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ characterState }) => {
    window.localStorage.setItem(
      'zimbomate-character-storage',
      JSON.stringify(characterState),
    )
    window.localStorage.removeItem('zimbomate-session-storage')
    window.localStorage.removeItem('zimbomate-game-state-storage')
  }, { characterState: persistedCharacters })

  await page.goto('/')
  await page.waitForSelector('text=Active Theme: Matsu', { timeout: 15000 })
})

test('martial and caster characters level up via the wizard', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await page.evaluate(() => {
    const stores = (window as any).__zimboStores
    if (!stores?.character || !stores?.session) {
      throw new Error('Required stores not available on window')
    }
    const characterStore = stores.character.getState()
    const sessionStore = stores.session.getState()
    const characterIds = characterStore.characters.map((character: { id: string }) => character.id)
    sessionStore.startSession('Playwright Session', characterIds)
    characterStore.addXP(
      'char-fighter',
      5,
      'Session Award',
      'Playwright level-up scenario',
    )
    characterStore.addXP(
      'char-wizard',
      5,
      'Session Award',
      'Playwright level-up scenario',
    )
  })
  await page.evaluate(() => {
    const stores = (window as any).__zimboStores
    if (!stores?.character) throw new Error('Character store not available')
    const store = stores.character.getState()
    store.levelUpCharacter('char-fighter')
    store.levelUpCharacter('char-wizard')
  })

  const wizard = page.getByTestId('level-up-wizard')
  const clickWizardNext = async () => {
    const nextButton = wizard.getByTestId('wizard-next')
    await nextButton.evaluate((node) =>
      (node as HTMLElement).scrollIntoView({ block: 'center' }),
    )
    await nextButton.click({ force: true })
  }
  const clickWizardConfirm = async () => {
    const confirmButton = wizard.getByTestId('wizard-confirm')
    await confirmButton.evaluate((node) =>
      (node as HTMLElement).scrollIntoView({ block: 'center' }),
    )
    await confirmButton.click({ force: true })
  }
  await expect(wizard).toBeVisible({ timeout: 15000 })
  await expect(wizard).toContainText('Gareth Ironshield')

  await clickWizardNext()
  await wizard.getByRole('radio', { name: 'Increase STR' }).click()
  await clickWizardNext()

  const fighterMoveOption = wizard.locator('[data-testid^="move-option-"]').first()
  const fighterMoveName =
    (
      await fighterMoveOption.locator('p.font-semibold').textContent()
    )?.trim() ?? ''
  await fighterMoveOption.click()
  await clickWizardNext()
  await expect(wizard).toContainText(fighterMoveName)
  await clickWizardConfirm()

  await expect(wizard).toBeVisible({ timeout: 15000 })
  await expect(wizard).toContainText('Eldara Moonwhisper')

  await clickWizardNext()
  await wizard.getByRole('radio', { name: 'Increase WIS' }).click()
  await clickWizardNext()

  const wizardMoveOption = wizard.locator('[data-testid^="move-option-"]').first()
  const wizardMoveName =
    (
      await wizardMoveOption.locator('p.font-semibold').textContent()
    )?.trim() ?? ''
  await wizardMoveOption.click()
  await clickWizardNext()

  const wizardSpellOption = wizard.locator('[data-testid^="spell-option-"]').first()
  const wizardSpellName =
    (
      await wizardSpellOption.locator('p.font-medium').textContent()
    )?.trim() ?? ''
  const wizardSpellTestId =
    (await wizardSpellOption.getAttribute('data-testid')) ?? ''
  const wizardSpellId = wizardSpellTestId.replace('spell-option-', '')
  await wizard.getByRole('checkbox', { name: wizardSpellName }).click()
  await clickWizardNext()
  await expect(wizard).toContainText(wizardMoveName)
  await expect(wizard).toContainText(wizardSpellName)
  await clickWizardConfirm()
  await expect(wizard).toBeHidden({ timeout: 15000 })

  await page.evaluate(() => {
    const store = (window as any).__zimboStores.character.getState()
    store.setActiveCharacter('char-fighter')
  })

  await expect(page.locator('[data-slot="folio-header"]')).toContainText(
    'Level 5 / Fighter',
  )
  await expect(page.locator('[data-testid="attribute-STR"]')).toContainText('17')
  await expect(
    page.locator('[data-testid="advanced-move-list"]'),
  ).toContainText(fighterMoveName)

  await page.evaluate(() => {
    const store = (window as any).__zimboStores.character.getState()
    store.setActiveCharacter('char-wizard')
  })

  await expect(page.locator('[data-slot="folio-header"]')).toContainText(
    'Level 6 / Wizard',
  )
  await expect(page.locator('[data-testid="attribute-WIS"]')).toContainText('17')

  await page.getByRole('tab', { name: 'Spells & Hold' }).click()
  await expect(
    page.locator(`[data-testid="known-spell-${wizardSpellId}"]`),
  ).toContainText(wizardSpellId)
})