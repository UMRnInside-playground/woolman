const Vec3 = require("vec3")

// A rectangular area
global.SheepMaxX = 831
global.SheepMinX = 813
global.SheepMaxZ = 1046
global.SheepMinZ = 999

// Also for sheep
global.ItemExpectedY = 65

global.idlePosition = Vec3(826, 65, 1032)
// Where bot tosses wool
global.tossingPosition = Vec3(814, 65, 1007)
// Looking at a hopper
global.tossingLookingAtPosition = Vec3(814, 64, 1003)

// 65535 for all colors
// global.WoolMask & (1<<i)
// where i is the DataValue of a wool
global.WoolMask = 65535

// Can be optimized?
global.AutoShearInterval = 1000
global.AutoStoreMinimumWoolCount = 256

// For sheep
global.StatsUnchangedTolerance = 24
global.StatsUnchangedPreferReset = false

// Useful in some servers
global.cmd1 = "/stp ss"
global.cmd2 = "/home"

// For AuthMe Plugins
global.AuthmePassword = "changeme"
