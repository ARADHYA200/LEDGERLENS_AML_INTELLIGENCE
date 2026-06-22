import { useMemo, useState, useEffect, useRef } from "react";
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ nodes = [], edges = [], selectedAccount, highlightedAccount, onNodeSelect }) => {
  const fgRef = useRef();

  // Resize observer to maintain canvas size
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => {
    console.log('NetworkGraph received nodes:', nodes.length, 'edges:', edges.length);
    console.log('Sample node:', nodes[0]);
    console.log('Sample edge:', edges[0]);

    return {
      nodes: nodes.map(n => {
         // Use risk score from the node data or calculate from style
         const riskScore = n.riskScore || 0;
         let nodeColor = '#10B981'; // Green
         if (riskScore > 80) nodeColor = '#EF4444'; // Red
         else if (riskScore > 50) nodeColor = '#F97316'; // Orange
         else if (riskScore > 30) nodeColor = '#EAB308'; // Yellow

         // Use size from backend style or default
         const size = n.style?.width ? n.style.width / 10 : 5;

         return {
            id: n.id,
            val: size,
            color: nodeColor,
            isHighRisk: riskScore > 80,
            tooltip: n.data?.tooltip || `Account: ${n.id} | Risk: ${riskScore}`,
            label: n.data?.label || n.id,
            x: n.position?.x || Math.random() * 800,
            y: n.position?.y || Math.random() * 600
         };
      }),
      links: edges.map(e => ({
        source: e.source,
        target: e.target,
        color: e.style?.stroke || '#7C83A8',
        width: e.style?.strokeWidth || 1.5,
        animated: e.animated || false
      }))
    };
  }, [nodes, edges]);

  // Handle focus when highlightedAccount changes
  useEffect(() => {
    if (highlightedAccount && fgRef.current) {
      const node = graphData.nodes.find(n => n.id === highlightedAccount);
      if (node) {
         fgRef.current.centerAt(node.x, node.y, 1000);
         fgRef.current.zoom(3, 2000);
      }
    }
  }, [highlightedAccount, graphData.nodes]);

  return (
    <section className="rounded-3xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-5 w-full">
      <div className="mb-4 text-white text-sm">
        Nodes: {graphData.nodes.length}, Edges: {graphData.links.length}
      </div>
      <div ref={containerRef} className="h-[520px] w-full overflow-hidden rounded-3xl bg-slate-950/90 relative">
        {graphData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No graph data available
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="tooltip"
            nodeColor={node => {
              if (node.id === selectedAccount) return '#22D3EE'; // Highlight selected
              if (node.id === highlightedAccount) return '#FCD34D'; // Highlight searched
              return node.color;
            }}
            nodeRelSize={4}
            linkColor="color"
            linkWidth="width"
            linkDirectionalParticles={link => link.animated ? 3 : 0}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={node => onNodeSelect(node.id)}
            // Draw custom borders, halos and glow effects
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const isSelected = node.id === selectedAccount;
              const isHighlighted = node.id === highlightedAccount;

              if (isSelected || isHighlighted || node.isHighRisk) {
                 ctx.beginPath();
                 ctx.arc(node.x, node.y, Math.sqrt(node.val) * 4 + 2, 0, 2 * Math.PI, false);

                 if (node.isHighRisk) {
                   ctx.shadowColor = '#EF4444';
                   ctx.shadowBlur = 15;
                 }

                 ctx.strokeStyle = isSelected ? '#22D3EE' : isHighlighted ? '#FCD34D' : node.color;
                 ctx.lineWidth = 2 / globalScale;
                 ctx.stroke();

                 // reset shadow so it doesn't bleed downstream to other drawings
                 ctx.shadowBlur = 0;
              }
              
              // Render label if zoomed in sufficiently
              if (globalScale > 2) {
                 ctx.font = `${10/globalScale}px Sans-Serif`;
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.fillStyle = '#cbd5e1';
                 ctx.fillText(node.label, node.x, node.y + Math.sqrt(node.val) * 4 + 4/globalScale);
              }
            }}
          />
        )}
      </div>

      {highlightedAccount ? (
        <div className="mt-4 text-sm text-sky-300">Searching: {highlightedAccount}</div>
      ) : null}
    </section>
  );
};

export default NetworkGraph;
