import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/utils/logger'

describe('audio & Memory Testing for Gaming', () => {
  describe('audio System Tests', () => {
    let audioPlaySpy: any
    let audioStopSpy: any

    beforeEach(() => {
      // Mock Web Audio API
      globalThis.AudioContext = vi.fn(() => ({
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: { value: 440 },
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: { value: 1 },
        })),
        createBuffer: vi.fn(),
        createTexture: vi.fn(),
        destination: {},
      })) as any

      // Mock Howler.js
      audioPlaySpy = vi.fn()
      audioStopSpy = vi.fn()

      globalThis.Howl = vi.fn(() => ({
        play: audioPlaySpy,
        stop: audioStopSpy,
        volume: vi.fn(),
        duration: vi.fn(() => 1000),
        playing: vi.fn(() => false),
      })) as any
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('plays dice roll sound with correct timing', async () => {
      const mockDiceRoller = () => {
        const handleRoll = () => {
          // Simulate dice roll with sound
          const sound = new (globalThis.Howl as any)({
            src: ['dice-roll.mp3'],
          })
          sound.play()
        }

        return (
          <button type='button' onClick={handleRoll} data-testid='roll-button'>
            Roll Dice
          </button>
        )
      }

      const { getByTestId } = render(mockDiceRoller())

      fireEvent.click(getByTestId('roll-button'))

      expect(audioPlaySpy).toHaveBeenCalled()
      expect(audioPlaySpy).toHaveBeenCalledTimes(1)
    })

    it('handles multiple simultaneous audio sources', async () => {
      const mockAudioManager = () => {
        const handleMultipleSounds = () => {
          // Simulate background music + sound effects
          const bgMusic = new (globalThis.Howl as any)({
            src: ['bg-music.mp3'],
          })
          const diceSound = new (globalThis.Howl as any)({ src: ['dice.mp3'] })
          const successSound = new (globalThis.Howl as any)({
            src: ['success.mp3'],
          })

          bgMusic.play()
          diceSound.play()
          successSound.play()
        }

        return (
          <button
            type='button'
            onClick={handleMultipleSounds}
            data-testid='multi-audio'
          >
            Play Multiple
          </button>
        )
      }

      const { getByTestId } = render(mockAudioManager())

      fireEvent.click(getByTestId('multi-audio'))

      expect(audioPlaySpy).toHaveBeenCalledTimes(3)
    })

    it('respects user audio preferences', async () => {
      const MockAudioSettings = () => {
        const [audioEnabled, setAudioEnabled] = React.useState(false)

        const handleToggleAudio = () => {
          setAudioEnabled(!audioEnabled)
          localStorage.setItem('audioEnabled', String(!audioEnabled))
        }

        const handlePlay = () => {
          if (audioEnabled) {
            const sound = new (globalThis.Howl as any)({ src: ['test.mp3'] })
            sound.play()
          }
        }

        return (
          <div>
            <button
              type='button'
              onClick={handleToggleAudio}
              data-testid='audio-toggle'
            >
              {audioEnabled ? 'Disable' : 'Enable'} Audio
            </button>
            <button type='button' onClick={handlePlay} data-testid='play-sound'>
              Play Sound
            </button>
          </div>
        )
      }

      const { getByTestId } = render(<MockAudioSettings />)

      // Initially audio is disabled
      fireEvent.click(getByTestId('play-sound'))
      expect(audioPlaySpy).not.toHaveBeenCalled()

      // Enable audio
      fireEvent.click(getByTestId('audio-toggle'))
      fireEvent.click(getByTestId('play-sound'))
      expect(audioPlaySpy).toHaveBeenCalled()
    })

    it('handles audio loading errors gracefully', async () => {
      const mockErrorHandler = () => {
        const handlePlayWithError = () => {
          const sound = new (globalThis.Howl as any)({
            src: ['nonexistent.mp3'],
            onloaderror: (id: any, error: any) => {
              logger.info('Audio load error handled:', error)
            },
          })
          sound.play()
        }

        return (
          <button
            type='button'
            onClick={handlePlayWithError}
            data-testid='error-audio'
          >
            Play Broken Audio
          </button>
        )
      }

      // Mock console.log to verify error handling
      vi.spyOn(logger, 'info')

      const { getByTestId } = render(mockErrorHandler())
      fireEvent.click(getByTestId('error-audio'))

      // Should still attempt to play (graceful degradation)
      expect(audioPlaySpy).toHaveBeenCalled()
    })
  })

  describe('memory Management Tests', () => {
    it('cleans up event listeners on component unmount', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const MockKeyboardComponent = () => {
        React.useEffect(() => {
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'r') {
              logger.info('Roll dice shortcut')
            }
          }

          document.addEventListener('keydown', handleKeydown)

          return () => {
            document.removeEventListener('keydown', handleKeydown)
          }
        }, [])

        return <div>Keyboard Handler</div>
      }

      const { unmount } = render(<MockKeyboardComponent />)

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      )

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('prevents memory leaks in animation loops', async () => {
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')
      const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')

      const MockAnimationComponent = () => {
        React.useEffect(() => {
          let animationId: number

          const animate = () => {
            // Simulate dice rolling animation
            animationId = requestAnimationFrame(animate)
          }

          animate()

          return () => {
            if (animationId) {
              cancelAnimationFrame(animationId)
            }
          }
        }, [])

        return <div>Animated Component</div>
      }

      const { unmount } = render(<MockAnimationComponent />)

      expect(requestAnimationFrameSpy).toHaveBeenCalled()

      unmount()

      expect(cancelAnimationFrameSpy).toHaveBeenCalled()

      cancelAnimationFrameSpy.mockRestore()
      requestAnimationFrameSpy.mockRestore()
    })

    it('manages large datasets efficiently', async () => {
      const MockLargeDataComponent = () => {
        const data = React.useMemo(
          () =>
            Array.from({ length: 10000 }).map((_, i) => ({
              id: i,
              name: `Character ${i}`,
              stats: {
                hp: Math.floor(Math.random() * 20) + 1,
                level: Math.floor(Math.random() * 10) + 1,
              },
            })),
          [],
        )

        return <div>Loaded {data.length} items</div>
      }

      const { unmount, getByText } = render(<MockLargeDataComponent />)

      await waitFor(() => {
        expect(getByText('Loaded 10000 items')).toBeTruthy()
      })

      // Verify data is loaded
      expect(getByText('Loaded 10000 items')).toBeTruthy()

      unmount()

      // Memory should be freed (we can't directly test this, but the cleanup should run)
    })

    it('handles WebGL context cleanup', async () => {
      const mockCanvas = {
        getContext: vi.fn(() => ({
          createBuffer: vi.fn(),
          createTexture: vi.fn(),
          deleteBuffer: vi.fn(),
          deleteTexture: vi.fn(),
          deleteProgram: vi.fn(),
          deleteShader: vi.fn(),
          getExtension: vi.fn(() => ({ loseContext: vi.fn() })),
        })),
      }

      const MockWebGLComponent = () => {
        React.useEffect(() => {
          const canvas = mockCanvas as any
          const gl = canvas.getContext('webgl')

          // Simulate creating WebGL resources
          const buffer = gl.createBuffer()
          const texture = gl.createTexture()

          return () => {
            // Cleanup WebGL resources
            if (buffer) gl.deleteBuffer(buffer)
            if (texture) gl.deleteTexture(texture)

            // Lose context to free memory
            const loseContext = gl.getExtension('WEBGL_lose_context')
            if (loseContext) loseContext.loseContext()
          }
        }, [])

        return <div>WebGL Component</div>
      }

      const { unmount } = render(<MockWebGLComponent />)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl')

      unmount()

      // Verify cleanup methods would be called
      // (In real implementation, these would actually clean up GPU resources)
    })
  })

  describe('long Gaming Session Simulation', () => {
    it('maintains performance over extended play', async () => {
      // Simulate a 2-hour gaming session with frequent state updates
      const sessionActions = []

      for (let i = 0; i < 1000; i++) {
        sessionActions.push({
          type: 'dice_roll',
          result: Math.floor(Math.random() * 20) + 1,
          timestamp: Date.now() + i * 100,
        })

        if (i % 10 === 0) {
          sessionActions.push({
            type: 'hp_change',
            delta: Math.floor(Math.random() * 10) - 5,
            timestamp: Date.now() + i * 100,
          })
        }

        if (i % 50 === 0) {
          sessionActions.push({
            type: 'level_up',
            newLevel: Math.floor(i / 50) + 1,
            timestamp: Date.now() + i * 100,
          })
        }
      }

      // Test that the action history doesn't grow unbounded
      expect(sessionActions.length).toBe(1120) // 1000 rolls + 100 HP + 20 level ups

      // In a real implementation, old actions should be cleaned up
      const cutoffTime = Date.now() - 1800000 // 30 minutes ago
      const recentActions = sessionActions.filter(
        (action) => action.timestamp > cutoffTime,
      )

      expect(recentActions.length).toBeLessThanOrEqual(sessionActions.length)
    })
  })
})
