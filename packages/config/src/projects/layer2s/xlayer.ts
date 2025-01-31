import { EthereumAddress, UnixTime } from '@l2beat/shared-pure'
import {
  DA_BRIDGES,
  DA_LAYERS,
  NEW_CRYPTOGRAPHY,
  RISK_VIEW,
} from '../../common'
import { REASON_FOR_BEING_OTHER } from '../../common'
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'
import type { Layer2 } from '../../types'
import { Badge } from '../badges'
import { PolygoncdkDAC } from '../da-beat/templates/polygoncdk-template'
import { polygonCDKStack } from './templates/polygonCDKStack'

const discovery = new ProjectDiscovery('xlayer')

const shared = new ProjectDiscovery('shared-polygon-cdk')
const bridge = shared.getContract('Bridge')

const membersCountDAC = discovery.getContractValue<number>(
  'XLayerValidiumDAC',
  'getAmountOfMembers',
)

const requiredSignaturesDAC = discovery.getContractValue<number>(
  'XLayerValidiumDAC',
  'requiredAmountOfSignatures',
)

const isForcedBatchDisallowed =
  discovery.getContractValue<string>('XLayerValidium', 'forceBatchAddress') !==
  '0x0000000000000000000000000000000000000000'

const upgradeability = {
  upgradableBy: ['DACProxyAdminOwner'],
  upgradeDelay: 'No delay',
}

export const xlayer: Layer2 = polygonCDKStack({
  addedAt: new UnixTime(1713983341), // 2024-04-24T18:29:01Z
  discovery,
  additionalBadges: [Badge.DA.DAC, Badge.Infra.AggLayer],
  daProvider: {
    layer: DA_LAYERS.DAC,
    bridge: DA_BRIDGES.DAC_MEMBERS({
      requiredSignatures: requiredSignaturesDAC,
      membersCount: membersCountDAC,
    }),
    riskView: RISK_VIEW.DATA_EXTERNAL_DAC({
      membersCount: membersCountDAC,
      requiredSignatures: requiredSignaturesDAC,
    }),
    technology: {
      name: 'Data is not stored on chain',
      description:
        'The transaction data is not recorded on the Ethereum main chain. Transaction data is stored off-chain and only the hashes are posted onchain by the Sequencer, after being signed by the DAC members.',
      risks: [
        {
          category: 'Funds can be lost if',
          text: 'the external data becomes unavailable.',
          isCritical: true,
        },
      ],
      references: [
        {
          title:
            'PolygonValidiumEtrog.sol - Etherscan source code, sequenceBatchesValidium function',
          url: 'https://etherscan.io/address/0x427113ae6F319BfFb4459bfF96eb8B6BDe1A127F#code#F1#L91',
        },
      ],
    },
  },
  chainConfig: {
    name: 'xlayer',
    chainId: 196,
    explorerUrl: 'https://rpc.xlayer.tech',
    minTimestampForTvl: new UnixTime(1711782180),
    multicallContracts: [
      {
        address: EthereumAddress('0xcA11bde05977b3631167028862bE2a173976CA11'),
        batchSize: 150,
        sinceBlock: 47416,
        version: '3',
      },
    ],
  },
  reasonsForBeingOther: [REASON_FOR_BEING_OTHER.SMALL_DAC],
  display: {
    name: 'X Layer',
    slug: 'xlayer',
    description:
      'X Layer is Validium by OKX with seamless integration with OKX products. It is powered by the Polygon CDK.',
    links: {
      websites: ['https://okx.com/xlayer'],
      documentation: [
        'https://okx.com/xlayer/docs/users/welcome/about-x-layer',
      ],
      explorers: ['https://okx.com/explorer/xlayer'],
      socialMedia: ['https://twitter.com/XLayerOfficial'],
    },
  },
  associatedTokens: ['OKB'],
  nonTemplateEscrows: [
    shared.getEscrowDetails({
      address: bridge.address,
      tokens: '*',
      sinceTimestamp: new UnixTime(1712620800),
      sharedEscrow: {
        type: 'AggLayer',
        nativeAsset: 'etherWrapped',
        wethAddress: EthereumAddress(
          '0x5a77f1443d16ee5761d310e38b62f77f726bc71c',
        ),
        tokensToAssignFromL1: ['OKB'],
      },
    }),
  ],
  milestones: [
    {
      title: 'X Layer Public Launch',
      url: 'https://x.com/XLayerOfficial/status/1780056275898048562',
      date: '2024-04-16',
      description: 'X Layer is now accessible to everyone.',
      type: 'general',
    },
  ],
  knowledgeNuggets: [],
  rollupModuleContract: discovery.getContract('XLayerValidium'),
  rollupVerifierContract: discovery.getContract('XLayerVerifier'),
  rpcUrl: 'https://rpc.xlayer.tech',
  isForcedBatchDisallowed,
  nonTemplateTechnology: {
    newCryptography: {
      ...NEW_CRYPTOGRAPHY.ZK_BOTH,
    },
  },
  nonTemplatePermissions: [
    {
      name: 'LocalAdmin',
      accounts: [
        discovery.formatPermissionedAccount(
          discovery.getContractValue('XLayerValidium', 'admin'),
        ),
      ],
      description:
        'Admin of the XLayerValidium contract, can set core system parameters like timeouts, sequencer, activate forced transactions and update the DA mode.',
    },
    {
      name: 'RollupManager',
      accounts: [
        discovery.formatPermissionedAccount(
          discovery.getContractValue('XLayerValidium', 'rollupManager'),
        ),
      ],
      description:
        'Permissioned to revert batches that are not yet finalized and to initialize / upgrade the validium contract to a new (existing) version.',
    },
    {
      name: 'DACProxyAdminOwner',
      accounts: [
        discovery.formatPermissionedAccount(
          discovery.getContractValue('ProxyAdmin', 'owner'),
        ),
      ],
      description:
        "Owner of the XLayerValidiumDAC's ProxyAdmin. Can upgrade the contract.",
    },
  ],
  nonTemplateContracts: [
    discovery.getContractDetails('XLayerValidiumDAC', {
      description:
        'Validium committee contract that allows the admin to setup the members of the committee and stores the required amount of signatures threshold.',
      ...upgradeability,
    }),
  ],
  customDa: PolygoncdkDAC({
    dac: {
      requiredMembers: requiredSignaturesDAC,
      membersCount: membersCountDAC,
    },
  }),
})
