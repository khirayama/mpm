// tslint:disable:no-any
import * as assert from 'power-assert';

// tslint:disable-next-line:no-relative-imports
import {
  IPackage,
  getPinnedReference,
  fetchPackage,
} from '../src/index';

const packageJSON: { dependencies: { [key: string]: string } } = {
  dependencies: {
    react: '^15.5.4',
    'babel-core': '6.25.0',
  },
};

describe('mpm', () => {
  describe('getPinnedReference', () => {
    it('Semver ^', (done: any) => {
      getPinnedReference({
        name: 'react',
        reference: '^15.5.4',
      }).then((pkg: IPackage) => {
        const actual: IPackage = pkg;
        const expected: IPackage = {
          name: 'react',
          reference: '15.6.2', // FYI: There is possibility to change version
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
        const expected: IPackage = {
          name: 'react',
          reference: '15.3.2', // FYI: There is possibility to change version
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
