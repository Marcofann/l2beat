import fs from 'fs'
import { ethers } from 'ethers'

interface RollupNamesMap {
  [key: string]: string
}

interface RollupTypeNamesMap {
  [key: string]: string
}

interface RollupData {
  rollupContract: string
  chainID: ethers.BigNumber
  verifier: string
  forkID: ethers.BigNumber
  lastLocalExitRoot: string
  lastBatchSequenced: ethers.BigNumber
  lastVerifiedBatch: ethers.BigNumber
  lastVerifiedBatchBeforeUpgrade: ethers.BigNumber
  rollupTypeID: ethers.BigNumber
  rollupVerifierType: number
  lastPessimisticRoot: string
  programVKey: string
}

interface RollupDataExtended extends RollupData {
  rollupID: number
  name: string
}

interface ErrorWithMessage {
  message: string
}

export class AgglayerDataFetcher {
  private provider: ethers.providers.JsonRpcProvider
  private rollupManagerAddress = '0x5132A183E9F3CB7C848b0AAC5Ae0c4f0491B7aB2'
  private outputFilePath: string

  // Known rollup names
  private rollupNames: RollupNamesMap = {
    '1': 'polygon zkEVM',
    '2': 'astar',
    '3': 'OkX X Layer',
    '4': 'OEV network (dead)',
    '5': 'gptprotocol.org (dead)',
    '6': 'witnesschain (dead)',
    '7': 'lumia.org',
    '8': 'pay network (wirex)',
    '9': 'silicon-zk testnet',
    '10': 'silicon-zk',
    '11': 'haust.network testnet',
    '12': 'haust.network',
    '13': 'ternoa.network',
    '14': 'cdk-sov test (z-chain/token)',
    '15': 'pentagon.games/pen-chain ',
    '16': 'pentagon games testnet?',
  }

  // Rollup type ID descriptions
  private rollupTypeNames: RollupTypeNamesMap = {
    '6': 'zk rollup',
    '4': 'validiumV1',
    '7': 'validiumV2',
    '8': 'okx validium',
    '9': 'pessimistic test',
  }

  private rollupManagerAbi = [
    'function rollupIDToRollupDataV2(uint32 rollupID) view returns (tuple(address rollupContract, uint64 chainID, address verifier, uint64 forkID, bytes32 lastLocalExitRoot, uint64 lastBatchSequenced, uint64 lastVerifiedBatch, uint64 lastVerifiedBatchBeforeUpgrade, uint64 rollupTypeID, uint8 rollupVerifierType, bytes32 lastPessimisticRoot, bytes32 programVKey) rollupData)',
  ]

  constructor(providerUrl: string, outputFilePath: string) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this.outputFilePath = outputFilePath
  }

  // Function to create a formatted console table
  private createConsoleTable(data: string[][]): string {
    const columnWidths: number[] = []
    for (const row of data) {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellLength = row[colIndex].length
        if (!columnWidths[colIndex] || cellLength > columnWidths[colIndex]) {
          columnWidths[colIndex] = cellLength
        }
      }
    }

    // Create the table
    let result = ''

    // Helper function to create a horizontal border
    const createBorder = (char: string): string => {
      let border = '+'
      for (const width of columnWidths) {
        border += char.repeat(width + 2) + '+'
      }
      return border + '\n'
    }

    // Top border
    result += createBorder('-')

    // Header row
    if (data.length > 0) {
      const headerRow = data[0]
      result += '| '
      for (let i = 0; i < headerRow.length; i++) {
        const cell = headerRow[i]
        result += cell.padEnd(columnWidths[i]) + ' | '
      }
      result = result.trimEnd() + '\n'

      // Header separator
      result += createBorder('=')
    }

    // Data rows
    for (let i = 1; i < data.length; i++) {
      result += '| '
      for (let j = 0; j < data[i].length; j++) {
        const cell = data[i][j]
        result += cell.padEnd(columnWidths[j]) + ' | '
      }
      result = result.trimEnd() + '\n'
    }

    // Bottom border
    result += createBorder('-')

    return result
  }

  // Helper function to safely access string map with fallback
  private getFromStringMap(
    map: RollupNamesMap | RollupTypeNamesMap,
    key: string,
    fallback: string,
  ): string {
    return map[key] !== undefined ? map[key] : fallback
  }

  public async fetchAndDisplayRollupData(): Promise<void> {
    // Create contract instance
    const rollupManager = new ethers.Contract(
      this.rollupManagerAddress,
      this.rollupManagerAbi,
      this.provider,
    )

    // Fetch rollup data
    const rollupDataList: RollupDataExtended[] = []
    let rollupID = 1
    let continueLoop = true

    console.log('Fetching rollup data...')

    while (continueLoop) {
      try {
        const data: RollupData =
          await rollupManager.rollupIDToRollupDataV2(rollupID)

        // Check if rollupContract is the zero address
        if (
          data.rollupContract === '0x0000000000000000000000000000000000000000'
        ) {
          console.log(`No more rollups found after ID ${rollupID - 1}`)
          continueLoop = false
        } else {
          // Add to our list with extended information
          rollupDataList.push({
            ...data,
            rollupID,
            name: this.getFromStringMap(
              this.rollupNames,
              rollupID.toString(),
              'Unknown',
            ),
          })

          console.log(`Fetched data for rollupID: ${rollupID}`)
          rollupID++
        }
      } catch (error: unknown) {
        const errorWithMessage = error as ErrorWithMessage
        console.log(
          `Error fetching rollupID ${rollupID}: ${errorWithMessage.message}`,
        )
        continueLoop = false
      }
    }

    // Save complete data to file
    const formattedData = rollupDataList.map((data) => {
      const rollupTypeID = data.rollupTypeID.toString()
      const rollupTypeName = this.getFromStringMap(
        this.rollupTypeNames,
        rollupTypeID,
        'Unknown',
      )

      return {
        rollupID: data.rollupID,
        name: data.name,
        rollupContract: data.rollupContract,
        chainID: data.chainID.toString(),
        verifier: data.verifier,
        forkID: data.forkID.toString(),
        lastLocalExitRoot: data.lastLocalExitRoot,
        lastBatchSequenced: data.lastBatchSequenced.toString(),
        lastVerifiedBatch: data.lastVerifiedBatch.toString(),
        lastVerifiedBatchBeforeUpgrade:
          data.lastVerifiedBatchBeforeUpgrade.toString(),
        rollupTypeID: `${rollupTypeID} (${rollupTypeName})`,
        rollupVerifierType:
          data.rollupVerifierType === 0 ? 'standard (0)' : 'pessimistic (1)',
        lastPessimisticRoot: data.lastPessimisticRoot,
        programVKey: data.programVKey,
      }
    })

    // Create directory if it doesn't exist
    const outputDir = this.outputFilePath.substring(
      0,
      this.outputFilePath.lastIndexOf('/'),
    )
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(
      this.outputFilePath,
      JSON.stringify(formattedData, null, 2),
    )
    console.log(`Full data saved to ${this.outputFilePath}`)

    // Display table with selected fields
    const tableData: string[][] = [
      ['RollupID', 'Name', 'ChainID', 'ForkID', 'RollupTypeID', 'VerifierType'],
    ]

    rollupDataList.forEach((data) => {
      const verifierTypeString =
        data.rollupVerifierType === 0 ? 'standard' : 'pessimistic'
      const rollupTypeID = data.rollupTypeID.toString()
      const rollupTypeName = this.getFromStringMap(
        this.rollupTypeNames,
        rollupTypeID,
        'Unknown',
      )
      const rollupTypeString = `${rollupTypeID} (${rollupTypeName})`

      tableData.push([
        data.rollupID.toString(),
        data.name,
        data.chainID.toString(),
        data.forkID.toString(),
        rollupTypeString,
        verifierTypeString,
      ])
    })

    console.log('Rollup Data Summary:')
    console.log(this.createConsoleTable(tableData))
  }
}
