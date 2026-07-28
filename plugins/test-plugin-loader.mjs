import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

export async function loadClassicPlugin(file, className, random = () => 0.5) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8');
  let registered;
  const math = Object.create(Math);
  math.random = random;
  const context = {
    console,
    Date,
    Math: math,
    PluginRegistry: { register(PluginClass) { registered = PluginClass; } },
  };
  vm.runInNewContext(`${source}\nglobalThis.__plugin = ${className};`, context);
  return registered || context.__plugin;
}
