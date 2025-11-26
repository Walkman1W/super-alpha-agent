import { Button } from './button'
import { Card, CardHeader, CardContent, CardFooter } from './card'

export function ExampleUI() {
  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Button Components</h2>
          <div className="space-x-4 mb-4">
            <Button variant="default">Default Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </div>
          <div className="space-x-4">
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Card Components</h2>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Card Title</h3>
            </CardHeader>
            <CardContent>
              <p>This is a card content example. It supports responsive layout and has hover effects.</p>
            </CardContent>
            <CardFooter>
              <Button>Action Button</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
