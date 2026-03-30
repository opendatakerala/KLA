# AGENTS.md - Guidelines for AI Coding Agents

This document provides guidelines for AI agents working on the KLA (Kerala Legislative Assembly Election 2026) codebase.

## Project Overview

- **Tech Stack**: Astro, Svelte 5, Nanostores (state management), ECharts (charts)
- **Build System**: Vite (via Astro)
- **No tests configured** - Do not add tests unless explicitly requested

## Data Generation Scripts

```bash
# Run individual data generation script
node scripts/index.js --script constituencies

# Run all scripts
node scripts/index.js --all

```

## Code Style Guidelines

### General Principles
- Keep code concise and focused - avoid unnecessary abstractions
- Use existing patterns in the codebase
- Prioritize readability over cleverness
- NO comments unless explicitly requested by user

### Svelte Components (.svelte) - STRICT SVELTE 5 MODE
- **Must use Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`) for all reactivity and properties.
- **NEVER use Svelte 3/4 reactive statements** (`$:`). Use `$derived` instead.
- **NEVER use `export let` for props**. Use `let { propName } = $props();`.
- **Use modern event handlers**: Use `onclick`, `oninput`, etc. NEVER use the old `on:click` or `on:input` syntax.
- Component styles should be in `<style>` block scoped to the component
- Use semantic HTML elements
- Prefer `#each` blocks over manual HTML string construction
- Avoid `{@html}` - use proper Svelte templates instead
- Access Nanostores directly with `$storeName` syntax, but wrap derivations in `$derived()` when combining with local state.

### JavaScript (.js)
- Use ES modules (`import`/`export`)
- Use named exports for functions
- Prefer `const` over `let` - use only when mutation is necessary

### Naming Conventions
- **Files**: kebab-case (e.g., `constituencyStore.js`, `DataExplorer.svelte`)
- **Components**: PascalCase (e.g., `FilterBar.svelte`)
- **Functions**: camelCase (e.g., `setSearch`, `getHistoricalData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `COLORS`, `ALLIANCES`)
- **CSS Classes**: kebab-case (e.g., `.filter-btn`, `.active-tag`)
- **JSON Keys**: lowercase (e.g., `number`, `name`, `district`, `qid`)

### Store Patterns
- Use Nanostores (`atom`, `computed`)
- Initialize stores at module level with data
- Keep stores focused - one store per domain (constituencyStore, historicalStore)

### Data Handling
- JSON data lives in `src/data/`
- Data generation scripts in `scripts/`
- Use consistent keys: `number`, `name`, `district`, `qid` (not verbose names)
- Sort data in ascending order by default (e.g., years 2014 → 2019 → 2024)

### Component Architecture
- Components should be self-contained with their styles
- Avoid prop drilling - use stores when data is needed globally
- Extract related code into focused components (e.g., DataDisplay, DataExplorer)
- Put components in `src/components/`, charts in `src/components/charts/`
- Put stores in `src/stores/`

### CSS Guidelines
- Use CSS variables from `global.css` for colors (e.g., `var(--gold)`, `var(--border)`) and font size ( `var(--text-muted)`, etc)
- Avoid hardcoding colors and size - use the defined variables
- Use Manjari as font
- Keep styles scoped to components when possible

### Error Handling
- Check for null/undefined before accessing properties
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Handle missing data gracefully in templates

## Important Patterns

### Defining Component Props (Svelte 5)
```svelte
<script>
  let { title, isActive = false } = $props();
</script>
```

### Accessing Store Data and Derived State (Svelte 5)
```svelte
<script>
  import { selectedConstituency } from '../stores/constituencyStore.js';
  
  // Use $derived instead of $: for reactive store transformations
  let qid = $derived($selectedConstituency?.qid);
  let seriesData = $derived(qid ? getHistoricalData(qid) : []);
</script>
```

### Local State and Event Handling (Svelte 5)
```svelte
<script>
  let count = $state(0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>Count is {count}</button>
```

### Conditional Rendering
```svelte
{#if condition}
  <div>Content</div>
{:else}
  <div>Alternative</div>
{/if}
```

### Iterating with #each
```svelte
{#each items as item}
  <div>{item.name}</div>
{/each}
```

## Common Issues to Avoid

1. **Don't use `on:click` or other `on:event` syntax** - Always use the modern `onevent` equivalent (e.g., `onclick`, `onchange`).
2. **Don't use `$: ` for reactivity** - Use `$derived()` for computed values and `$effect()` for side effects.
3. **Don't use `export let` for props** - Use `$props()` exclusively.
4. **Don't use `document.getElementById`** - Use Svelte 5 bindings or standard reactivity.
5. **Don't craft HTML strings** - Use Svelte templates with `#each`.
6. **Don't mix data concerns** - Keep constituency data in one store, historical in another.

## File Structure

```
src/
├── components/          # Svelte components
│   ├── charts/          # Chart components
│   ├── *.svelte
├── data/                # JSON data files
├── lib/                 # Utilities (i18n, constants)
├── stores/              # Nanostores
└── styles/              # Global CSS
scripts/                 # Data generation scripts
```

## Git

DO NOT EVER PUSH CODE without user explicitly asking you to.

DO NOT COMMIT CHANGES unless user explicitly asks you to.
