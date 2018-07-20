// tslint:disable:no-console
import * as path from 'path';
import * as Progress from 'progress';
import * as util from 'util';

import { getPackageDependencyTree, IPackage, IPackageJson, linkPackages, optimizePackageTree } from 'mpm';
import { trackProgress } from 'utilities';

const cwd: string = process.argv[2] || process.cwd();
const packageJsonPath: string = path.resolve(cwd, 'package.json');
// tslint:disable-next-line:non-literal-require no-var-requires
const projectPackageJson: IPackageJson = require(packageJsonPath);
const dest: string = path.resolve(process.argv[3] || cwd);

const projectDependencies: IPackage[] = Object.keys(projectPackageJson.dependencies || {}).map((name: string) => {
  return {
    name,
    reference: projectPackageJson.dependencies[name],
    dependencies: [],
  };
});

Promise.resolve()
  .then(() => {
    console.log('Resolving the package tree...');

    return trackProgress((pace: Progress) =>
      getPackageDependencyTree(
        {
          name: projectPackageJson.name,
          reference: null,
          dependencies: projectDependencies,
        },
        new Map(),
        pace,
      ),
    );
  })
  .then((packageTree: IPackage) => {
    console.log('Linking the packages on the filesystem...');

    return trackProgress((pace: Progress) => linkPackages(optimizePackageTree(packageTree), dest, pace));
  })
  .catch((err: Error) => {
    console.log(err.stack);
    process.exit(1);
  });
