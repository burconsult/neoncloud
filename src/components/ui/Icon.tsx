import {
  HelpCircle,
  MessageSquare,
  Trash2,
  FileText,
  FolderOpen,
  Network,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  BookOpen,
  Award,
  Terminal,
  Code,
  Server,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RefreshCw,
  List,
  Circle,
  Info,
} from 'lucide-react';

/**
 * Icon name mapping to actual icon components
 */
const iconMap: Record<string, React.ComponentType<any>> = {
  // Command icons
  'help': HelpCircle,
  'echo': MessageSquare,
  'clear': Trash2,
  'cls': Trash2,
  'ls': List,
  'cd': FolderOpen,
  'cat': FileText,
  'ping': Network,
  'whoami': User,
  'user': User,
  'pwd': MapPin,
  'traceroute': Network,
  'nslookup': Search,
  'whois': Search,
  'scan': Search,
  'encrypt': Lock,
  'decrypt': Unlock,
  'lock': Lock,
  'unlock': Unlock,
  'verify': Shield,
  'firewall': Shield,
  'analyze': Eye,
  'configure': Settings,
  'monitor': Eye,
  'secure': Shield,
  'terminal': Terminal,
  'code': Code,
  'server': Server,
  
  // Status icons
  'success': CheckCircle2,
  'check': CheckCircle2,
  'check-circle': CheckCircle2,
  'error': XCircle,
  'warning': AlertTriangle,
  'info': Info,
  
  // Navigation icons
  'arrow-up': ChevronUp,
  'arrow-down': ChevronDown,
  'arrow-left': ChevronLeft,
  'arrow-right': ChevronRight,
  'up': ChevronUp,
  'down': ChevronDown,
  'left': ChevronLeft,
  'right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  
  // UI icons
  'settings': Settings,
  'gear': Settings,
  'book': BookOpen,
  'book-open': BookOpen,
  'notes': BookOpen,
  'trophy': Award,
  'badge': Award,
  'achievement': Award,
  'award': Award,
  'download': Download,
  'upload': Upload,
  'play': Play,
  'pause': Pause,
  'stop': Square,
  'refresh': RefreshCw,
  'reload': RefreshCw,
  'filter': Filter,
  'search': Search,
  'eye': Eye,
  'eye-off': EyeOff,
  'circle': Circle,
  'icon': HelpCircle, // Generic icon fallback
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

/**
 * Icon component that uses lucide-react icon library
 * 
 * @example
 * <Icon name="help" size={24} aria-label="Help" />
 * <Icon name="success" size={16} color="#00ff41" />
 */
export function Icon({
  name,
  size = 24,
  className = '',
  color,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = !ariaLabel,
}: IconProps) {
  const IconComponent = iconMap[name.toLowerCase()];
  
  if (!IconComponent) {
    // Fallback to a default icon if not found
    console.warn(`Icon "${name}" not found. Using default icon.`);
    return (
      <HelpCircle
        size={size}
        className={className}
        color={color}
        aria-label={ariaLabel || `Icon: ${name}`}
        aria-hidden={ariaHidden}
      />
    );
  }

  const style = color ? { color } : undefined;

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      style={style}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    />
  );
}

/**
 * Get available icon names
 */
export function getAvailableIcons(): string[] {
  return Object.keys(iconMap);
}
