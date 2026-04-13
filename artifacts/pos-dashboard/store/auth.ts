export type AuthUser = {
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  city: string;
  shopName: string;
  gstNumber: string;
  panNumber: string;
  vatNumber: string;
};

type AuthState = {
  isLoggedIn: boolean;
  hasPinSetup: boolean;
  pinVerified: boolean;
  pin: string;
  user: AuthUser | null;
};

let _state: AuthState = {
  isLoggedIn: false,
  hasPinSetup: false,
  pinVerified: false,
  pin: "",
  user: null,
};

const _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((fn) => fn());
}

export function getAuthState(): Readonly<AuthState> {
  return _state;
}

export function subscribeAuth(fn: () => void): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i !== -1) _listeners.splice(i, 1);
  };
}

export function loginUser(user: AuthUser): void {
  _state = { ..._state, isLoggedIn: true, user };
  notify();
}

export function setupPin(pin: string): void {
  _state = { ..._state, hasPinSetup: true, pin, pinVerified: true };
  notify();
}

export function removePin(): void {
  _state = { ..._state, hasPinSetup: false, pin: "", pinVerified: true };
  notify();
}

export function verifyPin(pin: string): boolean {
  if (_state.pin === pin) {
    _state = { ..._state, pinVerified: true };
    notify();
    return true;
  }
  return false;
}

export function logout(): void {
  _state = {
    isLoggedIn: false,
    hasPinSetup: false,
    pinVerified: false,
    pin: "",
    user: null,
  };
  notify();
}
