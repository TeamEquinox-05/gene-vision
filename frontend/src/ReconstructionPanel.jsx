import React, { useState } from 'react';
import { Send, Sparkles, Dna, AlertCircle, Info } from 'lucide-react';

export default function ReconstructionPanel() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [geneModifications, setGeneModifications] = useState([]);
  const [biologicalWarning, setBiologicalWarning] = useState(null);

  const queryRAGAPI = async (userPrompt) => {
    try {
      const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${RAG_API_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userPrompt,
          top_k: 5
        })
      });

      if (!response.ok) {
        throw new Error(`RAG API error: ${response.status}`);
      }

      const data = await response.json();
      // Return both genes and warning
      return {
        genes: data.genes || [],
        warning: data.warning || null
      };
    } catch (error) {
      console.error('Error querying RAG API:', error);
      throw error;
    }
  };

  const buildImagePrompt = (userPrompt, genes) => {
    // Extract unique phenotype names from top genes to enrich the image prompt
    const phenotypeDescriptions = [];
    for (const gene of genes.slice(0, 3)) {
      if (gene.phenotypes) {
        for (const p of gene.phenotypes.slice(0, 3)) {
          if (p.phenotype_name && !phenotypeDescriptions.includes(p.phenotype_name)) {
            phenotypeDescriptions.push(p.phenotype_name);
          }
        }
      }
    }

    const phenotypeText = phenotypeDescriptions.length > 0
      ? `Visible phenotypic traits: ${phenotypeDescriptions.join(', ')}.`
      : '';

    const geneNames = genes.slice(0, 3).map(g => g.gene_symbol).join(', ');

    return `A photorealistic genetically modified laboratory mouse (Mus musculus) based on this description: ${userPrompt}. ${phenotypeText} Genes involved: ${geneNames}. Scientific illustration, laboratory setting, high detail, 4k photography, clear anatomical features showing the genetic modifications.`;
  };

  const generateImage = async (userPrompt) => {
    setIsGenerating(true);
    setBiologicalWarning(null); // Clear previous warning
    
    try {
      // Query RAG API for gene data FIRST
      const ragResponse = await queryRAGAPI(userPrompt);
      const geneData = ragResponse.genes;
      const warning = ragResponse.warning;
      
      setGeneModifications(geneData);
      setBiologicalWarning(warning);

      // Build an image prompt enriched with RAG phenotype data
      let imageUrl = null;
      setIsGeneratingImage(true); // Start image loading indicator
      let imageError = null;
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const imagePrompt = buildImagePrompt(userPrompt, geneData);
        console.log('Image prompt:', imagePrompt);

        const response = await fetch(`${BACKEND_URL}/api/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt })
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.image;
          setGeneratedImage(imageUrl);
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn('Image generation failed:', response.status, errData.error || '');
          
          // Store error information to display to user
          imageError = {
            message: errData.error || 'Image generation failed',
            type: errData.errorType || 'unknown',
            status: response.status
          };
        }
      } catch (imgErr) {
        console.warn('Image generation unavailable:', imgErr.message);
        imageError = {
          message: 'Image generation service unavailable',
          type: 'connection_error',
          status: 0
        };
      } finally {
        setIsGeneratingImage(false); // Stop image loading indicator
      }

      // Add to messages - gene data always shows even if image fails
      setMessages(prev => [...prev, 
        { type: 'user', text: userPrompt },
        { type: 'assistant', image: imageUrl, genes: geneData, warning: warning, imageError: imageError }
      ]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 
        { type: 'user', text: userPrompt },
        { type: 'error', text: `Error: ${error.message}` }
      ]);
      setIsGeneratingImage(false);
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
                        <div className="max-w-[90%] space-y-3">
                          {/* Biological Warning Banner */}
                          {msg.warning && (
                            <div className={`p-4 rounded-xl border ${
                              msg.warning.type === 'impossible_trait' 
                                ? 'bg-amber-500/10 border-amber-500/30' 
                                : 'bg-blue-500/10 border-blue-500/30'
                            }`}>
                              <div className="flex items-start gap-3">
                                {msg.warning.type === 'impossible_trait' ? (
                                  <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 space-y-2">
                                  <h4 className={`text-sm font-semibold ${
                                    msg.warning.type === 'impossible_trait' 
                                      ? 'text-amber-300' 
                                      : 'text-blue-300'
                                  }`}>
                                    {msg.warning.type === 'impossible_trait' ? 'Biological Constraint' : 'Note'}
                                  </h4>
                                  <p className="text-xs text-gray-300 leading-relaxed">
                                    {msg.warning.message}
                                  </p>
                                  {msg.warning.suggestions && msg.warning.suggestions.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                      <p className="text-xs text-gray-400 mb-1">Try instead:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {msg.warning.suggestions.map((suggestion, i) => (
                                          <span 
                                            key={i}
                                            className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 hover:bg-white/20 cursor-pointer transition-colors"
                                            onClick={() => setPrompt(suggestion)}
                                          >
                                            {suggestion}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {msg.image ? (
                            <div className="rounded-xl overflow-hidden border border-[#00d9ff]/20 bg-black/40">
                              <img src={msg.image} alt="Generated mouse" className="w-full" />
                            </div>
                          ) : msg.imageError ? (
                            <div className="space-y-3">
                              <div className="px-4 py-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-yellow-300 mb-1">
                                      Image Generation Unavailable
                                    </h4>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      {msg.imageError.message}
                                      {msg.imageError.type === 'credits_depleted' && (
                                        <span className="block mt-2 text-gray-400">
                                          The image generation service requires additional API credits. Gene analysis is still working perfectly!
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 py-3 bg-gradient-to-br from-[#00d9ff]/10 to-[#7c3aed]/10 border border-[#00d9ff]/20 rounded-xl text-xs text-gray-400">
                                Gene analysis complete. See results on the right panel.
                                {msg.genes && msg.genes.length > 0 && (
                                  <span className="block mt-1 text-[#00d9ff]">
                                    Top gene: {msg.genes[0].gene_symbol} ({msg.genes[0].gene_name})
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-3 bg-gradient-to-br from-[#00d9ff]/10 to-[#7c3aed]/10 border border-[#00d9ff]/20 rounded-xl text-xs text-gray-400">
                              Gene analysis complete. See results on the right panel.
                              {msg.genes && msg.genes.length > 0 && (
                                <span className="block mt-1 text-[#00d9ff]">
                                  Top gene: {msg.genes[0].gene_symbol} ({msg.genes[0].gene_name})
                                </span>
                              )}
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
                      <span>Analyzing genes...</span>
                    </div>
                  </div>
                </div>
              )}
              {isGeneratingImage && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gradient-to-br from-[#10b981]/10 to-[#7c3aed]/10 border border-[#10b981]/20 rounded-xl text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin"></div>
                      <span>Generating mouse visualization... (10-30s)</span>
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
                    Gene analysis will appear here after you describe your desired phenotype
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {geneModifications.map((gene, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-[#7c3aed]/20 bg-gradient-to-br from-[#7c3aed]/[0.05] to-[#00d9ff]/[0.03] transition-all duration-300 hover:border-[#7c3aed]/40"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-[#7c3aed] mt-2"></div>
                      <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-base font-bold text-[#00d9ff] mb-1">
                                {gene.gene_symbol}
                                <span className="text-xs font-normal text-gray-400 ml-2">{gene.gene_name}</span>
                              </h4>
                              <p className="text-xs text-gray-400 leading-relaxed mb-2">
                                {gene.description}
                              </p>
                              {gene.mgi_ids && gene.mgi_ids.length > 0 && (
                                <a 
                                  href={`http://www.informatics.jax.org/marker/${gene.mgi_ids[0].split('|')[0]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#7c3aed] hover:text-[#00d9ff] underline transition-colors"
                                >
                                  View on MGI ({gene.mgi_ids[0].split('|')[0]}) →
                                </a>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              {/* Confidence Level Badge */}
                              {gene.confidence_level && (
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-center ${
                                  gene.confidence_level === 'high' 
                                    ? 'bg-green-500/20 border border-green-500/40 text-green-300' 
                                    : gene.confidence_level === 'medium'
                                    ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                                    : 'bg-gray-500/20 border border-gray-500/40 text-gray-300'
                                }`}>
                                  {gene.confidence_level === 'high' && '★★★ High'}
                                  {gene.confidence_level === 'medium' && '★★ Medium'}
                                  {gene.confidence_level === 'low' && '★ Low'}
                                </div>
                              )}
                              {/* Score Badge */}
                              <div className="px-2 py-1 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded text-[10px] font-mono text-gray-400">
                                Score: {gene.aggregate_score?.toFixed(4) ?? 'N/A'}
                              </div>
                            </div>
                          </div>

                        <div className="space-y-3 mt-4">
                          {/* Alleles Section */}
                          {gene.alleles && gene.alleles.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                Relevant Alleles ({gene.alleles.length}):
                              </span>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {gene.alleles.slice(0, 5).map((allele, aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="px-2 py-1 bg-[#00d9ff]/10 border border-[#00d9ff]/20 rounded text-[10px] font-mono text-gray-300"
                                  >
                                    {allele}
                                  </span>
                                ))}
                                {gene.alleles.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded text-[10px] text-gray-500">
                                    +{gene.alleles.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Phenotypes Section */}
                          {gene.phenotypes && gene.phenotypes.length > 0 && (
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                Associated Phenotypes ({gene.phenotypes.length}):
                              </span>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {gene.phenotypes.slice(0, 6).map((phenotype, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded text-[10px] text-gray-300"
                                    title={phenotype.phenotype_description}
                                  >
                                    {phenotype.phenotype_name}
                                  </span>
                                ))}
                                {gene.phenotypes.length > 6 && (
                                  <span className="px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded text-[10px] text-gray-500">
                                    +{gene.phenotypes.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* References Section */}
                          {gene.pubmed_refs && gene.pubmed_refs.filter(r => r).length > 0 && (
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                Scientific References ({gene.pubmed_refs.filter(r => r).length}):
                              </span>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {gene.pubmed_refs.filter(r => r).slice(0, 4).map((ref, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={`https://pubmed.ncbi.nlm.nih.gov/${ref.split('|')[0]}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1 bg-[#7c3aed]/10 border border-[#7c3aed]/20 rounded text-[10px] text-[#7c3aed] hover:text-[#00d9ff] hover:border-[#00d9ff]/30 transition-colors"
                                  >
                                    PMID:{ref.split('|')[0]}
                                  </a>
                                ))}
                                {gene.pubmed_refs.filter(r => r).length > 4 && (
                                  <span className="px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded text-[10px] text-gray-500">
                                    +{gene.pubmed_refs.filter(r => r).length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold mb-1">RAG-Powered Gene Database</p>
                      <p className="text-xs text-gray-400">
                        These genes are retrieved from MGI (Mouse Genome Informatics) database with {geneModifications.reduce((sum, g) => sum + (g.phenotypes?.length || 0), 0)} phenotypes across {geneModifications.reduce((sum, g) => sum + (g.pubmed_refs?.filter(r => r).length || 0), 0)} scientific references.
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
