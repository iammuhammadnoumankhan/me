// Validates every src/_data/*.yaml file against schemas/<name>.schema.json,
// plus cross-file checks a JSON schema can't express. Runs before each build
// and on its own with `npm run validate`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import Ajv from "ajv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "src/_data");
const schemaDir = path.join(root, "schemas");

export function validate() {
  const ajv = new Ajv({ allErrors: true });
  for (const f of fs.readdirSync(schemaDir)) {
    ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDir, f), "utf8")));
  }

  const errors = [];
  const data = {};
  for (const f of fs.readdirSync(dataDir).filter((f) => /\.ya?ml$/.test(f))) {
    const name = f.replace(/\.ya?ml$/, "");
    const check = ajv.getSchema(`${name}.schema.json`);
    if (!check) {
      errors.push(`${f}: no schema found at schemas/${name}.schema.json`);
      continue;
    }
    try {
      data[name] = loadYaml(fs.readFileSync(path.join(dataDir, f), "utf8"));
    } catch (e) {
      errors.push(`${f}: invalid YAML — ${e.message}`);
      continue;
    }
    if (!check(data[name])) {
      for (const e of check.errors) errors.push(`${f}: ${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` ('${e.params.additionalProperty}')` : ""}`);
    }
  }

  // Cross-file references
  const { projects, pages, experience, cv } = data;
  if (projects?.items && projects?.categories) {
    const ids = new Set(projects.categories.map((c) => c.id));
    projects.items.forEach((p, i) => {
      if (!ids.has(p.category)) errors.push(`projects.yaml: /items/${i} category '${p.category}' is not one of: ${[...ids].join(", ")}`);
    });
  }
  if (cv?.projects && projects?.items) {
    const names = new Set(projects.items.map((p) => p.name));
    cv.projects.forEach((n, i) => {
      if (!names.has(n)) errors.push(`cv.yaml: /projects/${i} '${n}' is not a project name in projects.yaml`);
    });
  }
  if (pages?.home?.explore) {
    pages.home.explore.forEach((c, i) => {
      if (!pages[c.page]) errors.push(`pages.yaml: /home/explore/${i} page '${c.page}' does not exist`);
    });
  }
  if (Array.isArray(experience)) {
    experience.forEach((x, i) => {
      if (x.end && x.end < x.start) errors.push(`experience.yaml: /${i} end ${x.end} is before start ${x.start}`);
    });
  }

  if (errors.length) {
    throw new Error(`Content validation failed:\n  - ${errors.join("\n  - ")}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    validate();
    console.log("✓ All content files are valid");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
