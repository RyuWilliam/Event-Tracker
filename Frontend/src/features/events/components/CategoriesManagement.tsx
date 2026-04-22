import { useState } from "react"
import type { ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Card, CardContent } from "@/shared/ui"
import { Trash2, Edit2, Check, X, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import type { EventCategory } from "@/features/events/types/event.types"
import { deleteCategory, updateCategory, createCategory } from "@/features/events/services/eventsApi"

interface CategoriesManagementProps {
  categories: EventCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCategoriesChange: (categories: EventCategory[]) => void
}

export function CategoriesManagement({
  categories,
  open,
  onOpenChange,
  onCategoriesChange,
}: CategoriesManagementProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<EventCategory | null>(null)

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty")
      return
    }

    try {
      setIsCreating(true)
      const newCategory = await createCategory(newCategoryName.trim())
      onCategoriesChange([...categories, newCategory])
      setNewCategoryName("")
      toast.success("Category created successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category")
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditStart = (category: EventCategory) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) {
      toast.error("Category name cannot be empty")
      return
    }

    try {
      setIsUpdating(id)
      await updateCategory(id, editingName.trim())
      onCategoriesChange(
        categories.map((cat) =>
          cat.id === id ? { ...cat, name: editingName.trim() } : cat
        )
      )
      setEditingId(null)
      setEditingName("")
      toast.success("Category updated successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category")
    } finally {
      setIsUpdating(id)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(categoryToDelete.id)
      await deleteCategory(categoryToDelete.id)
      onCategoriesChange(categories.filter((cat) => cat.id !== categoryToDelete.id))
      toast.success("Category deleted successfully!")
      setCategoryToDelete(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete category"
      if (errorMessage.includes("500") || errorMessage.includes("associated")) {
        toast.error("Cannot delete category with associated events")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Category */}
          <div className="border-b pb-4">
            <label className="text-sm font-medium block mb-2">Create New Category</label>
            <div className="flex gap-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewCategoryName(e.target.value)
                }
                disabled={isCreating}
              />
              <Button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>

          {/* Categories List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium block">Existing Categories</label>
              <div className="relative w-1/2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                  {searchQuery ? "No categories matched your search" : "No categories yet"}
                </p>
              ) : (
                filteredCategories.map((category) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        {editingId === category.id ? (
                          <>
                            <Input
                              value={editingName}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setEditingName(e.target.value)
                              }
                              className="flex-1"
                              disabled={isUpdating === category.id}
                            />
                            <Button
                              onClick={() => handleSaveEdit(category.id)}
                              size="sm"
                              variant="outline"
                              disabled={isUpdating === category.id}
                              className="gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingId(null)}
                              size="sm"
                              variant="outline"
                              disabled={isUpdating === category.id}
                              className="gap-2"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1">{category.name}</span>
                            <Button
                              onClick={() => handleEditStart(category)}
                              size="sm"
                              variant="outline"
                              disabled={isDeleting === category.id}
                              className="gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => setCategoryToDelete(category)}
                              size="sm"
                              variant="destructive"
                              disabled={isDeleting === category.id}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeleting === category.id ? "Deleting..." : "Delete"}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog that overrides default navigator's alert */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete the category <span className="font-semibold text-foreground">"{categoryToDelete?.name}"</span>?
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={!!isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={!!isDeleting}
              onClick={handleDeleteCategory}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
