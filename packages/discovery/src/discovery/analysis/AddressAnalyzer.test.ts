import { Bytes, EthereumAddress, Hash256, UnixTime } from '@l2beat/shared-pure'
import { expect, mockFn, mockObject } from 'earl'

import { createContractConfig } from '../config/ContractConfig'
import { DiscoveryContract } from '../config/RawDiscoveryConfig'
import type { HandlerExecutor } from '../handlers/HandlerExecutor'
import type { IProvider } from '../provider/IProvider'
import type { ProxyDetector } from '../proxies/ProxyDetector'
import type { ContractSources } from '../source/SourceCodeService'
import type { SourceCodeService } from '../source/SourceCodeService'
import { EMPTY_ANALYZED_CONTRACT, EMPTY_ANALYZED_EOA } from '../utils/testUtils'
import { AddressAnalyzer } from './AddressAnalyzer'
import type { TemplateService } from './TemplateService'

describe(AddressAnalyzer.name, () => {
  const overrides = DiscoveryContract.parse({})
  const config = createContractConfig(
    { address: EthereumAddress.random(), ...overrides },
    {},
    {},
  )

  describe(AddressAnalyzer.prototype.analyze.name, () => {
    it('handles EOAs', async () => {
      const sources: ContractSources = {
        name: '',
        isVerified: false,
        abi: [],
        abis: {},
        sources: [],
      }

      const provider = mockObject<IProvider>({
        getBytecode: async () => Bytes.EMPTY,
      })
      const addressAnalyzer = new AddressAnalyzer(
        mockObject<ProxyDetector>({
          detectProxy: async () => ({
            type: 'EOA',
            values: {},
            deployment: undefined,
            addresses: [],
          }),
        }),
        mockObject<SourceCodeService>({
          getSources: async () => sources,
        }),
        mockObject<HandlerExecutor>({
          execute: async () => ({
            results: [],
            values: {},
            usedTypes: [],
            errors: {},
          }),
        }),
        mockObject<TemplateService>({
          findMatchingTemplates: () => [],
        }),
      )

      const address = EthereumAddress.random()
      const result = await addressAnalyzer.analyze(
        provider,
        address,
        config,
        undefined,
      )

      expect(result).toEqual({
        ...EMPTY_ANALYZED_EOA,
        type: 'EOA',
        name: undefined,
        category: undefined,
        deploymentTimestamp: undefined,
        deploymentBlockNumber: undefined,
        references: undefined,
        targetsMeta: undefined,
        address,
      })
    })

    it('handles contracts', async () => {
      const address = EthereumAddress.random()
      const implementation = EthereumAddress.random()
      const admin = EthereumAddress.random()
      const owner = EthereumAddress.random()

      const sources: ContractSources = {
        name: 'Test',
        isVerified: true,
        abi: ['function foo()', 'function bar()'],
        abis: {
          [address.toString()]: ['function foo()'],
          [implementation.toString()]: ['function bar()'],
        },
        sources: [
          {
            hash: Hash256.random(),
            name: 'Proxy1',
            address: address,
            source: {
              name: 'Proxy1',
              isVerified: true,
              abi: ['function foo()'],
              solidityVersion: '0.8.0',
              constructorArguments: '',
              files: { 'Foo.sol': 'contract Test { function foo() {} }' },
              remappings: [],
            },
          },
          {
            hash: Hash256.random(),
            name: 'Impl1',
            address: implementation,
            source: {
              name: 'Impl1',
              isVerified: true,
              abi: ['function bar()'],
              solidityVersion: '0.8.0',
              constructorArguments: '',
              files: { 'Bar.sol': 'contract Test { function bar() {} }' },
              remappings: [],
            },
          },
        ],
      }

      const provider = mockObject<IProvider>({
        getBytecode: async () => Bytes.fromHex('0x1234'),
      })

      const addressAnalyzer = new AddressAnalyzer(
        mockObject<ProxyDetector>({
          detectProxy: async () => ({
            type: 'EIP1967 proxy',
            values: {
              $implementation: implementation.toString(),
              $admin: admin.toString(),
            },
            deployment: {
              timestamp: UnixTime(1234),
              blockNumber: 9876,
              deployer: EthereumAddress.random(),
              transactionHash: Hash256.random(),
            },
            addresses: [],
          }),
        }),
        mockObject<SourceCodeService>({
          getSources: async () => sources,
        }),
        mockObject<HandlerExecutor>({
          execute: async () => ({
            results: [{ field: 'owner', value: owner.toString() }],
            values: { owner: owner.toString() },
            errors: {},
            usedTypes: [],
          }),
        }),
        mockObject<TemplateService>({
          findMatchingTemplates: () => [],
        }),
      )

      const result = await addressAnalyzer.analyze(
        provider,
        address,
        config,
        undefined,
      )

      expect(result).toEqual({
        ...EMPTY_ANALYZED_CONTRACT,
        address,
        category: undefined,
        name: 'Test',
        isVerified: true,
        deploymentTimestamp: UnixTime(1234),
        deploymentBlockNumber: 9876,
        proxyType: 'EIP1967 proxy',
        references: undefined,
        implementations: [implementation],
        values: {
          $implementation: implementation.toString(),
          $admin: admin.toString(),
          owner: owner.toString(),
        },
        abis: sources.abis,
        sourceBundles: sources.sources,
        targetsMeta: {
          [admin.toString()]: {
            canActIndependently: undefined,
            displayName: undefined,
            description: undefined,
            permissions: [{ type: 'upgrade', delay: 0, target: address }],
            references: undefined,
            severity: undefined,
            types: undefined,
          },
        },
        relatives: {
          [owner.toString()]: new Set(),
          [admin.toString()]: new Set(),
        },
      })
    })

    it('handles unverified contracts', async () => {
      const address = EthereumAddress.random()
      const implementation = EthereumAddress.random()
      const admin = EthereumAddress.random()
      const owner = EthereumAddress.random()

      const sources: ContractSources = {
        name: 'Test',
        isVerified: false,
        abi: ['function foo()'],
        abis: {
          [address.toString()]: ['function foo()'],
        },
        sources: [
          {
            hash: Hash256.random(),
            name: 'Test',
            address,
            source: {
              name: 'Test',
              isVerified: true,
              abi: ['function foo()'],
              solidityVersion: '0.8.0',
              constructorArguments: '',
              files: { 'Foo.sol': 'contract Test { function foo() {} }' },
              remappings: [],
            },
          },
          {
            hash: Hash256.random(),
            name: 'Test2',
            address: implementation,
            source: {
              name: 'Test2',
              isVerified: false,
              abi: [],
              constructorArguments: '',
              files: {},
              remappings: [],
              solidityVersion: '0.8.0',
            },
          },
        ],
      }

      const provider = mockObject<IProvider>({
        getBytecode: async () => Bytes.fromHex('0x1234'),
      })

      const addressAnalyzer = new AddressAnalyzer(
        mockObject<ProxyDetector>({
          detectProxy: async () => ({
            type: 'EIP1967 proxy',
            values: {
              $implementation: implementation.toString(),
              $admin: admin.toString(),
            },
            deployment: {
              timestamp: UnixTime(1234),
              blockNumber: 9876,
              deployer: EthereumAddress.random(),
              transactionHash: Hash256.random(),
            },
            addresses: [],
          }),
        }),
        mockObject<SourceCodeService>({
          getSources: async () => sources,
        }),
        mockObject<HandlerExecutor>({
          execute: async () => ({
            results: [{ field: 'owner', value: owner.toString() }],
            values: { owner: owner.toString() },
            usedTypes: [],
            errors: {},
          }),
        }),
        mockObject<TemplateService>({
          findMatchingTemplates: () => [],
        }),
      )

      const result = await addressAnalyzer.analyze(
        provider,
        address,
        config,
        undefined,
      )

      expect(result).toEqual({
        ...EMPTY_ANALYZED_CONTRACT,
        name: 'Test',
        address,
        category: undefined,
        isVerified: false,
        deploymentTimestamp: UnixTime(1234),
        deploymentBlockNumber: 9876,
        proxyType: 'EIP1967 proxy',
        references: undefined,
        implementations: [implementation],
        values: {
          $implementation: implementation.toString(),
          $admin: admin.toString(),
          owner: owner.toString(),
        },
        abis: sources.abis,
        sourceBundles: sources.sources,
        targetsMeta: {
          [admin.toString()]: {
            canActIndependently: undefined,
            displayName: undefined,
            description: undefined,
            permissions: [{ type: 'upgrade', delay: 0, target: address }],
            references: undefined,
            severity: undefined,
            types: undefined,
          },
        },
        relatives: {
          [owner.toString()]: new Set(),
          [admin.toString()]: new Set(),
        },
      })
    })

    it('handles contracts while omitting the sinceTimestamp', async () => {
      const address = EthereumAddress.random()
      const implementation = EthereumAddress.random()
      const admin = EthereumAddress.random()
      const owner = EthereumAddress.random()

      const sources: ContractSources = {
        name: 'Test',
        isVerified: true,
        abi: ['function foo()', 'function bar()'],
        abis: {
          [address.toString()]: ['function foo()'],
          [implementation.toString()]: ['function bar()'],
        },
        sources: [
          {
            hash: Hash256.random(),
            name: 'Test',
            address,
            source: {
              name: 'Test',
              isVerified: true,
              abi: ['function foo()'],
              solidityVersion: '0.8.0',
              constructorArguments: '',
              files: { 'Foo.sol': 'contract Test { function foo() {} }' },
              remappings: [],
            },
          },
          {
            hash: Hash256.random(),
            name: 'Test',
            address,
            source: {
              name: 'Test',
              isVerified: true,
              abi: ['function bar()'],
              solidityVersion: '0.8.0',
              constructorArguments: '',
              files: { 'Bar.sol': 'contract Test { function bar() {} }' },
              remappings: [],
            },
          },
        ],
      }

      const provider = mockObject<IProvider>({
        getBytecode: async () => Bytes.fromHex('0x1234'),
        getDeployment: mockFn().resolvesTo(undefined),
      })

      const addressAnalyzer = new AddressAnalyzer(
        mockObject<ProxyDetector>({
          detectProxy: async () => ({
            type: 'EIP1967 proxy',
            values: {
              $implementation: implementation.toString(),
              $admin: admin.toString(),
            },
            deployment: undefined,
            addresses: [],
          }),
        }),
        mockObject<SourceCodeService>({
          getSources: async () => sources,
        }),
        mockObject<HandlerExecutor>({
          execute: async () => ({
            results: [{ field: 'owner', value: owner.toString() }],
            values: { owner: owner.toString() },
            usedTypes: [],
            errors: {},
          }),
        }),
        mockObject<TemplateService>({
          findMatchingTemplates: () => [],
        }),
      )

      const result = await addressAnalyzer.analyze(
        provider,
        address,
        config,
        undefined,
      )

      expect(result).toEqual({
        ...EMPTY_ANALYZED_CONTRACT,
        address,
        category: undefined,
        name: 'Test',
        deploymentBlockNumber: undefined,
        deploymentTimestamp: undefined,
        isVerified: true,
        proxyType: 'EIP1967 proxy',
        references: undefined,
        implementations: [implementation],
        values: {
          $implementation: implementation.toString(),
          $admin: admin.toString(),
          owner: owner.toString(),
        },
        abis: sources.abis,
        sourceBundles: sources.sources,
        targetsMeta: {
          [admin.toString()]: {
            canActIndependently: undefined,
            displayName: undefined,
            description: undefined,
            permissions: [{ type: 'upgrade', delay: 0, target: address }],
            references: undefined,
            severity: undefined,
            types: undefined,
          },
        },
        relatives: {
          [owner.toString()]: new Set(),
          [admin.toString()]: new Set(),
        },
      })
    })
  })
})
