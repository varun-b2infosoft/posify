const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
// Two levels up: artifacts/pos-dashboard -> artifacts -> workspace root
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Include workspace root in addition to Expo defaults.
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// 2. Resolve packages from both the project-local and the workspace-root node_modules.
//    pnpm hoists shared packages to the root; Metro must know to look there.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
