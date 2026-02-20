
import React, { useState, useRef } from 'react';
import { generateAvatar } from '../services/geminiService';
import { Wand2, Download, RefreshCw, Loader2, Upload, X, Image as ImageIcon, FileCheck, FilePlus2, Sparkles, Shirt, Map, Zap, Palette } from 'lucide-react';

interface AvatarGeneratorProps {
  onAttachToResume?: (avatarUrl: string) => void;
}

const CLOTHING_OPTIONS = [
  "Business Suit",
  "Smart Casual Blazer",
  "Formal Professional Wear",
  "Modern Minimalist Outfit",
  "Casual Button-down Shirt",
  "Tech Startup Hoodie",
  "Crisp White Oxford Shirt",
  "Professional Turtleneck",
  "Elegant Blouse",
  "Academic Tweed Jacket",
];

const BACKGROUND_OPTIONS = [
  "Modern Office Interior",
  "Minimalist Studio Background",
  "Blurred Cityscape",
  "Professional Library",
  "Soft Natural Garden",
  "Clean Solid Color",
  "Sleek Architectural Firm",
  "Contemporary Art Gallery",
  "Bright Industrial Loft",
  "Wall of Bookshelves",
];

const SOLID_COLOR_OPTIONS = [
  { name: "Neutral White", value: "Pure White" },
  { name: "Professional Gray", value: "Light Studio Gray" },
  { name: "Deep Navy", value: "Solid Navy Blue" },
  { name: "Executive Slate", value: "Matte Slate Gray" },
  { name: "Corporate Blue", value: "Soft Corporate Blue" },
  { name: "Modern Teal", value: "Deep Teal" }
];

const LIGHTING_OPTIONS = [
  "Soft Studio Lighting",
  "Natural Window Sunlight",
  "Warm Golden Hour Glow",
  "High-End Cinematographic Lighting",
  "Bright Professional Ring Light",
  "High Contrast Executive Lighting",
  "Dramatic Side-Lit Portrait",
  "Classic Three-Point Setup",
  "Bright and Airy High-Key",
  "Sharp Rim Lighting",
];

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onAttachToResume }) => {
  const [clothing, setClothing] = useState(CLOTHING_OPTIONS[0]);
  const [background, setBackground] = useState(BACKGROUND_OPTIONS[0]);
  const [solidColor, setSolidColor] = useState(SOLID_COLOR_OPTIONS[0].value);
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0]);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attached, setAttached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setAttached(false);
    try {
      const bgPrompt = background === "Clean Solid Color" ? `Solid ${solidColor} background` : background;
      const combinedPrompt = `${clothing}, ${bgPrompt}, ${lighting}`;
      const image = await generateAvatar(selectedImage, combinedPrompt);
      setGeneratedImage(image);
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = () => {
    if (generatedImage && onAttachToResume) {
      onAttachToResume(generatedImage);
      setAttached(true);
      setTimeout(() => setAttached(false), 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pt-16 md:pt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-brand-deep dark:text-white mb-2">AI Professional Avatar</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate a professional LinkedIn-style headshot with custom styles.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm shadow-brand-primary/5 flex flex-col">
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Step 1: Upload Your Photo</label>
            
            <div className="bg-blue-50 dark:bg-slate-800 border-2 border-dashed border-blue-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center p-6 relative mb-8 transition-colors hover:bg-blue-100/50 dark:hover:bg-slate-800/80 min-h-[180px]">
              {!selectedImage ? (
                <>
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-4">
                    <ImageIcon className="text-brand-primary dark:text-blue-400" size={24} />
                  </div>
                  <p className="text-brand-deep/80 dark:text-slate-300 text-xs mb-4 text-center max-w-xs">
                    Upload a clear selfie or portrait.
                  </p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-slate-900 border border-brand-primary text-brand-primary dark:text-blue-400 dark:border-blue-400 px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Upload Image
                  </button>
                </>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                  <img src={selectedImage} alt="Reference" className="max-h-40 object-contain" />
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Step 2: Customize Style</label>
            
            <div className="space-y-4 mb-8">
              {/* Clothing Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <Shirt size={12} className="text-brand-primary" />
                  Clothing Style
                </label>
                <select 
                  value={clothing}
                  onChange={(e) => setClothing(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700 dark:text-slate-200"
                >
                  {CLOTHING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Background Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <Map size={12} className="text-brand-primary" />
                  Background Scene
                </label>
                <select 
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700 dark:text-slate-200"
                >
                  {BACKGROUND_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Solid Color Picker - Conditionally Visible */}
              {background === "Clean Solid Color" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <Palette size={12} className="text-brand-primary" />
                    Select Background Color
                  </label>
                  <select 
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700 dark:text-slate-200 ring-2 ring-brand-primary/20"
                  >
                    {SOLID_COLOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                  </select>
                </div>
              )}

              {/* Lighting Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap size={12} className="text-brand-primary" />
                  Lighting Environment
                </label>
                <select 
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700 dark:text-slate-200"
                >
                  {LIGHTING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3.5 rounded-xl hover:bg-brand-deep transition disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-brand-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {loading ? 'Redrawing Face...' : 'Generate AI Portrait'}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-brand-mint dark:border-slate-800 shadow-sm shadow-brand-primary/5 flex flex-col items-center justify-center min-h-[500px]">
          {generatedImage ? (
            <div className="w-full flex flex-col items-center">
              {/* Generated Image Container */}
              <div className="w-full max-w-sm aspect-square bg-brand-rose dark:bg-slate-800 rounded-2xl overflow-hidden border border-brand-mint dark:border-slate-700 ring-4 ring-brand-mint dark:ring-slate-800 shadow-2xl mb-8 group relative">
                 <img 
                   src={generatedImage} 
                   alt="Generated Avatar" 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-xs uppercase tracking-widest bg-brand-primary/80 px-3 py-1.5 rounded-full">Preview</span>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 w-full max-w-sm">
                <a 
                  href={generatedImage} 
                  download="professional-avatar.png"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition font-bold text-sm"
                >
                  <Download size={18} />
                  Save
                </a>
                
                <button 
                  onClick={handleAttach}
                  disabled={attached}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition font-bold text-sm ${
                    attached 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-brand-primary text-white border border-brand-primary hover:bg-brand-deep'
                  }`}
                >
                  {attached ? <FileCheck size={18} /> : <FilePlus2 size={18} />}
                  {attached ? 'Ready!' : 'To Resume'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center w-full h-full flex flex-col items-center justify-center">
              <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800/50 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <UserCirclePlaceholder />
              </div>
              <h3 className="font-bold text-brand-deep dark:text-white text-xl">Ready for your close-up?</h3>
              <p className="text-sm mt-2 max-w-xs mx-auto text-slate-500 dark:text-slate-400">Your AI-enhanced professional headshot will appear here after generation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserCirclePlaceholder = () => (
  <svg className="w-20 h-20 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
  </svg>
);

export default AvatarGenerator;
