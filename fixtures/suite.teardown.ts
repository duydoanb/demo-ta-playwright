async function globalTeardown() {
    console.log('[AFTER SUITE]: START...');
    // AfterSuite logic here - Executed only once per run, after all tests
    console.log('[AFTER SUITE]: END...');
}

export default globalTeardown;