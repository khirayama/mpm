// tslint:disable:no-suspicious-comment no-any
// Doc: https://yarnpkg.com/blog/2017/07/11/lets-dev-a-package-manager/
import * as cp from 'child_process';
import * as path from 'path';
import * as util from 'util';

import * as fsExtra from 'fs-extra';
import nodeFetch, { Response } from 'node-fetch';
import * as semver from 'semver';

import { extractNpmArchiveTo, readPackageJsonFromArchive } from 'utilities';

// TODO: Needs to define IEntirePackage has dependencies and pinned reference
// TODO: IPackage.dependencies should have `null`

// interfaces
export interface IPackage {
  name: string;
  reference: string | null;
  dependencies: IPackage[];
}

export interface IPackageJson {
  dependencies: { [key: string]: string };
  bin?: object;
  scripts?: object;
  name?: string;
}

const exec: (command: string, options: { cwd: string; env: object }) => Promise<object> = util.promisify(cp.exec);

// Description
export async function linkPackages(pkg: IPackage, cwd: string, pace?: any): Promise<void> {
  if (pace) {
    pace.total += 1;
  }

  const dependencyTree: IPackage = await getPackageDependencyTree(pkg, new Map(), pace);

  if (pkg.reference) {
    const packageBuffer: Buffer = await fetchPackage(pkg);
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
    dependencies,
  };
}

// Finds dependency packages of the package given as argument recursively.
export async function getPackageDependencyTree(
  pkg: IPackage,
  available: Map<string, string>,
  pace?: any,
): Promise<IPackage> {
  return {
    name: pkg.name,
    reference: pkg.reference,
    dependencies: await Promise.all(
      pkg.dependencies
        .filter(
          (volatileDependency: IPackage): boolean => {
            const availableReference: string = available.get(volatileDependency.name);
            if (volatileDependency.reference === availableReference) {
              return false;
            }
            if (
              semver.validRange(volatileDependency.reference) &&
              semver.satisfies(availableReference, volatileDependency.reference)
            ) {
              return false;
            }

            return true;
          },
        )
        .map(
          async (volatileDependency: IPackage): Promise<IPackage> => {
            if (pace) {
              pace.total += 1;
            }

            const pinnedDependency: IPackage = await getPinnedReferencePackage(volatileDependency);
            const subDependencies: IPackage[] = await getPackageDependencies(pinnedDependency);

            const subAvailable: Map<string, string> = new Map(available);
            subAvailable.set(pinnedDependency.name, pinnedDependency.reference);

            if (pace) {
              pace.tick();
            }

            return getPackageDependencyTree(
              {
                ...pinnedDependency,
                dependencies: subDependencies,
              },
              subAvailable,
              pace,
            );
          },
        ),
    ),
  };
}

// Finds dependency packages of the package given as argument.
export async function getPackageDependencies(pkg: IPackage): Promise<IPackage[]> {
  const packageBuffer: Buffer = await fetchPackage(pkg);
  const packageJson: IPackageJson = JSON.parse(await readPackageJsonFromArchive(packageBuffer));

  return Object.keys(packageJson.dependencies || {}).map(
    (name: string): IPackage => {
      return {
        name,
        reference: packageJson.dependencies[name],
        dependencies: [],
      };
    },
  );
}

// Get a package that have pinned version reference.
export async function getPinnedReferencePackage(pkg: IPackage): Promise<IPackage> {
  let reference: string = pkg.reference;

  if (semver.validRange(pkg.reference) && !semver.valid(pkg.reference)) {
    const res: Response = await nodeFetch(`https://registry.yarnpkg.com/${pkg.name}`);
    const info: { versions: object } = await res.json();

    const versions: string[] = Object.keys(info.versions);
    const maxSatisfying: string | null = semver.maxSatisfying(versions, pkg.reference);

    if (maxSatisfying === null) {
      throw new Error(`Couldn't find a version matching "${pkg.reference}" for package "${pkg.name}"`);
    }

    reference = maxSatisfying;
  }

  return {
    name: pkg.name,
    reference,
    dependencies: [],
  };
}

// Fetch the package given as argument as a buffer.
export async function fetchPackage(pkg: IPackage): Promise<Buffer> {
  if (['/', './', '../'].some((prefix: string) => pkg.reference.startsWith(prefix))) {
    return fsExtra.readFile(pkg.reference);
  }

  if (pkg.reference === null) {
    // Skip - for project ownself
  } else if (semver.valid(pkg.reference)) {
    // nodeFetch supports only absolute URL. So, we need to retry it using absolute URL.
    // When we set absolute URL, `semver.valid` is null.
    // So we will call `nodeFetch` to get package.
    return fetchPackage({
      name: pkg.name,
      reference: `https://registry.yarnpkg.com/${pkg.name}/-/${pkg.name}-${pkg.reference}.tgz`,
      dependencies: [],
    });
  } else if (pkg.reference.indexOf('http') !== -1) {
    const res: Response = await nodeFetch(pkg.reference);

    if (!res.ok) {
      throw new Error(`Couldn't fetch package "${pkg.reference}"`);
    }

    return res.buffer();
  } else {
    throw new Error(`Invalid reference: ${pkg.name}@${pkg.reference}`);
  }
}
