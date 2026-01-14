// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { KeyringPair } from '@polkadot/keyring/types';

import { ApiPromise } from '@polkadot/api';
// import { bnToU8a } from '@polkadot/util';

export const prepareCall = async (
  api: ApiPromise,
  _call: string,
  pair: KeyringPair,
  { kid, proof, maxEpoch, zkAddress }: any
) => {
  const call = api.tx(api.registry.createType('Call', _call));

  const jwkProvider = api.createType('PrimitiveZkloginJwkProvider', 'Google');

  const convertToBytes = (value: string | number) => {
    const u256Value = api.createType('U256', value);
    const bytesArray = Array.from(u256Value.toU8a());

    return api.createType('Bytes', bytesArray);
  };

  const inputs = api.createType('PrimitiveZkloginZkInputZkLoginInputs', {
    proofPoints: {
      a: api.createType('Vec<Bytes>', proof.proof_points.a.map(convertToBytes)),
      b: api.createType(
        'Vec<Vec<Bytes>>',
        proof.proof_points.b.map((subArr: (string | number)[]) => subArr.map(convertToBytes))
      ),
      c: api.createType('Vec<Bytes>', proof.proof_points.c.map(convertToBytes))
    },
    issBase64Details: {
      value: api.createType('U256', BigInt(proof.iss_base64_details.value).toString()),
      indexMod4: api.createType('u8', proof.iss_base64_details.index_mod_4)
    },
    header: api.createType('U256', BigInt(proof.header).toString())
  });

  const zkMaterial = api.createType('PrimitiveZkloginVersionedZkMaterial', {
    V1: {
      provider: jwkProvider,
      kid: kid,
      inputs: inputs,
      ephkey_expire_at: api.createType('u64', maxEpoch)
    }
  });
  const { nonce }: any = await api.query.system.account(zkAddress);
  const uxt = call.sign(pair, {
    blockHash: api.genesisHash,
    genesisHash: api.genesisHash,
    nonce: nonce,
    runtimeVersion: api.runtimeVersion
  });

  return {
    uxt,
    zkMaterial,
    address: zkAddress
  };
};
