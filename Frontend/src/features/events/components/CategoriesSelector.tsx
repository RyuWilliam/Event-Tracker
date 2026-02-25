import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button, Input, Popover, PopoverContent, PopoverTrigger, Checkbox, Label } from "@/shared/ui"
import type { EventCategory } from "../types/event.types"
import { getCategories, createCategory } from "../services/eventsApi"

interface CategoriesSelectorProps {
  selected: EventCategory[]
  onChange: (categories: EventCategory[]) => void
}

export function CategoriesSelector({ selected, onChange }: CategoriesSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load categories"
      toast.error(message)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isCategorySelected = (categoryId: number) =>
    selected.some((cat) => cat.id === categoryId)

  const handleToggleCategory = (category: EventCategory) => {
    if (isCategorySelected(category.id)) {
      onChange(selected.filter((cat) => cat.id !== category.id))
    } else {
      onChange([...selected, category])
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsCreatingCategory(true)
    try {
      const newCategory = await createCategory(newCategoryName.trim())
      setCategories([...categories, newCategory])
      onChange([...selected, newCategory])
      setNewCategoryName("")
      setSearchQuery("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create category"
      toast.error(message)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button">
          Set categories {selected.length > 0 && `(${selected.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" sideOffset={4}>
        <div className="space-y-4">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />

          <div className="max-h-[250px] overflow-y-auto space-y-2">
            {isLoadingCategories ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading categories...
              </p>
            ) : filteredCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No categories found
              </p>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={isCategorySelected(category.id)}
                    onCheckedChange={() => handleToggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {category.name}
                  </Label>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            {isCreatingCategory ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                  className="h-9 flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCreateCategory()
                  }}
                  disabled={!newCategoryName.trim()}
                >
                  Add
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full"
                onClick={() => setIsCreatingCategory(true)}
              >
                + Add new category
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
