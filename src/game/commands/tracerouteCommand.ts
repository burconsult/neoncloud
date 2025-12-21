import { Command, CommandResult } from '@/types';
import { findHost, simulateTraceroute } from '../network/networkSimulation';
import { isCommandAvailableForMission } from '../missions/missionProgression';

/**
 * Traceroute command - Trace network path to a host
 */
export const tracerouteCommand: Command = {
  name: 'traceroute',
  aliases: ['tracert'],
  description: 'Trace the network path to a host',
  usage: 'traceroute <host>',
  educationalNote: 'Traceroute shows the path data takes through the network, revealing routers and network hops.',
  execute: (args: string[]): CommandResult => {
    // Check mission availability
    const availability = isCommandAvailableForMission('traceroute');
    if (!availability.available) {
      return {
        output: [
          `⚠️  Command not available yet`,
          '',
          availability.message || 'This command will be available in a later mission.',
          '',
          'Complete the current mission to unlock new commands!',
        ],
        success: false,
        error: 'Command locked',
      };
    }

    if (args.length === 0) {
      return {
        output: [
          'traceroute: missing host operand',
          'Usage: traceroute <host>',
          '',
          'Examples:',
          '  traceroute localhost',
          '  traceroute 8.8.8.8',
          '  traceroute example.com',
        ],
        success: false,
        error: 'Missing argument',
      };
    }

    const hostQuery = args[0];
    if (!hostQuery || typeof hostQuery !== 'string') {
      return {
        output: 'Usage: traceroute <hostname>',
        success: false,
        error: 'Missing hostname',
      };
    }
    const host = findHost(hostQuery);

    if (!host) {
      return {
        output: `traceroute: ${hostQuery}: Name or service not known`,
        success: false,
        error: 'Host not found',
      };
    }

    const hops = simulateTraceroute(host);

    const output: string[] = [];
    output.push(`traceroute to ${host.domain || host.name} (${host.ip}), 15 hops max`);
    output.push('');

    hops.forEach((hop) => {
      const times = [hop.time];
      if (hop.time2) times.push(hop.time2);
      if (hop.time3) times.push(hop.time3);
      
      const timeStr = times.map(t => `${t} ms`).join('  ');
      const hostname = hop.hostname ? ` (${hop.hostname})` : '';
      
      output.push(` ${hop.hop}  ${hop.ip}${hostname}  ${timeStr}`);
    });

    if (!host.isOnline) {
      output.push('');
      output.push('Destination host unreachable');
    }

    // Add educational note
    output.push('');
    output.push('💡 Tip: Traceroute shows each router (hop) your data passes through.');
    output.push('   Each hop adds latency. The path reveals network topology.');

    return {
      output,
      success: host.isOnline,
      educationalContent: {
        id: 'traceroute-explanation',
        title: 'Understanding Traceroute',
        content: `Traceroute maps the path data takes from your computer to a destination host.

**How it works:**
- Sends packets with increasing TTL (Time To Live) values
- Each router decrements TTL and sends back an error when TTL reaches 0
- By incrementing TTL, we discover each hop in the path

**What the output means:**
- **Hop number**: Sequential router in the path
- **IP address**: Router's IP address
- **Hostname**: Domain name of the router (if available)
- **Times**: Response times for 3 packets (shows consistency)

**Common uses:**
- Diagnosing network routing issues
- Understanding network topology
- Finding where network delays occur`,
        type: 'concept',
        relatedCommands: ['traceroute'],
        relatedMissions: [],
        difficulty: 2,
      },
    };
  },
};

