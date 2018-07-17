// tslint:disable:no-any
import * as assert from 'power-assert';

// tslint:disable-next-line:no-relative-imports
import {
  fetchPackage,
  getPackageDependencies,
  getPackageDependencyTree,
  getPinnedReference,
  IPackage,
  linkPackages,
} from '../src/mpm';

describe('mpm', () => {
  describe('getPackageDependencies', () => {
    it('Runable', (done: any) => {
      getPackageDependencies({
        name: 'react',
        reference: '15.6.1',
        dependencies: [],
      }).then(
        (res: IPackage[]): void => {
          const actual: any = res;
          // FYI: There is possibility to change version
          const expected: any = [
            {
              name: 'create-react-class',
              reference: '^15.6.0',
              dependencies: [],
            },
            {
              name: 'fbjs',
              reference: '^0.8.9',
              dependencies: [],
            },
            {
              name: 'loose-envify',
              reference: '^1.1.0',
              dependencies: [],
            },
            {
              name: 'object-assign',
              reference: '^4.1.0',
              dependencies: [],
            },
            {
              name: 'prop-types',
              reference: '^15.5.10',
              dependencies: [],
            },
          ];
          assert.deepEqual(actual, expected);
          done();
        },
      );
    });
  });

  describe('getPackageDependencyTree', () => {
    it('Runable', () => {
    });
  });

  describe('getPinnedReference', () => {
    it('Semver ^', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '^15.5.4',
        dependencies: [],
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        // FYI: There is possibility to change version
        const expected: IPackage = {
          name: 'react',
          reference: '15.6.2',
          dependencies: [],
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('Semver ~', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '~15.3.0',
        dependencies: [],
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        // FYI: There is possibility to change version
        const expected: IPackage = {
          name: 'react',
          reference: '15.3.2',
          dependencies: [],
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('Semver fixed version', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '15.3.0',
        dependencies: [],
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        const expected: IPackage = {
          name: 'react',
          reference: '15.3.0',
          dependencies: [],
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('Semver fixed file', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '/tmp/react-15.3.2.tar.gz',
        dependencies: [],
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        const expected: IPackage = {
          name: 'react',
          reference: '/tmp/react-15.3.2.tar.gz',
          dependencies: [],
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });
  });

  describe('fetchPackage', () => {
    it('Semver fixed version', (done: any) => {
      fetchPackage({
        name: 'react',
        reference: '15.4.1',
        dependencies: [],
      }).then(() => {
        assert.ok(true);
        done();
      });
    });

    it('Semver ^', (done: any) => {
      fetchPackage({
        name: 'react',
        reference: '^15.5.4',
        dependencies: [],
      }).catch(() => {
        assert.ok(true);
        done();
      });
    });
  });
});
