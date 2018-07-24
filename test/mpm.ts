// tslint:disable:no-any max-func-body-length
import * as assert from 'power-assert';

// tslint:disable-next-line:no-relative-imports
import {
  createPacakgeTree,
  getPinnedReference,
  IBasePackage,
  IPackage,
  linkPackages,
  optimizePackageTree,
} from '../src/mpm';

declare var Map: any;

describe('mpm', () => {
  describe('createPacakgeTree', () => {
    it('Create package tree that has shallow dependency', (done: any) => {
      const expected: IPackage = {
        name: 'micro-emitter',
        reference: '1.1.15',
        pinnedReference: '1.1.15',
        url: 'https://registry.yarnpkg.com/micro-emitter/-/micro-emitter-1.1.15.tgz',
        dependencies: [],
      };
      createPacakgeTree(
        {
          name: 'micro-emitter',
          reference: '1.1.15',
        },
        new Map(),
      )
        .then((actual: IPackage) => {
          // console.log(JSON.stringify(actual));
          assert.deepEqual(actual, expected);
          done();
        })
        .catch(done);
    });

    it('Create package tree that has deep dependency', (done: any) => {
      const expected: IPackage = {
        name: 'react',
        reference: '15.6.1',
        pinnedReference: '15.6.1',
        url: 'https://registry.yarnpkg.com/react/-/react-15.6.1.tgz',
        dependencies: [
          {
            name: 'create-react-class',
            reference: '^15.6.0',
            pinnedReference: '15.6.3',
            url: 'https://registry.yarnpkg.com/create-react-class/-/create-react-class-15.6.3.tgz',
            dependencies: [
              {
                name: 'fbjs',
                reference: '^0.8.9',
                pinnedReference: '0.8.17',
                url: 'https://registry.yarnpkg.com/fbjs/-/fbjs-0.8.17.tgz',
                dependencies: [
                  {
                    name: 'core-js',
                    reference: '^1.0.0',
                    pinnedReference: '1.2.7',
                    url: 'https://registry.yarnpkg.com/core-js/-/core-js-1.2.7.tgz',
                    dependencies: [],
                  },
                  {
                    name: 'isomorphic-fetch',
                    reference: '^2.1.1',
                    pinnedReference: '2.2.1',
                    url: 'https://registry.yarnpkg.com/isomorphic-fetch/-/isomorphic-fetch-2.2.1.tgz',
                    dependencies: [
                      {
                        name: 'node-fetch',
                        reference: '^1.0.1',
                        pinnedReference: '1.7.3',
                        url: 'https://registry.yarnpkg.com/node-fetch/-/node-fetch-1.7.3.tgz',
                        dependencies: [
                          {
                            name: 'encoding',
                            reference: '^0.1.11',
                            pinnedReference: '0.1.12',
                            url: 'https://registry.yarnpkg.com/encoding/-/encoding-0.1.12.tgz',
                            dependencies: [
                              {
                                name: 'iconv-lite',
                                reference: '~0.4.13',
                                pinnedReference: '0.4.23',
                                url: 'https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.23.tgz',
                                dependencies: [
                                  {
                                    name: 'safer-buffer',
                                    reference: '>= 2.1.2 < 3',
                                    pinnedReference: '2.1.2',
                                    url: 'https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz',
                                    dependencies: [],
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            name: 'is-stream',
                            reference: '^1.0.1',
                            pinnedReference: '1.1.0',
                            url: 'https://registry.yarnpkg.com/is-stream/-/is-stream-1.1.0.tgz',
                            dependencies: [],
                          },
                        ],
                      },
                      {
                        name: 'whatwg-fetch',
                        reference: '>=0.10.0',
                        pinnedReference: '2.0.4',
                        url: 'https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-2.0.4.tgz',
                        dependencies: [],
                      },
                    ],
                  },
                  {
                    name: 'loose-envify',
                    reference: '^1.0.0',
                    pinnedReference: '1.4.0',
                    url: 'https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz',
                    dependencies: [
                      {
                        name: 'js-tokens',
                        reference: '^3.0.0 || ^4.0.0',
                        pinnedReference: '4.0.0',
                        url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
                        dependencies: [],
                      },
                    ],
                  },
                  {
                    name: 'object-assign',
                    reference: '^4.1.0',
                    pinnedReference: '4.1.1',
                    url: 'https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz',
                    dependencies: [],
                  },
                  {
                    name: 'promise',
                    reference: '^7.1.1',
                    pinnedReference: '7.3.1',
                    url: 'https://registry.yarnpkg.com/promise/-/promise-7.3.1.tgz',
                    dependencies: [
                      {
                        name: 'asap',
                        reference: '~2.0.3',
                        pinnedReference: '2.0.6',
                        url: 'https://registry.yarnpkg.com/asap/-/asap-2.0.6.tgz',
                        dependencies: [],
                      },
                    ],
                  },
                  {
                    name: 'setimmediate',
                    reference: '^1.0.5',
                    pinnedReference: '1.0.5',
                    url: 'https://registry.yarnpkg.com/setimmediate/-/setimmediate-1.0.5.tgz',
                    dependencies: [],
                  },
                  {
                    name: 'ua-parser-js',
                    reference: '^0.7.18',
                    pinnedReference: '0.7.18',
                    url: 'https://registry.yarnpkg.com/ua-parser-js/-/ua-parser-js-0.7.18.tgz',
                    dependencies: [],
                  },
                ],
              },
              {
                name: 'loose-envify',
                reference: '^1.3.1',
                pinnedReference: '1.4.0',
                url: 'https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz',
                dependencies: [
                  {
                    name: 'js-tokens',
                    reference: '^3.0.0 || ^4.0.0',
                    pinnedReference: '4.0.0',
                    url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
                    dependencies: [],
                  },
                ],
              },
              {
                name: 'object-assign',
                reference: '^4.1.1',
                pinnedReference: '4.1.1',
                url: 'https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz',
                dependencies: [],
              },
            ],
          },
          {
            name: 'fbjs',
            reference: '^0.8.9',
            pinnedReference: '0.8.17',
            url: 'https://registry.yarnpkg.com/fbjs/-/fbjs-0.8.17.tgz',
            dependencies: [
              {
                name: 'core-js',
                reference: '^1.0.0',
                pinnedReference: '1.2.7',
                url: 'https://registry.yarnpkg.com/core-js/-/core-js-1.2.7.tgz',
                dependencies: [],
              },
              {
                name: 'isomorphic-fetch',
                reference: '^2.1.1',
                pinnedReference: '2.2.1',
                url: 'https://registry.yarnpkg.com/isomorphic-fetch/-/isomorphic-fetch-2.2.1.tgz',
                dependencies: [
                  {
                    name: 'node-fetch',
                    reference: '^1.0.1',
                    pinnedReference: '1.7.3',
                    url: 'https://registry.yarnpkg.com/node-fetch/-/node-fetch-1.7.3.tgz',
                    dependencies: [
                      {
                        name: 'encoding',
                        reference: '^0.1.11',
                        pinnedReference: '0.1.12',
                        url: 'https://registry.yarnpkg.com/encoding/-/encoding-0.1.12.tgz',
                        dependencies: [
                          {
                            name: 'iconv-lite',
                            reference: '~0.4.13',
                            pinnedReference: '0.4.23',
                            url: 'https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.23.tgz',
                            dependencies: [
                              {
                                name: 'safer-buffer',
                                reference: '>= 2.1.2 < 3',
                                pinnedReference: '2.1.2',
                                url: 'https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz',
                                dependencies: [],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        name: 'is-stream',
                        reference: '^1.0.1',
                        pinnedReference: '1.1.0',
                        url: 'https://registry.yarnpkg.com/is-stream/-/is-stream-1.1.0.tgz',
                        dependencies: [],
                      },
                    ],
                  },
                  {
                    name: 'whatwg-fetch',
                    reference: '>=0.10.0',
                    pinnedReference: '2.0.4',
                    url: 'https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-2.0.4.tgz',
                    dependencies: [],
                  },
                ],
              },
              {
                name: 'loose-envify',
                reference: '^1.0.0',
                pinnedReference: '1.4.0',
                url: 'https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz',
                dependencies: [
                  {
                    name: 'js-tokens',
                    reference: '^3.0.0 || ^4.0.0',
                    pinnedReference: '4.0.0',
                    url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
                    dependencies: [],
                  },
                ],
              },
              {
                name: 'object-assign',
                reference: '^4.1.0',
                pinnedReference: '4.1.1',
                url: 'https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz',
                dependencies: [],
              },
              {
                name: 'promise',
                reference: '^7.1.1',
                pinnedReference: '7.3.1',
                url: 'https://registry.yarnpkg.com/promise/-/promise-7.3.1.tgz',
                dependencies: [
                  {
                    name: 'asap',
                    reference: '~2.0.3',
                    pinnedReference: '2.0.6',
                    url: 'https://registry.yarnpkg.com/asap/-/asap-2.0.6.tgz',
                    dependencies: [],
                  },
                ],
              },
              {
                name: 'setimmediate',
                reference: '^1.0.5',
                pinnedReference: '1.0.5',
                url: 'https://registry.yarnpkg.com/setimmediate/-/setimmediate-1.0.5.tgz',
                dependencies: [],
              },
              {
                name: 'ua-parser-js',
                reference: '^0.7.18',
                pinnedReference: '0.7.18',
                url: 'https://registry.yarnpkg.com/ua-parser-js/-/ua-parser-js-0.7.18.tgz',
                dependencies: [],
              },
            ],
          },
          {
            name: 'loose-envify',
            reference: '^1.1.0',
            pinnedReference: '1.4.0',
            url: 'https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz',
            dependencies: [
              {
                name: 'js-tokens',
                reference: '^3.0.0 || ^4.0.0',
                pinnedReference: '4.0.0',
                url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
                dependencies: [],
              },
            ],
          },
          {
            name: 'object-assign',
            reference: '^4.1.0',
            pinnedReference: '4.1.1',
            url: 'https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz',
            dependencies: [],
          },
          {
            name: 'prop-types',
            reference: '^15.5.10',
            pinnedReference: '15.6.2',
            url: 'https://registry.yarnpkg.com/prop-types/-/prop-types-15.6.2.tgz',
            dependencies: [
              {
                name: 'loose-envify',
                reference: '^1.3.1',
                pinnedReference: '1.4.0',
                url: 'https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz',
                dependencies: [
                  {
                    name: 'js-tokens',
                    reference: '^3.0.0 || ^4.0.0',
                    pinnedReference: '4.0.0',
                    url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
                    dependencies: [],
                  },
                ],
              },
              {
                name: 'object-assign',
                reference: '^4.1.1',
                pinnedReference: '4.1.1',
                url: 'https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz',
                dependencies: [],
              },
            ],
          },
        ],
      };

      createPacakgeTree(
        {
          name: 'react',
          reference: '15.6.1',
        },
        new Map(),
      ).then((actual: IPackage) => {
        assert.deepEqual(actual, expected);
        done();
      });
    });
  });
});

const hoge: IPackage = {
  name: 'react',
  reference: '15.6.1',
  pinnedReference: '15.6.1',
  url: 'https://registry.yarnpkg.com/react/-/react-15.6.1.tgz',
  dependencies: [
    {
      name: 'create-react-class',
      reference: '^15.6.0',
      pinnedReference: '15.6.3',
      url: 'https://registry.yarnpkg.com/create-react-class/-/create-react-class-15.6.3.tgz',
      dependencies: [],
    },
    {
      name: 'fbjs',
      reference: '^0.8.9',
      pinnedReference: '0.8.17',
      url: 'https://registry.yarnpkg.com/fbjs/-/fbjs-0.8.17.tgz',
      dependencies: [],
    },
    {
      name: 'loose-envify',
      reference: '^1.1.0',
      pinnedReference: '1.4.0',
      url: 'https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz',
      dependencies: [],
    },
    {
      name: 'object-assign',
      reference: '^4.1.0',
      pinnedReference: '4.1.1',
      url: 'https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz',
      dependencies: [],
    },
    {
      name: 'prop-types',
      reference: '^15.5.10',
      pinnedReference: '15.6.2',
      url: 'https://registry.yarnpkg.com/prop-types/-/prop-types-15.6.2.tgz',
      dependencies: [],
    },
    {
      name: 'core-js',
      reference: '^1.0.0',
      pinnedReference: '1.2.7',
      url: 'https://registry.yarnpkg.com/core-js/-/core-js-1.2.7.tgz',
      dependencies: [],
    },
    {
      name: 'isomorphic-fetch',
      reference: '^2.1.1',
      pinnedReference: '2.2.1',
      url: 'https://registry.yarnpkg.com/isomorphic-fetch/-/isomorphic-fetch-2.2.1.tgz',
      dependencies: [],
    },
    {
      name: 'promise',
      reference: '^7.1.1',
      pinnedReference: '7.3.1',
      url: 'https://registry.yarnpkg.com/promise/-/promise-7.3.1.tgz',
      dependencies: [],
    },
    {
      name: 'setimmediate',
      reference: '^1.0.5',
      pinnedReference: '1.0.5',
      url: 'https://registry.yarnpkg.com/setimmediate/-/setimmediate-1.0.5.tgz',
      dependencies: [],
    },
    {
      name: 'ua-parser-js',
      reference: '^0.7.18',
      pinnedReference: '0.7.18',
      url: 'https://registry.yarnpkg.com/ua-parser-js/-/ua-parser-js-0.7.18.tgz',
      dependencies: [],
    },
    {
      name: 'node-fetch',
      reference: '^1.0.1',
      pinnedReference: '1.7.3',
      url: 'https://registry.yarnpkg.com/node-fetch/-/node-fetch-1.7.3.tgz',
      dependencies: [],
    },
    {
      name: 'whatwg-fetch',
      reference: '>=0.10.0',
      pinnedReference: '2.0.4',
      url: 'https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-2.0.4.tgz',
      dependencies: [],
    },
    {
      name: 'encoding',
      reference: '^0.1.11',
      pinnedReference: '0.1.12',
      url: 'https://registry.yarnpkg.com/encoding/-/encoding-0.1.12.tgz',
      dependencies: [],
    },
    {
      name: 'is-stream',
      reference: '^1.0.1',
      pinnedReference: '1.1.0',
      url: 'https://registry.yarnpkg.com/is-stream/-/is-stream-1.1.0.tgz',
      dependencies: [],
    },
    {
      name: 'iconv-lite',
      reference: '~0.4.13',
      pinnedReference: '0.4.23',
      url: 'https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.23.tgz',
      dependencies: [],
    },
    {
      name: 'safer-buffer',
      reference: '>= 2.1.2 < 3',
      pinnedReference: '2.1.2',
      url: 'https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz',
      dependencies: [],
    },
    {
      name: 'js-tokens',
      reference: '^3.0.0 || ^4.0.0',
      pinnedReference: '4.0.0',
      url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
      dependencies: [],
    },
    {
      name: 'asap',
      reference: '~2.0.3',
      pinnedReference: '2.0.6',
      url: 'https://registry.yarnpkg.com/asap/-/asap-2.0.6.tgz',
      dependencies: [],
    },
    {
      name: 'js-tokens',
      reference: '^3.0.0 || ^4.0.0',
      pinnedReference: '4.0.0',
      url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
      dependencies: [],
    },
    {
      name: 'core-js',
      reference: '^1.0.0',
      pinnedReference: '1.2.7',
      url: 'https://registry.yarnpkg.com/core-js/-/core-js-1.2.7.tgz',
      dependencies: [],
    },
    {
      name: 'isomorphic-fetch',
      reference: '^2.1.1',
      pinnedReference: '2.2.1',
      url: 'https://registry.yarnpkg.com/isomorphic-fetch/-/isomorphic-fetch-2.2.1.tgz',
      dependencies: [],
    },
    {
      name: 'promise',
      reference: '^7.1.1',
      pinnedReference: '7.3.1',
      url: 'https://registry.yarnpkg.com/promise/-/promise-7.3.1.tgz',
      dependencies: [],
    },
    {
      name: 'setimmediate',
      reference: '^1.0.5',
      pinnedReference: '1.0.5',
      url: 'https://registry.yarnpkg.com/setimmediate/-/setimmediate-1.0.5.tgz',
      dependencies: [],
    },
    {
      name: 'ua-parser-js',
      reference: '^0.7.18',
      pinnedReference: '0.7.18',
      url: 'https://registry.yarnpkg.com/ua-parser-js/-/ua-parser-js-0.7.18.tgz',
      dependencies: [],
    },
    {
      name: 'node-fetch',
      reference: '^1.0.1',
      pinnedReference: '1.7.3',
      url: 'https://registry.yarnpkg.com/node-fetch/-/node-fetch-1.7.3.tgz',
      dependencies: [],
    },
    {
      name: 'whatwg-fetch',
      reference: '>=0.10.0',
      pinnedReference: '2.0.4',
      url: 'https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-2.0.4.tgz',
      dependencies: [],
    },
    {
      name: 'encoding',
      reference: '^0.1.11',
      pinnedReference: '0.1.12',
      url: 'https://registry.yarnpkg.com/encoding/-/encoding-0.1.12.tgz',
      dependencies: [],
    },
    {
      name: 'is-stream',
      reference: '^1.0.1',
      pinnedReference: '1.1.0',
      url: 'https://registry.yarnpkg.com/is-stream/-/is-stream-1.1.0.tgz',
      dependencies: [],
    },
    {
      name: 'iconv-lite',
      reference: '~0.4.13',
      pinnedReference: '0.4.23',
      url: 'https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.23.tgz',
      dependencies: [],
    },
    {
      name: 'safer-buffer',
      reference: '>= 2.1.2 < 3',
      pinnedReference: '2.1.2',
      url: 'https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz',
      dependencies: [],
    },
    {
      name: 'js-tokens',
      reference: '^3.0.0 || ^4.0.0',
      pinnedReference: '4.0.0',
      url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
      dependencies: [],
    },
    {
      name: 'asap',
      reference: '~2.0.3',
      pinnedReference: '2.0.6',
      url: 'https://registry.yarnpkg.com/asap/-/asap-2.0.6.tgz',
      dependencies: [],
    },
    {
      name: 'js-tokens',
      reference: '^3.0.0 || ^4.0.0',
      pinnedReference: '4.0.0',
      url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
      dependencies: [],
    },
    {
      name: 'js-tokens',
      reference: '^3.0.0 || ^4.0.0',
      pinnedReference: '4.0.0',
      url: 'https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz',
      dependencies: [],
    },
  ],
};
