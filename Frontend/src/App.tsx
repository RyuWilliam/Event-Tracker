import { MainLayout } from "@/core/layouts/MainLayout"
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, H1, H2, Body, Caption } from "@/shared/ui"

function App() {
  return (
    <MainLayout>
      <section className="mb-8 space-y-4">
        <H1>Event Tracker</H1>
        <Body>Manage your events efficiently with our modern tracking system.</Body>
        <Caption>Version 1.0.0</Caption>
      </section>

      <section className="mb-8 space-y-4">
        <H2>Button Variants</H2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <H2>Form Inputs</H2>
        <div className="max-w-md space-y-4">
          <Input placeholder="Event name" />
          <Input placeholder="Event description" />
          <Input type="date" />
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <H2>Event Card Example</H2>
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tech Conference 2026</CardTitle>
              <Badge variant="success">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Body>Join us for the biggest tech event of the year.</Body>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <H2>Badge Variants</H2>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>
    </MainLayout>
  )
}

export default App
