import { UserAgent } from "../../util/http";
import { Log } from "../Logger";
import { AndroidTVClient } from "./AndroidTVClient";
import { ChromeClient } from "./ChromeClient";
import { Client } from "./Client";
import { DoseClient } from "./DoseClient";
import { EdgeClient } from "./EdgeClient";
import { FirefoxClient } from "./FirefoxClient";
import { IphoneClient } from "./IphoneClient";
import { OperaClient } from "./OperaClient";
import { SafariClient } from "./SafariClient";
import { UnknownClient } from "./UnknownClient";

const createBrowserClient = (userAgent: UserAgent): Client => {
  const browserVersion = userAgent.browserVersion || 0;
  if (userAgent.browserVersion === undefined) {
    Log.debug('No browser version found, defaulting to 0');
  }
  if (userAgent.isChrome) {
    return new ChromeClient(browserVersion)
  }
  if (userAgent.isFirefox) {
    return new FirefoxClient(browserVersion);
  }
  if (userAgent.isEdge) {
    return new EdgeClient(browserVersion);
  }
  if (userAgent.isIE) {
    return new EdgeClient(browserVersion);
  }
  if (userAgent.isOpera) {
    return new OperaClient(browserVersion);
  }
  if (userAgent.isSafari) {
    return new SafariClient(browserVersion);
  }
  Log.debug('Browser not recognized, using unknown client');
  return new UnknownClient();
}

const createAndroidClient = (userAgent: UserAgent): Client => {
  if (userAgent.isMobile) {
    return new UnknownClient();
  }
  const osVersion = userAgent.osVersion || 0;
  if (userAgent.osVersion === undefined) {
    Log.debug('No OS version found, defaulting to 0');
  }
  return new AndroidTVClient(osVersion)
}

const createIphoneClient = (userAgent: UserAgent): Client => {
  const osVersion = userAgent.osVersion || 0;
  if (userAgent.osVersion === undefined) {
    Log.debug('No OS version found, defaulting to 0');
  }
  return new IphoneClient(osVersion);
}

export const createClientFromUserAgent = (userAgent: UserAgent): Client => {
  if (userAgent.source === 'DoseApp/1.0') {
    return new DoseClient();
  }
  if (userAgent.isDesktop && !userAgent.isAndroid && userAgent.source) {
    return createBrowserClient(userAgent);
  }
  if (userAgent.isAndroid) {
    return createAndroidClient(userAgent);
  }
  if (userAgent.isIphone) {
    return createIphoneClient(userAgent);
  }
  Log.debug('User agent not recognized, using unknown client');
  return new UnknownClient();
}