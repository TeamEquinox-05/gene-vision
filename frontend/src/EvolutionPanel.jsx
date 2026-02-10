import React, { useState } from 'react';
import { Zap, Sparkles, RefreshCw } from 'lucide-react';

export default function EvolutionPanel() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  // Physical feature sliders (0-100 scale)
  const [features, setFeatures] = useState({
    bodySize: 50,
    legLength: 50,
    tailLength: 50,
    earSize: 50,
    whiskerLength: 50,
    furDensity: 50,
    snoutLength: 50,
    eyeSize: 50,
    neckLength: 50,
    pawSize: 50
  });

  // Color selections
  const [colors, setColors] = useState({
    bodyColor: '#8B4513',
    tailColor: '#FFC0CB',
    eyeColor: '#FF0000',
    earColor: '#8B4513',
    noseColor: '#FFB6C1'
  });

  // Dropdown selections
  const [selections, setSelections] = useState({
    furPattern: 'solid',
    tailShape: 'long-tapered',
    earShape: 'rounded',
    furTexture: 'smooth',
    bodyBuild: 'average'
  });

  const colorOptions = [
    { name: 'Brown', value: '#8B4513' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#808080' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Cream', value: '#FFFDD0' },
    { name: 'Auburn', value: '#A52A2A' },
    { name: 'Tan', value: '#D2B48C' }
  ];

  const furPatterns = [
    { value: 'solid', label: 'Solid Color' },
    { value: 'spotted', label: 'Spotted' },
    { value: 'striped', label: 'Striped' },
    { value: 'patched', label: 'Patched' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'mottled', label: 'Mottled' }
  ];

  const tailShapes = [
    { value: 'long-tapered', label: 'Long & Tapered' },
    { value: 'short-stubby', label: 'Short & Stubby' },
    { value: 'thick', label: 'Thick' },
    { value: 'thin', label: 'Thin' },
    { value: 'bushy', label: 'Bushy' },
    { value: 'hairless', label: 'Hairless' }
  ];

  const earShapes = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'pointed', label: 'Pointed' },
    { value: 'large-floppy', label: 'Large & Floppy' },
    { value: 'small-perky', label: 'Small & Perky' },
    { value: 'bat-like', label: 'Bat-like' }
  ];

  const furTextures = [
    { value: 'smooth', label: 'Smooth' },
    { value: 'fluffy', label: 'Fluffy' },
    { value: 'coarse', label: 'Coarse' },
    { value: 'silky', label: 'Silky' },
    { value: 'wiry', label: 'Wiry' }
  ];

  const bodyBuilds = [
    { value: 'slim', label: 'Slim' },
    { value: 'average', label: 'Average' },
    { value: 'muscular', label: 'Muscular' },
    { value: 'stocky', label: 'Stocky' },
    { value: 'plump', label: 'Plump' }
  ];

  const handleFeatureChange = (feature, value) => {
    setFeatures(prev => ({ ...prev, [feature]: parseInt(value) }));
  };

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({ ...prev, [colorType]: value }));
  };

  const handleSelectionChange = (selectionType, value) => {
    setSelections(prev => ({ ...prev, [selectionType]: value }));
  };

  const generatePrompt = () => {
    const sizeMap = {
      0: 'extremely small', 25: 'small', 50: 'average sized', 75: 'large', 100: 'extremely large'
    };
    const lengthMap = {
      0: 'very short', 25: 'short', 50: 'medium length', 75: 'long', 100: 'very long'
    };
    
    const getDescriptor = (value, map) => {
      const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
      for (let i = 0; i < keys.length - 1; i++) {
        if (value >= keys[i] && value <= keys[i + 1]) {
          return value < (keys[i] + keys[i + 1]) / 2 ? map[keys[i]] : map[keys[i + 1]];
        }
      }
      return map[keys[keys.length - 1]];
    };

    const bodySize = getDescriptor(features.bodySize, sizeMap);
    const legLength = getDescriptor(features.legLength, lengthMap);
    const tailLength = getDescriptor(features.tailLength, lengthMap);
    const earSize = getDescriptor(features.earSize, sizeMap);
    const whiskerLength = getDescriptor(features.whiskerLength, lengthMap);
    const snoutLength = getDescriptor(features.snoutLength, lengthMap);
    const eyeSize = getDescriptor(features.eyeSize, sizeMap);

    const furDensityDesc = features.furDensity > 75 ? 'very thick' : features.furDensity > 50 ? 'thick' : features.furDensity > 25 ? 'normal' : 'sparse';
    const pawSizeDesc = features.pawSize > 75 ? 'large' : features.pawSize > 50 ? 'average' : 'small';

    const bodyColorName = colorOptions.find(c => c.value.toLowerCase() === colors.bodyColor.toLowerCase())?.name || colors.bodyColor;
    const tailColorName = colorOptions.find(c => c.value.toLowerCase() === colors.tailColor.toLowerCase())?.name || colors.tailColor;
    const eyeColorName = colorOptions.find(c => c.value.toLowerCase() === colors.eyeColor.toLowerCase())?.name || colors.eyeColor;

    const prompt = `A photorealistic laboratory rat (Rattus norvegicus) with the following detailed characteristics:
Body: ${bodySize} body with ${selections.bodyBuild} build, ${furDensityDesc} ${selections.furTexture} fur with ${selections.furPattern} pattern in ${bodyColorName} color.
Head: ${snoutLength} snout, ${earSize} ${selections.earShape} ears in ${colorOptions.find(c => c.value === colors.earColor)?.name || 'matching body'} color, ${eyeSize} ${eyeColorName} eyes.
Limbs: ${legLength} legs with ${pawSizeDesc} paws.
Tail: ${tailLength} ${selections.tailShape} tail in ${tailColorName} color.
Details: ${whiskerLength} whiskers.
Style: High quality, detailed, scientific illustration, white background, clear focus.`;

    return prompt;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = generatePrompt();

      const response = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      const imageUrl = data.image;

      setGeneratedImage(imageUrl);

    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToDefaults = () => {
    setFeatures({
      bodySize: 50,
      legLength: 50,
      tailLength: 50,
      earSize: 50,
      whiskerLength: 50,
      furDensity: 50,
      snoutLength: 50,
      eyeSize: 50,
      neckLength: 50,
      pawSize: 50
    });
    setColors({
      bodyColor: '#8B4513',
      tailColor: '#FFC0CB',
      eyeColor: '#FF0000',
      earColor: '#8B4513',
      noseColor: '#FFB6C1'
    });
    setSelections({
      furPattern: 'solid',
      tailShape: 'long-tapered',
      earShape: 'rounded',
      furTexture: 'smooth',
      bodyBuild: 'average'
    });
    setGeneratedImage(null);
    setError(null);
  };

  const SliderControl = ({ label, value, onChange, icon }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {icon && <span className="text-[#00d9ff]">{icon}</span>}
          {label}
        </label>
        <span className="text-xs font-mono text-[#00d9ff] bg-[#00d9ff]/10 px-2 py-1 rounded">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full bg-white/10 outline-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#00d9ff] [&::-webkit-slider-thumb]:to-[#00a8cc] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,217,255,0.6)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-[#00d9ff] [&::-moz-range-thumb]:to-[#00a8cc] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );

  const ColorPicker = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
              value === color.value 
                ? 'border-[#00d9ff] shadow-[0_0_12px_rgba(0,217,255,0.6)]' 
                : 'border-white/20'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  const SelectControl = ({ label, value, onChange, options }) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/[0.03] border border-[#00d9ff]/20 rounded-lg text-gray-200 text-sm outline-none cursor-pointer transition-all duration-300 hover:bg-[#00d9ff]/[0.05] focus:border-[#00d9ff]/50 focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0a0f1a]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex-1 flex gap-6 p-8 overflow-hidden">
      {/* Left Panel - Controls */}
      <div className="w-[45%] flex flex-col gap-6 overflow-y-auto pr-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-light tracking-[0.15em] bg-gradient-to-br from-[#00d9ff] to-[#7c3aed] bg-clip-text text-transparent mb-2">
              Evolution Designer
            </h2>
            <p className="text-gray-400 text-sm font-normal tracking-wider">
              Customize every aspect of your rat phenotype
            </p>
          </div>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-gray-400 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/30 hover:text-[#00d9ff]"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        {/* Physical Features Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/40 to-[#00d9ff]/[0.05] border border-[#00d9ff]/15 space-y-6">
          <h3 className="text-sm font-bold text-[#00d9ff] uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} />
            Physical Features
          </h3>
          
          <div className="space-y-4">
            <SliderControl label="Body Size" value={features.bodySize} onChange={(v) => handleFeatureChange('bodySize', v)} />
            <SliderControl label="Leg Length" value={features.legLength} onChange={(v) => handleFeatureChange('legLength', v)} />
            <SliderControl label="Tail Length" value={features.tailLength} onChange={(v) => handleFeatureChange('tailLength', v)} />
            <SliderControl label="Ear Size" value={features.earSize} onChange={(v) => handleFeatureChange('earSize', v)} />
            <SliderControl label="Eye Size" value={features.eyeSize} onChange={(v) => handleFeatureChange('eyeSize', v)} />
            <SliderControl label="Snout Length" value={features.snoutLength} onChange={(v) => handleFeatureChange('snoutLength', v)} />
            <SliderControl label="Whisker Length" value={features.whiskerLength} onChange={(v) => handleFeatureChange('whiskerLength', v)} />
            <SliderControl label="Fur Density" value={features.furDensity} onChange={(v) => handleFeatureChange('furDensity', v)} />
            <SliderControl label="Paw Size" value={features.pawSize} onChange={(v) => handleFeatureChange('pawSize', v)} />
          </div>
        </div>

        {/* Colors Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/40 to-[#7c3aed]/[0.05] border border-[#7c3aed]/15 space-y-6">
          <h3 className="text-sm font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={16} />
            Color Palette
          </h3>
          
          <div className="space-y-4">
            <ColorPicker label="Body Color" value={colors.bodyColor} onChange={(v) => handleColorChange('bodyColor', v)} />
            <ColorPicker label="Tail Color" value={colors.tailColor} onChange={(v) => handleColorChange('tailColor', v)} />
            <ColorPicker label="Eye Color" value={colors.eyeColor} onChange={(v) => handleColorChange('eyeColor', v)} />
            <ColorPicker label="Ear Color" value={colors.earColor} onChange={(v) => handleColorChange('earColor', v)} />
            <ColorPicker label="Nose Color" value={colors.noseColor} onChange={(v) => handleColorChange('noseColor', v)} />
          </div>
        </div>

        {/* Style Options Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-black/40 to-[#10b981]/[0.05] border border-[#10b981]/15 space-y-4">
          <h3 className="text-sm font-bold text-[#10b981] uppercase tracking-widest">Style Options</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <SelectControl label="Fur Pattern" value={selections.furPattern} onChange={(v) => handleSelectionChange('furPattern', v)} options={furPatterns} />
            <SelectControl label="Tail Shape" value={selections.tailShape} onChange={(v) => handleSelectionChange('tailShape', v)} options={tailShapes} />
            <SelectControl label="Ear Shape" value={selections.earShape} onChange={(v) => handleSelectionChange('earShape', v)} options={earShapes} />
            <SelectControl label="Fur Texture" value={selections.furTexture} onChange={(v) => handleSelectionChange('furTexture', v)} options={furTextures} />
            <SelectControl label="Body Build" value={selections.bodyBuild} onChange={(v) => handleSelectionChange('bodyBuild', v)} options={bodyBuilds} />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-br from-[#00d9ff] to-[#00a8cc] border-0 rounded-xl text-black text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-[0_8px_32px_rgba(0,217,255,0.4)] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,217,255,0.6)]"
        >
          <Zap size={18} />
          <span>{isGenerating ? 'Generating Evolution...' : 'Generate Evolved Rat'}</span>
        </button>
      </div>

      {/* Right Panel - Preview & Results */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Image Display */}
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-black/50 to-[#00d9ff]/[0.05] border border-[#00d9ff]/15 overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.7)]">
          <div className="w-full h-full flex items-center justify-center p-6">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-[#00d9ff]/20 border-t-[#00d9ff] rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Evolving your rat specimen...</p>
              </div>
            ) : generatedImage ? (
              <img 
                src={generatedImage} 
                alt="Evolved rat" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : error ? (
              <div className="text-center space-y-3 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold uppercase tracking-wider transition-all hover:bg-red-500/30"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/30 flex items-center justify-center">
                  <Zap size={32} className="text-[#00d9ff]" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-300 font-semibold mb-2">Ready to Evolve</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Adjust the features using the controls on the left, then click "Generate Evolved Rat" to see your creation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
