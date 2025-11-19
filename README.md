# Reactor WP Builder

A modern WordPress page builder plugin with React-based admin interface, built with Vite and following modern PHP practices.

**Author:** [Bilal Mahmood](https://wpcorex.com)  
**Website:** [wpcorex.com](https://wpcorex.com)  
**Plugin URI:** [wpcorex.com/products/reactor-wp-builder](https://wpcorex.com/products/reactor-wp-builder)  
**Repository:** [github.com/sahibbilal/reactor-wp-builder](https://github.com/sahibbilal/reactor-wp-builder)

## Quick Start

### For React Development

**Important:** Run npm commands from the plugin root directory:

```bash
cd wp-content/plugins/reactor-wp-builder
npm install
npm run dev
```

Then create the dev marker file:
```bash
touch .vite-dev
```

## Architecture

### Plugin Structure

```
reactor-wp-builder/
├── reactor-wp-builder.php    # Main plugin bootstrap file
├── admin/                     # Admin-specific functionality
│   └── class-menu.php        # Admin menu and page handler
├── includes/                  # Core plugin classes
│   ├── class-autoloader.php  # PSR-4 style autoloader
│   ├── class-post-meta.php   # Post meta handler for _reactor_layout
│   └── api/
│       └── class-rest-api.php # REST API endpoints
├── src/                      # React application source (Vite)
│   ├── main.jsx             # React entry point
│   └── App.jsx              # Main React component
├── package.json             # NPM dependencies
├── vite.config.js           # Vite configuration
├── dist/                    # Built assets (generated)
└── node_modules/            # NPM packages (generated)
├── templates/                # PHP templates
│   └── admin-page.php        # Admin page template
└── README.md                 # This file
```

### Key Components

#### 1. Plugin Bootstrap (`reactor-wp-builder.php`)

The main plugin file that:
- Defines plugin constants
- Implements singleton pattern for the main plugin class
- Registers activation/deactivation hooks
- Initializes all plugin components

#### 2. Autoloader (`includes/class-autoloader.php`)

A custom autoloader that:
- Follows PSR-4 naming conventions
- Automatically loads classes from `includes/`, `admin/`, and `api/` directories
- Converts class names to file names (e.g., `Class_Name` → `class-name.php`)

#### 3. Admin Menu (`admin/class-menu.php`)

Handles:
- WordPress admin menu registration
- Admin page rendering
- React app script enqueuing (with Vite dev server support)
- Script localization for REST API communication

#### 4. REST API (`includes/api/class-rest-api.php`)

Registers REST API endpoints under `/reactor/v1/`:
- `GET /reactor/v1/layouts` - Retrieve layouts
- `POST /reactor/v1/layouts/{id}` - Save layout to post
- `DELETE /reactor/v1/layouts/{id}` - Delete layout from post

All endpoints require `manage_options` capability.

#### 5. Post Meta Handler (`includes/class-post-meta.php`)

Manages the `_reactor_layout` post meta:
- Registers meta field for REST API access
- Provides sanitization callbacks
- Adds optional meta box to post editor

#### 6. React Application (`src/react-app/`)

A minimal React app built with Vite:
- **Development**: Runs on Vite dev server (http://localhost:5173)
- **Production**: Builds to `dist/` directory with manifest.json
- Communicates with WordPress REST API using localized script data

### Development Workflow

#### PHP Development

1. Edit PHP files in the plugin directory
2. Changes take effect immediately (no build step required)

#### React Development

1. Navigate to plugin root directory:
   ```bash
   cd wp-content/plugins/reactor-wp-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Vite dev server:
   ```bash
   npm run dev
   ```

4. Create a marker file for dev mode detection:
   ```bash
   touch .vite-dev
   ```

5. The plugin will automatically load from the Vite dev server when `WP_DEBUG` is enabled and `.vite-dev` exists.

#### Production Build

1. Build React app (from plugin root):
   ```bash
   cd wp-content/plugins/reactor-wp-builder
   npm run build
   ```

2. Remove `.vite-dev` file (if exists)

3. The plugin will load built assets from `dist/` directory

### Modern PHP Practices

- **Namespaces**: All classes use `Reactor\WP\Builder` namespace
- **Autoloading**: Custom autoloader eliminates manual `require_once` statements
- **Type Hints**: PHP 7.4+ type declarations throughout
- **PSR Standards**: Follows PSR-4 autoloading standards
- **Object-Oriented**: Classes with single responsibilities

### REST API Usage

The plugin exposes REST API endpoints that can be accessed from the React app:

```javascript
// Example: Fetch layouts
fetch(`${reactorBuilder.apiUrl}layouts`, {
  headers: {
    'X-WP-Nonce': reactorBuilder.nonce
  }
})

// Example: Save layout
fetch(`${reactorBuilder.apiUrl}layouts/123`, {
  method: 'POST',
  headers: {
    'X-WP-Nonce': reactorBuilder.nonce,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* layout data */ })
})
```

### Post Meta Storage

Layouts are stored as post meta with the key `_reactor_layout`. The meta value is an object/array that can be retrieved via:

- REST API: `GET /wp-json/wp/v2/posts/{id}?_embed` (includes meta)
- PHP: `get_post_meta( $post_id, '_reactor_layout', true )`

### Constants

- `REACTOR_WP_BUILDER_VERSION` - Plugin version
- `REACTOR_WP_BUILDER_PLUGIN_DIR` - Plugin directory path
- `REACTOR_WP_BUILDER_PLUGIN_URL` - Plugin URL
- `REACTOR_WP_BUILDER_PLUGIN_FILE` - Main plugin file path
- `REACTOR_WP_BUILDER_PLUGIN_BASENAME` - Plugin basename

### Requirements

- WordPress 5.8+
- PHP 7.4+
- Node.js 16+ (for React development)
- npm or yarn (for React development)

### Installation

1. Copy the plugin to `wp-content/plugins/reactor-wp-builder/`
2. Activate the plugin in WordPress admin
3. Navigate to "Reactor Builder" in the admin menu
4. For React development, install dependencies and start the dev server

### Future Enhancements

- Add more REST API endpoints as needed
- Implement layout builder UI in React
- Add block editor integration
- Support for custom post types
- Export/import functionality
- Template library
