import { TestClassSetupAndTearDown } from "../fixtures/beforeAndAfterTest";

export class Constants {
    private static _initialized = false;
    private static _validUsername: string;
    private static _validPassword: string;
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
        this._validUsername = process.env.VALID_USERNAME ?? "undefined username";
        this._validPassword = process.env.VALID_PASSWORD ?? "undefined password";
        this._testClassSetupTeardownInstance = new TestClassSetupAndTearDown();
        this._temp_login_state_file_path = ".temp-storage-state-data/.auth/user.json";
        this._auth_data_lifetime_threshold = 1 * 60 * 1000; // Maximum is 30 * 24 hours, current is 1 hour
        this._initialized = true;
    }

    static get VALID_USERNAME(): string {
        this.initializeOnce();
        return this._validUsername;
    }

    static get VALID_PASSWORD(): string {
        this.initializeOnce();
        return this._validPassword;
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
