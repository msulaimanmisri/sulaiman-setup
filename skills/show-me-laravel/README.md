# Show Me Laravel

A Laravel-flavored agent skill that explains whatever you point at in your terminal — routes, controllers, Eloquent models, Livewire components, Blade views, Alpine.js behavior, jobs, events, middleware, or config — using concise visuals instead of walls of prose.

## The Problem We Faced

Our team constantly asked each other:

- "Can you explain this route and what middleware it hits?"
- "What actually happens when I click this `wire:click`?"
- "Why is this Eloquent query running N+1?"
- "Show me the flow from this Form Request to the job dispatch."

Answers were long, text-heavy explanations that took forever to read and often missed the point. We needed something that **showed** the flow, not just described it.

## How This Skill Saved Us

`show-me-laravel` forces the agent to:

1. **Orient first** — run `php artisan route:list` or `php artisan model:show` before explaining, so the answer is grounded in your actual codebase.
2. **Pick the smallest visual** — a call tree, a component tree, a Mermaid diagram, a diff, or a focused HTML diagram — that makes the key point clear.
3. **Speak Laravel** — explain Eloquent relations, Livewire round-trips, Alpine client-side state, Blade layouts, queue vs sync listeners, and middleware order in terms the team actually uses.

Instead of 500 words of prose, we get a 10-line call tree or a Mermaid sequence diagram that shows exactly what hits the database, what gets queued, and what stays client-side.

## What It Explains

- **Eloquent**: relations, casts, accessors, global scopes, N+1 risks
- **Livewire**: component class + view, `wire:*` bindings, lifecycle hooks, `#[Computed]` properties
- **Alpine.js**: `x-data` scope, `x-on` / `@` listeners, `$wire` / `@entangle` boundaries
- **Blade**: `@extends` / `@section` vs `<x-layout>` components vs full-page Livewire
- **Service Container**: interface → concrete binding traces from `AppServiceProvider`
- **Events & Queues**: sync vs `ShouldQueue` listeners/jobs, what happens on the worker
- **Middleware**: pipeline order from route groups
- **Config & Env**: behavior differences by environment

## Installation

### OpenCode

```bash
npx skills add msulaimanmisri/sulaiman-setup --skill show-me-laravel --agent opencode
```

### GitHub Copilot (Copilot CLI)

```bash
npx skills add msulaimanmisri/sulaiman-setup --skill show-me-laravel --agent copilot
```

### CommandCode.ai

```bash
npx skills add msulaimanmisri/sulaiman-setup --skill show-me-laravel --agent commandcode
```

### Claude Code

```bash
npx skills add msulaimanmisri/sulaiman-setup --skill show-me-laravel --agent claude-code
```

### Install for All Agents at Once

```bash
npx skills add msulaimanmisri/sulaiman-setup --skill show-me-laravel --agent opencode --agent copilot --agent commandcode --agent claude-code
```

### Verify Installation

```bash
# List installed skills
npx skills list

# Or check the directory directly
ls ~/.config/opencode/skills/show-me-laravel/
ls ~/.github-copilot/skills/show-me-laravel/
ls ~/.config/commandcode/skills/show-me-laravel/
ls ~/.claude/skills/show-me-laravel/
```

## Usage

Once installed, just point at something in your terminal and ask:

- "Show me how this works"
- "Explain this route"
- "What happens when I click this?"
- "/show-me-laravel"

The skill will automatically detect the Laravel context and generate the appropriate visual explanation.

## Example Output

Instead of:

> "When you submit this form, it goes through the StorePostRequest which validates the input, then the controller creates a post using Eloquent, dispatches an event, and redirects you..."

You get:

```
POST /posts
  HandleController@store
      StorePostRequest::validated
      StorePostAction->execute
          Post::create
          dispatch(new NotifySubscribers(post))   # queued
      redirect()->route('posts.show')
```

Or a Mermaid diagram showing the full flow from browser to database to queued job.

## Contributing

Found a Laravel pattern this skill doesn't handle well? Open an issue or PR in the `sulaiman-setup` repo.

## License

MIT
