/**
 * E2E test tag detection
 *
 * Analyzes PR changes and determines which test tags should run.
 * - Parses changed E2E test files to extract tags directly
 * - Maps changed source files to feature tags
 * - Always includes @critical and @smoke as baseline
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// Feature tag mappings for source file changes
const FEATURE_MAPPINGS = {
  auth: [
    'src/contexts/auth-context.tsx',
    'src/components/auth/',
    'src/app/api/auth/',
  ],
  listing: ['src/app/listing/', 'src/components/listing/'],
  properties: ['src/app/properties/', 'src/components/property'],
  payment: ['src/app/properties/[id]/payment/', 'src/lib/stripe'],
  messaging: ['src/app/messages/', 'src/components/messaging/'],
  inquiry: ['src/app/listings/[id]/inquiry/', 'src/components/inquiry/'],
  account: ['src/app/account/', 'src/components/account/'],
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
 * Extract tags from E2E test file content
 * Looks for patterns like @tag in test.describe() and test() calls
 */
function extractTagsFromTestFile(filePath) {
  const tags = new Set();

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match @tag patterns that are:
    // - Preceded by whitespace or string quote (to avoid emails like test@example.com)
    // - Followed by whitespace, quote, or end of line
    // e.g., test.describe('Some Test @inquiry @critical', ...)
    // e.g., test('should do something @smoke', ...)
    const tagPattern = /(?:^|[\s'"])@(\w+)(?=[\s'",)\]]|$)/gm;
    let match;

    while ((match = tagPattern.exec(content)) !== null) {
      const tag = match[1];
      // Filter out common non-tag @ patterns (JSDoc tags)
      const docTags = [
        'param',
        'returns',
        'type',
        'typedef',
        'example',
        'see',
        'link',
        'tag',
        'description',
      ];
      if (!docTags.includes(tag)) {
        tags.add(`@${tag}`);
      }
    }
  } catch (error) {
    console.error(`Error reading test file ${filePath}:`, error.message);
  }

  return tags;
}

/**
 * Extract tags from all changed E2E test files
 */
function extractTagsFromChangedTests(changedFiles) {
  const tags = new Set();

  for (const file of changedFiles) {
    // Only process E2E test files
    if (file.startsWith('tests/e2e/') && file.endsWith('.spec.ts')) {
      const absolutePath = path.resolve(process.cwd(), file);
      const fileTags = extractTagsFromTestFile(absolutePath);
      for (const tag of fileTags) {
        tags.add(tag);
      }
    }
  }

  return tags;
}

/**
 * Map changed source files to feature tags
 */
function detectFeatureTagsFromSource(changedFiles) {
  const tags = new Set();

  for (const file of changedFiles) {
    // Skip test files - they're handled by extractTagsFromChangedTests
    if (file.startsWith('tests/')) continue;

    for (const [feature, patterns] of Object.entries(FEATURE_MAPPINGS)) {
      if (patterns.some((pattern) => file.includes(pattern))) {
        tags.add(`@${feature}`);
      }
    }
  }

  return tags;
}

/**
 * Detect all relevant tags from changed files
 * Combines: default tags + tags from test files + tags from source mappings
 */
function detectAllTags(changedFiles) {
  const tags = new Set(DEFAULT_TAGS);

  // Extract tags directly from changed E2E test files
  const testFileTags = extractTagsFromChangedTests(changedFiles);
  for (const tag of testFileTags) {
    tags.add(tag);
  }

  // Map source file changes to feature tags
  const sourceTags = detectFeatureTagsFromSource(changedFiles);
  for (const tag of sourceTags) {
    tags.add(tag);
  }

  return Array.from(tags);
}

/**
 * @deprecated Use detectAllTags instead
 * Map changed files to feature tags (legacy function for backwards compatibility)
 */
function detectFeatureTags(changedFiles) {
  return detectAllTags(changedFiles);
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

  // Detect tags from both test files and source mappings
  const tags = detectAllTags(changedFiles);
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

module.exports = {
  getChangedFiles,
  detectAllTags,
  detectFeatureTags, // deprecated, kept for backwards compatibility
  detectFeatureTagsFromSource,
  extractTagsFromChangedTests,
  generateGrepFilter,
};
