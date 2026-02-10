import React, { useState } from 'react';
import { Send, Sparkles, Dna } from 'lucide-react';

export default function ReconstructionPanel() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [geneModifications, setGeneModifications] = useState([]);

  const mockGeneResponses = [
    {
      feature: 'leg count',
      genes: ['GENE_0012_LIMB_STRUCTURE', 'GENE_0045_LIMB_DEVELOPMENT', 'GENE_0089_APPENDAGE_FORMATION'],
      modifications: 'Increase expression of LIMB_STRUCTURE by 50% and modify APPENDAGE_FORMATION regulatory regions'
    },
    {
      feature: 'fur color',
      genes: ['GENE_0156_MELANIN_PRODUCTION', 'GENE_0203_PIGMENT_DISTRIBUTION', 'GENE_0267_COLOR_PATTERN'],
      modifications: 'Alter MELANIN_PRODUCTION pathway to achieve desired pigmentation'
    },
    {
      feature: 'tail color',
      genes: ['GENE_0203_PIGMENT_DISTRIBUTION', 'GENE_0267_COLOR_PATTERN', 'GENE_0334_TAIL_PIGMENTATION'],
      modifications: 'Target TAIL_PIGMENTATION for specific color expression in tail region'
    },
    {
      feature: 'size',
      genes: ['GENE_0091_METABOLIC_RATE', 'GENE_0123_GROWTH_HORMONE', 'GENE_0178_BODY_SIZE'],
      modifications: 'Modulate GROWTH_HORMONE expression and BODY_SIZE regulatory elements'
    },
    {
      feature: 'eye color',
      genes: ['GENE_0299_EYE_PIGMENTATION', 'GENE_0312_IRIS_COLOR', 'GENE_0334_MELANIN_IRIS'],
      modifications: 'Adjust iris melanin concentration for desired eye color'
    }
  ];

  const generateMockGeneData = (userPrompt) => {
    const modifications = [];
    const lowerPrompt = userPrompt.toLowerCase();
    
    // Check for features mentioned in the prompt
    mockGeneResponses.forEach(response => {
      if (lowerPrompt.includes(response.feature)) {
        modifications.push(response);
      }
    });

    // If no specific features matched, add a general response
    if (modifications.length === 0) {
      modifications.push({
        feature: 'general modifications',
        genes: ['GENE_0012_LIMB_STRUCTURE', 'GENE_0156_MELANIN_PRODUCTION', 'GENE_0091_METABOLIC_RATE'],
        modifications: 'Multiple gene pathways would need to be modified to achieve the described phenotype. Awaiting advanced LLM analysis for specific recommendations.'
      });
    }

    return modifications;
  };

  const generateImage = async (userPrompt) => {
    setIsGenerating(true);
    
    try {
      // Create an enhanced prompt for Stable Diffusion focused on rat
      const enhancedPrompt = `A photorealistic laboratory rat (Rattus norvegicus) with the following characteristics: ${userPrompt}. High quality, detailed, scientific illustration style, white background, 8k, professional photography`;

      const response = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: enhancedPrompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      const imageUrl = data.image;

      setGeneratedImage(imageUrl);
      
      // Generate mock gene modifications
      const geneData = generateMockGeneData(userPrompt);
      setGeneModifications(geneData);

      // Add to messages
      setMessages(prev => [...prev, 
        { type: 'user', text: userPrompt },
        { type: 'assistant', image: imageUrl, genes: geneData }
      ]);

    } catch (error) {
      console.error('Error generating image:', error);
      setMessages(prev => [...prev, 
        { type: 'user', text: userPrompt },
        { type: 'error', text: `Error: ${error.message}` }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    generateImage(prompt);
    setPrompt('');
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-[0.15em] bg-gradient-to-br from-[#00d9ff] to-[#7c3aed] bg-clip-text text-transparent mb-2">
            Gene Reconstruction Lab
          </h2>
          <p className="text-gray-400 text-sm font-normal tracking-wider">
            Describe your rat phenotype and generate visual representations
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#00d9ff]/[0.08] border border-[#00d9ff]/20 rounded-xl">
          <Sparkles size={16} className="text-[#00d9ff]" />
          <span className="text-[#00d9ff] text-xs font-semibold uppercase tracking-widest">AI Powered</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Side - Chat Interface */}
        <div className="w-[45%] flex flex-col gap-4">
          {/* Messages Area */}
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-black/40 to-[#00d9ff]/[0.05] border border-[#00d9ff]/15 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/30 flex items-center justify-center">
                    <Dna size={32} className="text-[#00d9ff]" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-300 font-semibold mb-2">Design Your Rat</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Describe the physical characteristics you want for your rat. For example:
                      "3 legs, black fur, pink tail, red eyes, larger size"
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="space-y-3">
                    {msg.type === 'user' && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] px-4 py-3 bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/30 rounded-xl text-sm text-gray-200">
                          {msg.text}
                        </div>
                      </div>
                    )}
                    {msg.type === 'assistant' && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] space-y-3">
                          {msg.image && (
                            <div className="rounded-xl overflow-hidden border border-[#00d9ff]/20 bg-black/40">
                              <img src={msg.image} alt="Generated rat" className="w-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {msg.type === 'error' && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gradient-to-br from-[#00d9ff]/10 to-[#7c3aed]/10 border border-[#00d9ff]/20 rounded-xl text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#00d9ff] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#00d9ff] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#00d9ff] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>Generating rat visualization...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe rat features (e.g., 3 legs, black fur, pink tail...)"
              disabled={isGenerating}
              className="flex-1 py-4 px-6 bg-white/[0.03] border border-[#00d9ff]/20 rounded-xl text-gray-200 text-sm outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#00d9ff]/[0.05] focus:border-[#00d9ff]/50 focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d9ff] to-[#00a8cc] border-0 text-black flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,217,255,0.4)]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Right Side - Gene Modifications */}
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-black/40 to-[#7c3aed]/[0.05] border border-[#00d9ff]/15 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="h-full overflow-y-auto p-6">
            <div className="flex items-center gap-3 mb-6">
              <Dna size={20} className="text-[#7c3aed]" />
              <h3 className="text-lg font-semibold text-gray-200 uppercase tracking-wider">
                Required Gene Modifications
              </h3>
            </div>

            {geneModifications.length === 0 ? (
              <div className="h-[calc(100%-4rem)] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center">
                    <Dna size={24} className="text-[#7c3aed]" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Gene analysis will appear here after image generation
                  </p>
                  <p className="text-xs text-gray-600">
                    (Local LLM integration in development)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {geneModifications.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-[#7c3aed]/20 bg-gradient-to-br from-[#7c3aed]/[0.05] to-[#00d9ff]/[0.03] transition-all duration-300 hover:border-[#7c3aed]/40"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-[#7c3aed] mt-2"></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#00d9ff] uppercase tracking-wider mb-2">
                          {mod.feature}
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Target Genes:</span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {mod.genes.map((gene, geneIdx) => (
                                <span
                                  key={geneIdx}
                                  className="px-2 py-1 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded text-[10px] font-mono text-gray-300"
                                >
                                  {gene}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Modifications:</span>
                            <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                              {mod.modifications}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold mb-1">Mock Data Mode</p>
                      <p className="text-xs text-gray-400">
                        Advanced LLM analysis is currently in development. These gene recommendations are based on template responses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
