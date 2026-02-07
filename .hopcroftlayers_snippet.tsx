// Add this code after line 437 in DataPanel.tsx, right before the closing </> tag

               {/* Hopcroft-Karp Layers Panel */}
               {isHopcroftKarp && step.hopcroftLayers && Object.keys(step.hopcroftLayers).length > 0 && (
                 <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden w-full">
                   <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                     BFS Layers (L₀, L₁, L₂, ...)
                   </div>
                   <div className="p-3 overflow-auto flex-1">
                     <div className="space-y-2">
                       {Object.keys(step.hopcroftLayers)
                         .map(Number)
                         .sort((a, b) => a - b)
                         .map((layerNum) => {
                           const layerNodes = step.hopcroftLayers![layerNum];
                           if (!layerNodes || layerNodes.length === 0) return null;
                           
                           return (
                             <div key={layerNum} className="flex items-start gap-3">
                               <span className="text-xs font-mono text-cyan-400 w-8 shrink-0 pt-1.5">
                                 L<sub>{layerNum}</sub>:
                               </span>
                               <div className="flex flex-wrap gap-1.5">
                                 {layerNodes.map((node) => (
                                   <span 
                                     key={node}
                                     className={`flex items-center justify-center px-2.5 py-1 rounded text-xs font-bold border ${
                                       step.currentNodeId === node || step.processedSet.includes(node)
                                         ? 'bg-cyan-900/40 border-cyan-500 text-cyan-200'
                                         : 'bg-slate-700/40 border-slate-600 text-slate-300'
                                     }`}
                                   >
                                     {node}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           );
                         })}
                     </div>
                   </div>
                 </div>
               )}
