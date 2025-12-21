/**
 * Programmatic SVG diagram generators for educational content
 * 
 * These functions generate SVG diagrams programmatically,
 * avoiding the need for manual graphics creation.
 */

export interface DiagramOptions {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  fontSize?: number;
}

const DEFAULT_OPTIONS: Required<DiagramOptions> = {
  width: 800,
  height: 400,
  color: '#00ff41',
  strokeWidth: 2,
  fontSize: 14,
};

/**
 * Generate a simple network topology diagram
 */
export function generateNetworkTopologyDiagram(options: DiagramOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, color, strokeWidth, fontSize } = opts;

  const nodes = [
    { id: 'client', x: 100, y: height / 2, label: 'Client' },
    { id: 'router1', x: width / 3, y: height / 2, label: 'Router 1' },
    { id: 'router2', x: (width * 2) / 3, y: height / 2, label: 'Router 2' },
    { id: 'server', x: width - 100, y: height / 2, label: 'Server' },
  ];

  const connections = [
    { from: 'client', to: 'router1' },
    { from: 'router1', to: 'router2' },
    { from: 'router2', to: 'server' },
  ];

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#0a0a0a"/>`;

  // Draw connections
  connections.forEach(({ from, to }) => {
    const fromNode = nodes.find(n => n.id === from)!;
    const toNode = nodes.find(n => n.id === to)!;
    svg += `<line x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}" 
            stroke="${color}" stroke-width="${strokeWidth}" opacity="0.6"/>`;
  });

  // Draw nodes
  nodes.forEach(({ x, y, label }) => {
    const nodeSize = 40;
    svg += `<rect x="${x - nodeSize / 2}" y="${y - nodeSize / 2}" 
            width="${nodeSize}" height="${nodeSize}" 
            fill="#1a1a1a" stroke="${color}" stroke-width="${strokeWidth}"/>`;
    svg += `<text x="${x}" y="${y + nodeSize / 2 + fontSize + 5}" 
            fill="${color}" font-family="monospace" font-size="${fontSize}" 
            text-anchor="middle">${label}</text>`;
  });

  svg += '</svg>';
  return svg;
}

/**
 * Generate a DNS resolution flow diagram
 */
export function generateDNSResolutionDiagram(options: DiagramOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, color, strokeWidth, fontSize } = opts;

  const steps = [
    { x: width / 5, y: height / 4, label: '1. Query\n"example.com"', type: 'query' },
    { x: width / 2, y: height / 4, label: '2. DNS\nServer', type: 'server' },
    { x: (width * 4) / 5, y: height / 4, label: '3. Response\n"192.0.2.1"', type: 'response' },
    { x: width / 2, y: (height * 3) / 4, label: '4. Connect to\nIP Address', type: 'connect' },
  ];

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#0a0a0a"/>`;

  // Draw flow arrows
  svg += `<path d="M ${steps[0].x + 60} ${steps[0].y} L ${steps[1].x - 60} ${steps[1].y}" 
          stroke="${color}" stroke-width="${strokeWidth}" fill="none" marker-end="url(#arrowhead)"/>`;
  svg += `<path d="M ${steps[1].x + 60} ${steps[1].y} L ${steps[2].x - 60} ${steps[2].y}" 
          stroke="${color}" stroke-width="${strokeWidth}" fill="none" marker-end="url(#arrowhead)"/>`;
  svg += `<path d="M ${steps[2].x} ${steps[2].y + 40} L ${steps[3].x} ${steps[3].y - 40}" 
          stroke="${color}" stroke-width="${strokeWidth}" fill="none" marker-end="url(#arrowhead)"/>`;

  // Arrow marker definition
  svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="${color}"/></marker></defs>`;

  // Draw steps
  steps.forEach(({ x, y, label, type }) => {
    const boxWidth = 120;
    const boxHeight = 80;
    const rx = 4;

    let fill = '#1a1a1a';
    if (type === 'server') fill = '#2a2a2a';

    svg += `<rect x="${x - boxWidth / 2}" y="${y - boxHeight / 2}" 
            width="${boxWidth}" height="${boxHeight}" rx="${rx}"
            fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
    svg += `<text x="${x}" y="${y}" 
            fill="${color}" font-family="monospace" font-size="${fontSize}" 
            text-anchor="middle" dominant-baseline="middle">${label}</text>`;
  });

  svg += '</svg>';
  return svg;
}

/**
 * Generate a TCP/IP stack diagram
 */
export function generateTCPIPStackDiagram(options: DiagramOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, color, strokeWidth, fontSize } = opts;

  const layers = [
    { name: 'Application', protocols: ['HTTP', 'HTTPS', 'FTP'] },
    { name: 'Transport', protocols: ['TCP', 'UDP'] },
    { name: 'Internet', protocols: ['IP', 'ICMP'] },
    { name: 'Link', protocols: ['Ethernet', 'WiFi'] },
  ];

  const layerHeight = height / (layers.length + 1);
  const boxWidth = width * 0.7;
  const startX = (width - boxWidth) / 2;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#0a0a0a"/>`;

  layers.forEach((layer, index) => {
    const y = (index + 1) * layerHeight;
    const boxY = y - layerHeight / 2;

    // Layer box
    svg += `<rect x="${startX}" y="${boxY}" width="${boxWidth}" height="${layerHeight - 10}" 
            fill="#1a1a1a" stroke="${color}" stroke-width="${strokeWidth}" rx="2"/>`;
    
    // Layer name
    svg += `<text x="${startX + 20}" y="${y - 10}" 
            fill="${color}" font-family="monospace" font-size="${fontSize + 2}" 
            font-weight="bold">${layer.name}</text>`;
    
    // Protocols
    svg += `<text x="${startX + 20}" y="${y + 10}" 
            fill="#b0b0b0" font-family="monospace" font-size="${fontSize}">${layer.protocols.join(', ')}</text>`;
  });

  svg += '</svg>';
  return svg;
}

/**
 * Generate a packet structure diagram
 */
export function generatePacketStructureDiagram(options: DiagramOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, color, strokeWidth, fontSize } = opts;

  const segments = [
    { name: 'Header', size: 20, color: '#00ffff' },
    { name: 'Payload', size: 60, color: '#00ff41' },
    { name: 'Footer', size: 20, color: '#ffaa00' },
  ];

  const startX = width / 4;
  const boxHeight = 100;
  const boxY = height / 2 - boxHeight / 2;
  let currentX = startX;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#0a0a0a"/>`;

  // Title
  svg += `<text x="${width / 2}" y="${boxY - 20}" 
          fill="${color}" font-family="monospace" font-size="${fontSize + 4}" 
          font-weight="bold" text-anchor="middle">Packet Structure</text>`;

  segments.forEach((segment, index) => {
    const segmentWidth = (width / 2) * (segment.size / 100);
    
    svg += `<rect x="${currentX}" y="${boxY}" width="${segmentWidth}" height="${boxHeight}" 
            fill="${segment.color}" stroke="${color}" stroke-width="${strokeWidth}" opacity="0.8"/>`;
    svg += `<text x="${currentX + segmentWidth / 2}" y="${boxY + boxHeight / 2}" 
            fill="#0a0a0a" font-family="monospace" font-size="${fontSize}" 
            font-weight="bold" text-anchor="middle" dominant-baseline="middle">${segment.name}</text>`;
    
    currentX += segmentWidth;
  });

  // Labels
  svg += `<text x="${startX}" y="${boxY + boxHeight + 20}" 
          fill="#b0b0b0" font-family="monospace" font-size="${fontSize - 2}">Start</text>`;
  svg += `<text x="${currentX}" y="${boxY + boxHeight + 20}" 
          fill="#b0b0b0" font-family="monospace" font-size="${fontSize - 2}" text-anchor="end">End</text>`;

  svg += '</svg>';
  return svg;
}

/**
 * Generate a simple firewall diagram
 */
export function generateFirewallDiagram(options: DiagramOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, color, strokeWidth, fontSize } = opts;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#0a0a0a"/>`;

  const firewallX = width / 2;
  const firewallWidth = 20;
  const firewallHeight = height * 0.6;

  // Internet side
  svg += `<text x="${width / 4}" y="${height / 2}" 
          fill="${color}" font-family="monospace" font-size="${fontSize + 2}" 
          text-anchor="middle">Internet</text>`;
  
  // Firewall
  svg += `<rect x="${firewallX - firewallWidth / 2}" y="${height / 2 - firewallHeight / 2}" 
          width="${firewallWidth}" height="${firewallHeight}" 
          fill="#2a2a2a" stroke="${color}" stroke-width="${strokeWidth * 2}"/>`;
  svg += `<text x="${firewallX}" y="${height / 2}" 
          fill="${color}" font-family="monospace" font-size="${fontSize}" 
          font-weight="bold" text-anchor="middle" dominant-baseline="middle">Firewall</text>`;
  
  // Internal network
  svg += `<text x="${(width * 3) / 4}" y="${height / 2}" 
          fill="${color}" font-family="monospace" font-size="${fontSize + 2}" 
          text-anchor="middle">Internal Network</text>`;

  // Allowed connection
  svg += `<line x1="${width / 4}" y1="${height / 2 - 40}" 
          x2="${firewallX - firewallWidth / 2}" y2="${height / 2 - 40}" 
          stroke="${color}" stroke-width="${strokeWidth}" opacity="0.8"/>`;
  svg += `<line x1="${firewallX + firewallWidth / 2}" y1="${height / 2 - 40}" 
          x2="${(width * 3) / 4}" y2="${height / 2 - 40}" 
          stroke="${color}" stroke-width="${strokeWidth}" opacity="0.8"/>`;
  svg += `<text x="${firewallX}" y="${height / 2 - 50}" 
          fill="#00ff41" font-family="monospace" font-size="${fontSize - 2}" 
          text-anchor="middle">Allowed</text>`;

  // Blocked connection
  svg += `<line x1="${width / 4}" y1="${height / 2 + 40}" 
          x2="${firewallX - firewallWidth / 2}" y2="${height / 2 + 40}" 
          stroke="#ff0044" stroke-width="${strokeWidth}" opacity="0.8"/>`;
  svg += `<line x1="${firewallX - firewallWidth / 2}" y1="${height / 2 + 40}" 
          x2="${firewallX - firewallWidth / 2}" y2="${height / 2 + 60}" 
          stroke="#ff0044" stroke-width="${strokeWidth}" opacity="0.8"/>`;
  svg += `<text x="${firewallX - 40}" y="${height / 2 + 70}" 
          fill="#ff0044" font-family="monospace" font-size="${fontSize - 2}">Blocked</text>`;

  svg += '</svg>';
  return svg;
}

/**
 * Save generated diagram to a data URL
 */
export function diagramToDataURL(svgString: string): string {
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}

