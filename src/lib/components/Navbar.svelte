<script lang="ts">
  import { page } from '$app/stores';

  // Type definitions
  interface NavItem {
    href: string;
    label: string;
  }

  interface DropdownNav {
    type: 'dropdown';
    label: string;
    items: NavItem[];
  }

  interface LinkNav {
    type: 'link';
    href: string;
    label: string;
  }

  type NavStructureItem = DropdownNav | LinkNav;

  // Navigation structure with dropdowns
  const navStructure: NavStructureItem[] = [
    {
      type: 'dropdown',
      label: 'Theory',
      items: [
        { href: '/chord-dictionary', label: 'Chord Dictionary' },
        { href: '/chord-progressions', label: 'Chord Progressions' },
        { href: '/learn-scales', label: 'Scales' },
        { href: '/circle-of-fifths', label: 'Circle of Fifths' }
      ]
    },
    {
      type: 'dropdown',
      label: 'Practice',
      items: [
        { href: '/chord-practice', label: 'Chord Practice' },
        { href: '/pitch-training', label: 'Ear Training' }
      ]
    },
    {
      type: 'link',
      href: '/progress',
      label: 'Progress'
    }
  ];

  // Mobile menu state
  let mobileMenuOpen = false;
  let activeDropdown: number | null = null;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    // Close any open dropdowns when opening mobile menu
    activeDropdown = null;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function toggleDropdown(index: number) {
    activeDropdown = activeDropdown === index ? null : index;
  }

  function closeDropdown() {
    activeDropdown = null;
  }

  // Close dropdown when clicking outside
  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-dropdown')) {
      closeDropdown();
    }
  }

  // Check if current path is in any dropdown items
  function isDropdownActive(dropdownItems: NavItem[]) {
    if (typeof window === 'undefined') return false;
    return dropdownItems.some((item: NavItem) => $page.url.pathname === item.href);
  }

  // Reactive statement to get current path (SSR-safe)
  $: currentPath = typeof window !== 'undefined' ? $page.url.pathname : '/';
</script>

<nav class="navbar">
  <div class="nav-container">
    <!-- Logo/Brand -->
    <a href="/" class="nav-brand" on:click={closeMobileMenu}>
      <svg
        class="nav-logo"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <span class="nav-brand-text">Piano Triads</span>
    </a>

    <!-- Desktop Navigation -->
    <div class="nav-links">
      {#each navStructure as item, index}
        {#if item.type === 'link'}
          <a href={item.href} class="nav-link" class:active={currentPath === item.href}>
            {item.label}
          </a>
        {:else if item.type === 'dropdown'}
          <div class="nav-dropdown" class:active={isDropdownActive(item.items)}>
            <button
              class="nav-dropdown-btn"
              class:active={activeDropdown === index}
              on:click={() => toggleDropdown(index)}
              aria-expanded={activeDropdown === index}
              aria-haspopup="true"
            >
              {item.label}
              <svg
                class="dropdown-arrow"
                class:rotated={activeDropdown === index}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
              >
                <path d="m6 9 3-3 3 3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            {#if activeDropdown === index}
              <div class="nav-dropdown-menu">
                {#each item.items as dropdownItem}
                  <a
                    href={dropdownItem.href}
                    class="nav-dropdown-item"
                    class:active={currentPath === dropdownItem.href}
                    on:click={closeDropdown}
                  >
                    {dropdownItem.label}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>

    <!-- Mobile Menu Button -->
    <button
      class="mobile-menu-btn"
      class:active={mobileMenuOpen}
      on:click={toggleMobileMenu}
      aria-label="Toggle menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <!-- Overlay -->
    <div
      class="mobile-menu-overlay"
      on:click={closeMobileMenu}
      on:keydown={(e) => e.key === 'Escape' && closeMobileMenu()}
      role="button"
      tabindex="0"
    ></div>

    <!-- Menu -->
    <div class="mobile-menu">
      <div class="mobile-nav-links">
        {#each navStructure as item}
          {#if item.type === 'link'}
            <a
              href={item.href}
              class="mobile-nav-link"
              class:active={currentPath === item.href}
              on:click={closeMobileMenu}
            >
              {item.label}
            </a>
          {:else if item.type === 'dropdown'}
            <!-- Section divider -->
            <div class="mobile-nav-section">
              <h3 class="mobile-nav-section-title">{item.label}</h3>
              <div class="mobile-nav-section-items">
                {#each item.items as dropdownItem}
                  <a
                    href={dropdownItem.href}
                    class="mobile-nav-section-item"
                    class:active={currentPath === dropdownItem.href}
                    on:click={closeMobileMenu}
                  >
                    {dropdownItem.label}
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</nav>

<!-- Document click listener to close dropdowns when clicking outside -->
<svelte:window on:click={handleDocumentClick} />

<style>
  /* Static navbar */
  .navbar {
    position: relative;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border-light);
  }

  /* Container */
  .nav-container {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Brand */
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: 700;
    font-size: 1.125rem;
  }

  .nav-brand:hover {
    opacity: 0.8;
  }

  .nav-logo {
    color: var(--color-accent);
    flex-shrink: 0;
  }

  .nav-brand-text {
    white-space: nowrap;
  }

  /* Desktop navigation */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-link {
    text-decoration: none;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 0.9375rem;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    transition: var(--transition-smooth);
    white-space: nowrap;
  }

  .nav-link:hover {
    color: var(--color-text-primary);
    background: rgba(0, 0, 0, 0.04);
  }

  .nav-link.active {
    color: var(--color-accent);
    background: rgba(0, 122, 255, 0.1);
  }

  /* Desktop dropdown styles */
  .nav-dropdown {
    position: relative;
  }

  .nav-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 0.9375rem;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    transition: var(--transition-smooth);
    white-space: nowrap;
  }

  .nav-dropdown-btn:hover,
  .nav-dropdown-btn.active {
    color: var(--color-text-primary);
    background: rgba(0, 0, 0, 0.04);
  }

  .nav-dropdown.active .nav-dropdown-btn {
    color: var(--color-accent);
    background: rgba(0, 122, 255, 0.1);
  }

  .dropdown-arrow {
    transition: transform 0.2s ease;
    transform: rotate(180deg);
  }

  .dropdown-arrow.rotated {
    transform: rotate(0deg);
  }

  .nav-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid var(--color-border-light);
    border-radius: 0.75rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    padding: 0.5rem;
    margin-top: 0.5rem;
    z-index: 1001;
  }

  .nav-dropdown-item {
    display: block;
    text-decoration: none;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 0.9375rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    transition: var(--transition-smooth);
    white-space: nowrap;
  }

  .nav-dropdown-item:hover {
    color: var(--color-text-primary);
    background: rgba(0, 0, 0, 0.04);
  }

  .nav-dropdown-item.active {
    color: var(--color-accent);
    background: rgba(0, 122, 255, 0.1);
  }

  /* Mobile menu button */
  .mobile-menu-btn {
    display: none;
    flex-direction: column;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    gap: 0.25rem;
  }

  .hamburger-line {
    width: 1.25rem;
    height: 0.125rem;
    background: var(--color-text-primary);
    border-radius: 0.0625rem;
    transition: all 0.3s ease;
  }

  .mobile-menu-btn.active .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(0.1875rem, 0.1875rem);
  }

  .mobile-menu-btn.active .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-btn.active .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(0.1875rem, -0.1875rem);
  }

  /* Mobile menu overlay */
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
    height: 100vh;
  }

  /* Mobile menu */
  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border-light);
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .mobile-nav-links {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-nav-link {
    text-decoration: none;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 1rem;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    transition: var(--transition-smooth);
  }

  .mobile-nav-link:hover {
    color: var(--color-text-primary);
    background: rgba(0, 0, 0, 0.04);
  }

  .mobile-nav-link.active {
    color: var(--color-accent);
    background: rgba(0, 122, 255, 0.1);
  }

  /* Mobile section styles */
  .mobile-nav-section {
    margin-bottom: 1rem;
  }

  .mobile-nav-section:last-child {
    margin-bottom: 0;
  }

  .mobile-nav-section-title {
    color: var(--color-text-primary);
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
    padding: 0.75rem 1.5rem 0.5rem 1.5rem;
    border-bottom: 1px solid var(--color-border-light);
    margin-bottom: 0.5rem;
  }

  .mobile-nav-section-items {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .mobile-nav-section-item {
    text-decoration: none;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 0.9375rem;
    padding: 0.75rem 1.5rem 0.75rem 2rem;
    border-radius: 0.5rem;
    transition: var(--transition-smooth);
    margin: 0 0.75rem;
  }

  .mobile-nav-section-item:hover {
    color: var(--color-text-primary);
    background: rgba(0, 0, 0, 0.04);
  }

  .mobile-nav-section-item.active {
    color: var(--color-accent);
    background: rgba(0, 122, 255, 0.1);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .nav-container {
      padding: 0 1.25rem;
    }

    .nav-links {
      display: none;
    }

    .mobile-menu-btn {
      display: flex;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      padding: 0 1rem;
    }
  }
</style>
