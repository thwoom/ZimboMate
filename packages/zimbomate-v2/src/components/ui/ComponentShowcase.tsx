import React, { useState } from 'react'
import { 
  Button, 
  Input, 
  Textarea, 
  Badge, 
  Progress, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './index'
import { Sword, Shield, Heart, Zap, Star, Settings } from 'lucide-react'

export const ComponentShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-md mb-6">Base UI Components</h2>
        <div className="grid gap-8">
          
          {/* Buttons Section */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Interactive buttons with various styles and magical effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="magical">Magical</Button>
                  <Button variant="cyber">Cyber</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon">
                    <Settings size={16} />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">
                    <Sword size={16} />
                    Attack
                  </Button>
                  <Button variant="secondary">
                    <Shield size={16} />
                    Defend
                  </Button>
                  <Button variant="magical">
                    <Star size={16} />
                    Cast Spell
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inputs Section */}
          <Card variant="magical" padding="lg">
            <CardHeader>
              <CardTitle>Form Inputs</CardTitle>
              <CardDescription>
                Beautiful form inputs with fantasy styling and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Character Name"
                    placeholder="Enter your character's name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  
                  <Input
                    label="Magical Input"
                    variant="magical"
                    placeholder="Enchanted field"
                    helper="This field has magical properties"
                  />
                  
                  <Input
                    label="Error Example"
                    error="This field is required"
                    placeholder="Invalid input"
                  />
                  
                  <Input
                    label="Cyber Input"
                    variant="cyber"
                    placeholder="Futuristic field"
                  />
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    label="Character Background"
                    placeholder="Tell your character's story..."
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    rows={4}
                  />
                  
                  <Textarea
                    label="Magical Notes"
                    variant="magical"
                    placeholder="Enchanted notes..."
                    helper="Use this for spell descriptions"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Badges & Status Indicators</CardTitle>
              <CardDescription>
                Status badges for character attributes and game states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="magical">Magical</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Danger</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="health">
                    <Heart size={12} />
                    Healthy
                  </Badge>
                  <Badge variant="mana">
                    <Zap size={12} />
                    Full Mana
                  </Badge>
                  <Badge variant="experience">
                    <Star size={12} />
                    Level 5
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bars Section */}
          <Card variant="parchment" padding="lg">
            <CardHeader>
              <CardTitle>Progress Indicators</CardTitle>
              <CardDescription>
                Health bars, mana, and experience tracking with animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Progress
                  variant="health"
                  value={85}
                  max={100}
                  showLabel
                  label="Health Points"
                />
                
                <Progress
                  variant="health"
                  value={35}
                  max={100}
                  showLabel
                  label="Injured Character"
                />
                
                <Progress
                  variant="health"
                  value={15}
                  max={100}
                  showLabel
                  label="Critical Health"
                />
                
                <Progress
                  variant="mana"
                  value={60}
                  max={100}
                  showLabel
                  label="Mana Points"
                />
                
                <Progress
                  variant="experience"
                  value={750}
                  max={1000}
                  showLabel
                  label="Experience"
                />
                
                <Progress
                  variant="default"
                  value={40}
                  max={100}
                  showLabel
                  label="Quest Progress"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card Variants Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm">
                  This is a default card with standard styling and hover effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
            
            <Card variant="magical">
              <CardHeader>
                <CardTitle>Magical Card</CardTitle>
                <CardDescription>Enchanted with magical effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm">
                  This card has magical styling with glowing effects and parchment texture.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="magical" size="sm">
                  <Star size={14} />
                  Cast
                </Button>
              </CardFooter>
            </Card>
            
            <Card variant="cyber">
              <CardHeader>
                <CardTitle>Cyber Card</CardTitle>
                <CardDescription>Futuristic sci-fi styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm">
                  This card features cyber styling with circuit patterns and neon effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="cyber" size="sm">
                  Execute
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}