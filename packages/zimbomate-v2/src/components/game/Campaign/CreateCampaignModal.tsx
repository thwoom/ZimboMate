/**
 * Create Campaign Modal - Modal dialog for creating new campaigns
 */

import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Form from '@radix-ui/react-form'
import { X, Scroll, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { useCampaignStore } from '../../../stores/campaignStore'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignCreated?: (campaignId: string) => void
}

interface CampaignFormData {
  name: string
  description: string
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState<Partial<CampaignFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createCampaign = useCampaignStore(state => state.createCampaign)
  const campaigns = useCampaignStore(state => state.campaigns)

  const validateForm = (): boolean => {
    const newErrors: Partial<CampaignFormData> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Campaign name must be at least 2 characters'
    } else if (campaigns.some(c => c.name.toLowerCase() === formData.name.trim().toLowerCase())) {
      newErrors.name = 'A campaign with this name already exists'
    }

    // Description is optional, but if provided should have minimum length
    if (formData.description.trim() && formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters if provided'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const campaign = createCampaign(
        formData.name.trim(),
        formData.description.trim() || undefined
      )

      // Reset form
      setFormData({ name: '', description: '' })
      setErrors({})
      
      // Notify parent component
      onCampaignCreated?.(campaign.id)
      
      // Close modal
      onClose()
    } catch (error) {
      console.error('Failed to create campaign:', error)
      setErrors({ name: 'Failed to create campaign. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', description: '' })
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
          <Card variant="magical" padding="none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                  >
                    <Scroll 
                      size={20} 
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <CardTitle>Create New Campaign</CardTitle>
                </div>
                <Dialog.Close asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </Button>
                </Dialog.Close>
              </div>
            </CardHeader>
            
            <CardContent>
              <Form.Root onSubmit={handleSubmit} className="space-y-6">
                <Form.Field name="name">
                  <Input
                    label="Campaign Name"
                    placeholder="Enter campaign name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    disabled={isSubmitting}
                    required
                    maxLength={100}
                  />
                </Form.Field>

                <Form.Field name="description">
                  <Textarea
                    label="Description (Optional)"
                    placeholder="Describe your campaign world, themes, or goals..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    error={errors.description}
                    disabled={isSubmitting}
                    rows={4}
                    maxLength={500}
                  />
                </Form.Field>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Form.Submit asChild>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting || !formData.name.trim()}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Create Campaign
                        </>
                      )}
                    </Button>
                  </Form.Submit>
                </div>
              </Form.Root>
            </CardContent>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}