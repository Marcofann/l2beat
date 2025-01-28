import {
  EthereumAddress,
  ProjectId,
  UnixTime,
  formatSeconds,
} from '@l2beat/shared-pure'

import {
  CONTRACTS,
  DA_BRIDGES,
  DA_LAYERS,
  DA_MODES,
  EXITS,
  FORCE_TRANSACTIONS,
  FRONTRUNNING_RISK,
  RISK_VIEW,
  SEQUENCER_NO_MECHANISM,
  STATE_CORRECTNESS,
  TECHNOLOGY_DATA_AVAILABILITY,
  addSentimentToDataAvailability,
} from '../../common'
import { REASON_FOR_BEING_OTHER } from '../../common'
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'
import { Badge } from '../badges'
import { PolygoncdkDAC } from '../da-beat/templates/polygoncdk-template'
import type { Layer2 } from './types'

const discovery = new ProjectDiscovery('zkfair')
const upgradeDelay = discovery.getContractValue<number>(
  'Timelock',
  'getMinDelay',
)
const upgradeDelayString = formatSeconds(upgradeDelay)
const trustedAggregatorTimeout = discovery.getContractValue<number>(
  'ZKFairValidium',
  'trustedAggregatorTimeout',
)
const trustedAggregatorTimeoutString = formatSeconds(trustedAggregatorTimeout)

const pendingStateTimeout = discovery.getContractValue<number>(
  'ZKFairValidium',
  'pendingStateTimeout',
)
const pendingStateTimeoutString = formatSeconds(pendingStateTimeout)
const _HALT_AGGREGATION_TIMEOUT = formatSeconds(
  discovery.getContractValue<number>(
    'ZKFairValidium',
    '_HALT_AGGREGATION_TIMEOUT',
  ),
)

const forceBatchTimeout = discovery.getContractValue<number>(
  'ZKFairValidium',
  'forceBatchTimeout',
)

const membersCountDAC = discovery.getContractValue<number>(
  'ZKFairValidiumDAC',
  'getAmountOfMembers',
)

const requiredSignaturesDAC = discovery.getContractValue<number>(
  'ZKFairValidiumDAC',
  'requiredAmountOfSignatures',
)

const exitWindowRisk = {
  ...RISK_VIEW.EXIT_WINDOW(
    upgradeDelay,
    trustedAggregatorTimeout + pendingStateTimeout + forceBatchTimeout,
    {
      upgradeDelay2: 0,
    },
  ),
  description: `Even though there is a ${upgradeDelayString} Timelock for upgrades, forced transactions are disabled. Even if they were to be enabled, user withdrawals can be censored up to ${formatSeconds(
    trustedAggregatorTimeout + pendingStateTimeout + forceBatchTimeout,
  )}.`,
  warning: {
    value: 'The ZkFair Owner can upgrade with no delay.',
    sentiment: 'bad',
  },
} as const

const timelockUpgrades = {
  upgradableBy: ['ZKFairAdmin'],
  upgradeDelay: exitWindowRisk.value,
  upgradeConsiderations: exitWindowRisk.description,
}

const isForcedBatchDisallowed = discovery.getContractValue<boolean>(
  'ZKFairValidium',
  'isForcedBatchDisallowed',
)

const membersCount = discovery.getContractValue<number>(
  'ZKFairValidiumDAC',
  'getAmountOfMembers',
)

const requiredSignatures = discovery.getContractValue<number>(
  'ZKFairValidiumDAC',
  'requiredAmountOfSignatures',
)

export const zkfair: Layer2 = {
  type: 'layer2',
  id: ProjectId('zkfair'),
  createdAt: new UnixTime(1690815262), // 2023-07-31T14:54:22Z
  badges: [Badge.VM.EVM, Badge.DA.DAC, Badge.Stack.PolygonCDK],
  reasonsForBeingOther: [
    REASON_FOR_BEING_OTHER.NO_PROOFS,
    REASON_FOR_BEING_OTHER.NO_DA_ORACLE,
  ],
  display: {
    name: 'ZKFair',
    slug: 'zkfair',
    purposes: ['Universal'],
    warning:
      'The forced transaction mechanism is currently disabled. The project claims to use CelestiaDA but smart contracts on L1 use DAC. Arbitrary messaging passing is removed from the bridge.',
    description: 'ZKFair is a Validium based on Polygon CDK and Celestia DA.',
    category: 'Validium',
    provider: 'Polygon',
    links: {
      websites: ['https://zkfair.io/'],
      apps: ['https://wallet.zkfair.io/'],
      documentation: ['https://docs.zkfair.io/'],
      explorers: ['https://scan.zkfair.io/'],
      repositories: ['https://github.com/ZKFair'],
      socialMedia: ['https://twitter.com/ZKFCommunity'],
    },
  },
  config: {
    escrows: [
      discovery.getEscrowDetails({
        address: EthereumAddress('0x9cb4706e20A18E59a48ffa7616d700A3891e1861'),
        sinceTimestamp: new UnixTime(1702879283),
        tokens: '*',
      }),
    ],
    associatedTokens: ['ZKF'],
    transactionApi: {
      type: 'rpc',
      defaultUrl: 'https://rpc.zkfair.io',
      defaultCallsPerMinute: 1500,
      startBlock: 1,
    },
  },
  chainConfig: {
    name: 'zkfair',
    chainId: 42766,
    explorerUrl: 'https://scan.zkfair.io/',
    explorerApi: {
      url: 'https://scan.zkfair.io/api/',
      type: 'blockscout',
    },
    // ~ Timestamp of block number 0 on zkFair
    // https://scan.zkfair.io/block/0
    minTimestampForTvl: UnixTime.fromDate(new Date('2023-12-19T20:00:00Z')),
    multicallContracts: [
      {
        sinceBlock: 6330383,
        batchSize: 150,
        address: EthereumAddress('0xcA11bde05977b3631167028862bE2a173976CA11'),
        version: '3',
      },
    ],
    coingeckoPlatform: 'zkfair',
  },
  dataAvailability: addSentimentToDataAvailability({
    layers: [DA_LAYERS.DAC],
    bridge: DA_BRIDGES.DAC_MEMBERS({
      requiredSignatures,
      membersCount,
    }),
    mode: DA_MODES.STATE_DIFFS,
  }),
  riskView: {
    stateValidation: {
      ...RISK_VIEW.STATE_ZKP_SN,
      sources: [
        {
          contract: 'ZKFairValidium',
          references: [
            'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L820',
          ],
        },
      ],
    },
    dataAvailability: {
      ...RISK_VIEW.DATA_EXTERNAL_DAC({
        membersCount,
        requiredSignatures,
      }),
      sources: [
        {
          contract: 'ZKFairValidium',
          references: [
            'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L587',
          ],
        },
      ],
    },
    exitWindow: exitWindowRisk,
    // this will change once the isForcedBatchDisallowed is set to false inside Polygon ZkEvm contract (if they either lower timeouts or increase the timelock delay)
    sequencerFailure: {
      ...SEQUENCER_NO_MECHANISM(isForcedBatchDisallowed),
      sources: [
        {
          contract: 'ZKFairValidium',
          references: [
            'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L247',
          ],
        },
      ],
    },
    proposerFailure: {
      ...RISK_VIEW.PROPOSER_SELF_PROPOSE_ZK,
      description:
        RISK_VIEW.PROPOSER_SELF_PROPOSE_ZK.description +
        ` There is a ${trustedAggregatorTimeoutString} delay for proving and a ${pendingStateTimeoutString} delay for finalizing state proven in this way. These delays can only be lowered except during the emergency state.`,
      sources: [
        {
          contract: 'ZKFairValidium',
          references: [
            'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L639',
            'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L862',
          ],
        },
      ],
    },
  },
  stage: {
    stage: 'NotApplicable',
  },
  technology: {
    stateCorrectness: {
      ...STATE_CORRECTNESS.VALIDITY_PROOFS,
      references: [
        {
          text: 'ZKFairValidium.sol#L758 - Etherscan source code, _verifyAndRewardBatches function',
          href: 'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L758',
        },
      ],
    },
    dataAvailability: {
      ...TECHNOLOGY_DATA_AVAILABILITY.GENERIC_OFF_CHAIN,
      references: [
        {
          text: 'ZKFairValidium.sol#L494 - Etherscan source code, sequencedBatches mapping',
          href: 'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L494',
        },
      ],
    },
    operator: {
      name: 'The system has a centralized sequencer',
      description:
        'Only a trusted sequencer is allowed to submit transaction batches. A mechanism for users to submit their own batches is currently disabled.',
      risks: [
        FRONTRUNNING_RISK,
        {
          category: 'Funds can be frozen if',
          text: 'the sequencer refuses to include an exit transaction.',
          isCritical: true,
        },
      ],
      references: [
        {
          text: 'ZKFairValidium.sol#L61 - Etherscan source code, onlyTrustedSequencer modifier',
          href: 'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L461',
        },
      ],
    },
    forceTransactions: {
      ...FORCE_TRANSACTIONS.SEQUENCER_NO_MECHANISM,
      description:
        'The mechanism for allowing users to submit their own transactions is currently disabled.',
      references: [
        {
          text: 'ZKFairValidium.sol#L475 - Etherscan source code, isForceBatchAllowed modifier',
          href: 'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L475',
        },
      ],
    },
    exitMechanisms: [
      {
        ...EXITS.REGULAR('zk', 'merkle proof'),
        references: [
          {
            text: 'PolygonZkEvmBridge.sol#L311 - Etherscan source code, claimAsset function',
            href: 'https://etherscan.io/address/0xEb80283EBc508CF6AaC5E054118954a2BD7fA006#code#F19#L315',
          },
        ],
      },
    ],
  },
  permissions: [
    {
      name: 'Sequencer',
      accounts: [
        discovery.getPermissionedAccount('ZKFairValidium', 'trustedSequencer'),
      ],
      description:
        'Its sole purpose and ability is to submit transaction batches. In case they are unavailable users cannot rely on the force batch mechanism because it is currently disabled.',
    },
    {
      name: 'Proposer',
      accounts: [
        discovery.getPermissionedAccount('ZKFairValidium', 'trustedAggregator'),
      ],
      description: `The trusted proposer (called Aggregator) provides the ZKFairValidium contract with ZK proofs of the new system state. In case they are unavailable a mechanism for users to submit proofs on their own exists, but is behind a ${trustedAggregatorTimeoutString} delay for proving and a ${pendingStateTimeoutString} delay for finalizing state proven in this way. These delays can only be lowered except during the emergency state.`,
    },
    ...discovery.getMultisigPermission(
      'ZKFairAdmin',
      'Admin of the ZKFairValidium, can set core system parameters like timeouts, sequencer and aggregator as well as deactivate emergency state.',
    ),
    ...discovery.getMultisigPermission(
      'ZKFairOwner',
      'The ZkFair Owner is a multisig that can be used to trigger the emergency state which pauses bridge functionality, restricts advancing system state and removes the upgradeability delay.',
    ),
    ...discovery.getMultisigPermission(
      'BridgeAdminMultiSig',
      'The Bridge Admin is a multisig that can be used to set bridge fees and an address into which fees are transferred.',
    ),
    {
      name: 'DAC members',
      accounts: (() => {
        // format: [ [ip, address], ... ]
        const membersMap = discovery.getContractValue<string[][]>(
          'ZKFairValidiumDAC',
          'members',
        )

        const members = membersMap.map((member) =>
          discovery.formatPermissionedAccount(EthereumAddress(member[1])),
        )

        return members
      })(),
      description: `Members of the Data Availability Committee. The setup is equivalent to a ${requiredSignatures}/${membersCount} multisig.`,
    },
    {
      name: 'DAC Owner',
      accounts: [
        discovery.getPermissionedAccount('ZKFairValidiumDAC', 'owner'),
      ],
      description:
        'The owner of the Data Availability Committee, can update the member set at any time.',
    },
    {
      name: 'TimelockExecutor',
      accounts: discovery.getAccessControlRolePermission(
        'Timelock',
        'EXECUTOR_ROLE',
      ),
      description:
        'Controls the upgrades to the ZKFairValidiumDAC and ZKFairValidium contracts through the Timelock. ',
    },
  ],
  contracts: {
    addresses: [
      discovery.getContractDetails('ZKFairValidium', {
        description: `The main contract of the Polygon CDK Validium. It defines the rules of the system including core system parameters, permissioned actors as well as emergency procedures. The emergency state can be activated either by the ZkFair Owner, by proving a soundness error or by presenting a sequenced batch that has not been aggregated before a ${_HALT_AGGREGATION_TIMEOUT} timeout. This contract receives transaction roots, L2 state roots as well as ZK proofs. It also holds the address of ZKFairValidiumDAC.`,
        ...timelockUpgrades,
      }),
      discovery.getContractDetails('Bridge', {
        description:
          'The escrow contract for user funds. It is mirrored on the L2 side and can be used to transfer ERC20 assets. To transfer funds a user initiated transaction on both sides is required.',
        ...timelockUpgrades,
      }),
      discovery.getContractDetails('GlobalExitRoot', {
        description:
          'Synchronizes deposit and withdraw merkle trees across L1 and L2. The global root from this contract is injected into the L2 contract.',
        ...timelockUpgrades,
      }),
      discovery.getContractDetails(
        'FflonkVerifier',
        'An autogenerated contract that verifies ZK proofs in the ZKFairValidium system.',
      ),
      discovery.getContractDetails('ZKFairValidiumDAC', {
        description:
          'Committee attesting that data for a given dataRoot has been published. The DAC Owner can update the member set at any time.',
        ...timelockUpgrades,
      }),
      discovery.getContractDetails('Timelock', {
        description: `Contract upgrades have to go through a ${upgradeDelayString} timelock unless the Emergency State is activated. It is controlled by the TimelockExecutor.`,
      }),
    ],
    references: [
      {
        text: 'State injections - stateRoot and exitRoot are part of the validity proof input.',
        href: 'https://etherscan.io/address/0x668965757127549f8755D2eEd10494B06420213b#code#F8#L809',
      },
    ],
    risks: [CONTRACTS.UPGRADE_WITH_DELAY_RISK(upgradeDelayString)],
  },
  milestones: [
    {
      name: 'ZKFair Mainnet is Live',
      link: 'https://twitter.com/ZKFCommunity/status/1737307444181869017',
      date: '2023-12-20T00:00:00Z',
      description: 'ZKFair launched.',
      type: 'general',
    },
  ],
  dataAvailabilitySolution: PolygoncdkDAC({
    bridge: {
      createdAt: new UnixTime(1723211933), // 2024-08-09T13:58:53Z
      requiredMembers: requiredSignaturesDAC,
      membersCount: membersCountDAC,
      transactionDataType: 'State diffs',
    },
  }),
}
