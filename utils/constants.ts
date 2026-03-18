import { TestClassSetupAndTearDown } from "../fixtures/beforeAndAfterTest";
import { Credential } from "../data-objects/credential";

export class Constants {
    private static _initialized = false;
    private static _validCredential_1: Credential;
    private static _validCredential_2: Credential;
    private static _testClassSetupTeardownInstance: TestClassSetupAndTearDown;
    private static _temp_login_state_file_path: string;
    // If the current timestamp exceeds the auth data generation timestamp by this threshold (in seconds) -> generate new auth data
    private static _auth_data_lifetime_threshold: number;

    // Playwright use different processes for global-setup level and test-class level so this CANNOT be init at global-setup phase 
    // Has to be init during run-time, in each process instead
    private static initializeOnce() {
        if (this._initialized) {
            return;
        }
        console.log("Initializing global constants for process!");
        this._validCredential_1 = new Credential({
            username: process.env.VALID_USERNAME_1 ?? "undefined username 1",
            password: process.env.VALID_PASSWORD_1 ?? "undefined password"
        });
        this._validCredential_2 = new Credential({
            username: process.env.VALID_USERNAME_2 ?? "undefined username 2",
            password: process.env.VALID_PASSWORD_2 ?? "undefined password"
        });
        this._testClassSetupTeardownInstance = new TestClassSetupAndTearDown();
        this._temp_login_state_file_path = ".temp-storage-state-data/.auth/user.json";
        this._auth_data_lifetime_threshold = 2 * 60 * 60; // Maximum is 30 * 24 hours, current is 2 hours
        this._initialized = true;
    }

    static get VALID_CREDENTIAL_1(): Credential {
        this.initializeOnce();
        return this._validCredential_1;
    }

    static get VALID_CREDENTIAL_2(): Credential {
        this.initializeOnce();
        return this._validCredential_2;
    }

    static get TEST_CLASS_SETUP_TEARDOWN_INSTANCE(): TestClassSetupAndTearDown {
        this.initializeOnce();
        return this._testClassSetupTeardownInstance;
    }

    static get TEMP_LOGIN_STATE_FILE_PATH(): string {
        this.initializeOnce();
        return this._temp_login_state_file_path;
    }

    static get AUTH_DATA_LIFETIME_THRESHOLD(): number {
        this.initializeOnce();
        return this._auth_data_lifetime_threshold;
    }
}
