/**
 * Campaign Selector - Dropdown component for selecting campaigns
 */

import React from 'react'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, ChevronUp, Check, Scroll } from 'lucide-react'
import { useCampaignStore } from '../../../stores/campaignStore'
import { formatDateRelative } from '../../../campaignManagementMockData'

interface CampaignSelectorProps {
  onCampaignSelect: (campaignId: string | null) => void
  className?: string
}

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  onCampaignSelect,
  className = ''
}) => {
  const campaigns = useCampaignStore(state => state.campaigns)
  const activeCampaignId = useCampaignStore(state => state.activeCampaignId)

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId)

  return (
    <Select.Root 
      value={activeCampaignId || ''} 
      onValueChange={(value) => onCampaignSelect(value || null)}
    >
      <Select.Trigger 
        className={`inline-flex items-center justify-between gap-2 px-4 py-2 rounded-lg border transition-colors min-w-[200px] ${className}`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-primary)',
          borderOpacity: 0.2,
          color: 'var(--color-text-primary)'
        }}
      >
        <div className="flex items-center gap-2">
          <Scroll size={16} style={{ color: 'var(--color-primary)' }} />
          <Select.Value placeholder="Select Campaign">
            {activeCampaign ? activeCampaign.name : 'Select Campaign'}
          </Select.Value>
        </div>
        <Select.Icon>
          <ChevronDown size={16} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content 
          className="overflow-hidden rounded-lg border shadow-lg z-50"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-primary)',
            borderOpacity: 0.2
          }}
          position="popper"
          sideOffset={4}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-6">
            <ChevronUp size={16} />
          </Select.ScrollUpButton>
          
          <Select.Viewport className="p-1">
            {campaigns.length === 0 ? (
              <div 
                className="px-3 py-2 text-sm text-center"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No campaigns available
              </div>
            ) : (
              campaigns.map((campaign) => (
                <Select.Item
                  key={campaign.id}
                  value={campaign.id}
                  className="relative flex items-center px-3 py-2 rounded cursor-pointer select-none outline-none transition-colors"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Select.ItemIndicator className="absolute left-1 flex items-center">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                  </Select.ItemIndicator>
                  
                  <div className="ml-6 flex-1">
                    <Select.ItemText>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div 
                          className="text-xs mt-1"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {campaign.sessions.length} sessions • Last updated {formatDateRelative(campaign.lastModified)}
                        </div>
                        {campaign.description && (
                          <div 
                            className="text-xs mt-1 line-clamp-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </Select.ItemText>
                  </div>
                </Select.Item>
              ))
            )}
          </Select.Viewport>
          
          <Select.ScrollDownButton className="flex items-center justify-center h-6">
            <ChevronDown size={16} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}