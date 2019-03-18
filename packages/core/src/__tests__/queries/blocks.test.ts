import { EthqlOptions, testGraphql, TestMode } from '@ethql/plugin';
import { CORE_PLUGIN } from '../../plugin';

const testServerOpts: EthqlOptions = { plugins: [CORE_PLUGIN] };
const { execQuery } = testGraphql({opts: testServerOpts});

test('blocks: select blocks with defined to and from', async () => {
  const query = `
    {
      blocks(from: 1202, to: 1205) {
        hash
      }
    }
  `;

  const expected = {
    data: {
      blocks: [
        { hash: '0x2f0e2a7b56ef50dcf8856af8d724566fbe51ecc0ff2ed67c235ca56fc67c0153' },
        { hash: '0x6ba32ed8982b0778625088fc0f589d8ae28fda10772cae8df62a8e7c3821aeb6' },
        { hash: '0x50fb4b21004a51625ad336c7d9e8d388cee7149949d1b6b03d3cb1d7aea20e91' },
        { hash: '0xef87d950f2f0222200eb272452e67db95bd0e97f4adacc4cf7fb170469f41ee0' },
      ],
    },
  };

  const result = await execQuery(query);
  expect(result).toEqual(expected);
});

test('blocks: select blocks with defined from, undefined to', async () => {
  const numberOfBlocks = 3;
  const prep = `
    {
      block(tag: LATEST) {
        number
      }
    }
  `;
  const result = await execQuery(prep);
  const latestBlockNumber = result.data.block.number;

  const query = `
    query BlocksQuery($from: Long!){
      blocks(from: $from) {
        number
      }
    }
  `;

  const result2 = await execQuery(query, null, {from: latestBlockNumber - numberOfBlocks});
  expect(result2.data).toBeDefined();
  expect(result2.data.blocks.length).toEqual(4);
  expect(result2.data.blocks[3].number).toEqual(latestBlockNumber);
});
