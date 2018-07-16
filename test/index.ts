// tslint:disable:no-any
import * as assert from 'power-assert';

// tslint:disable-next-line:no-relative-imports
import { fetchPackage, getPackageDependencies, getPinnedReference, IPackage } from '../src/index';

describe('mpm', () => {
  describe('getPackageDependencies', () => {
    it('Runable', (done: any) => {
      getPackageDependencies({
        name: 'react',
        reference: '15.6.1',
      }).then(
        (res: IPackage[]): void => {
          const actual: any = res;
          // FYI: There is possibility to change version
          const expected: any = [
            { name: 'create-react-class', reference: '^15.6.0' },
            { name: 'fbjs', reference: '^0.8.9' },
            { name: 'loose-envify', reference: '^1.1.0' },
            { name: 'object-assign', reference: '^4.1.0' },
            { name: 'prop-types', reference: '^15.5.10' },
          ];
          assert.deepEqual(actual, expected);
          done();
        },
      );
    });
  });

  describe('getPinnedReference', () => {
    it('Semver ^', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '^15.5.4',
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        // FYI: There is possibility to change version
        const expected: IPackage = {
          name: 'react',
          reference: '15.6.2',
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('Semver ~', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '~15.3.0',
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        // FYI: There is possibility to change version
        const expected: IPackage = {
          name: 'react',
          reference: '15.3.2',
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('Semver fixed version', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '15.3.0',
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        const expected: IPackage = {
          name: 'react',
          reference: '15.3.0',
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('Semver fixed file', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '/tmp/react-15.3.2.tar.gz',
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        const expected: IPackage = {
          name: 'react',
          reference: '/tmp/react-15.3.2.tar.gz',
        };
        assert.deepEqual(actual, expected);
        done();
      });
    });
  });

  describe('fetchPackage', () => {
    it('Runable', (done: any) => {
      fetchPackage({
        name: 'react',
        reference: '15.4.1',
      }).then(() => {
        done();
      });
    });
  });
});
