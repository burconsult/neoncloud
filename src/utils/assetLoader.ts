/**
 * Asset loading utilities for NeonCloud
 * 
 * Provides helper functions for loading and managing graphics assets
 */

/**
 * Get the path to an icon asset
 */
export function getIconPath(name: string, size: number = 24): string {
  return `/assets/icons/${name}-${size}.svg`;
}

/**
 * Get the path to a diagram asset
 */
export function getDiagramPath(name: string): string {
  return `/assets/images/diagrams/${name}.svg`;
}

/**
 * Get the path to a badge asset
 */
export function getBadgePath(name: string): string {
  return `/assets/badges/${name}.svg`;
}

/**
 * Get the path to a mission asset
 */
export function getMissionAssetPath(name: string): string {
  return `/assets/images/missions/${name}.svg`;
}

/**
 * Preload an asset
 */
export function preloadAsset(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = path.endsWith('.svg') ? 'image' : 'image';
    link.href = path;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload asset: ${path}`));
    document.head.appendChild(link);
  });
}

/**
 * Preload multiple assets
 */
export async function preloadAssets(paths: string[]): Promise<void> {
  await Promise.all(paths.map(preloadAsset));
}

