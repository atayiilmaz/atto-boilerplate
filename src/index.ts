#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { runScaffolder } from './scaffolder.js';
import { promptUser } from './prompts.js';
import type { Answers } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('create-atto')
  .description('Create a new Expo app with the Atto boilerplate')
  .version('0.1.0')
  .argument('[project-name]', 'Name of the project')
  .option('-d, --default', 'Skip prompts and use defaults')
  .option('--yes', 'Skip confirmation prompts')
  .action(async (projectName: string | undefined, options: { default?: boolean; yes?: boolean }) => {
    console.log('');
    console.log(chalk.cyan.bold('┌─────────────────────────────────────────┐'));
    console.log(chalk.cyan.bold('│') + chalk.cyan.bold('  Welcome to ') + chalk.white.bold('Atto') + chalk.cyan.bold(' Scaffolder') + chalk.cyan.bold('        │'));
    console.log(chalk.cyan.bold('└─────────────────────────────────────────┘'));
    console.log('');

    try {
      // If project name provided, use it; otherwise prompt
      let answers: Answers;

      if (projectName && options.default) {
        answers = {
          projectName,
          bundleId: `com.company.${projectName}`,
          packageManager: 'npm',
          features: [],
        };
      } else {
        answers = await promptUser(projectName);
      }

      // Get template directory
      const templateDir = path.resolve(__dirname, '../template');

      // Run scaffolder
      await runScaffolder(answers, templateDir, options.yes);

      console.log('');
      console.log(chalk.green('✓ Project created successfully!'));
      console.log('');
      printNextSteps(answers);
    } catch (error) {
      if (error instanceof Error) {
        console.error('');
        console.error(chalk.red('Error:'), error.message);
        if (error.stack) {
          console.error(chalk.gray(error.stack));
        }
      }
      process.exit(1);
    }
  });

function printNextSteps(answers: Answers) {
  const { projectName, packageManager, features } = answers;

  console.log(chalk.cyan('Next steps:'));
  console.log('');

  console.log(chalk.gray('1. Navigate to your project:'));
  console.log(`   ${chalk.white('cd')} ${chalk.cyan(projectName)}`);
  console.log('');

  console.log(chalk.gray('2. Install dependencies:'));
  const installCmd = getInstallCommand(packageManager);
  console.log(`   ${chalk.cyan(installCmd)}`);
  console.log('');

  console.log(chalk.gray('3. Run prebuild to generate native code:'));
  console.log(`   ${chalk.cyan('npx expo prebuild --clean')}`);
  console.log('');

  console.log(chalk.gray('4. Run on iOS:'));
  console.log(`   ${chalk.cyan('npx expo run:ios')}`);
  console.log('');

  console.log(chalk.gray('5. Run on Android:'));
  console.log(`   ${chalk.cyan('npx expo run:android')}`);
  console.log('');

  if (features.includes('firebase')) {
    console.log(chalk.yellow('Firebase setup required:'));
    console.log(`   ${chalk.gray('Make sure to place your firebase config files:')}
   ${chalk.white('  • google-services.json')} ${chalk.gray('(in root)')}
   ${chalk.white('  • GoogleService-Info.plist')} ${chalk.gray('(in root)')}`);
    console.log('');
  }

  if (features.includes('revenuecat')) {
    console.log(chalk.yellow('RevenueCat setup required:'));
    console.log(`   ${chalk.gray('Update the API key in:')}
   ${chalk.white('  • context/PremiumContext.tsx')}`);
    console.log('');
  }

  if (features.includes('admob')) {
    console.log(chalk.yellow('AdMob setup required:'));
    console.log(`   ${chalk.gray('Update ad unit IDs in:')}
   ${chalk.white('  • constants/ads.ts')}
   ${chalk.white('  • app.json')} ${chalk.gray('(androidAppId/iosAppId)')}`);
    console.log('');
  }

  console.log(chalk.gray('Happy coding! 🚀'));
  console.log('');
}

function getInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn';
    case 'bun':
      return 'bun install';
    case 'npm':
    default:
      return 'npm install';
  }
}

program.parse();
