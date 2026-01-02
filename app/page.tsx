"use client"

// ... imports

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { AuthForm } from "@/components/auth-form"
import { ModeToggle } from "@/components/mode-toggle"
import { addMemo, deleteMemo, subscribeToMemos, updateMemo, type Memo } from "@/lib/db"
import { toast } from "sonner"

const memoColors = [
  "bg-[oklch(0.85_0.12_85)] dark:bg-[oklch(0.30_0.12_85)]", // Soft yellow
  "bg-[oklch(0.85_0.10_320)] dark:bg-[oklch(0.30_0.10_320)]", // Soft pink
  "bg-[oklch(0.85_0.10_180)] dark:bg-[oklch(0.30_0.10_180)]", // Soft cyan
  "bg-[oklch(0.85_0.10_140)] dark:bg-[oklch(0.30_0.10_140)]", // Soft green
  "bg-[oklch(0.85_0.10_50)] dark:bg-[oklch(0.30_0.10_50)]", // Soft orange
]

export default function MemoApp() {
  const { user, loading, logout } = useAuth()
  const [memos, setMemos] = useState<Memo[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  useEffect(() => {
    if (!user) {
      setMemos([])
      return
    }

    const unsubscribe = subscribeToMemos(user.uid, (data) => {
      setMemos(data)
    })

    return () => unsubscribe()
  }, [user])

  const handleAddMemo = async () => {
    if ((newTitle.trim() || newContent.trim()) && user) {
      try {
        await addMemo(
            user.uid,
            newTitle || "New Memo",
            newContent,
            memoColors[Math.floor(Math.random() * memoColors.length)],
        )
        toast.success("Memo added!")
        setNewTitle("")
        setNewContent("")
        setIsAdding(false)
      } catch (error) {
        toast.error("Failed to add memo")
        console.error(error)
      }
    }
  }

  const handleDeleteMemo = async (id: string) => {
    try {
      await deleteMemo(id)
      toast.success("Memo deleted")
    } catch (error) {
       toast.error("Failed to delete memo")
       console.error(error)
    }
  }

  const handleEditMemo = (id: string) => {
    const memo = memos.find((m) => m.id === id)
    if (memo) {
      setEditingId(id)
      setNewTitle(memo.title)
      setNewContent(memo.content)
    }
  }

  const handleSaveEdit = async () => {
    if (editingId !== null) {
      try {
        await updateMemo(editingId, newTitle, newContent)
        toast.success("Memo updated")
        setEditingId(null)
        setNewTitle("")
        setNewContent("")
      } catch (error) {
        toast.error("Failed to update memo")
        console.error(error)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewTitle("")
    setNewContent("")
    setIsAdding(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.95_0.03_320)] via-background to-[oklch(0.95_0.03_180)] p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
           <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
             My Memos ✨
           </h1>
           <p className="text-muted-foreground text-lg">Capture your brightest thoughts</p>
        </div>
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.95_0.03_320)] via-background to-[oklch(0.95_0.03_180)] dark:from-[oklch(0.2_0.03_320)] dark:to-[oklch(0.2_0.03_180)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative">
          <div className="absolute top-0 right-0 flex gap-2">
             <ModeToggle />
             <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            My Memos ✨
          </h1>
          <p className="text-muted-foreground text-lg">Welcome, {user.email}</p>
        </div>

        {/* Add Button */}
        {!isAdding && editingId === null && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setIsAdding(true)}
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Memo
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId !== null) && (
          <Card className="mb-8 p-6 shadow-xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-4">
              <Input
                placeholder="Memo title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-lg font-semibold border-2 focus-visible:ring-primary"
              />
              <Textarea
                placeholder="What's on your mind?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                className="resize-none border-2 focus-visible:ring-primary"
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancelEdit} className="rounded-full bg-transparent">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={editingId !== null ? handleSaveEdit : handleAddMemo}
                  className="rounded-full bg-primary text-primary-foreground"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {editingId !== null ? "Save" : "Add"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Memos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memos.map((memo) => (
            <Card
              key={memo.id}
              className={`${memo.color} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/50 animate-in fade-in slide-in-from-bottom-4 group`}
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold mb-3 text-foreground text-balance">{memo.title}</h3>
                <p className="text-foreground/80 whitespace-pre-wrap flex-grow leading-relaxed">{memo.content}</p>
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditMemo(memo.id)}
                    className="rounded-full bg-white/60 hover:bg-white/80 text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMemo(memo.id)}
                    className="rounded-full bg-white/60 hover:bg-white/80 text-foreground"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {memos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No memos yet! 📝</p>
            <p className="text-muted-foreground">Start capturing your thoughts above</p>
          </div>
        )}
      </div>
    </div>
  )
}

