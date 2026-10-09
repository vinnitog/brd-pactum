const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("workflow kit files exist", () => {
  for (const file of ["AGENTS.md", "PROJECT_CONTEXT.md", "test.cmd", "package.json", ".gitignore"]) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} should exist`);
  }
});

test("agent instructions define the mandatory workflow", () => {
  const content = read("AGENTS.md");
  const order = ["senior-dev", "ui-ux-expert", "code-reviewer", "qa-senior", "qa-automate"];
  let lastIndex = -1;
  for (const step of order) {
    const index = content.indexOf(step);
    assert.ok(index > lastIndex, `${step} should appear after the previous workflow step`);
    lastIndex = index;
  }
  assert.match(content, /develop/);
  assert.match(content, /Nunca.*push direto.*main|Nunca faca push direto para `main`/s);
});

test("frontend work requires ui ux review", () => {
  const agents = read("AGENTS.md");
  assert.match(agents, /qualquer ajuste de front-end deve acionar `ui-ux-expert`/);
});

test("browser blocked by client policy is documented", () => {
  const content = read("AGENTS.md");
  assert.match(content, /ERR_BLOCKED_BY_CLIENT/);
  assert.match(content, /file:\/\//);
  assert.match(content, /localhost/);
  assert.match(content, /127\.0\.0\.1/);
});

test("project context records stack decision", () => {
  const context = read("PROJECT_CONTEXT.md");
  assert.match(context, /## Stack Escolhida/);
  assert.match(context, /## Motivo Da Stack/);
  assert.match(context, /## Alternativas Rejeitadas/);
  assert.match(context, /Revisao Obrigatoria De Stack/);
});


test("automation delegates to Codex with explicit API and private-library secrets", () => {
  for (const file of ["develop.yml", "review.yml"]) {
    const workflow = read(`.github/workflows/${file}`);
    const calls = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((match) => match[1]);
    assert.deepEqual(calls, [`vinnitog/brd-ci/.github/workflows/${file}@main`]);
    const secrets = [...workflow.matchAll(/secrets\.([A-Z_]+)/g)].map((match) => match[1]);
    assert.deepEqual(secrets, ["OPENAI_API_KEY", "TECHTOGS_UTILITIES_SSH_KEY"]);
    assert.doesNotMatch(workflow, /secrets:\s*inherit|id-token:\s*write/);
  }
  assert.match(read(".github/workflows/develop.yml"), /provider: openai/);
});

test("development triggers only for the automation label and queues repeated runs", () => {
  const workflow = read(".github/workflows/develop.yml");
  assert.match(workflow, /types: \[labeled\]/);
  assert.match(workflow, /if: github\.event\.label\.name == 'trello-auto'/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /group: brd-issue-\$\{\{ github\.event\.issue\.number \}\}/);
});

test("consultative review runs on develop and only for same-repository PRs", () => {
  const workflow = read(".github/workflows/review.yml");
  assert.match(workflow, /branches: \[develop\]/);
  assert.match(workflow, /types: \[opened, reopened\]/);
  assert.match(workflow, /if: github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
});
