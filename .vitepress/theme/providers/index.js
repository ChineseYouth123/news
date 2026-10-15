import { localProvider } from './local';
import { apiProvider } from './api';

const providers = {
  local: localProvider,
  api: apiProvider,
};

let current = 'local';

export function setProvider(name) {
  current = name;
}

export function getProvider() {
  return providers[current];
}
