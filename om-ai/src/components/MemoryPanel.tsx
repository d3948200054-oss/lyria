import React, { useState } from "react";
import { MemoryItem } from "../types";
import { Plus, Trash2, Edit2, Check, X, Bookmark, Target, Settings, BrainCircuit, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MemoryPanelProps {
  memories: MemoryItem[];
  onAddMemory: (text: string, category: MemoryItem["category"]) => void;
  onUpdateMemory: (id: string, text: string, category: MemoryItem["category"]) => void;
  onDeleteMemory: (id: string) => void;
  isSaving: boolean;
}

const CATEGORY_ICONS: Record<MemoryItem["category"], any> = {
  "Personal Info": User,
  Preferences: Bookmark,
  Goals: Target,
  "Technical Details": Settings,
  Other: BrainCircuit,
};

const CATEGORY_COLORS: Record<MemoryItem["category"], { border: string; bg: string; text: string; glow: string }> = {
  "Personal Info": {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  Preferences: {
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    glow: "shadow-pink-500/20",
  },
  Goals: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
  "Technical Details": {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  Other: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
};

export default function MemoryPanel({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  isSaving,
}: MemoryPanelProps) {
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryItem["category"]>("Personal Info");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<MemoryItem["category"]>("Personal Info");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddMemory(newText.trim(), newCategory);
    setNewText("");
  };

  const startEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditCategory(item.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateMemory(id, editText.trim(), editCategory);
    setEditingId(null);
    setEditText("");
  };

  const categories: MemoryItem["category"][] = [
    "Personal Info",
    "Preferences",
    "Goals",
    "Technical Details",
    "Other",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="memory-panel-root">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
            om's Persistent Memory
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            om automatically remembers your goals, interests, and preferences across visits. You can also edit them here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-xs bg-white/5 border border-white/10 text-indigo-300 px-3 py-1 rounded-full animate-pulse">
              Saving to memory...
            </span>
          ) : (
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
              Memory Synced
            </span>
          )}
        </div>
      </div>

      {/* Manual Memory Addition Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md shadow-lg flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add a preference (e.g., I want to edit my coding channel videos in lofi style)"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryItem["category"])}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-neutral-900">
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add Fact
          </button>
        </div>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const categoryMemories = memories.filter((m) => m.category === category);
          const colors = CATEGORY_COLORS[category];
          const Icon = CATEGORY_ICONS[category];

          return (
            <div
              key={category}
              className={`bg-white/[0.02] border ${colors.border} rounded-2xl p-5 backdrop-blur-md flex flex-col min-h-[160px] shadow-sm transition-all duration-300`}
            >
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                <div className={`${colors.bg} p-2 rounded-lg ${colors.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-base">{category}</h3>
                <span className="ml-auto text-xs text-gray-500">
                  {categoryMemories.length} {categoryMemories.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {categoryMemories.length === 0 ? (
                  <p className="text-gray-500 text-xs italic my-auto text-center py-4">
                    No memories saved in this category yet. Tell om to "remember this..."
                  </p>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {categoryMemories.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-black/35 border border-white/5 rounded-xl p-3 flex items-start gap-2 relative group hover:border-white/10 transition-colors"
                        >
                          {editingId === item.id ? (
                            <div className="flex-1 flex flex-col gap-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-indigo-500 h-16 resize-none"
                              />
                              <div className="flex items-center justify-between">
                                <select
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value as MemoryItem["category"])}
                                  className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                                >
                                  {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => saveEdit(item.id)}
                                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-colors cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="text-white text-sm leading-relaxed">{item.text}</p>
                                <span className="text-[10px] text-gray-500 mt-1 block">
                                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-black/80 backdrop-blur-sm p-1 rounded-md border border-white/5">
                                <button
                                  onClick={() => startEdit(item)}
                                  className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
                                  title="Edit memory"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteMemory(item.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                                  title="Delete memory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
