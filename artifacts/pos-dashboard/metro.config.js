const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
// Two levels up: artifacts/pos-dashboard -> artifacts -> workspace root
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Let Metro watch the entire pnpm workspace (including node_modules/.pnpm store)
//    so it can reach font assets that are only accessible via symlinks.
config.watchFolders = [workspaceRoot];

// 2. Resolve packages from both the project-local and the workspace-root node_modules.
//    pnpm hoists shared packages to the root; Metro must know to look there.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Enable symlink following (Metro >= 0.80 / Expo SDK 50+).
//    Without this, Metro silently skips font files that live behind pnpm symlinks,
//    causing @expo/vector-icons to render as empty boxes on Android.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
