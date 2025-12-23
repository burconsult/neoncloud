/**
 * Diagram Component
 * 
 * Programmatic SVG diagram generator for educational content.
 * 
 * STATUS: Available for future use - not currently integrated into missions/educational popups.
 * 
 * This component can be used to display educational diagrams in:
 * - Educational popups
 * - Mission descriptions
 * - Help system
 * - Lore entries
 * 
 * @example
 * <Diagram 
 *   type="dns-resolution"
 *   title="DNS Resolution Process"
 *   description="Shows how DNS queries resolve domain names to IP addresses"
 * />
 */

import { 
  generateNetworkTopologyDiagram,
  generateDNSResolutionDiagram,
  generateTCPIPStackDiagram,
  generatePacketStructureDiagram,
  generateFirewallDiagram,
  diagramToDataURL,
  DiagramOptions,
} from '@/utils/diagramGenerator';

type DiagramType = 
  | 'network-topology'
  | 'dns-resolution'
  | 'tcpip-stack'
  | 'packet-structure'
  | 'firewall';

interface DiagramProps {
  type: DiagramType;
  title?: string;
  description?: string;
  className?: string;
  width?: number;
  height?: number;
  options?: DiagramOptions;
}

const diagramGenerators: Record<DiagramType, (options?: DiagramOptions) => string> = {
  'network-topology': generateNetworkTopologyDiagram,
  'dns-resolution': generateDNSResolutionDiagram,
  'tcpip-stack': generateTCPIPStackDiagram,
  'packet-structure': generatePacketStructureDiagram,
  'firewall': generateFirewallDiagram,
};

/**
 * Diagram component that generates SVG diagrams programmatically
 * 
 * @example
 * <Diagram 
 *   type="dns-resolution"
 *   title="DNS Resolution Process"
 *   description="Shows how DNS queries resolve domain names to IP addresses"
 * />
 */
export function Diagram({
  type,
  title,
  description,
  className = '',
  width,
  height,
  options = {},
}: DiagramProps) {
  const generator = diagramGenerators[type];
  
  if (!generator) {
    console.warn(`Diagram type "${type}" not found.`);
    return null;
  }

  const diagramOptions: DiagramOptions = {
    ...options,
    ...(width && { width }),
    ...(height && { height }),
  };

  const svgString = generator(diagramOptions);
  const dataURL = diagramToDataURL(svgString);

  return (
    <figure className={`diagram ${className}`}>
      <img
        src={dataURL}
        alt={description || title || `Diagram: ${type}`}
        className="diagram-image"
        loading="lazy"
      />
      {title && <figcaption className="diagram-caption">{title}</figcaption>}
      {description && (
        <p className="diagram-description" aria-label={description}>
          {description}
        </p>
      )}
    </figure>
  );
}

/**
 * Get available diagram types
 */
export function getAvailableDiagramTypes(): DiagramType[] {
  return Object.keys(diagramGenerators) as DiagramType[];
}
