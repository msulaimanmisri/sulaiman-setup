---
name: sulaiman-livewire-alpine-standard
description: >-
  Portable Livewire conventions — domain folder structure, action-based naming,
  custom docblocks, placeholder Blade paths, and generic Alpine
  x-data guideline. Use when creating or refactoring any Livewire component.
author: Muhamad Sulaiman Misri <saya@sulaimanmisri.com>
version: 1.0.0
license: MIT
---

## Core Rules

### 1. Component Type

- Always use **Multi-File Components (MFCs)**.
- Never use inline class-based or single-file structures.

### 2. Namespace and Imports

- Components live under `App\Livewire`.
- Use correct imports (`use Livewire\Attributes\Computed;`), never fully-qualified inline names.
- Import only what is needed.

### 3. Type Safety

- Begin every component file with `declare(strict_types=1);`.
- Every method must declare a return type (`: void`, `: View`, `: Collection`, etc.).
- Use nullable types where appropriate (`?string`, `?int`).
- Example:

  ```php
  public function store(): void
  public function items(): Collection
  public function total(): ?float
  ```

### 4. Navigation

- Always use `redirectRoute()` with `navigate: true` for SPA navigation:

  ```php
  $this->redirectRoute('{route-name}', navigate: true);
  $this->redirectRoute('{route-name}', ['{param}' => $value], navigate: true);
  ```

---

## Code Organization

All component classes must follow this **exact order**. Use generic placeholders
`{Domain}`, `{Entity}`, `{Action}` — never hard-code a project-specific name.

```php
<?php

declare(strict_types=1);

namespace App\Livewire\{Domain};

use Livewire\Component;
use Illuminate\View\View;
use Livewire\Attributes\{Computed, Validate};
use Livewire\Features\SupportFileUploads\WithFileUploads;

class {Action}{Entity} extends Component
{
    /*
    |--------------------------------------------------------------------------
    | Traits
    |--------------------------------------------------------------------------
    */
    use WithFileUploads;

    /*
    |--------------------------------------------------------------------------
    | Properties Traits
    |--------------------------------------------------------------------------
    */
    use With{Entity}Filters;

    /*
    |--------------------------------------------------------------------------
    | Component Properties
    |--------------------------------------------------------------------------
    */
    #[Validate(['required', 'string', 'max:255'])]
    public ?string $name = null;
    public ?int $relatedId = null;

    /*
    |--------------------------------------------------------------------------
    | Computed Properties
    |--------------------------------------------------------------------------
    */
    #[Computed]
    public function items(): \Illuminate\Database\Eloquent\Collection
    {
        return \App\Models\{Entity}::query()
            ->when($this->name, fn ($q) => $q->where('name', 'like', "%{$this->name}%"))
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Mounting Resources
    |--------------------------------------------------------------------------
    */
    public function mount(): void
    {
        // Code goes here..
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle Hooks
    |--------------------------------------------------------------------------
    */
    public function updatedName(): void
    {
        // Code goes here..
    }

    /*
    |--------------------------------------------------------------------------
    | Store Action
    |--------------------------------------------------------------------------
    */
    public function store(): void
    {
        $this->validate();
        \App\Models\{Entity}::create(['name' => $this->name]);
        $this->redirectRoute('{domain}.index', navigate: true);
    }

    /*
    |--------------------------------------------------------------------------
    | Rendering Native Livewire Resources
    |--------------------------------------------------------------------------
    */
    public function render(): View
    {
        return view('livewire.{domain-kebab}.{action-entity-kebab}');
    }
}
```

### Property Guidelines

- Group all public properties together; declare visibility explicitly.
- Use `#[Validate]` attributes for rules; nullable types for optional fields.
- Initialise with sensible defaults.

### Computed Property Guidelines

- Annotate with `#[Computed]`; keep logic focused and query-efficient.

### Action Guidelines

- One descriptive method per action (`store`, `update`, `delete`, `search`, `edit`).
- Return `void` unless returning a redirect; keep heavy logic in a domain Service.
- Validate and authorise inside every action as with an HTTP request.

---

## Docblock / Comment Guide

This is the **custom docblock convention** for every Livewire component. It is the
minimal 3-line PHPDoc style:

```php
/*
|--------------------------------------------------------------------------
| Title
|--------------------------------------------------------------------------
*/
```

Rules:

- Title is a short noun phrase, capitalised (`General Traits`, `Properties`,
  `Mounting Resources`). For private helpers, use a verb phrase
  (`Throw a validation exception for the attachment.`).
- One block per section, placed immediately above the code it describes.

## File Naming and Folder Structure

When creating a Livewire component, **always** follow this codebase convention.
Create the domain folder if it does not exist.

### Component Class

- Generate with `php artisan make:livewire {Domain}/{Action}{Entity}`.
- Action-based naming: `Create{Entity}`, `Edit{Entity}`, `Index{Entity}`,
  `Show{Entity}`, `Delete{Entity}`.
- Namespace mirrors folder: `App\Livewire\{Domain}\{Action}{Entity}`.
- Class PascalCase maps to view kebab-case (`Edit{Entity}` → `edit-{entity-kebab}`).

### Folder Layout (placeholders)

```
app/Livewire/
├── {Domain}/
│   ├── {Action}{Entity}.php
│   ├── Traits/
│   │   └── With{Entity}*.php
│   └── Services/
│       └── {Domain}Service.php
├── {AnotherDomain}/
│   └── ...
└── Traits/                  # shared traits only
    └── WithCommon*.php

resources/views/livewire/
├── {domain-kebab}/
│   └── {action-entity-kebab}.blade.php
├── placeholders/
│   └── skeleton.blade.php
```

### Rules for Related Files

- **Domain traits** → `app/Livewire/{Domain}/Traits/`. **Shared traits** → `app/Livewire/Traits/`.
- **Services** are per-domain, one service per domain, never shared across domains → `app/Livewire/{Domain}/Services/{Domain}Service.php`.
- **Blade views** → `resources/views/livewire/{domain-kebab}/{action-entity-kebab}.blade.php`.
  View string is `livewire.{domain-kebab}.{action-entity-kebab}`.
- **Contextual variants** (e.g., an international flavour of a domain) → subfolder under the domain (`{Domain}/SubContext/{Action}{Entity}.php` and `livewire/{domain-kebab}/sub-context/{action-entity-kebab}.blade.php`), not a name suffix.
- **Component-specific JS** (if needed) → `app/Livewire/{Domain}/resources/{action-entity-kebab}.js`, never `public/app.js`.

---

## Alpine.js Interactivity Guideline

Alpine is bundled with Livewire — do not include it separately. Prefer Alpine
for client-side state to avoid round-trips.

### Naming Guideline (not a literal)

Derive the `x-data` boolean from the intent. Do not hard-code a single key;
use a descriptive name following one of these patterns:

- Modal toggle: `<action><Entity>Modal` — e.g., a create-modal boolean reads as
  `{create}{Entity}Modal`, an edit-modal as `{edit}{Entity}Modal`.
- Confirm flow: `showPrompt` for a confirmation dialog.
- Local UI: `showChildren`, `showDetails`, `availableTab` — boolean, `false` by default.

### Modal Pattern (index → create/edit)

```blade
<div x-data="{ <descriptiveBoolean>: false }">
    <button @click="<descriptiveBoolean> = !<descriptiveBoolean>">Add New {Entity}</button>

    <div x-show="<descriptiveBoolean>" x-cloak
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg">
        <div class="relative w-full max-w-lg rounded-xl bg-white">
            <livewire:{domain-kebab}.{action-entity-kebab} />
        </div>
    </div>
</div>
```

Required: initialise `false`, toggle with `@click="<key> = !<key>"`, reveal with
`x-show="<key>"` plus `x-cloak` to prevent flash.

### Confirm-Modal Pattern (form → save)

```blade
<div x-data="{ showPrompt: false }" x-on:show-confirm-modal.window="showPrompt = true">
    <div x-show="showPrompt" x-cloak>
        @include('components.{domain-kebab}.ConfirmModal')
    </div>

    <button @click="$wire.save()">Save</button>
</div>
```

Pair with a PHP action that validates then dispatches:

```php
/*
|--------------------------------------------------------------------------
| Validate Before Show Modal
|--------------------------------------------------------------------------
*/
public function save(): void
{
    $this->validate();
    $this->dispatch('show-confirm-modal');
}
```

Alternatives for the trigger: `$wire.validateBeforeShowModal()` or any
`$this->dispatch('{event-name}')` / `x-on:{event-name}.window` pair.

### Other Alpine Notes

- Use `@input.debounce.500="$wire.search($el.value)"` for search without hammering the server.
- For complex progress/upload state, `Alpine.data('{name}', () => ({ ... }))` inside `@script` / `@endscript` is allowed, but keep simple toggles inline.
- Never move Alpine snippets into `public/app.js`; keep them in the Blade file.

---

## Validation, Events, and Livewire Directives

- Validate with `#[Validate]` attributes or a `rules()` method; always call `$this->validate()` in actions.
- Dispatch with `$this->dispatch('{event}')`, listen with `#[On('{event}')]` or Alpine `x-on:{event}.window`.
- Use `wire:model.live` for real-time, `wire:model` is deferred by default.
- Use `wire:key` in every `@foreach` loop; use `wire:loading`, `wire:dirty`, `wire:target` for loading states.
- Authorise in actions (`$this->checkPermissionTo*` or policies) — treat every Livewire call as an HTTP request.

---

## Performance Optimization

### Lazy Loading

Use `#[Lazy]` for below-the-fold or heavy-query components, with a placeholder:

```php
use Livewire\Attributes\Lazy;

#[Lazy]
class {Action}{Entity} extends Component
{
    public function placeholder(): View
    {
        return view('livewire.placeholders.skeleton');
    }
}
```

### Other

- Keep `#[Computed]` queries lean; select only needed columns.
- Prefer Alpine debounce over `wire:model.live` on every keystroke for search fields.

---

## Anti-Patterns

- Hard-coding project-specific paths or line numbers in a skill or prompt.
- Requiring a single literal Alpine key — always use the descriptive-boolean guideline instead.
- Single-file or inline Livewire components.
- Sharing a domain Service across different domains.
- Adding component JS to `public/app.js`.
- Omitting `declare(strict_types=1);` or return types.
- Redirecting without `navigate: true`.

---

## Verification

- `php artisan make:livewire {Domain}/{Action}{Entity}` creates the component.
- `vendor/bin/pint --dirty --format agent` passes.
- `php artisan test --compact` passes.

## Portability

To make this skill available to all projects, copy it to:

```
~/.agents/skills/sulaiman-livewire-alpine-standard/SKILL.md
```
