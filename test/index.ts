import * as assert from 'power-assert';

// tslint:disable-next-line:no-relative-imports
import { sampleFunc } from '../src/index';

describe('sampleFunc', () => {
  it('Runable', () => {
    assert.equal(sampleFunc(1, 2), 3);
  });
});
