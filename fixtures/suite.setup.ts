async function globalSetup() {
    console.log('[BEFORE SUITE]: START...');
    // BeforeSuite logic here - Executed only once per run, before all tests
    // BUT using a completely isolated process with other tests, so don't init/store any value here or they will be undefined at run-time
    console.log('[BEFORE SUITE]: END...');
}

export default globalSetup;
