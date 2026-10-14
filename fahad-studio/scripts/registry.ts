import { writeRegistry } from "./lib";

const slugs = writeRegistry();
console.log(`Registered ${slugs.length} project(s): ${slugs.join(", ")}`);
