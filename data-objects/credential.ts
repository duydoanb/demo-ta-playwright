export class Credential {
    private readonly _username: string;
    private readonly _password: string;

    constructor(cred: Record<string, string>) {
        this._username = cred.username;
        this._password = cred.password;
    }

    get username(): string { return this._username; }

    get password(): string { return this._password; }
}
