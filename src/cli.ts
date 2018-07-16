// tslint:disable:no-console
import * as path from 'path';
import * as util from 'util';

import { getPackageDependencyTree, IPackage, IPackageJson } from 'mpm';

const cwd: string = process.argv[2] || process.cwd();
const packageJsonPath: string = path.resolve(cwd, 'package.json');
// tslint:disable-next-line:non-literal-require no-var-requires
const projectPackageJson: IPackageJson = require(packageJsonPath);
const projectDependencies: IPackage[] = Object.keys(projectPackageJson.dependencies || {}).map((name: string) => {
  return {
    name,
    reference: projectPackageJson.dependencies[name],
    dependencies: [],
  };
});

getPackageDependencyTree(
  {
    name: 'project',
    reference: 'root',
    dependencies: projectDependencies,
  },
  new Map(),
).then((tree: IPackage) => {
  console.log(util.inspect(tree, { depth: Infinity }));
});
