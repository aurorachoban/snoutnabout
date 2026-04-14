"use client";

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Image from "next/image";

const CATEGORIES = ["dog", "cat"];
const TYPES = ["food", "treats", "toys", "accessories", "grooming", "health"];

/**
 * AddProductForm Component
 *
 * A comprehensive form for administrators to add new products to the database.
 * Handles product details, image uploads, variants, and ingredient information.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onAdded - Callback function called after successful product addition
 */
export default function AddProductForm({ onAdded }) {
  const fileInputRef = useRef(null);

  // State for image previews and uploads
  const [previews, setPreviews] = useState([]); // { file, url }[]
  const [uploadProgress, setUploadProgress] = useState(null);

  // Form submission states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Main product form data
  const [form, setForm] = useState({
    name: "",
    category: "dog",
    type: "food",
    price: "",
    description: "",
    featured: false,
    inStock: true,
    features: "",
    ingredientsFull: "",
  });

  // Product variants: [{label, price}]
  const [variants, setVariants] = useState([]);

  // Ingredient highlights: [{name, emoji, benefit}]
  const [highlights, setHighlights] = useState([]);

  // Ingredient breakdown: [{name, pct}]
  const [breakdown, setBreakdown] = useState([]);

  /**
   * Handles changes to the main form inputs
   */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  /**
   * Handles file selection for image uploads
   */
  function handleFiles(e) {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((p) => [...p, ...newPreviews]);
  }

  /**
   * Removes a preview image at the specified index
   */
  function removePreview(i) {
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  // --- Variant helpers ---
  /**
   * Adds a new empty variant to the variants array
   */
  function addVariant() {
    setVariants((v) => [...v, { label: "", price: "" }]);
  }

  /**
   * Updates a specific variant's field at the given index
   */
  function updateVariant(i, key, value) {
    setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  }

  /**
   * Removes a variant at the specified index
   */
  function removeVariant(i) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  // --- Highlight helpers ---
  /**
   * Adds a new empty ingredient highlight
   */
  function addHighlight() {
    setHighlights((h) => [...h, { name: "", emoji: "", benefit: "" }]);
  }

  /**
   * Updates a specific highlight's field at the given index
   */
  function updateHighlight(i, key, value) {
    setHighlights((h) => h.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  }

  /**
   * Removes a highlight at the specified index
   */
  function removeHighlight(i) {
    setHighlights((h) => h.filter((_, idx) => idx !== i));
  }

  // --- Breakdown helpers ---
  /**
   * Adds a new empty ingredient breakdown entry
   */
  function addBreakdown() {
    setBreakdown((b) => [...b, { name: "", pct: "" }]);
  }

  /**
   * Updates a specific breakdown entry's field at the given index
   */
  function updateBreakdown(i, key, value) {
    setBreakdown((b) => b.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  }

  /**
   * Removes a breakdown entry at the specified index
   */
  function removeBreakdown(i) {
    setBreakdown((b) => b.filter((_, idx) => idx !== i));
  }

  /**
   * Uploads all selected images to Firebase Storage and returns their download URLs
   * @returns {Promise<string[]>} Array of image URLs
   */
  async function uploadImages() {
    if (previews.length === 0) return [];
    const urls = [];
    for (let i = 0; i < previews.length; i++) {
      const { file } = previews[i];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setUploadProgress(`Uploading image ${i + 1}/${previews.length} — ${pct}%`);
          },
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            urls.push(url);
            resolve();
          }
        );
      });
    }
    setUploadProgress(null);
    return urls;
  }

  /**
   * Handles form submission: validates input, uploads images, and saves product to Firestore
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.price || isNaN(Number(form.price))) { setError("A valid price is required."); return; }

    setLoading(true);
    try {
      // 1. Upload images
      const imageUrls = await uploadImages();

      // 2. Build product document
      const features = form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const ingredientsPayload = {};
      if (breakdown.length > 0) {
        ingredientsPayload.breakdown = Object.fromEntries(
          breakdown.filter((b) => b.name && b.pct).map((b) => [b.name, b.pct])
        );
      }
      if (highlights.length > 0) {
        ingredientsPayload.highlights = highlights.filter((h) => h.name);
      }
      if (form.ingredientsFull.trim()) {
        ingredientsPayload.full = form.ingredientsFull.trim();
      }

      const parsedVariants = variants
        .filter((v) => v.label && v.price)
        .map((v) => ({ label: v.label, price: parseFloat(v.price) }));

      const productData = {
        name: form.name.trim(),
        category: form.category,
        type: form.type,
        price: parseFloat(form.price),
        description: form.description.trim(),
        featured: form.featured,
        inStock: form.inStock,
        ...(imageUrls.length > 0 && {
          images: imageUrls,
          image: imageUrls[0],
        }),
        ...(features.length > 0 && { features }),
        ...(Object.keys(ingredientsPayload).length > 0 && { ingredients: ingredientsPayload }),
        ...(parsedVariants.length > 0 && { variants: parsedVariants }),
        rating: 0,
        reviewCount: 0,
        popularity: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "products"), productData);

      setSuccess(`"${form.name}" added successfully!`);
      setForm({ name: "", category: "dog", type: "food", price: "", description: "", featured: false, inStock: true, features: "", ingredientsFull: "" });
      setPreviews([]);
      setVariants([]);
      setHighlights([]);
      setBreakdown([]);
      onAdded?.();
    } catch (err) {
      console.error(err);
      setError("Failed to add product. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  // CSS class constants for consistent styling
  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 transition-colors bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Basic Product Information Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-black text-gray-900 text-lg">Basic Info</h3>

        <div>
          <label className={labelClass}>Product Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Chicken & Rice Dog Food" className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Base Price ($) *</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" placeholder="19.99" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the product..." className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Feature Badges <span className="font-normal text-gray-400">(comma-separated)</span></label>
          <input type="text" name="features" value={form.features} onChange={handleChange} placeholder="Grain free, Vet approved, High protein" className={inputClass} />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-pink-500" />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} className="w-4 h-4 accent-pink-500" />
            In stock
          </label>
        </div>
      </section>

      {/* Product Images Upload Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-black text-gray-900 text-lg">Product Images</h3>
        <p className="text-xs text-gray-400">First image becomes the main photo. Supports JPG, PNG, WebP.</p>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl p-8 text-center cursor-pointer transition-colors"
        >
          <p className="text-3xl mb-2">📷</p>
          <p className="text-sm font-semibold text-gray-600">Click to upload images</p>
          <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-gray-100">
                <Image src={p.url} alt={`preview ${i}`} fill className="object-cover" sizes="80px" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-pink-500/80 text-white text-[9px] font-bold text-center py-0.5">
                    MAIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {uploadProgress && (
          <div className="text-sm text-pink-500 font-medium animate-pulse">{uploadProgress}</div>
        )}
      </section>

      {/* Product Variants Section (e.g., different sizes/packs) */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Size / Pack Variants</h3>
            <p className="text-xs text-gray-400 mt-0.5">Optional — e.g. 1kg, 2kg, 5kg</p>
          </div>
          <button type="button" onClick={addVariant} className="text-sm text-pink-500 font-semibold hover:underline">+ Add</button>
        </div>

        {variants.map((v, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input
              type="text"
              value={v.label}
              onChange={(e) => updateVariant(i, "label", e.target.value)}
              placeholder="Label (e.g. 2kg)"
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              value={v.price}
              onChange={(e) => updateVariant(i, "price", e.target.value)}
              placeholder="Price"
              min="0"
              step="0.01"
              className={`${inputClass} w-28`}
            />
            <button type="button" onClick={() => removeVariant(i)} className="text-gray-300 hover:text-red-400 transition-colors text-lg font-bold">✕</button>
          </div>
        ))}
      </section>

      {/* Ingredients Information Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h3 className="font-black text-gray-900 text-lg">Ingredients <span className="font-normal text-gray-400 text-sm">(optional)</span></h3>

        {/* Breakdown percentages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={labelClass + " mb-0"}>Breakdown Percentages</p>
            <button type="button" onClick={addBreakdown} className="text-sm text-pink-500 font-semibold hover:underline">+ Add</button>
          </div>
          <div className="space-y-2">
            {breakdown.map((b, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input type="text" value={b.name} onChange={(e) => updateBreakdown(i, "name", e.target.value)} placeholder="Ingredient (e.g. Chicken)" className={`${inputClass} flex-1`} />
                <input type="text" value={b.pct} onChange={(e) => updateBreakdown(i, "pct", e.target.value)} placeholder="Amount (e.g. 31%)" className={`${inputClass} w-32`} />
                <button type="button" onClick={() => removeBreakdown(i)} className="text-gray-300 hover:text-red-400 transition-colors text-lg font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Key ingredient highlights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={labelClass + " mb-0"}>Key Ingredient Highlights</p>
            <button type="button" onClick={addHighlight} className="text-sm text-pink-500 font-semibold hover:underline">+ Add</button>
          </div>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-3 items-center flex-wrap">
                <input type="text" value={h.emoji} onChange={(e) => updateHighlight(i, "emoji", e.target.value)} placeholder="Emoji" className={`${inputClass} w-20`} />
                <input type="text" value={h.name} onChange={(e) => updateHighlight(i, "name", e.target.value)} placeholder="Name (e.g. Sweet Potato)" className={`${inputClass} flex-1 min-w-35`} />
                <input type="text" value={h.benefit} onChange={(e) => updateHighlight(i, "benefit", e.target.value)} placeholder="Benefit (e.g. High in fibre)" className={`${inputClass} flex-1 min-w-35`} />
                <button type="button" onClick={() => removeHighlight(i)} className="text-gray-300 hover:text-red-400 transition-colors text-lg font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Full ingredient list */}
        <div>
          <label className={labelClass}>Full Ingredient List</label>
          <textarea name="ingredientsFull" value={form.ingredientsFull} onChange={handleChange} rows={2} placeholder="Chicken 31%, Sweet Potatoes 29%, ..." className={`${inputClass} resize-none`} />
        </div>
      </section>

      {/* Error and Success Messages */}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-700 font-semibold">{success}</div>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-black py-4 rounded-full text-base transition-colors shadow-lg shadow-pink-200"
      >
        {loading ? (uploadProgress ?? "Saving…") : "Add Product →"}
      </button>
    </form>
  );
}
