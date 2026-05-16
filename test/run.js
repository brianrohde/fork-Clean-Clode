#!/usr/bin/env node
/**
 * Test runner for Clean Clode
 *
 * Usage:
 *   node test/run.js           # Run all tests
 *   node test/run.js 001       # Run test_001
 *
 * Test files:
 *   input_NNN.txt      - Input text to clean
 *   expected_NNN.txt   - Expected output
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CORE CLEANING FUNCTIONS (copied from script.js)
// Keep these in sync with script.js!
// ============================================================================

function isMarkdownTable(text) {
    // Match tables with optional leading spaces OR starting at column 0
    return /^[\s]*\|/m.test(text);
}

function extractMarkdownTables(input) {
    const lines = input.split('\n');
    const result = [];
    let currentTable = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^[\s]*\|/.test(line)) {
            // Table line: strip any leading whitespace (0 or more spaces)
            currentTable.push(line.replace(/^[\s]*/, ''));
        } else {
            if (currentTable.length > 0) {
                result.push({ type: 'table', content: currentTable.join('\n') });
                currentTable = [];
            }
            result.push({ type: 'content', content: line });
        }
    }

    if (currentTable.length > 0) {
        result.push({ type: 'table', content: currentTable.join('\n') });
    }

    return result;
}

function cleanLLMText(input) {
    // Preserve YAML frontmatter blocks (between --- markers)
    const yamlMatch = input.match(/^---\n([\s\S]*?)\n---/);
    let yamlBlock = '';
    let contentToClean = input;

    if (yamlMatch) {
        yamlBlock = yamlMatch[0]; // Keep the entire YAML block as-is, no trimming
        contentToClean = input.substring(yamlMatch[0].length).trimLeft();
    }

    // For content after YAML, preserve structure but fix text wrapping
    // Don't join lines that:
    // - Start with # (markdown headers)
    // - Start with list markers (-, *, •, etc.)
    // - Start with numbers followed by period (ordered lists)
    // - Start with capital letter (new sentence/paragraph)
    // - Are empty
    const cleaned = contentToClean
        .replace(
            /([^\n])\n(?!\s*(#|[\-*•●⏺▶▪◦]|\d+\.|[A-Z][a-z]|[📌🎯📋📖✨✅❌⭐🔥👉➡️]|$))/g,
            '$1 '
        )
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return yamlBlock ? (yamlBlock + '\n\n' + cleaned) : cleaned;
}

function cleanGitDiff(input) {
    return input
        .replace(/[│┃╏╎|▌]+/g, '')
        .replace(/([^\n])\n(?!\s*(\d+\s*[+-]\s*|[\-*•●⏺▶▪◦]|\d+\.|[A-Z][a-z]|[📌🎯📋📖✨✅❌⭐🔥👉➡️]|^\s*$|$))/g, '$1 ')
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => {
            const trimmed = line.trim();
            if (trimmed === '') {
                return '';
            }
            if (/^\d+\s*[+-]/.test(trimmed)) {
                return trimmed;
            }
            return trimmed;
        })
        .join('\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .trim();
}

function cleanClaudeDump(input) {
    return input
        .replace(/[│┃╏╎|▌]+/g, '')
        .replace(/ {2,}/g, ' ')
        .replace(/([^\n])\n(?!\s*([\-*•●⏺▶▪◦]|\d+\.|[A-Z][a-z]|[📌🎯📋📖✨✅❌⭐🔥👉➡️]|$))/g, '$1 ')
        .replace(/([a-z,:])\s*\n\s*([a-z])/g, '$1 $2')
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function detectAndClean(input) {
    if (!input.trim()) {
        return '';
    }

    // First, check if the entire document is indented (common with copy-pasted content)
    // If most non-empty lines start with 2+ spaces, dedent them
    const lines = input.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    const indentedLines = nonEmptyLines.filter(l => /^\s{2,}/.test(l)).length;

    let dedentedInput = input;
    if (nonEmptyLines.length > 0 && indentedLines / nonEmptyLines.length > 0.8) {
        // Most lines are indented, strip ALL leading whitespace from each line
        dedentedInput = lines.map(l => l.replace(/^\s+/, '')).join('\n');
    }

    const preserveTables = true; // Always enabled for testing
    let hasMarkdownTable = false;
    let extracted = null;

    if (preserveTables && isMarkdownTable(dedentedInput)) {
        hasMarkdownTable = true;
        extracted = extractMarkdownTables(dedentedInput);
    }

    if (!hasMarkdownTable) {
        // No tables extracted, clean normally
        let cleanedContent = dedentedInput;

        if (/^\s*\d+\s*[+-]\s/m.test(dedentedInput)) {
            cleanedContent = cleanGitDiff(dedentedInput);
        } else if (/[│┃╏╎▌]/.test(dedentedInput) || /\|/.test(dedentedInput)) {
            cleanedContent = cleanClaudeDump(dedentedInput);
        } else {
            const codeScore = (dedentedInput.match(/[{}();=]/g) || []).length;
            const lineCount = dedentedInput.split('\n').length;
            if (lineCount > 0 && codeScore / lineCount > 0.5) {
                cleanedContent = dedentedInput.trim();
            } else {
                cleanedContent = cleanLLMText(dedentedInput);
            }
        }

        return cleanedContent;
    }

    // Tables were extracted, process each content block separately while preserving table positions
    const result = [];
    let contentBuffer = [];

    for (const item of extracted) {
        if (item.type === 'table') {
            // Clean and output any buffered content first
            if (contentBuffer.length > 0) {
                const bufferedText = contentBuffer.join('\n');
                let cleanedContent = bufferedText;

                if (/^\s*\d+\s*[+-]\s/m.test(bufferedText)) {
                    cleanedContent = cleanGitDiff(bufferedText);
                } else if (/[│┃╏╎▌]/.test(bufferedText)) {
                    cleanedContent = cleanClaudeDump(bufferedText);
                } else {
                    const codeScore = (bufferedText.match(/[{}();=]/g) || []).length;
                    const lineCount = bufferedText.split('\n').length;
                    if (lineCount > 0 && codeScore / lineCount > 0.5) {
                        cleanedContent = bufferedText.trim();
                    } else {
                        cleanedContent = cleanLLMText(bufferedText);
                    }
                }

                if (cleanedContent.trim().length > 0) {
                    result.push(cleanedContent);
                }
                contentBuffer = [];
            }
            // Add the table as-is (already dedented)
            result.push(item.content);
        } else {
            // Buffer content lines
            contentBuffer.push(item.content);
        }
    }

    // Clean any remaining buffered content
    if (contentBuffer.length > 0) {
        const bufferedText = contentBuffer.join('\n');
        let cleanedContent = bufferedText;

        if (/^\s*\d+\s*[+-]\s/m.test(bufferedText)) {
            cleanedContent = cleanGitDiff(bufferedText);
        } else if (/[│┃╏╎▌]/.test(bufferedText)) {
            cleanedContent = cleanClaudeDump(bufferedText);
        } else {
            const codeScore = (bufferedText.match(/[{}();=]/g) || []).length;
            const lineCount = bufferedText.split('\n').length;
            if (lineCount > 0 && codeScore / lineCount > 0.5) {
                cleanedContent = bufferedText.trim();
            } else {
                cleanedContent = cleanLLMText(bufferedText);
            }
        }

        if (cleanedContent.trim().length > 0) {
            result.push(cleanedContent);
        }
    }

    const finalOutput = result.filter(item => item.trim().length > 0).join('\n\n');
    return finalOutput;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

const testDir = __dirname;
const testFiles = fs.readdirSync(testDir)
    .filter(f => f.startsWith('input_') && f.endsWith('.txt'))
    .sort();

if (testFiles.length === 0) {
    console.error('❌ No test files found (expected input_NNN.txt)');
    process.exit(1);
}

// Filter tests if argument provided
let testsToRun = testFiles;
const arg = process.argv[2];
if (arg) {
    const regex = new RegExp(`input_${arg}\\.txt$`);
    testsToRun = testFiles.filter(f => regex.test(f));
    if (testsToRun.length === 0) {
        console.error(`❌ No tests matching pattern: ${arg}`);
        process.exit(1);
    }
}

console.log(`\n🧪 Running ${testsToRun.length} test(s)\n`);

let passed = 0;
let failed = 0;

for (const inputFile of testsToRun) {
    const testNum = inputFile.match(/input_(\d+)/)[1];
    const expectedFile = `expected_${testNum}.txt`;
    const expectedPath = path.join(testDir, expectedFile);
    const outputFile = `output_${testNum}.txt`;
    const outputPath = path.join(testDir, outputFile);

    const inputPath = path.join(testDir, inputFile);
    const input = fs.readFileSync(inputPath, 'utf8');

    // Run the cleaning logic
    const output = detectAndClean(input);

    // ALWAYS save the actual output, regardless of whether expected file exists or test passes
    fs.writeFileSync(outputPath, output, 'utf8');

    // Skip comparison if no expected output file
    if (!fs.existsSync(expectedPath)) {
        console.log(`⏭️  test_${testNum}: GENERATED (no ${expectedFile} for comparison)`);
        console.log(`   💾 Output saved to: ${outputFile}`);
        continue;
    }

    const expected = fs.readFileSync(expectedPath, 'utf8');

    if (output === expected) {
        console.log(`✅ test_${testNum}: PASSED`);
        passed++;
    } else {
        console.log(`❌ test_${testNum}: FAILED`);
        console.log(`\n   📥 Input (${input.length} chars):`);
        console.log(indent(input, 6));
        console.log(`\n   📤 Expected (${expected.length} chars):`);
        console.log(indent(expected, 6));
        console.log(`\n   🔧 Got (${output.length} chars):`);
        console.log(indent(output, 6));
        console.log(`\n   💾 Saved to: ${outputFile}`);
        console.log('');
        failed++;
    }
}

console.log(`📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);

// Helper: indent text
function indent(text, spaces) {
    return text.split('\n').map(l => ' '.repeat(spaces) + l).join('\n');
}
