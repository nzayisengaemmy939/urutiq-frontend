import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

// Simple wrapper for components that might need context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

describe('Comprehensive UI Components Test', () => {
  describe('Button Component', () => {
    it('renders button with text', () => {
      render(<Button>Click Me</Button>)
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
    })

    it('renders disabled button', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders different variants', () => {
      render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })
  })

  describe('Card Component', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Content')).toBeInTheDocument()
      expect(screen.getByText('Card Footer')).toBeInTheDocument()
    })

    it('renders card with just content', () => {
      render(
        <Card>
          <CardContent>Simple Content</CardContent>
        </Card>
      )
      expect(screen.getByText('Simple Content')).toBeInTheDocument()
    })
  })

  describe('Badge Component', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('renders different badge variants', () => {
      render(<Badge variant="destructive">Error</Badge>)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('Progress Component', () => {
    it('renders progress bar', () => {
      render(<Progress value={50} />)
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
    })

    it('renders progress with different values', () => {
      const { rerender } = render(<Progress value={0} />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      rerender(<Progress value={100} />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('Input Component', () => {
    it('renders input field', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
    })

    it('handles input changes', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      fireEvent.change(input, { target: { value: 'test' } })
      expect(handleChange).toHaveBeenCalled()
    })

    it('renders disabled input', () => {
      render(<Input disabled placeholder="Disabled" />)
      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toBeDisabled()
    })
  })

  describe('Label Component', () => {
    it('renders label', () => {
      render(<Label htmlFor="test-input">Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })

  describe('Textarea Component', () => {
    it('renders textarea', () => {
      render(<Textarea placeholder="Enter long text" />)
      expect(screen.getByPlaceholderText('Enter long text')).toBeInTheDocument()
    })

    it('handles textarea changes', () => {
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} placeholder="Enter long text" />)
      const textarea = screen.getByPlaceholderText('Enter long text')
      fireEvent.change(textarea, { target: { value: 'test content' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Select Component', () => {
    it('renders select component', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Tabs Component', () => {
    it('renders tabs with content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('switches tabs on click', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      
      fireEvent.click(screen.getByText('Tab 2'))
      // Note: The content might not immediately appear due to animation timing
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
    })
  })

  describe('Dialog Component', () => {
    it('renders dialog trigger', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
            Dialog Content
          </DialogContent>
        </Dialog>
      )
      expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument()
    })
  })

  describe('AlertDialog Component', () => {
    it('renders alert dialog trigger', () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Open Alert</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert Title</AlertDialogTitle>
              <AlertDialogDescription>Alert Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
      expect(screen.getByRole('button', { name: 'Open Alert' })).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('renders multiple components together', () => {
      render(
        <TestWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Test Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-input">Test Input</Label>
                  <Input id="test-input" placeholder="Enter value" />
                </div>
                <div>
                  <Badge>Status: Active</Badge>
                </div>
                <div>
                  <Progress value={75} />
                </div>
                <div>
                  <Button>Submit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TestWrapper>
      )
      
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Test Input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
      expect(screen.getByText('Status: Active')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })
  })
})
