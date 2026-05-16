# Clean Clode Test Suite

Test the cleaning logic locally without deploying to the website.

## Structure

- **`input_NNN.txt`** — Raw input text to clean
- **`expected_NNN.txt`** — Expected cleaned output
- **`run.js`** — Test runner (extracts functions from script.js)

## Usage

```bash
# Run all tests
node test/run.js

# Run specific test
node test/run.js 001

# Run tests 002-005
node test/run.js 00[2-5]
```

## Creating a New Test

1. Create `input_NNN.txt` with your test input
2. Create `expected_NNN.txt` with the expected output
3. Run `node test/run.js NNN` to test

Example:
```bash
echo "    | Col A | Col B |
    |-------|-------|
    | Val 1 | Val 2 |
Normal text" > test/input_002.txt

echo "| Col A | Col B |
|-------|-------|
| Val 1 | Val 2 |

Normal text" > test/expected_002.txt

node test/run.js 002
```

## Important

The functions in `run.js` must stay in sync with `script.js`. When you update the cleaning logic in script.js, update the corresponding function in `run.js` as well.

Functions to keep in sync:
- `isMarkdownTable`
- `extractMarkdownTables`
- `cleanLLMText`
- `cleanGitDiff`
- `cleanClaudeDump`
- `detectAndClean`
