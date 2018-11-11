declare module '../../services' {
  interface EthqlServices {
    erc165Service: Erc165Service;
  }

  interface EthqlServiceDefinitions {
    erc165Service: EthqlServiceDefinition<{}, Erc165Service>;
  }
}

export interface Erc165Service {
  supportsInterface(address, interfaceId: string): Promise<boolean>;
}
