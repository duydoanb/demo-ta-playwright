import path from "path";
import { TestClassSetupAndTearDown } from "../fixtures/beforeAndAfterTest";
import { Credential } from "../data-objects/credential";
import { TestInfo } from "@playwright/test";

export class Constants {
    private static _initialized = false;
    private static _loginURL: string;

    private static _validCredential_1: Credential;
    private static _allValidCredentials: Record<string, string>[];
    private static _testClassSetupTeardownInstance: TestClassSetupAndTearDown;

    private static _temp_login_state_file_path: (userAlias: string) => string;
    private static _temp_storage_state_data_dir_path: string;
    private static _credential_usage_status_file_name: string;
    private static _credential_creation_time_data_file_name: string;

    // If the current timestamp exceeds the auth data generation timestamp by this threshold (in seconds) -> generate new auth data
    private static _auth_data_lifetime_threshold: number;

    // Logger
    private static _stepContextForProcess: TestInfo;
    private static _test_run_id: string;

    // Playwright use different processes for global-setup level and test-class level so this CANNOT be init at global-setup phase 
    // Has to be init during run-time, in each process instead
    private static initializeOnce() {
        if (this._initialized) {
            return;
        }
        console.log("Initializing global constants for process!");

        this._loginURL = `${process.env.BASE_URL}/my-account/`
        this._validCredential_1 = new Credential({
            username: process.env.VALID_USERNAME_1 ?? "undefined username 1",
            password: process.env.VALID_PASSWORD_1 ?? "undefined password"
        });

        if (process.env.VALID_CREDENTIALS === undefined || process.env.VALID_CREDENTIALS === null) {
            throw new Error("[FATAL] Please add valid credentials for the site in the env variables as VALID_CREDENTIALS (it must be an json array)!");
        }
        this._allValidCredentials = JSON.parse(process.env.VALID_CREDENTIALS);
        this._testClassSetupTeardownInstance = new TestClassSetupAndTearDown();
        this._temp_login_state_file_path = (_userAlias: string): string => `.temp-storage-state-data/.auth/${_userAlias}.json`;
        this._temp_storage_state_data_dir_path = path.join(process.cwd(), '.temp-storage-state-data', '.auth');
        this._credential_usage_status_file_name = "credential_usage_status.json";
        this._credential_creation_time_data_file_name = "credential_creation_time.json";

        this._auth_data_lifetime_threshold = 12 * 60 * 60; // Maximum is 30 * 24 hours, current is 12 hours

        if (!process.env.TEST_RUN_ID) {
            throw new Error("[FATAL] TEST_RUN_ID is not set in env variables, please set it in the playwright.config.ts file!");
        }
        this._test_run_id = process.env.TEST_RUN_ID;

        this._initialized = true;
    }

    static get LOGIN_URL(): string {
        this.initializeOnce();
        return this._loginURL;
    }

    static get VALID_CREDENTIAL_1(): Credential {
        this.initializeOnce();
        return this._validCredential_1;
    }

    static get ALL_VALID_CREDENTIALS(): Record<string, string>[] {
        this.initializeOnce();
        return this._allValidCredentials;
    }

    static get TEST_CLASS_SETUP_TEARDOWN_INSTANCE(): TestClassSetupAndTearDown {
        this.initializeOnce();
        return this._testClassSetupTeardownInstance;
    }

    static get TEMP_LOGIN_STATE_FILE_PATH(): (userAlias: string) => string {
        this.initializeOnce();
        return this._temp_login_state_file_path;
    }

    static get TEMP_STORAGE_STATE_DIR_PATH(): string {
        this.initializeOnce();
        return this._temp_storage_state_data_dir_path;
    }

    static get CREDENTIAL_USAGE_STATUS_FILE_NAME(): string {
        this.initializeOnce();
        return this._credential_usage_status_file_name;
    }

    static get CREDENTIAL_CREATION_TIME_FILE_NAME(): string {
        this.initializeOnce();
        return this._credential_creation_time_data_file_name;
    }

    static get AUTH_DATA_LIFETIME_THRESHOLD(): number {
        this.initializeOnce();
        return this._auth_data_lifetime_threshold;
    }

    static get TEST_RUN_ID(): string {
        this.initializeOnce();
        return this._test_run_id;
    }

    static get CURRENT_STEP_CONTEXT(): TestInfo {
        this.initializeOnce();
        return this._stepContextForProcess;
    }

    static SET_CURRENT_STEP_CONTEXT(newContext: TestInfo): void {
        this.initializeOnce();
        this._stepContextForProcess = newContext;
    }
}
