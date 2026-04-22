import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

(async function mainPage() {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get("http://localhost:8000/src/html/index.html");
        await driver.findElement(By.id("start-btn")).click();
    } catch(e) {
        console.log("ERROR!",e);
    } finally {
        await driver.sleep(2000);
        await driver.quit();
    }
})();