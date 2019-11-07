var MickmanAppLogin = MickmanAppLogin || {};
MickmanAppLogin.Settings = MickmanAppLogin.Settings || {};
//Test URLS
MickmanAppLogin.Settings.signInUrl = "https://voilamediagroup.com/test-mick/login.php";
MickmanAppLogin.Settings.tokenUrl = "https://voilamediagroup.com/test-mick/token.php";
MickmanAppLogin.Settings.syncDataUrl = "https://voilamediagroup.com/test-mick/sync.php";
//Live URLS
//MickmanAppLogin.Settings.signInUrl = "https://online.mickman.com/app/login.php";
//MickmanAppLogin.Settings.tokenUrl = "https://online.mickman.com/app/token.php";
//MickmanAppLogin.Settings.syncDataUrl = "https://online.mickman.com/app/sync.php";
MickmanAppLogin.Settings.sessionTimeoutInMSec = 31500000; //364 days 14 hours

//database storage
localforage.config({
    driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver() - indexDB
    name        : 'mickApp',
    version     : 1.0,
    size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
    storeName   : 'keyvalue_pairs', // Should be alphanumeric, with underscores.
    description : 'products'
});
//Error inserting into database: 