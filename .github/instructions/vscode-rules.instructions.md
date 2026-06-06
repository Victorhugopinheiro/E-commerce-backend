---
description: This file outlines the guidelines for continuously improving Cursor rules based on emerging code patterns and best practices in the codebase.

alwaysApply: true
---
---
description: How to add or edit Cursor rules in our project
globs:
alwaysApply: false
---
# Cursor Rules Location

How to add new cursor rules to the project

1. Always place rule files in PROJECT_ROOT/.github/instructions/:
    ```
    .github/instructions/
    ├── your-rule-name.md
    ├── another-rule.md
    └── ...
    ```

2. Follow the naming convention:
    - Use kebab-case for filenames
    - Always use .md extension
    - Make names descriptive of the rule's purpose

3. Directory structure:
    ```
    PROJECT_ROOT/
    ├── .github/
    │   └── instructions/
    │       ├── your-rule-name.md
    │       └── ...
    └── ...
    ```

4. Never place rule files:
    - In the project root
    - In subdirectories outside .github/instructions
    - In any other location

5. Cursor rules have the following structure:

```
---
description: Short description of the rule's purpose
globs: optional/path/pattern/**/*
alwaysApply: false
---
# Rule Title

Main content explaining the rule with markdown formatting.

1. Step-by-step instructions
2. Code examples
3. Guidelines

Example:

```typescript
// Good example
function goodExample() {
  // Implementation following guidelines
}

// Bad example
function badExample() {
  // Implementation not following guidelines
}
```

