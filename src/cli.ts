// tslint:disable:no-console
import * as path from 'path';
import * as Progress from 'progress';
import * as util from 'util';

import { createPacakgeTree, IBasePackage, IPackage, IPackageJson, linkPackages, optimizePackageTree } from 'mpm';
import { trackProgress } from 'utilities';

const cwd: string = process.argv[2] || process.cwd();
const packageJsonPath: string = path.resolve(cwd, 'package.json');
// tslint:disable-next-line:non-literal-require no-var-requires
const projectPackageJson: IPackageJson = require(packageJsonPath);
const dest: string = path.resolve(process.argv[3] || cwd);
const rootBasePackage: IBasePackage = {
  name: projectPackageJson.name,
  reference: null,
};

(async (): Promise<void> => {
  console.log('Resolving the package tree...');
  const packageTree: IPackage = await trackProgress<Promise<IPackage>>(async (pace: Progress) => {
    return createPacakgeTree(rootBasePackage, new Map(), pace);
  });
  const optimizedPackageTree: IPackage = optimizePackageTree(packageTree);
  console.log(packageTree);

  console.log('Linking the packages on the filesystem...');
  await trackProgress<void>((pace: Progress) => linkPackages(optimizedPackageTree, dest, pace));
})();
