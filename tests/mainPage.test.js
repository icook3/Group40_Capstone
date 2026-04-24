import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

(async function testStart() {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get("http://localhost:8000/src/html/index.html");
        driver.executeScript('localStorage.setItem("testMode","True");');
        await driver.findElement(By.id("start-btn")).click();
        await driver.sleep(2000);
        let workoutDialog=await driver.findElement(By.className("workout-dialog"));
        if (!(await workoutDialog.getText()).startsWith("Free Ride starts in")) {
            throw new Error("Can not find workout start dialog!");
        }
        await driver.findElement(By.css("body")).sendKeys("qqqqq");
        await driver.sleep(2000);
        if (!(await driver.findElement(By.id("power")).getText())=="50") {
            throw new Error("Power is not set correctly");
        }
    } catch(e) {
        console.log("ERROR!",e);
    } finally {
        await driver.sleep(2000);
        await driver.quit();
    }
})();