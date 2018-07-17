// tslint:disable:no-any max-func-body-length
import * as assert from 'power-assert';

// tslint:disable-next-line:no-relative-imports
import {
  fetchPackage,
  getPackageDependencies,
  getPackageDependencyTree,
  getPinnedReferencePackage,
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
      })
        .then(
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
        )
        .catch(done);
    });
  });

  describe('getPackageDependencyTree', () => {
    it('Runable', (done: any) => {
      getPinnedReferencePackage({
        name: 'react',
        reference: '^15.5.4',
        dependencies: [],
      }).then((pinnedDependency: IPackage) => {
        getPackageDependencies(pinnedDependency).then((dependencies: IPackage[]) => {
          getPackageDependencyTree(
            {
              ...pinnedDependency,
              dependencies,
            },
            new Map(),
          ).then((res: IPackage) => {
            const actual: IPackage = res;
            const expected: IPackage = {
              name: 'react',
              reference: '15.6.2',
              dependencies: [
                {
                  name: 'create-react-class',
                  reference: '15.6.3',
                  dependencies: [
                    {
                      name: 'fbjs',
                      reference: '0.8.17',
                      dependencies: [
                        { name: 'core-js', reference: '1.2.7', dependencies: [] },
                        {
                          name: 'isomorphic-fetch',
                          reference: '2.2.1',
                          dependencies: [
                            {
                              name: 'node-fetch',
                              reference: '1.7.3',
                              dependencies: [
                                {
                                  name: 'encoding',
                                  reference: '0.1.12',
                                  dependencies: [
                                    {
                                      name: 'iconv-lite',
                                      reference: '0.4.23',
                                      dependencies: [{ name: 'safer-buffer', reference: '2.1.2', dependencies: [] }],
                                    },
                                  ],
                                },
                                { name: 'is-stream', reference: '1.1.0', dependencies: [] },
                              ],
                            },
                            { name: 'whatwg-fetch', reference: '2.0.4', dependencies: [] },
                          ],
                        },
                        {
                          name: 'loose-envify',
                          reference: '1.4.0',
                          dependencies: [{ name: 'js-tokens', reference: '4.0.0', dependencies: [] }],
                        },
                        { name: 'object-assign', reference: '4.1.1', dependencies: [] },
                        {
                          name: 'promise',
                          reference: '7.3.1',
                          dependencies: [{ name: 'asap', reference: '2.0.6', dependencies: [] }],
                        },
                        { name: 'setimmediate', reference: '1.0.5', dependencies: [] },
                        { name: 'ua-parser-js', reference: '0.7.18', dependencies: [] },
                      ],
                    },
                    {
                      name: 'loose-envify',
                      reference: '1.4.0',
                      dependencies: [{ name: 'js-tokens', reference: '4.0.0', dependencies: [] }],
                    },
                    { name: 'object-assign', reference: '4.1.1', dependencies: [] },
                  ],
                },
                {
                  name: 'fbjs',
                  reference: '0.8.17',
                  dependencies: [
                    { name: 'core-js', reference: '1.2.7', dependencies: [] },
                    {
                      name: 'isomorphic-fetch',
                      reference: '2.2.1',
                      dependencies: [
                        {
                          name: 'node-fetch',
                          reference: '1.7.3',
                          dependencies: [
                            {
                              name: 'encoding',
                              reference: '0.1.12',
                              dependencies: [
                                {
                                  name: 'iconv-lite',
                                  reference: '0.4.23',
                                  dependencies: [{ name: 'safer-buffer', reference: '2.1.2', dependencies: [] }],
                                },
                              ],
                            },
                            { name: 'is-stream', reference: '1.1.0', dependencies: [] },
                          ],
                        },
                        { name: 'whatwg-fetch', reference: '2.0.4', dependencies: [] },
                      ],
                    },
                    {
                      name: 'loose-envify',
                      reference: '1.4.0',
                      dependencies: [{ name: 'js-tokens', reference: '4.0.0', dependencies: [] }],
                    },
                    { name: 'object-assign', reference: '4.1.1', dependencies: [] },
                    {
                      name: 'promise',
                      reference: '7.3.1',
                      dependencies: [{ name: 'asap', reference: '2.0.6', dependencies: [] }],
                    },
                    { name: 'setimmediate', reference: '1.0.5', dependencies: [] },
                    { name: 'ua-parser-js', reference: '0.7.18', dependencies: [] },
                  ],
                },
                {
                  name: 'loose-envify',
                  reference: '1.4.0',
                  dependencies: [{ name: 'js-tokens', reference: '4.0.0', dependencies: [] }],
                },
                { name: 'object-assign', reference: '4.1.1', dependencies: [] },
                {
                  name: 'prop-types',
                  reference: '15.6.2',
                  dependencies: [
                    {
                      name: 'loose-envify',
                      reference: '1.4.0',
                      dependencies: [{ name: 'js-tokens', reference: '4.0.0', dependencies: [] }],
                    },
                    { name: 'object-assign', reference: '4.1.1', dependencies: [] },
                  ],
                },
              ],
            };
            assert.deepEqual(actual, expected);
            done();
          });
        });
      });
    });
  });

  describe('getPinnedReferencePackage', () => {
    it('Semver ^', (done: any) => {
      getPinnedReferencePackage({
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
      getPinnedReferencePackage({
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
      getPinnedReferencePackage({
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
      getPinnedReferencePackage({
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
