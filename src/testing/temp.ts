import type { HipotPoint } from "src/shared/types"


export const HIPOT_INIT: {[name: string]: HipotPoint[]} = {
  h0: [
    {time: 0,  voltage: 380, current: 0.1, resist: 10000},
    {time: 4,  voltage: 380, current: 0.2, resist: 11000},
    {time: 8,  voltage: 380, current: 0.3, resist: 12000},
    {time: 12, voltage: 380, current: 0.4, resist: 13000},
    {time: 16, voltage: 380, current: 0.5, resist: 14000},
    {time: 20, voltage: 380, current: 0.6, resist: 15000},
  ],
  l0: [
    {time: 0,  voltage: 380, current: 1.1, resist: 20000},
    {time: 4,  voltage: 380, current: 1.2, resist: 21000},
    {time: 8,  voltage: 380, current: 1.3, resist: 22000},
    {time: 12, voltage: 380, current: 1.4, resist: 23000},
    {time: 16, voltage: 380, current: 1.5, resist: 24000},
  ],
  hl: [
    {time: 0,  voltage: 380, current: 2.1, resist: 30000},
    {time: 4,  voltage: 380, current: 2.2, resist: 31000},
    {time: 8,  voltage: 380, current: 2.3, resist: 32000},
    {time: 12, voltage: 380, current: 2.4, resist: 33000},
  ],
}