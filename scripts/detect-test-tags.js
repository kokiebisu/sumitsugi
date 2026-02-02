/**
 * Claude-powered E2E test tag detection
 *
 * Analyzes PR changes and determines which test tags should run.
 * Always includes @critical and @smoke as baseline.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// Feature tag mappings (used as hints for Claude)
const FEATURE_MAPPINGS = {
  auth: [
    'src/contexts/auth-context.tsx',
    'src/components/auth/',
    'src/app/api/auth/',
  ],
  listing: ['src/app/listing/', 'src/components/listing/'],
  properties: ['src/app/properties/', 'src/components/property'],
  payment: [
    'src/app/properties/[id]/payment/',
    'src/lib/stripe',
    'tests/e2e/payment/',
  ],
  messaging: ['src/app/messages/', 'src/components/messaging/'],
};

// Default tags (always run)
const DEFAULT_TAGS = ['@critical', '@smoke'];

/**
 * Detect changed files from git diff
 */
async function getChangedFiles() {
  try {
    const baseBranch = process.env.GITHUB_BASE_REF || 'main';
    const { stdout } = await execFileAsync('git', [
      'diff',
      '--name-only',
      `origin/${baseBranch}...HEAD`,
    ]);

    return stdout.split('\n').filter((file) => file.trim().length > 0);
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Map changed files to feature tags (simple heuristic fallback)
 */
function detectFeatureTags(changedFiles) {
  const tags = new Set(DEFAULT_TAGS);

  for (const file of changedFiles) {
    for (const [feature, patterns] of Object.entries(FEATURE_MAPPINGS)) {
      if (patterns.some((pattern) => file.includes(pattern))) {
        tags.add(`@${feature}`);
      }
    }
  }

  return Array.from(tags);
}

/**
 * Generate Playwright grep filter from tags
 * Uses regex OR (|) for Playwright --grep compatibility
 */
function generateGrepFilter(tags) {
  return tags.join('|');
}

/**
 * Main execution
 */
async function main() {
  const changedFiles = await getChangedFiles();

  console.log('Changed files:', changedFiles);

  if (changedFiles.length === 0) {
    console.log('No changes detected, using default tags');
    const defaultFilter = generateGrepFilter(DEFAULT_TAGS);
    console.log('::set-output name=filter::' + defaultFilter);
    return;
  }

  const tags = detectFeatureTags(changedFiles);
  const filter = generateGrepFilter(tags);

  console.log('Detected tags:', tags);
  console.log('Generated filter:', filter);

  // Output for GitHub Actions (using modern GITHUB_OUTPUT syntax)
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `filter=${filter}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `tags=${tags.join(',')}\n`);
  } else {
    // Fallback for local testing
    console.log('Filter:', filter);
    console.log('Tags:', tags.join(','));
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { getChangedFiles, detectFeatureTags, generateGrepFilter };
