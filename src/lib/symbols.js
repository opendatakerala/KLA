import aap from '../images/aap.svg';
import bjp from '../images/bjp.svg';
import bsp from '../images/bsp.svg';
import cpim from '../images/cpim.svg';
import cpi from '../images/cpi.svg';
import inc from '../images/inc.svg';
import iuml from '../images/iuml.svg';
import ncp from '../images/ncp.svg';

import aapPng from '../images/aap.png';
import bjpPng from '../images/bjp.png';
import bspPng from '../images/bsp.png';
import cpimPng from '../images/cpim.png';
import cpiPng from '../images/cpi.png';
import incPng from '../images/inc.png';
import iumlPng from '../images/iuml.png';
import ncpPng from '../images/ncp.png';

const symbols = {
  aap: aap?.src || aapPng?.src || null,
  bjp: bjp?.src || bjpPng?.src || null,
  bsp: bsp?.src || bspPng?.src || null,
  cpim: cpim?.src || cpimPng?.src || null,
  cpi: cpi?.src || cpiPng?.src || null,
  inc: inc?.src || incPng?.src || null,
  iuml: iuml?.src || iumlPng?.src || null,
  ncp: ncp?.src || ncpPng?.src || null
};

export function getSymbolImage(symbolKey) {
  return symbols[symbolKey] || null;
}
