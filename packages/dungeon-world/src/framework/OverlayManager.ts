export type OverlayLayerId = string

class OverlayManagerClass {
  private layers: Map<OverlayLayerId, Set<HTMLElement>> = new Map()
  private _activeLayer: OverlayLayerId | null = null

  get activeLayer(): OverlayLayerId | null { return this._activeLayer }

  register(layerId: OverlayLayerId, element: HTMLElement): () => void {
    if (!this.layers.has(layerId)) this.layers.set(layerId, new Set())
    this.layers.get(layerId)!.add(element)
    // Initial visibility according to current active layer
    this.applyVisibility(element, layerId === this._activeLayer)
    return () => {
      const set = this.layers.get(layerId)
      if (!set) return
      set.delete(element)
      if (set.size === 0) this.layers.delete(layerId)
    }
  }

  setActiveLayer(layerId: OverlayLayerId | null): void {
    this._activeLayer = layerId
    for (const [id, set] of this.layers.entries()) {
      const isActive = id === layerId
      for (const el of set) this.applyVisibility(el, isActive)
    }
  }

  private applyVisibility(element: HTMLElement, visible: boolean): void {
    if (visible) {
      element.style.display = ''
      element.style.pointerEvents = ''
      element.removeAttribute('aria-hidden')
    } else {
      element.style.display = 'none'
      element.style.pointerEvents = 'none'
      element.setAttribute('aria-hidden', 'true')
    }
  }
}

export const OverlayManager = new OverlayManagerClass()


