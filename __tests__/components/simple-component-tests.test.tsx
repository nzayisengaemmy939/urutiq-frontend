import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Import simple components that don't require complex context
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

describe('Simple Component Tests', () => {
  describe('Button Variations', () => {
    it('renders primary button', () => {
      render(<Button variant="default">Primary</Button>)
      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument()
    })

    it('renders secondary button', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    })

    it('renders destructive button', () => {
      render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    it('renders outline button', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument()
    })

    it('renders ghost button', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument()
    })

    it('renders link button', () => {
      render(<Button variant="link">Link</Button>)
      expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    })

    it('renders button with different sizes', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument()

      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument()
    })
  })

  describe('Card Variations', () => {
    it('renders card with header only', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Header Only</CardTitle>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Header Only')).toBeInTheDocument()
    })

    it('renders card with content only', () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      )
      expect(screen.getByText('Content Only')).toBeInTheDocument()
    })

    it('renders multiple cards', () => {
      render(
        <div>
          <Card>
            <CardContent>Card 1</CardContent>
          </Card>
          <Card>
            <CardContent>Card 2</CardContent>
          </Card>
        </div>
      )
      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
    })
  })

  describe('Badge Variations', () => {
    it('renders default badge', () => {
      render(<Badge>Default</Badge>)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('renders secondary badge', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('renders destructive badge', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('renders outline badge', () => {
      render(<Badge variant="outline">Outline</Badge>)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })
  })

  describe('Input Variations', () => {
    it('renders text input', () => {
      render(<Input type="text" placeholder="Text input" />)
      expect(screen.getByPlaceholderText('Text input')).toBeInTheDocument()
    })

    it('renders email input', () => {
      render(<Input type="email" placeholder="Email input" />)
      expect(screen.getByPlaceholderText('Email input')).toBeInTheDocument()
    })

    it('renders password input', () => {
      render(<Input type="password" placeholder="Password input" />)
      expect(screen.getByPlaceholderText('Password input')).toBeInTheDocument()
    })

    it('renders number input', () => {
      render(<Input type="number" placeholder="Number input" />)
      expect(screen.getByPlaceholderText('Number input')).toBeInTheDocument()
    })

    it('renders input with value', () => {
      render(<Input value="test value" readOnly />)
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
    })
  })

  describe('Label Variations', () => {
    it('renders label with htmlFor', () => {
      render(<Label htmlFor="test-input">Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders label without htmlFor', () => {
      render(<Label>Simple Label</Label>)
      expect(screen.getByText('Simple Label')).toBeInTheDocument()
    })
  })

  describe('Textarea Variations', () => {
    it('renders textarea with placeholder', () => {
      render(<Textarea placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders textarea with value', () => {
      render(<Textarea value="test content" readOnly />)
      expect(screen.getByDisplayValue('test content')).toBeInTheDocument()
    })

    it('renders disabled textarea', () => {
      render(<Textarea disabled placeholder="Disabled textarea" />)
      expect(screen.getByPlaceholderText('Disabled textarea')).toBeDisabled()
    })
  })

  describe('Form Integration', () => {
    it('renders complete form with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message" />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Contact Form')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
      expect(screen.getByText('Message')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    it('handles button clicks', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles input changes', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} placeholder="Type here" />)
      const input = screen.getByPlaceholderText('Type here')
      fireEvent.change(input, { target: { value: 'test' } })
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles textarea changes', () => {
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} placeholder="Type here" />)
      const textarea = screen.getByPlaceholderText('Type here')
      fireEvent.change(textarea, { target: { value: 'test content' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })
})
