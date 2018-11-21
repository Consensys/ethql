## What's here?

This directory contains the ABIs (Application Binary Interfaces) for all the contract types ethql supports.

We classify supported ABIs in two types:

- Entity: introduces a new application-level concept.
- Extension: enhances an existing entity with new or modified behaviour. Changes introduced could be public (visible on
  the ABI) or private.

## Supported ABIs

| Standard | Type      | Entity | Specification | Comments                                                        |
| -------- | --------- | ------ | ------------- | --------------------------------------------------------------- |
| ERC20    | Entity    |  Token | [link][1]     |                                                                 |
| ERC223   | Extension |  Token | [link][2]     | Private ERC20 implementation change. No action needed in ethql. |

## ethql naming scheme

When it comes to transaction decoding and transaction logs, ethql types names explicitly mention the ERC standard of
entity they refer to. Normally this is the ERC that introduced the entity in the first place.

For example, in the case of ERC20 tokens: `ERC20TokenTransfer`, `ERC20TokenApproval`. This helps avoid ambiguity when
more than one standard exists for the same entity class, e.g. ERC777 in the case of tokens.

Typed queries (e.g. block -> tokenTransfers) may not refer to specific standards, instead conflating transactions and
logs pertaining to several standards that relate to the same entity.

[1]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
[2]: https://github.com/ethereum/EIPs/issues/223
