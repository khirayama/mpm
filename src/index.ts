// Doc: https://yarnpkg.com/blog/2017/07/11/lets-dev-a-package-manager/
// tslint:disable:export-name no-any

import * as fsExtra from 'fs-extra';
import nodeFetch from 'node-fetch';
import * as semver from 'semver';

export interface IPackage {
  name: string;
  reference: string;
}

export async function getPinnedReference(pkg: IPackage): Promise<IPackage> {
  let reference: string = pkg.reference;

  if (semver.validRange(pkg.reference) && !semver.valid(pkg.reference)) {
    const res: any = await nodeFetch(`https://registry.yarnpkg.com/${pkg.name}`);
    const info: any = await res.json();

    const versions: any = Object.keys(info.versions);
    const maxSatisfying: any = semver.maxSatisfying(versions, pkg.reference);

    if (maxSatisfying === null) {
      throw new Error(`Couldn't find a version matching "${pkg.reference}" for package "${pkg.name}"`);
    }

    reference = maxSatisfying;
  }

  return {
    name: pkg.name,
    reference,
  };
}

export async function fetchPackage(pkg: IPackage): Promise<any> {
  if (['/', './', '../'].some((prefix: string) => pkg.reference.startsWith(prefix))) {
    return fsExtra.readFile(pkg.reference);
  }

  if (semver.valid(pkg.reference)) {
    return fetchPackage({
      name: pkg.name,
      reference: `https://registry.yarnpkg.com/${pkg.name}/-/${pkg.name}-${pkg.reference}.tgz`,
    });
  }

  const res: any = await nodeFetch(pkg.reference);

  if (!res.ok) {
    throw new Error(`Couldn't fetch package "${pkg.reference}"`);
  }

  return res.buffer();
}
