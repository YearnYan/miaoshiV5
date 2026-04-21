import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagesJsonPath = path.join(root, 'src', 'pages.json');
const pagesDir = path.join(root, 'src', 'pages');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listVueFiles(dir) {
  const result = [];
  const names = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of names) {
    const abs = path.join(dir, item.name);
    if (item.isDirectory()) {
      result.push(...listVueFiles(abs));
      continue;
    }
    if (item.isFile() && item.name.endsWith('.vue')) {
      result.push(abs);
    }
  }
  return result;
}

function extractRouteTargets(content) {
  const regex = /\/pages\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/g;
  const targets = new Set();
  let m = regex.exec(content);
  while (m) {
    targets.add(m[0]);
    m = regex.exec(content);
  }
  return [...targets];
}

function getDeclaredPages() {
  const json = JSON.parse(readText(pagesJsonPath));
  return new Set((json.pages || []).map((p) => `/${p.path}`));
}

function parseTemplateClickHandlers(vueContent) {
  const templateMatch = vueContent.match(/<template>[\s\S]*?<\/template>/);
  if (!templateMatch) return [];
  const template = templateMatch[0];
  const handlers = [];
  const regex = /@click="([^"]+)"/g;
  let m = regex.exec(template);
  while (m) {
    const expr = m[1].trim();
    const nameMatch = expr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (nameMatch) handlers.push(nameMatch[1]);
    m = regex.exec(template);
  }
  return handlers;
}

function parseMethods(vueContent) {
  const scriptMatch = vueContent.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);
  if (!scriptMatch) return new Set();
  const script = scriptMatch[1];
  const start = script.search(/methods\s*:\s*\{/);
  if (start < 0) return new Set();
  const braceStart = script.indexOf('{', start);
  if (braceStart < 0) return new Set();
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < script.length; i += 1) {
    const ch = script[i];
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return new Set();
  const body = script.slice(braceStart + 1, end);
  const names = new Set();
  const regex = /\n\s*(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  let m = regex.exec(body);
  while (m) {
    names.add(m[1]);
    m = regex.exec(body);
  }
  return names;
}

test('页面跳转目标都在 pages.json 中声明', () => {
  const declared = getDeclaredPages();
  const vueFiles = listVueFiles(pagesDir);
  const unresolved = [];

  for (const file of vueFiles) {
    const content = readText(file);
    const targets = extractRouteTargets(content);
    for (const target of targets) {
      if (!declared.has(target)) {
        unresolved.push({
          file: path.relative(root, file),
          target
        });
      }
    }
  }

  assert.deepEqual(unresolved, []);
});

test('页面 @click 处理器在 methods 中有定义', () => {
  const vueFiles = listVueFiles(pagesDir);
  const missing = [];

  for (const file of vueFiles) {
    const content = readText(file);
    const handlers = parseTemplateClickHandlers(content);
    if (!handlers.length) continue;
    const methods = parseMethods(content);
    for (const h of handlers) {
      if (!methods.has(h)) {
        missing.push({
          file: path.relative(root, file),
          handler: h
        });
      }
    }
  }

  assert.deepEqual(missing, []);
});
