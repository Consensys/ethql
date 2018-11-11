import { createAbiDecoder, DecoderDefinition, extractParamValue } from '../../core/services/decoder';

type Erc165LogBindings = {};

type Erc165TxBindings = {};

class Erc165InterfaceDecoder implements DecoderDefinition<Erc165TxBindings, Erc165LogBindings> {
  public readonly entity = 'interface';
  public readonly standard = 'ERC165';
  public readonly abiDecoder = createAbiDecoder(__dirname + '../../../abi/erc165.json');

  public readonly txTransformers = {};

  public readonly logTransformers = {};
}

export { Erc165InterfaceDecoder };
