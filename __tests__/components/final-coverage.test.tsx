import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Import working UI components
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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

describe('Final Coverage Test Suite', () => {
  describe('Button Component - Complete Coverage', () => {
    it('renders all button variants', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
      variants.forEach(variant => {
        const { unmount } = render(<Button variant={variant}>{variant}</Button>)
        expect(screen.getByRole('button', { name: variant })).toBeInTheDocument()
        unmount()
      })
    })

    it('renders all button sizes', () => {
      const sizes = ['default', 'sm', 'lg', 'icon'] as const
      sizes.forEach(size => {
        const { unmount } = render(<Button size={size}>{size}</Button>)
        expect(screen.getByRole('button', { name: size })).toBeInTheDocument()
        unmount()
      })
    })

    it('handles all button states', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
    })

    it('handles button events', () => {
      const handleClick = jest.fn()
      const handleMouseOver = jest.fn()
      const handleMouseOut = jest.fn()
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(
        <Button 
          onClick={handleClick} 
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          Event Button
        </Button>
      )
      
      const button = screen.getByRole('button', { name: 'Event Button' })
      fireEvent.click(button)
      fireEvent.mouseOver(button)
      fireEvent.mouseOut(button)
      fireEvent.focus(button)
      fireEvent.blur(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
      expect(handleMouseOver).toHaveBeenCalledTimes(1)
      expect(handleMouseOut).toHaveBeenCalledTimes(1)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('renders button with custom className', () => {
      render(<Button className="custom-button">Custom</Button>)
      expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    })
  })

  describe('Card Component - Complete Coverage', () => {
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

    it('renders card with footer only', () => {
      render(
        <Card>
          <CardFooter>Footer Only</CardFooter>
        </Card>
      )
      expect(screen.getByText('Footer Only')).toBeInTheDocument()
    })

    it('renders multiple cards', () => {
      render(
        <div>
          <Card><CardContent>Card 1</CardContent></Card>
          <Card><CardContent>Card 2</CardContent></Card>
          <Card><CardContent>Card 3</CardContent></Card>
        </div>
      )
      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
      expect(screen.getByText('Card 3')).toBeInTheDocument()
    })
  })

  describe('Badge Component - Complete Coverage', () => {
    it('renders all badge variants', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const
      variants.forEach(variant => {
        const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
        expect(screen.getByText(variant)).toBeInTheDocument()
        unmount()
      })
    })

    it('renders badge with custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>)
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })
  })

  describe('Input Component - Complete Coverage', () => {
    it('renders input with all types', () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const
      types.forEach(type => {
        const { unmount } = render(<Input type={type} placeholder={`${type} input`} />)
        expect(screen.getByPlaceholderText(`${type} input`)).toBeInTheDocument()
        unmount()
      })
    })

    it('handles input events', () => {
      const handleChange = jest.fn()
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const handleKeyDown = jest.fn()
      const handleKeyUp = jest.fn()
      
      render(
        <Input 
          onChange={handleChange} 
          onFocus={handleFocus} 
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder="Event input" 
        />
      )
      
      const input = screen.getByPlaceholderText('Event input')
      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.focus(input)
      fireEvent.blur(input)
      fireEvent.keyDown(input, { key: 'Enter' })
      fireEvent.keyUp(input, { key: 'Enter' })
      
      expect(handleChange).toHaveBeenCalled()
      expect(handleFocus).toHaveBeenCalled()
      expect(handleBlur).toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalled()
      expect(handleKeyUp).toHaveBeenCalled()
    })

    it('renders input with different states', () => {
      render(<Input disabled placeholder="Disabled input" />)
      expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
    })

    it('renders input with value', () => {
      render(<Input value="test value" readOnly />)
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
    })
  })

  describe('Textarea Component - Complete Coverage', () => {
    it('renders textarea with different props', () => {
      render(
        <Textarea 
          placeholder="Enter text" 
          rows={5} 
          cols={50} 
          maxLength={100}
          disabled={false}
        />
      )
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('handles textarea events', () => {
      const handleChange = jest.fn()
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(
        <Textarea 
          onChange={handleChange} 
          onFocus={handleFocus} 
          onBlur={handleBlur} 
          placeholder="Event textarea" 
        />
      )
      
      const textarea = screen.getByPlaceholderText('Event textarea')
      fireEvent.change(textarea, { target: { value: 'test content' } })
      fireEvent.focus(textarea)
      fireEvent.blur(textarea)
      
      expect(handleChange).toHaveBeenCalled()
      expect(handleFocus).toHaveBeenCalled()
      expect(handleBlur).toHaveBeenCalled()
    })

    it('renders disabled textarea', () => {
      render(<Textarea disabled placeholder="Disabled textarea" />)
      expect(screen.getByPlaceholderText('Disabled textarea')).toBeDisabled()
    })
  })

  describe('Label Component - Complete Coverage', () => {
    it('renders label with htmlFor', () => {
      render(<Label htmlFor="test-input">Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders label without htmlFor', () => {
      render(<Label>Simple Label</Label>)
      expect(screen.getByText('Simple Label')).toBeInTheDocument()
    })

    it('renders label with custom className', () => {
      render(<Label className="custom-label">Custom Label</Label>)
      expect(screen.getByText('Custom Label')).toBeInTheDocument()
    })
  })

  describe('Progress Component - Complete Coverage', () => {
    it('renders progress with different values', () => {
      const values = [0, 25, 50, 75, 100]
      values.forEach(value => {
        const { unmount } = render(<Progress value={value} />)
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        unmount()
      })
    })

    it('renders progress with custom className', () => {
      render(<Progress value={50} className="custom-progress" />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('Select Component - Complete Coverage', () => {
    it('renders select with multiple options', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Tabs Component - Complete Coverage', () => {
    it('renders tabs with multiple tabs', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      )
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Tab 3')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })
  })

  describe('Checkbox Component - Complete Coverage', () => {
    it('renders checkbox', () => {
      render(<Checkbox />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders checked checkbox', () => {
      render(<Checkbox checked />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('renders disabled checkbox', () => {
      render(<Checkbox disabled />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('handles checkbox events', () => {
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Switch Component - Complete Coverage', () => {
    it('renders switch', () => {
      render(<Switch />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('renders checked switch', () => {
      render(<Switch checked />)
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('renders disabled switch', () => {
      render(<Switch disabled />)
      expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('handles switch events', () => {
      const handleChange = jest.fn()
      render(<Switch onChange={handleChange} />)
      const switchElement = screen.getByRole('switch')
      fireEvent.click(switchElement)
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Slider Component - Complete Coverage', () => {
    it('renders slider', () => {
      render(<Slider defaultValue={[50]} max={100} step={1} />)
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('renders slider with different values', () => {
      const values = [0, 25, 50, 75, 100]
      values.forEach(value => {
        const { unmount } = render(<Slider defaultValue={[value]} max={100} step={1} />)
        expect(screen.getByRole('slider')).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Avatar Component - Complete Coverage', () => {
    it('renders avatar with fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders avatar with image', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('Table Component - Complete Coverage', () => {
    it('renders table', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header 1</TableHead>
              <TableHead>Header 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Header 1')).toBeInTheDocument()
      expect(screen.getByText('Cell 1')).toBeInTheDocument()
    })

    it('renders table with multiple rows', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
              <TableCell>Value 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 2</TableCell>
              <TableCell>Value 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
      expect(screen.getByText('Row 1')).toBeInTheDocument()
      expect(screen.getByText('Row 2')).toBeInTheDocument()
    })
  })

  describe('Accordion Component - Complete Coverage', () => {
    it('renders accordion', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
      expect(screen.getByText('Is it accessible?')).toBeInTheDocument()
    })

    it('renders accordion with multiple items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      )
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  describe('Alert Component - Complete Coverage', () => {
    it('renders alert', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert description')).toBeInTheDocument()
    })

    it('renders alert with different variants', () => {
      const variants = ['default', 'destructive'] as const
      variants.forEach(variant => {
        const { unmount } = render(
          <Alert variant={variant}>
            <AlertTitle>{variant} Alert</AlertTitle>
            <AlertDescription>This is a {variant} alert</AlertDescription>
          </Alert>
        )
        expect(screen.getByText(`${variant} Alert`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Skeleton Component - Complete Coverage', () => {
    it('renders skeleton', () => {
      render(<Skeleton className="w-[100px] h-[20px] rounded-full" />)
      // Skeleton renders as a div with specific classes
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders skeleton with different sizes', () => {
      const sizes = [
        'w-[50px] h-[10px]',
        'w-[100px] h-[20px]',
        'w-[200px] h-[30px]'
      ]
      sizes.forEach(size => {
        const { unmount } = render(<Skeleton className={size} />)
        const skeleton = document.querySelector('.animate-pulse')
        expect(skeleton).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Complex Component Integration', () => {
    it('renders complex dashboard layout', () => {
      render(
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      <span>Status</span>
                    </div>
                    <Progress value={75} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Label htmlFor="input">Input Field</Label>
                    <Input id="input" placeholder="Enter value" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Tabs defaultValue="tab1">
                      <TabsList>
                        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      </TabsList>
                      <TabsContent value="tab1">Content 1</TabsContent>
                      <TabsContent value="tab2">Content 2</TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByText('Input Field')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('renders form with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Form</CardTitle>
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
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <div>
                <Label>Priority Level</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit</Button>
                <Button type="button" variant="outline">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Complete Form')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
      expect(screen.getByText('Message')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument()
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
      expect(screen.getByText('Enable notifications')).toBeInTheDocument()
      expect(screen.getByText('Priority Level')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('Utility Function Coverage', () => {
    it('tests cn utility function comprehensively', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
      expect(cn('base', undefined, null)).toBe('base')
      expect(cn('base', 'class1', 'class2')).toBe('base class1 class2')
      expect(cn('base', { 'conditional': true, 'hidden': false })).toBe('base conditional')
      expect(cn()).toBe('')
      expect(cn('single')).toBe('single')
    })
  })
})
