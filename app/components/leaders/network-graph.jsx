'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Returns a color for an entity based on its type
 */
function getEntityColor(type) {
  const typeColorMap = {
    'politician': '#4299E1', // blue
    'government': '#48BB78', // green
    'organization': '#ED8936', // orange
    'business': '#9F7AEA', // purple
    'military': '#F56565', // red
    'media': '#ECC94B', // yellow
    'academic': '#38B2AC', // teal
    'religious': '#667EEA', // indigo
  };
  
  return typeColorMap[type.toLowerCase()] || '#A0AEC0'; // default gray
}

/**
 * Returns a color for a relationship based on its type and sentiment
 */
function getRelationshipColor(type, sentiment) {
  if (sentiment === 'negative') {
    return '#F56565'; // red for negative relationships
  }
  
  const typeColorMap = {
    'alliance': '#48BB78', // green
    'family': '#4299E1', // blue
    'professional': '#9F7AEA', // purple
    'political': '#ED8936', // orange
    'economic': '#667EEA', // indigo
    'rival': '#F56565', // red
    'conflict': '#F56565', // red
  };
  
  return typeColorMap[type.toLowerCase()] || '#A0AEC0'; // default gray
}

/**
 * Network graph visualization showing entities and their relationships
 */
export function NetworkGraph({ entities, relationships }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current || !entities.length || !relationships.length) return;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = 800;
    const height = 600;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
      
    // Create tooltip div
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10');
    
    // Process data for d3 formatting
    const nodeMap = new Map();
    entities.forEach((entity, index) => {
      nodeMap.set(entity.name, { 
        id: entity.name, 
        type: entity.type, 
        role: entity.role,
        index 
      });
    });
    
    // Ensure all relationship nodes exist
    relationships.forEach(rel => {
      if (!nodeMap.has(rel.source)) {
        nodeMap.set(rel.source, { 
          id: rel.source, 
          type: 'person', 
          role: 'Unknown',
          index: nodeMap.size 
        });
      }
      if (!nodeMap.has(rel.target)) {
        nodeMap.set(rel.target, { 
          id: rel.target, 
          type: 'person', 
          role: 'Unknown',
          index: nodeMap.size 
        });
      }
    });
    
    const nodes = Array.from(nodeMap.values());
    
    const links = relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      type: rel.type,
      sentiment: rel.sentiment,
      strength: rel.strength,
      description: rel.description,
      source_url: rel.source_url,
      source_date: rel.source_date
    }));
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));
    
    // Add links (relationships)
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => getRelationshipColor(d.sentiment))
      .attr('stroke-width', d => Math.min(Math.max(d.strength, 1), 3))
      .attr('stroke-opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', d => Math.min(Math.max(d.strength, 1), 3) + 2);
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.source.id} → ${d.target.id}</strong><br>
            Type: ${d.type}<br>
            Sentiment: ${d.sentiment}<br>
            Strength: ${d.strength}/5<br>
            ${d.description ? `<span>${d.description}</span>` : ''}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', d => Math.min(Math.max(d.strength, 1), 3));
        
        tooltip.style('visibility', 'hidden');
      });
    
    // Add node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('mouseover', function(event, d) {
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.id}</strong><br>
            Type: ${d.type}<br>
            Role: ${d.role || 'Unknown'}
          `);
        
        // Highlight connected links and nodes
        link
          .attr('stroke-opacity', l => 
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
          )
          .attr('stroke-width', l => 
            l.source.id === d.id || l.target.id === d.id 
              ? Math.min(Math.max(l.strength, 1), 3) + 2 
              : Math.min(Math.max(l.strength, 1), 3)
          );
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
        
        // Reset link opacity
        link
          .attr('stroke-opacity', 0.8)
          .attr('stroke-width', d => Math.min(Math.max(d.strength, 1), 3));
      });
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', 12)
      .attr('fill', d => getEntityColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    
    // Add text labels
    node.append('text')
      .text(d => d.id)
      .attr('x', 0)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');
    
    // Update positions in simulation
    simulation.on('tick', () => {
      link
        .attr('x1', d => Math.max(20, Math.min(width - 20, d.source.x)))
        .attr('y1', d => Math.max(20, Math.min(height - 20, d.source.y)))
        .attr('x2', d => Math.max(20, Math.min(width - 20, d.target.x)))
        .attr('y2', d => Math.max(20, Math.min(height - 20, d.target.y)));
      
      node.attr('transform', d => {
        const x = Math.max(20, Math.min(width - 20, d.x));
        const y = Math.max(20, Math.min(height - 20, d.y));
        return `translate(${x},${y})`;
      });
    });
    
    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Clean up
    return () => {
      simulation.stop();
    };
  }, [entities, relationships]);
  
  return (
    <div className="relative">
      <div ref={tooltipRef} className="tooltip"></div>
      <div className="overflow-auto" style={{ height: '600px' }}>
        <svg 
          ref={svgRef} 
          className="mx-auto" 
          style={{ minWidth: '800px', minHeight: '600px' }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Entity Types</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-xs">Person</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs">Organization</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-xs">Location</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Relationship Sentiment</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-6 h-1 bg-green-500 mr-1"></div>
              <span className="text-xs">Positive</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-1 bg-gray-500 mr-1"></div>
              <span className="text-xs">Neutral</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-1 bg-red-500 mr-1"></div>
              <span className="text-xs">Negative</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
