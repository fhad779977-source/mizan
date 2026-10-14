// Creates projects/<slug>/ from a template and registers it.
//   npm run new-project -- --template product-ad --slug spring-launch --name "Spring Launch"
// Templates: projects/_templates/*.json
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { args, PROJECTS_DIR, readJson, TEMPLATES_DIR, writeJson, writeRegistry } from "./lib";

const { flags } = args();
const templates = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const template = String(flags.template ?? "");
const slug = String(flags.slug ?? "");
if (!templates.includes(template) || !/^[a-z0-9-]+$/.test(slug)) {
  console.error(`Usage: npm run new-project -- --template <${templates.join("|")}> --slug <kebab-case> [--name "Title"]`);
  process.exit(1);
}
const dir = path.join(PROJECTS_DIR, slug);
if (existsSync(dir)) {
  console.error(`projects/${slug} already exists — choose another slug (existing work is never overwritten).`);
  process.exit(1);
}
const data = readJson<Record<string, unknown>>(path.join(TEMPLATES_DIR, `${template}.json`));
data.slug = slug;
data.name = String(flags.name ?? data.name);
mkdirSync(dir, { recursive: true });
writeJson(path.join(dir, "project.json"), data);
writeFileSync(
  path.join(dir, "brief.md"),
  `# ${data.name}\n\nTemplate: \`${template}\` — created ${new Date().toISOString().slice(0, 10)}\n\n## Brief\n- Goal:\n- Audience:\n- Message:\n- Duration / formats: see project.json\n\n## Visual direction\n\n## Scene breakdown\n| # | Scene | Time | Image | Text | Motion | Sound |\n|---|-------|------|-------|------|--------|-------|\n\n## Assets & sources\n\n## Decisions / assumptions\n`,
);
const slugs = writeRegistry();
console.log(`Created projects/${slug} from "${template}". Registered: ${slugs.join(", ")}`);
console.log(`Compositions: ${(data.formats as Array<{ id: string }>).map((f) => `${slug}-${f.id}`).join(", ")}`);
