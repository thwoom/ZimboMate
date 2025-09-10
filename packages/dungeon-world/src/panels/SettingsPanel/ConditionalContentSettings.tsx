import React from 'react'
import { createPanel } from '../../framework/Panel'
import { useGameStore } from '../../store/GameStore'
import './ConditionalContentSettings.css'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  preferClassRelevant: z.boolean(),
  showAllMoves: z.boolean(),
  showAllEquipment: z.boolean(),
  showSpellsForNonCasters: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const ConditionalContentSettings: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const cc = state.settings.conditionalContent!

  const { register, handleSubmit, formState: { isDirty }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferClassRelevant: cc.global.preferClassRelevant,
      showAllMoves: cc.global.showAllMoves,
      showAllEquipment: cc.global.showAllEquipment,
      showSpellsForNonCasters: cc.global.showSpellsForNonCasters,
    },
    mode: 'onSubmit',
  })

  const onSubmit = (values: FormValues) => {
    updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, ...values } } })
    reset(values, { keepValues: true })
  }

  return (
    <div className="settings-conditional">
      <h2>Conditional Content</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label>
            <input type="checkbox" {...register('preferClassRelevant')} defaultChecked={cc.global.preferClassRelevant} />{' '}
            Prefer class-relevant content
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" {...register('showAllMoves')} defaultChecked={cc.global.showAllMoves} />{' '}
            Show all moves
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" {...register('showAllEquipment')} defaultChecked={cc.global.showAllEquipment} />{' '}
            Show all equipment
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" {...register('showSpellsForNonCasters')} defaultChecked={cc.global.showSpellsForNonCasters} />{' '}
            Show spells for non-casters
          </label>
        </div>
        <div className="is-button-row">
          <button type="submit" disabled={!isDirty}>Apply</button>
        </div>
      </form>
    </div>
  )
}

export default createPanel(
  {
    id: 'settings-conditional',
    name: 'Conditional Content',
    icon: '⚙️',
    priority: 10,
  },
  ConditionalContentSettings,
)


