export class AuthState {
  static Unknown = new AuthState('unknown');
  static Authenticated = new AuthState('authenticated');
  static Unauthenticated = new AuthState('unauthenticated');

  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name;
  }

  static fromName(name) {
    switch (name) {
      case 'authenticated':
        return AuthState.Authenticated;
      case 'unauthenticated':
        return AuthState.Unauthenticated;
      default:
        return AuthState.Unknown;
    }
  }
}