"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";

export default function ImageUpload({ name = "photo_url", defaultValue = "", label = "Foto / Gambar" }) {
  const [preview, setPreview] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // We'll store either a string URL (if they just typed one) or a File (if they selected/dropped one).
  // The backend now supports both strings (via processImageUrl downloading them) and Files (via processImageUrl saving them).
  // But wait, the standard HTML form behavior is: if there's a file input, it sends the File.
  // We can just use an <input type="file" /> and an <input type="text" /> and sync them.
  // However, simpler is just using a single hidden file input, or a file input and a text input that get toggled.
  
  const [inputType, setInputType] = useState(defaultValue ? "url" : "file");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }
    
    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    
    // Assign file to input
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
    
    setInputType("file");
  };

  const clearImage = () => {
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setInputType("file");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button 
          type="button" 
          onClick={() => setInputType(inputType === "url" ? "file" : "url")}
          className="text-[10px] uppercase tracking-wider text-crimson-400 hover:text-crimson-300"
        >
          {inputType === "url" ? "Gunakan Upload File" : "Gunakan Link URL"}
        </button>
      </div>

      {inputType === "url" ? (
        <div>
          <input 
            type="text" 
            name={name} 
            className="field" 
            placeholder="https://..." 
            defaultValue={preview && !preview.startsWith("data:") ? preview : ""}
            onChange={(e) => setPreview(e.target.value)}
          />
        </div>
      ) : (
        <div 
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all ${
            isDragging ? "border-crimson-500 bg-crimson-500/10" : "border-slate-700 bg-black/20 hover:bg-black/40 hover:border-slate-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          {/* File Input */}
          <input 
            ref={fileInputRef}
            type="file" 
            name={name} 
            accept="image/*"
            className="hidden" 
            onChange={handleFileChange}
          />

          {preview ? (
            <div className="relative w-full aspect-[21/9] max-h-48 rounded overflow-hidden flex items-center justify-center bg-black/50">
              <img src={preview} alt="Preview" className="object-contain w-full h-full" />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-crimson-500 text-white rounded-md transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="text-center cursor-pointer pointer-events-none">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <UploadCloud className="size-5" />
              </div>
              <p className="text-sm font-medium text-slate-300">Klik untuk upload atau drag & drop</p>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, GIF (Max. 5MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
