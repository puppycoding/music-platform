const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
    );
const files = walk(path.join(root, "src")).filter((f) => /\.tsx?$/.test(f));
const graph = new Map();
const errors = [];
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const imports = [];
  function visit(n) {
    if (
      (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
      n.moduleSpecifier &&
      ts.isStringLiteral(n.moduleSpecifier)
    )
      imports.push(n.moduleSpecifier.text);
    if (
      ts.isCallExpression(n) &&
      n.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(n.arguments[0])
    )
      imports.push(n.arguments[0].text);
    ts.forEachChild(n, visit);
  }
  visit(source);
  const edges = [];
  for (const name of imports) {
    if (!name.startsWith(".") && !name.startsWith("@/")) continue;
    if (
      name.endsWith(".css") &&
      fs.existsSync(path.resolve(path.dirname(file), name))
    )
      continue;
    const result = ts.resolveModuleName(
      name,
      file,
      {
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        resolveJsonModule: true,
        baseUrl: root,
        paths: { "@/*": ["src/*"] },
      },
      ts.sys,
    ).resolvedModule;
    if (!result) errors.push("Unresolved " + name + " in " + file);
    else edges.push(path.resolve(result.resolvedFileName));
  }
  graph.set(file, edges);
}
const visited = new Set(),
  active = new Set();
function dfs(f) {
  if (active.has(f)) {
    errors.push("Cycle: " + f);
    return;
  }
  if (visited.has(f)) return;
  visited.add(f);
  active.add(f);
  for (const edge of graph.get(f) ?? []) dfs(edge);
  active.delete(f);
}
for (const f of files) dfs(f);
const moves = [
  ...require("../docs/moves-music-player.json"),
  ...require("../docs/moves-queue.json"),
];
const baseline = require("../docs/baseline-files.json");
const changedJsx = [];
const changedData = [];
function jsx(text, filename) {
  const source = ts.createSourceFile(
    filename,
    text,
    ts.ScriptTarget.Latest,
    true,
  );
  const result = [];
  function visit(n) {
    if (
      ts.isJsxElement(n) ||
      ts.isJsxSelfClosingElement(n) ||
      ts.isJsxFragment(n)
    ) {
      result.push(n.getText(source).replaceAll("\r\n", "\n"));
      return;
    }
    ts.forEachChild(n, visit);
  }
  visit(source);
  return result;
}
for (const item of baseline) {
  const moved = moves.find((m) => m.from === item.path);
  const current = moved?.to ?? item.path;
  if (item.path === "src/components/PlayerBar.tsx") continue;
  const text = fs.readFileSync(path.join(root, current), "utf8");
  const original = cp.execFileSync(
    "git",
    [
      "-c",
      "safe.directory=C:/Users/User/Desktop/music-platform",
      "show",
      fs.readFileSync(path.join(root, "docs/baseline-ref.txt"), "utf8").trim() +
      ":frontend/" +
      item.path,
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (
    item.path.endsWith(".tsx") &&
    JSON.stringify(jsx(original, item.path)) !==
    JSON.stringify(jsx(text, current))
  )
    changedJsx.push(current);
  if (
    /\.(json|css|ico)$/.test(item.path) &&
    !Buffer.from(original).equals(fs.readFileSync(path.join(root, current)))
  ) {
    if (original.replaceAll("\r\n", "\n") !== text.replaceAll("\r\n", "\n"))
      changedData.push(current);
  }
}
if (changedJsx.length) errors.push("Changed JSX: " + changedJsx.join(", "));
if (changedData.length)
  errors.push("Changed data/styles: " + changedData.join(", "));
const publicDiff = cp
  .execFileSync(
    "git",
    [
      "-c",
      "safe.directory=C:/Users/User/Desktop/music-platform",
      "diff",
      "--name-only",
      "--",
      "public",
    ],
    { cwd: root, encoding: "utf8" },
  )
  .trim();
if (publicDiff) errors.push("Changed public assets: " + publicDiff);
const report = {
  sourceFiles: files.length,
  unresolvedImportsOrCycles: errors,
  jsxUnchanged: !changedJsx.length,
  dataAndStylesUnchanged: !changedData.length,
  publicAssetsUnchanged: !publicDiff,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
