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

export async function getPackageDependencyTree(pkg: IPackage): Promise<IPackage> {
  return {
    name: pkg.name,
    reference: pkg.reference,
    dependencies: await Promise.all(
      pkg.dependencies.map(async (volatileDependency: IPackage) => {
        const pinnedDependency: IPackage = await getPinnedReference(volatileDependency);
        const subDependencies: IPackage[] = await getPackageDependencies(pinnedDependency);

        return getPackageDependencyTree({
          ...pinnedDependency,
          dependencies: subDependencies,
        });
      }),
    ),
  };
}

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

export async function fetchPackage(pkg: IPackage): Promise<Buffer> {
  if (['/', './', '../'].some((prefix: string) => pkg.reference.startsWith(prefix))) {
    return fsExtra.readFile(pkg.reference);
  }

  if (semver.valid(pkg.reference)) {
    return fetchPackage({
      name: pkg.name,
      reference: `https://registry.yarnpkg.com/${pkg.name}/-/${pkg.name}-${pkg.reference}.tgz`,
      dependencies: [],
    });
  }

  const res: Response = await nodeFetch(pkg.reference);

  if (!res.ok) {
    throw new Error(`Couldn't fetch package "${pkg.reference}"`);
  }

  return res.buffer();
}
