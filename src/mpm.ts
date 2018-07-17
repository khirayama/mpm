// Doc: https://yarnpkg.com/blog/2017/07/11/lets-dev-a-package-manager/
import * as fsExtra from 'fs-extra';
import nodeFetch, { Response } from 'node-fetch';
import * as semver from 'semver';

import { readPackageJsonFromArchive } from 'utilities';

// interfaces
export interface IPackage {
  name: string;
  reference: string;
  dependencies: IPackage[];
}

export interface IPackageJson {
  dependencies: { [key: string]: string };
}

// Finds dependency packages of the package given as argument recursively.
export async function getPackageDependencyTree(pkg: IPackage, available: Map<string, string>): Promise<IPackage> {
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
            const pinnedDependency: IPackage = await getPinnedReference(volatileDependency);
            const subDependencies: IPackage[] = await getPackageDependencies(pinnedDependency);

            const subAvailable: Map<string, string> = new Map(available);
            subAvailable.set(pinnedDependency.name, pinnedDependency.reference);

            return getPackageDependencyTree(
              {
                ...pinnedDependency,
                dependencies: subDependencies,
              },
              subAvailable,
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
export async function getPinnedReference(pkg: IPackage): Promise<IPackage> {
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

  if (semver.valid(pkg.reference)) {
    // nodeFetch supports only absolute URL. So, we need to retry it using absolute URL.
    // When we set absolute URL, `semver.valid` is null.
    // So we will call `nodeFetch` to get package.
    return fetchPackage({
      name: pkg.name,
      reference: `https://registry.yarnpkg.com/${pkg.name}/-/${pkg.name}-${pkg.reference}.tgz`,
      dependencies: [],
    });
  } else {
    const res: Response = await nodeFetch(pkg.reference);

    if (!res.ok) {
      throw new Error(`Couldn't fetch package "${pkg.reference}"`);
    }

    return res.buffer();
  }
}
