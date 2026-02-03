import * as inquirer from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import type { Answers, Feature } from './types.js';

/**
 * Validates project name (npm package name + folder safe)
 */
function validateProjectName(name: string): boolean | string {
  if (!name) {
    return 'Project name is required';
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name)) {
    return 'Project name must be lowercase letters, numbers, and hyphens only';
  }
  if (name.length > 214) {
    return 'Project name is too long (max 214 characters)';
  }
  return true;
}

/**
 * Validates bundle ID format
 */
function validateBundleId(bundleId: string): boolean | string {
  if (!bundleId) {
    return 'Bundle ID is required';
  }
  // Must be lowercase letters/numbers/dots, at least 2 segments, each starts with letter
  const bundleIdRegex = /^(?![0-9])[a-z][a-z0-9]*(\.(?![0-9])[a-z][a-z0-9]*)+$/;
  if (!bundleIdRegex.test(bundleId)) {
    return 'Bundle ID must be in reverse domain format (e.g., com.company.app) with lowercase letters, numbers, and dots';
  }
  const segments = bundleId.split('.');
  if (segments.length < 2) {
    return 'Bundle ID must have at least 2 segments separated by dots';
  }
  return true;
}

/**
 * Validates file path exists
 */
function validateFilePath(filePath: string): boolean | string {
  if (!filePath) {
    return true; // Optional
  }
  if (!fs.existsSync(filePath)) {
    return `File does not exist: ${filePath}`;
  }
  return true;
}

/**
 * Validates google-services.json specifically
 */
function validateGoogleServices(filePath: string): boolean | string {
  if (!filePath) {
    return true; // Optional
  }
  const pathValidation = validateFilePath(filePath);
  if (pathValidation !== true) {
    return pathValidation;
  }
  const basename = path.basename(filePath);
  if (basename !== 'google-services.json') {
    return 'File must be named google-services.json';
  }
  try {
    const content = fs.readJsonSync(filePath);
    if (!content.project_info || !content.client) {
      return 'Invalid google-services.json format';
    }
  } catch {
    return 'Invalid JSON format in google-services.json';
  }
  return true;
}

/**
 * Validates GoogleService-Info.plist specifically
 */
function validateGoogleServiceInfoPlist(filePath: string): boolean | string {
  if (!filePath) {
    return true; // Optional
  }
  const pathValidation = validateFilePath(filePath);
  if (pathValidation !== true) {
    return pathValidation;
  }
  const basename = path.basename(filePath);
  if (basename !== 'GoogleService-Info.plist') {
    return 'File must be named GoogleService-Info.plist';
  }
  // Basic plist validation - must be a valid XML/plist file
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('<?xml') && !content.includes('plist')) {
      return 'Invalid GoogleService-Info.plist format';
    }
  } catch {
    return 'Invalid file format';
  }
  return true;
}

/**
 * Prompts user for all required information
 */
export async function promptUser(projectNameArg?: string): Promise<Answers> {
  const answers: Partial<Answers> = {};

  // Project name
  if (projectNameArg) {
    const validation = validateProjectName(projectNameArg);
    if (validation !== true) {
      throw new Error(`Invalid project name: ${validation}`);
    }
    answers.projectName = projectNameArg;
  } else {
    answers.projectName = await inquirer.input({
      message: 'What is your project name?',
      default: 'my-atto-app',
      validate: validateProjectName,
    });
  }

  // Bundle ID
  const defaultBundleId = `com.company.${answers.projectName!.replace(/-/g, '')}`;
  answers.bundleId = await inquirer.input({
    message: 'What is your bundle identifier?',
    default: defaultBundleId,
    validate: validateBundleId,
  });

  // Package manager
  answers.packageManager = await inquirer.select({
    message: 'Which package manager do you want to use?',
    choices: [
      { name: 'npm', value: 'npm', description: 'Default Node.js package manager' },
      { name: 'pnpm', value: 'pnpm', description: 'Fast, disk space efficient package manager' },
      { name: 'yarn', value: 'yarn', description: 'Fast, reliable package manager' },
      { name: 'bun', value: 'bun', description: 'Fast JavaScript runtime and package manager' },
    ],
    default: 'npm',
  });

  // Features
  answers.features = (await inquirer.checkbox({
    message: 'Which features would you like to include?',
    choices: [
      {
        name: 'Firebase',
        value: 'firebase',
        description: 'Analytics, Auth, and Firestore via @react-native-firebase',
        checked: false,
      },
      {
        name: 'RevenueCat',
        value: 'revenuecat',
        description: 'In-app purchases and subscriptions via react-native-purchases',
        checked: false,
      },
      {
        name: 'AdMob',
        value: 'admob',
        description: 'Banner ads via react-native-google-mobile-ads',
        checked: false,
      },
    ],
  })) ?? [];

  // Firebase config paths (if Firebase selected)
  if (answers.features.includes('firebase')) {
    console.log('');
    console.log(chalk.yellow('Firebase configuration files:'));
    console.log(chalk.gray('You can provide these now or add them manually later.'));

    const provideNow = await inquirer.confirm({
      message: 'Do you want to provide Firebase config files now?',
      default: false,
    });

    if (provideNow) {
      const googleServicesPath = await inquirer.input({
        message: 'Path to google-services.json:',
        validate: validateGoogleServices,
      });

      if (googleServicesPath) {
        answers.googleServicesPath = googleServicesPath;
      }

      const googleServiceInfoPlistPath = await inquirer.input({
        message: 'Path to GoogleService-Info.plist:',
        validate: validateGoogleServiceInfoPlist,
      });

      if (googleServiceInfoPlistPath) {
        answers.googleServiceInfoPlistPath = googleServiceInfoPlistPath;
      }
    }
  }

  return answers as Answers;
}
