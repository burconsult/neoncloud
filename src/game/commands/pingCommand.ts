import { Command, CommandResult } from '@/types';
import { findHost, simulatePing, calculatePingStats } from '../network/networkSimulation';
import { isCommandAvailableForMission } from '../missions/missionProgression';

/**
 * Ping command - Test network connectivity
 */
export const pingCommand: Command = {
  name: 'ping',
  description: 'Test network connectivity to a host',
  usage: 'ping <host> [-c count]',
  educationalNote: 'Ping uses the ICMP protocol to test if a host is reachable and measure response time.',
  execute: (args: string[]): CommandResult => {
    // Check mission availability
    const availability = isCommandAvailableForMission('ping');
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
          'ping: missing host operand',
          'Usage: ping <host> [-c count]',
          '',
          'Examples:',
          '  ping localhost',
          '  ping 8.8.8.8',
          '  ping dns.google',
          '  ping example.com -c 5',
        ],
        success: false,
        error: 'Missing argument',
      };
    }

    let hostQuery = args[0];
    let count = 4; // Default ping count

    // Parse arguments
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-c' && i + 1 < args.length) {
        const parsedCount = parseInt(args[i + 1], 10);
        if (!isNaN(parsedCount) && parsedCount > 0 && parsedCount <= 20) {
          count = parsedCount;
          i++; // Skip the count value
        }
      }
    }

    const host = findHost(hostQuery);

    if (!host) {
      return {
        output: `ping: ${hostQuery}: Name or service not known`,
        success: false,
        error: 'Host not found',
      };
    }

    const results = simulatePing(host, count);
    const stats = calculatePingStats(results);

    // Format output
    const output: string[] = [];
    
    output.push(`PING ${host.domain || host.name} (${host.ip})`);
    
    if (host.description) {
      output.push(`Host: ${host.description}`);
    }
    output.push('');

    // Show ping results
    results.forEach((result) => {
      if (result.success) {
        output.push(
          `${result.sequence ? result.sequence + ' ' : ''}bytes from ${host.ip}: icmp_seq=${result.sequence || 1} time=${result.time}ms ttl=${result.ttl || 64}`
        );
      } else {
        output.push(`Request timeout for icmp_seq=${result.sequence || 1}`);
      }
    });

    output.push('');
    output.push(`--- ${host.domain || host.name} ping statistics ---`);
    output.push(
      `${stats.sent} packets transmitted, ${stats.received} received, ${stats.lost} lost (${stats.lossPercentage}% packet loss)`
    );

    if (stats.received > 0) {
      output.push(
        `rtt min/avg/max = ${stats.minTime}/${stats.avgTime}/${stats.maxTime} ms`
      );
    }

    // Add educational note for first use
    if (count === 4) {
      output.push('');
      output.push('💡 Tip: Ping uses ICMP (Internet Control Message Protocol) to test connectivity.');
      output.push('   Response time (latency) shows how fast data travels to the host.');
    }

    return {
      output,
      success: stats.received > 0,
      educationalContent: {
        id: 'ping-explanation',
        title: 'Understanding Ping',
        content: `Ping is a network utility that tests connectivity between your computer and another host on the network.

**How it works:**
- Sends ICMP echo request packets to the target host
- Waits for ICMP echo reply packets
- Measures the time taken (latency)

**What the output means:**
- **time**: Response time in milliseconds (lower is better)
- **ttl**: Time To Live - how many hops the packet can make
- **packet loss**: Percentage of packets that didn't return

**Common uses:**
- Testing if a server is online
- Measuring network latency
- Diagnosing network connectivity issues`,
        type: 'concept',
        relatedCommands: ['ping'],
        relatedMissions: [],
        difficulty: 1,
      },
    };
  },
};

