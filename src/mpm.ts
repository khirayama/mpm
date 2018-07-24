// tslint:disable:no-suspicious-comment
// Doc: https://yarnpkg.com/blog/2017/07/11/lets-dev-a-package-manager/
import * as cp from 'child_process';
import * as path from 'path';
import * as Progress from 'progress';
import * as util from 'util';

import * as fsExtra from 'fs-extra';
import nodeFetch, { Response } from 'node-fetch';
import * as semver from 'semver';

import { extractNpmArchiveTo, readPackageJsonFromArchive } from 'utilities';

export interface IPackageJson {
  bin?: object;
  scripts?: object;
  name?: string;
  dependencies?: { [key: string]: string };
}

export interface IBasePackage {
  name: string;
  reference: string | null;
}

export interface IPackage extends IBasePackage {
  pinnedReference: string | null;
  url: string | null;
  dependencies: IPackage[];
}

// Get pinned reference according to semver
export async function getPinnedReference(name: string, reference: string): Promise<string> {
  let pinnedReference: string = reference;

  if (semver.validRange(reference) && !semver.valid(reference)) {
    const res: Response = await nodeFetch(`https://registry.yarnpkg.com/${name}`);
    const info: { versions: object } = await res.json();

    const versions: string[] = Object.keys(info.versions);
    const maxSatisfying: string | null = semver.maxSatisfying(versions, reference);

    if (maxSatisfying === null) {
      throw new Error(`Couldn't find a version matching "${reference}" for package "${name}"`);
    }

    pinnedReference = maxSatisfying;
  }

  return pinnedReference;
}

// create package tree
export async function createPacakgeTree(
  pkg: IBasePackage,
  available: Map<string, string>,
  pace?: Progress,
): Promise<IPackage> {
  const pinnedReference: string = await getPinnedReference(pkg.name, pkg.reference);
  const url: string = `https://registry.yarnpkg.com/${pkg.name}/-/${pkg.name}-${pinnedReference}.tgz`;

  let packageJson: IPackageJson;
  if (pkg.reference === null) {
    // Root package - your own project
    const cwd: string = process.argv[2] || process.cwd();
    const packageJsonPath: string = path.resolve(cwd, 'package.json');
    // tslint:disable-next-line:non-literal-require no-var-requires
    packageJson = require(packageJsonPath);
  } else {
    const res: Response = await nodeFetch(url);

    if (!res.ok) {
      throw new Error(`Couldn't fetch package "${url}"`);
    }

    const packageBuffer: Buffer = await res.buffer();
    packageJson = JSON.parse(await readPackageJsonFromArchive(packageBuffer));
  }

  const dependencies: IPackage[] = await Promise.all(
    Object.keys(packageJson.dependencies || {})
      .filter(
        (name: string): boolean => {
          const dependency: IBasePackage = {
            name,
            reference: packageJson.dependencies[name],
          };
          const availableReference: string = available.get(dependency.name);

          if (dependency.reference === availableReference) {
            return false;
          }

          if (semver.validRange(dependency.reference) && semver.satisfies(availableReference, dependency.reference)) {
            return false;
          }

          return true;
        },
      )
      .map(
        async (name: string): Promise<IPackage> => {
          if (pace) {
            pace.total += 1;
          }

          const dependency: IBasePackage = {
            name,
            reference: packageJson.dependencies[name],
          };

          const subAvailable: Map<string, string> = new Map(available);
          subAvailable.set(dependency.name, dependency.reference);

          if (pace) {
            pace.tick();
          }

          return createPacakgeTree(
            {
              name,
              reference: packageJson.dependencies[name],
            },
            subAvailable,
            pace,
          );
        },
      ),
  );

  return {
    name: pkg.name,
    reference: pkg.reference,
    pinnedReference,
    url,
    dependencies,
  };
}

// Optimize package tree
export function optimizePackageTree(pkg: IPackage): IPackage {
  const dependencies: IPackage[] = pkg.dependencies.map((dependency: IPackage) => {
    return optimizePackageTree(dependency);
  });

  for (const hardDependency of dependencies.slice()) {
    for (const subDependency of hardDependency.dependencies.slice()) {
      const availableDependency: IPackage = pkg.dependencies.find((dependency: IPackage) => {
        return dependency.name === subDependency.name;
      });

      if (!availableDependency) {
        dependencies.push(subDependency);
      }

      if (!availableDependency || availableDependency.reference === subDependency.reference) {
        hardDependency.dependencies.splice(
          hardDependency.dependencies.findIndex((dependency: IPackage) => {
            return dependency.name === subDependency.name;
          }),
        );
      }
    }
  }

  return {
    name: pkg.name,
    reference: pkg.reference,
    pinnedReference: pkg.pinnedReference,
    url: pkg.url,
    dependencies,
  };
}

// Link packages
const exec: (command: string, options: { cwd: string; env: object }) => Promise<object> = util.promisify(cp.exec);

export async function linkPackages(pkg: IPackage, cwd: string, pace?: Progress): Promise<void> {
  if (pace) {
    pace.total += 1;
  }

  const dependencyTree: IPackage = await createPacakgeTree(pkg, new Map(), pace);

  if (pkg.reference) {
    const res: Response = await nodeFetch(pkg.reference);

    if (!res.ok) {
      throw new Error(`Couldn't fetch package "${pkg.reference}"`);
    }

    const packageBuffer: Buffer = await res.buffer();
    await extractNpmArchiveTo(packageBuffer, cwd);
  }

  await Promise.all(
    pkg.dependencies.map(async (dependency: IPackage) => {
      const target: string = `${cwd}/node_modules/${dependency.name}`;
      const binTarget: string = `${cwd}/node_modules/.bin`;

      await linkPackages(pkg, target, pace);

      // tslint:disable-next-line:non-literal-require
      const dependencyPackageJson: IPackageJson = require(`${target}/package.json`);
      let bin: object = dependencyPackageJson.bin || {};

      if (typeof bin === 'string') {
        bin = {
          [pkg.name]: bin,
        };
      }

      for (const binName of Object.keys(bin)) {
        const source: string = path.resolve(target, bin[binName]);
        const dest: string = `${binTarget}/${binName}`;

        await fsExtra.mkdirp(`${cwd}/node_modules/.bin`);
        await fsExtra.symlink(path.relative(binTarget, source), dest);
      }

      if (dependencyPackageJson.scripts) {
        for (const scriptName of ['preinstall', 'install', 'postinstall']) {
          const script: string = dependencyPackageJson.scripts[scriptName];

          if (!script) {
            continue;
          }

          await exec(script, {
            cwd: target,
            env: {
              ...process.env,
              PATH: `${target}/node_modules/.bin:${process.env.PATH}`,
            },
          });
        }
      }
    }),
  );

  if (pace) {
    pace.tick();
  }
}
