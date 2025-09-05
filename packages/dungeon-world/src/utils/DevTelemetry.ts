type TelemetrySnapshot = {
  shortcutTriggers: Record<string, number>
  menuOpens: number
  menuSelects: Record<string, number>
  tooltipsShown: number
}

class DevTelemetryImpl {
  private data: TelemetrySnapshot = {
    shortcutTriggers: {},
    menuOpens: 0,
    menuSelects: {},
    tooltipsShown: 0,
  }

  recordShortcutTrigger(combo: string): void {
    this.data.shortcutTriggers[combo] = (this.data.shortcutTriggers[combo] ?? 0) + 1
  }

  recordMenuOpen(): void {
    this.data.menuOpens += 1
  }

  recordMenuSelect(id: string): void {
    this.data.menuSelects[id] = (this.data.menuSelects[id] ?? 0) + 1
  }

  recordTooltipShow(): void {
    this.data.tooltipsShown += 1
  }

  getSnapshot(): TelemetrySnapshot { return JSON.parse(JSON.stringify(this.data)) }
  reset(): void {
    this.data = { shortcutTriggers: {}, menuOpens: 0, menuSelects: {}, tooltipsShown: 0 }
  }
}

const globalAny = (typeof window !== 'undefined' ? (window as any) : {})
if (!globalAny.__devTelemetry)
  globalAny.__devTelemetry = new DevTelemetryImpl()

export const devTelemetry: DevTelemetryImpl = globalAny.__devTelemetry
export const recordShortcutTrigger = (combo: string) => devTelemetry.recordShortcutTrigger(combo)
export const recordMenuOpen = () => devTelemetry.recordMenuOpen()
export const recordMenuSelect = (id: string) => devTelemetry.recordMenuSelect(id)
export const recordTooltipShow = () => devTelemetry.recordTooltipShow()
export const getTelemetrySnapshot = () => devTelemetry.getSnapshot()
export const resetTelemetry = () => devTelemetry.reset()


