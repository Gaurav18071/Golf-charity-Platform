"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  X,
  Link as LinkIcon,
} from "lucide-react";

interface CampaignImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
}

const PRESET_COVERS = [
  {
    title: "Championship Fairway",
    category: "Golf Tournament",
    url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Golden Hour Swing",
    category: "Sports & Charity",
    url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Youth Golf Academy",
    category: "Education & Youth",
    url: "https://images.unsplash.com/photo-1593111774642-a16223a54b38?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hope & Community Care",
    category: "Healthcare",
    url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Nature & Green Course",
    category: "Environment",
    url: "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Charity Cup Celebration",
    category: "Tournament",
    url: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80",
  },
];

export function CampaignImagePicker({ value, onChange }: CampaignImagePickerProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>(value || "");
  const [customInput, setCustomInput] = useState<string>(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    setCustomInput(url);
    onChange(url);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    setSelectedUrl(val);
    onChange(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert local file to base64 data URL for instant cover preview and saving
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        handleSelect(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setSelectedUrl("");
    setCustomInput("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-emerald-600" />
            Campaign Cover Photo
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose a high-resolution banner photo, upload your own, or paste an image URL.
          </p>
        </div>

        {selectedUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
          >
            <X className="h-3.5 w-3.5" />
            Remove Image
          </button>
        )}
      </div>

      {/* Live Preview */}
      {selectedUrl ? (
        <div className="relative h-56 w-full overflow-hidden rounded-xl border border-slate-200 shadow-xs">
          <Image
            src={selectedUrl}
            alt="Campaign Cover Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <span className="rounded-full bg-emerald-600/90 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Cover Image Selected
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload an image from your device
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            PNG, JPG, JPEG up to 10MB
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Preset Curated Gallery */}
      <div>
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Or Pick from Curated Golf & Charity Photos:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_COVERS.map((preset) => {
            const isChosen = selectedUrl === preset.url;
            return (
              <div
                key={preset.url}
                onClick={() => handleSelect(preset.url)}
                className={`group relative h-24 overflow-hidden rounded-xl border cursor-pointer transition-all ${
                  isChosen
                    ? "border-emerald-600 ring-2 ring-emerald-500 shadow-sm"
                    : "border-slate-200 hover:border-emerald-400 opacity-90 hover:opacity-100"
                }`}
              >
                <Image
                  src={preset.url}
                  alt={preset.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 flex flex-col justify-end">
                  <span className="text-[11px] font-bold text-white leading-tight line-clamp-1">
                    {preset.title}
                  </span>
                  <span className="text-[9px] text-emerald-300 font-medium">
                    {preset.category}
                  </span>
                </div>

                {isChosen && (
                  <div className="absolute top-1.5 right-1.5 rounded-full bg-emerald-600 p-1 text-white shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom URL Input Field */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
          Or Paste Direct Image URL:
        </label>
        <input
          type="url"
          value={customInput}
          onChange={handleCustomChange}
          placeholder="https://images.unsplash.com/photo-..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  );
}
