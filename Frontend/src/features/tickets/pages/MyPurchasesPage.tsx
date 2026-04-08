import { MyPurchasesView } from "@/features/tickets"
import { MainLayout } from "@/core/layouts/MainLayout"

export function MyPurchasesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <MyPurchasesView />
      </div>
    </MainLayout>
  )
}
