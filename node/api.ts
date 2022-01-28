import express from 'express'
// This is not an installed dependency, it is only available at runtime on the
// BrightSign. Because of this, we need to have the TypeScript compiler ignore
// the import and add it to the webpack config `module.exports.externals` so
// that webpack doesn't try to resolve the import.
// @ts-expect-error
import NetworkStatus from '@brightsign/networkstatus'

// See the BrightSign JavaScript API documentation for type information.
// https://brightsign.atlassian.net/wiki/spaces/DOC/pages/370678188/JavaScript+API
type NetworkInterfaces = Readonly<string[]>
type NetworkInterfaceStatus = Readonly<{
  type?: string
  present: boolean
  presentStatus: string
  hasLink?: boolean
  macAddress?: string
  isVlan?: boolean
  vlanTag?: number
  parentInterface?: string
  vlanChildTagList?: number[]
  ipAddressList?: NetworkStatusIpAddress[]
  inboundShaperRate?: number
  domainSearchPath?: string[]
  domainNameServers?: string[]
}>
type NetworkStatusIpAddress = Readonly<{
  family: string
  scope: string
  address?: string
  netmask?: string
  broadcast?: string
  prefixLength?: number
  cidr?: string
}>

const ns = new NetworkStatus()

const app = express()
const port = 9001

const wantedProcess = ['version', 'versions', 'arch', 'platform', 'release', 'features', 'env', 'title', 'argv', 'execArgv', 'pid', 'ppid', 'execPath', 'debugPort', 'argv0']
const filteredProcess: { [key: string]: any } =
  Object.entries(process).filter(([key]) => wantedProcess.includes(key))

/**
 * Query a BrightSign's network status.
 * @returns A list of network interfaces and their statuses.
 */
async function getInterfaceStatuses (): Promise<NetworkInterfaceStatus[]> {
  const ifaces: NetworkInterfaces = await ns.getPresentNetworkInterfaces()

  return await Promise.all(ifaces.map((iface) => {
    return ns.getInterfaceStatus(iface)
  }))
}

// SD card filesystem
app.use('/sd', express.static('/storage/sd'))

// Listen for GET requests at `/networkstatus` and return the list of network
// interface statuses.
app.get('/network', (_req, res) => {
  getInterfaceStatuses().then((statuses: NetworkInterfaceStatus[]) => {
    res.json(statuses)
  }).catch((err) => {
    console.error(err)
    res.status(404).json(err)
  })
})

app.get('/node', (_req, res) => {
  try {
    res.json(filteredProcess)
  } catch (err) {
    res.status(404).json(err)
  }
})

// Start the API server on `port`.
app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})
