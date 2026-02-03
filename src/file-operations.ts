import path from 'path';
import fs from 'fs-extra';
import fg from 'fast-glob';
import { lstat } from 'fs/promises';
import type { FeatureToggleConfig, FileOperation, Modification } from './types.js';

/**
 * Patterns for files/folders to exclude when copying template
 */
export const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/ios/**',
  '**/android/**',
  '**/.expo/**',
  '**/build/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/.cache/**',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
  '**/.env*',
  '**/*.tgz',
  '**/*.local',
];

/**
 * Copy template directory to target, excluding unnecessary files
 */
export async function copyTemplate(
  templateDir: string,
  targetDir: string
): Promise<void> {
  // Ensure target directory exists
  await fs.ensureDir(targetDir);

  // Get all files in template directory
  const files = await fg('**/*', {
    cwd: templateDir,
    dot: true,
    onlyFiles: false,
    ignore: EXCLUDE_PATTERNS.map((p) => p.replace('**/', '')),
  });

  // Copy each file/directory
  for (const file of files) {
    const srcPath = path.join(templateDir, file);
    const destPath = path.join(targetDir, file);

    const stat = await lstat(srcPath);
    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
    } else {
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath);
    }
  }
}

/**
 * Remove a file or directory
 */
export async function removeFile(targetDir: string, filePattern: string): Promise<void> {
  const targetPath = path.join(targetDir, filePattern);

  if (await fs.exists(targetPath)) {
    await fs.remove(targetPath);
  }
}

/**
 * Remove multiple files by pattern
 */
export async function removeFiles(
  targetDir: string,
  patterns: string[]
): Promise<void> {
  for (const pattern of patterns) {
    await removeFile(targetDir, pattern);
  }
}

/**
 * Apply modifications to a file
 */
export async function modifyFile(
  targetDir: string,
  fileOperation: FileOperation
): Promise<void> {
  const filePath = path.join(targetDir, fileOperation.path);

  if (!(await fs.exists(filePath))) {
    return; // File may have been removed already
  }

  let content = await fs.readFile(filePath, 'utf-8');

  for (const mod of fileOperation.modifications || []) {
    switch (mod.type) {
      case 'remove-line':
        content = removeLineByPattern(content, mod.pattern);
        break;
      case 'remove-import':
        content = removeImport(content, mod.pattern);
        break;
      case 'remove-provider':
        content = removeProvider(content, mod.pattern);
        break;
      case 'remove-call':
        content = removeCallByPattern(content, mod.pattern);
        break;
      case 'replace':
        content = replacePattern(content, mod.pattern, mod.replacement || '');
        break;
    }
  }

  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Remove a line matching a pattern
 */
function removeLineByPattern(content: string, pattern: string | RegExp): string {
  const lines = content.split('\n');
  const regex = typeof pattern === 'string' ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : pattern;

  return lines
    .filter((line) => !regex.test(line))
    .join('\n');
}

/**
 * Remove an import statement
 */
function removeImport(content: string, pattern: string | RegExp): string {
  const lines = content.split('\n');
  const regex = typeof pattern === 'string' ? new RegExp(`import.*${pattern}.*;`) : pattern;

  // Remove import lines
  const filtered = lines.filter((line) => !regex.test(line.trim()));

  // Clean up double newlines
  return filtered
    .join('\n')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
}

/**
 * Remove a provider wrapper (nested tags)
 */
function removeProvider(content: string, pattern: string | RegExp): string {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gs') : pattern;
  return content.replace(regex, (match) => {
    // Extract the inner content
    const innerMatch = match.match(/<\w+>([\s\S]*)<\/\w+>/);
    if (innerMatch) {
      return innerMatch[1];
    }
    return '';
  });
}

/**
 * Remove a function call and surrounding code
 */
function removeCallByPattern(content: string, pattern: string | RegExp): string {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gs') : pattern;
  return content.replace(regex, (match) => {
    // Try to remove the entire statement including surrounding braces
    const lines = content.split('\n');
    const result: string[] = [];
    let skipping = false;
    let braceDepth = 0;

    for (const line of lines) {
      if (regex.test(line)) {
        skipping = true;
        // Check if the line starts a block
        if (line.includes('{')) {
          braceDepth++;
        }
        continue;
      }

      if (skipping) {
        if (line.includes('{')) braceDepth++;
        if (line.includes('}')) braceDepth--;
        if (braceDepth === 0 && !line.trim().startsWith('//')) {
          skipping = false;
        }
        continue;
      }

      result.push(line);
    }

    return result.join('\n');
  });
}

/**
 * Replace a pattern with replacement string
 */
function replacePattern(
  content: string,
  pattern: string | RegExp,
  replacement: string
): string {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'g') : pattern;
  return content.replace(regex, replacement);
}

/**
 * Remove dependencies from package.json
 */
export async function removeDependencies(
  targetDir: string,
  dependencies: string[]
): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json');

  if (!(await fs.exists(packageJsonPath))) {
    return;
  }

  const packageJson = await fs.readJson(packageJsonPath);

  // Remove from dependencies
  if (packageJson.dependencies) {
    for (const dep of dependencies) {
      delete packageJson.dependencies[dep];
    }
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Remove plugins from app.json
 */
export async function removePlugins(
  targetDir: string,
  plugins: (string | object)[]
): Promise<void> {
  const appJsonPath = path.join(targetDir, 'app.json');

  if (!(await fs.exists(appJsonPath))) {
    return;
  }

  const appJson = await fs.readJson(appJsonPath);

  if (!appJson.expo?.plugins) {
    return;
  }

  const pluginsToRemove = new Set<string>();

  // Build set of plugin names to remove
  for (const plugin of plugins) {
    if (typeof plugin === 'string') {
      pluginsToRemove.add(plugin);
    } else if (typeof plugin === 'object' && Array.isArray(plugin)) {
      pluginsToRemove.add(plugin[0] as string);
    }
  }

  // Filter out removed plugins
  appJson.expo.plugins = appJson.expo.plugins.filter((plugin: unknown) => {
    if (typeof plugin === 'string') {
      return !pluginsToRemove.has(plugin);
    } else if (Array.isArray(plugin)) {
      return !pluginsToRemove.has(plugin[0] as string);
    }
    return true;
  });

  await fs.writeJson(appJsonPath, appJson, { spaces: 2 });
}

/**
 * Apply all feature toggle configurations
 */
export async function applyFeatureToggles(
  targetDir: string,
  configs: FeatureToggleConfig[]
): Promise<void> {
  for (const config of configs) {
    // Remove files
    await removeFiles(targetDir, config.filesToRemove);

    // Modify files
    for (const fileOp of config.filesToModify) {
      await modifyFile(targetDir, fileOp);
    }

    // Remove dependencies
    await removeDependencies(targetDir, config.dependenciesToRemove);

    // Remove plugins
    await removePlugins(targetDir, config.pluginsToRemove);
  }
}
