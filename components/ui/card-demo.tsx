import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { Button } from './button'

export default function CardDemo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Card Component Demo</h1>

      {/* Variants Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Subtle shadow with hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                This is the default card variant with a light shadow that
                elevates on hover.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>More prominent shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                This card has a more prominent shadow for emphasis.
              </p>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>Border focus, no shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                This card uses a border instead of shadow for definition.
              </p>
            </CardContent>
          </Card>

          <Card variant="ghost">
            <CardHeader>
              <CardTitle>Ghost Card</CardTitle>
              <CardDescription>Minimal styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                This card has minimal styling and shows background on hover.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Padding Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Padding Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="sm">
            <CardHeader>
              <CardTitle>Small Padding</CardTitle>
              <CardDescription>Compact spacing (p-4)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Ideal for dense layouts or smaller cards.
              </p>
            </CardContent>
          </Card>

          <Card padding="default">
            <CardHeader>
              <CardTitle>Default Padding</CardTitle>
              <CardDescription>Standard spacing (p-6)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                The default padding works well for most use cases.
              </p>
            </CardContent>
          </Card>

          <Card padding="lg">
            <CardHeader>
              <CardTitle>Large Padding</CardTitle>
              <CardDescription>Generous spacing (p-8)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Use for hero cards or featured content.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Agent Card Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Agent Card Example</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" className="hover:scale-[1.02] cursor-pointer">
            <CardHeader>
              <CardTitle>ChatGPT Assistant</CardTitle>
              <CardDescription>AI-powered conversational agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Platform:</span>
                  <span>Web</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Pricing:</span>
                  <span>Free / Premium</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">AI Searches:</span>
                  <span className="font-semibold text-blue-600">1,234</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>

          <Card variant="default" className="hover:scale-[1.02] cursor-pointer">
            <CardHeader>
              <CardTitle>Code Interpreter</CardTitle>
              <CardDescription>Execute and analyze code snippets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Platform:</span>
                  <span>Web, API</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Pricing:</span>
                  <span>Premium</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">AI Searches:</span>
                  <span className="font-semibold text-blue-600">856</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>

          <Card variant="default" className="hover:scale-[1.02] cursor-pointer">
            <CardHeader>
              <CardTitle>Image Generator</CardTitle>
              <CardDescription>Create images from text descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Platform:</span>
                  <span>Web</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Pricing:</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">AI Searches:</span>
                  <span className="font-semibold text-blue-600">2,103</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Responsive Layout Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Responsive Layout</h2>
        <p className="text-gray-600 mb-4">
          Cards automatically adapt to different screen sizes. Try resizing your
          browser window.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} padding="sm">
              <CardHeader>
                <CardTitle className="text-base">Card {i}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  Responsive grid layout adapts to screen size
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Custom Styling Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Custom Styling</h2>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Custom Styled Card</CardTitle>
            <CardDescription className="text-blue-700">
              Cards accept custom className for additional styling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              You can combine the built-in variants with custom Tailwind classes
              to create unique designs that match your brand.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default">Learn More</Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}
