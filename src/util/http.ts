import { UAParser } from "ua-parser-js";

export interface UserAgent {
  isDesktop: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isIE: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isIphone: boolean;
  isIpad: boolean;
  isMobile: boolean;
  osVersion?: number
  browserVersion?: number;
  source: string;
}

export const parseUserAgent = (userAgent: string): UserAgent => {
  const parsed = new UAParser(userAgent).getResult();
  const deviceType = parsed.device.type;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const browser = parsed.browser.name;
  const os = parsed.os.name;
  const isIos = os === 'iOS'
  return {
    isDesktop: !isMobile && !isTablet,
    isAndroid: os === 'Android',
    isChrome: browser === 'Chrome',
    isFirefox: browser === 'Firefox',
    isSafari: browser === 'Safari',
    isIE: browser === 'IE',
    isEdge: browser === 'Edge',
    isOpera: browser === 'Opera',
    isIphone: isMobile && isIos,
    isIpad: isTablet && isIos,
    osVersion: parsed.os.version !== undefined ? parseInt(parsed.os.version, 10) : undefined,
    browserVersion: parsed.browser.version !== undefined ? parseFloat(parsed.browser.version) : undefined,
    source: userAgent,
    isMobile
  }
}