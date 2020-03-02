package hu.coware.naplo.uitests;

import androidx.test.espresso.Espresso;
import androidx.test.espresso.web.webdriver.DriverAtoms;
import androidx.test.espresso.web.webdriver.Locator;
import androidx.test.filters.LargeTest;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;
import androidx.test.uiautomator.UiDevice;

import com.azimolabs.conditionwatcher.ConditionWatcher;

import org.junit.FixMethodOrder;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runners.MethodSorters;

import hu.coware.naplo.MainActivity;

import static androidx.test.espresso.web.sugar.Web.onWebView;
import static androidx.test.espresso.web.webdriver.DriverAtoms.findElement;
import static androidx.test.espresso.web.webdriver.DriverAtoms.webClick;
import static androidx.test.espresso.web.webdriver.DriverAtoms.webKeys;

@LargeTest
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class MainActivityTest {

    @Rule
    public ActivityTestRule<MainActivity> mActivityTestRule = new ActivityTestRule<>(MainActivity.class);

    public final static boolean sleep = true;

    @Test
    public void T01_loginAndTimetableTest() throws Exception {
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.CSS_SELECTOR, "input[name='name']")));
        onWebView()
                .withElement(findElement(Locator.CSS_SELECTOR, "input[name='name']"))
                .perform(DriverAtoms.webKeys(KretaLoginConfig.KRETA_USERNAME))

                .withElement(findElement(Locator.CSS_SELECTOR, "input[name='password']"))
                .perform(DriverAtoms.webKeys(KretaLoginConfig.KRETA_PASSWORD));

        Espresso.closeSoftKeyboard();

        onWebView()
                .withElement(findElement(Locator.CSS_SELECTOR, "ion-input[name='selectedInstitute']"))
                .perform(DriverAtoms.webClick());


        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.XPATH, "//ion-virtual-scroll/ion-item[1]")));
        onWebView()
                .withElement(findElement(Locator.XPATH, "//div[contains(@class, 'searchbar-input-container')]/input"))
                .perform(DriverAtoms.webKeys(KretaLoginConfig.KRETA_INSTITUTE_SEARCH))

                .withElement(findElement(Locator.XPATH, "//ion-virtual-scroll/ion-item[1]"))
                .perform(DriverAtoms.webClick());

        Espresso.closeSoftKeyboard();
        if(sleep) Thread.sleep(1000);

        onWebView()
                .withElement(findElement(Locator.CSS_SELECTOR, "#buttons>ion-button"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        UiDevice mDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        mDevice.pressBack();

        onWebView()
                .withElement(findElement(Locator.CLASS_NAME, "submitBtn"))
                .perform(webClick());

        // megvárjuk míg betölt az órarend
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.CSS_SELECTOR, "app-timetable")));

        T02_timetableTest();
    }

    //@Test
    public void T02_timetableTest() throws Exception {
        // megvárjuk míg lesz előre gomb
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.CSS_SELECTOR, "app-timetable ion-toolbar[color=secondary]>ion-icon[slot=end]")));
        // nyomunk egy előrét
        onWebView()
                .withElement(findElement(Locator.CSS_SELECTOR, "ion-toolbar[color=secondary]>ion-icon[slot=end]"))
                .perform(webClick());

        // most addig fogjuk nyomni a visszát, amíg érünk olyan naphoz ahol van óra
        // ezzel fogjuk ellenőrizni, hogy van-e
        String oraselector = "//app-timetable//ion-list/app-orarendi-ora[1]/ion-item[not(contains(@class, 'elmaradt'))]";
        WebViewAvailableInstruction conditionChecker = new WebViewAvailableInstruction(
                findElement(Locator.XPATH, oraselector));
        int maxVissza = 20;

        while(!conditionChecker.checkCondition()){
            // nyomunk egy visszát
            onWebView()
                    .withElement(findElement(Locator.CSS_SELECTOR, "ion-toolbar[color=secondary]>ion-icon[slot=start]"))
                    .perform(webClick());

            // megvárjuk amíg betölt
            ConditionWatcher.waitForCondition(
                    new WebViewAvailableInstruction(findElement(Locator.XPATH, "//app-timetable//ion-list[@id='ion-list-orarend']")));

            maxVissza--;
            if(maxVissza <= 0) throw new Exception("Nem találtunk órát a maximális visszalépés után");
        }

        // megnézzük a datepickert
        // jó lenne vele majd interakcióba is lépni, de egyelőre csak megnézzük
        onWebView()
                .withElement(findElement(Locator.CSS_SELECTOR, "app-timetable ion-toolbar[color=secondary]>.ion-text-center"))
                .perform(webClick());

        Thread.sleep(1000);
        UiDevice mDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        mDevice.pressBack();

        // megvárjuk míg bezáródik a datepicker
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.XPATH, oraselector)));

        // rányomunk a második órára
        onWebView()
                .withElement(findElement(Locator.XPATH, oraselector))
                .perform(webClick());

        T03_loggingModalTest();
    }

    //@Test
    public void T03_loggingModalTest() throws Exception {
        // megvárjuk míg betöltődik a modal
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.XPATH,
                        "//ion-segment[@id='loggingtabs' and not(@ng-reflect-disabled='true')]")));

        // nyomunk egy hiányzást
        onWebView()
                .withElement(findElement(Locator.XPATH, "//ion-list//ion-item[1]/app-tanulo-jelenlet//ion-segment-button[3]"))
                .perform(webClick())
                // egy késést
                .withElement(findElement(Locator.XPATH, "//ion-list//ion-item[2]/app-tanulo-jelenlet//ion-segment-button[2]"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        onWebView()
                // választunk egy percet a pickerből
                .withElement(findElement(Locator.XPATH, "//ion-picker//ion-picker-column//button[@opt-index='1']"))
                .perform(webClick())
                // leokézzuk a pickert
                .withElement(findElement(Locator.XPATH, "//ion-picker//button[contains(@class, 'picker-button')]"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        onWebView()
                // átmegyünk a feljegyzések tabra
                .withElement(findElement(Locator.XPATH,
                        "//ion-segment[@id='loggingtabs' and not(@ng-reflect-disabled='true')]/ion-segment-button[2]"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        onWebView()
                // nyomunk egy házi feladat hiányt
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-feljegyzes//ion-col[4]/ion-button"))
                .perform(webClick())
                // nyomunk egy felszereléshiányt
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[2]/app-tanulo-feljegyzes//ion-col[3]/ion-button"))
                .perform(webClick())
                // nyomunk egy felmentést
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-feljegyzes//ion-col[2]/ion-button"))
                .perform(webClick())
                // nyomunk egy órai dicséretet
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[2]/app-tanulo-feljegyzes//ion-col[1]/ion-button"))
                .perform(webClick());


        if(sleep) Thread.sleep(1000);

        onWebView()
                // átmegyünk a házi feladat tabra
                .withElement(findElement(Locator.XPATH,
                        "//ion-segment[@id='loggingtabs' and not(@ng-reflect-disabled='true')]/ion-segment-button[3]"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        onWebView()
                // megnyitjuk a datepickert
                .withElement(findElement(Locator.XPATH, "//ion-slide//ion-datetime"))
                .perform(webClick());

        // megvárjuk míg betöltődik a picker
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.XPATH,
                        "//ion-picker//div[contains(@class, 'picker-toolbar-button')][1]/button")));

        onWebView()
                // választunk egy dátumot
                .withElement(findElement(Locator.XPATH, "//ion-picker//div[contains(@class, 'picker-toolbar-button')][2]/button"))
                .perform(webClick())
                // beírunk egy leírást
                .withElement(findElement(Locator.XPATH, "//ion-slide//textarea"))
                .perform(webKeys("teszt házifeladat leírás"));

        if(sleep) Thread.sleep(1000);

        onWebView()
                // átmegyünk az értékelés tabra
                .withElement(findElement(Locator.XPATH,
                        "//ion-segment[@id='loggingtabs' and not(@ng-reflect-disabled='true')]/ion-segment-button[4]"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        onWebView()
                // megadunk egy témát
                .withElement(findElement(Locator.XPATH, "//app-ertekeles/ion-item[2]/ion-input"))
                .perform(webKeys("teszt értékelés téma"))
                // megnyitjuk a módválasztó pickert
                .withElement(findElement(Locator.XPATH, "//app-ertekeles/ion-item[3]/ion-input"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        onWebView()
                // választunk egy értékeléstípust a pickerből
                .withElement(findElement(Locator.XPATH, "//ion-picker//ion-picker-column//button[2]"))
                .perform(webClick())
                // leokézzuk a pickert
                .withElement(findElement(Locator.XPATH, "//ion-picker//button[contains(@class, 'picker-button')]"))
                .perform(webClick())

                // kiosztunk pár jegyet
                // azért mindig ugyanannak, hogy ne csússzunk ki a látótérből, mert a scrolltoView nem működik.
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-ertekeles//ion-col[5]/ion-button"))
                .perform(webClick())
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-ertekeles//ion-col[4]/ion-button"))
                .perform(webClick())
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-ertekeles//ion-col[3]/ion-button"))
                .perform(webClick())
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-ertekeles//ion-col[2]/ion-button"))
                .perform(webClick())
                .withElement(findElement(Locator.XPATH, "//ion-list/ion-item[1]/app-tanulo-ertekeles//ion-col[1]/ion-button"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        // bezárjuk a modalt
        onWebView()
                .withElement(findElement(Locator.XPATH, "//ion-toolbar/ion-buttons[@slot='start']/ion-button"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        T04_notloggedTest();
    }

    //@Test
    public void T04_notloggedTest() throws  Exception {
        openMenu();

        // kiválasztjuk a menüből a nem naplózott órák menüpontot
        onWebView()
                .withElement(findElement(Locator.XPATH, "//ion-menu//ion-menu-toggle[2]/ion-item"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);

        T05_evaluationTest();
    }

    //@Test
    public void T05_evaluationTest() throws Exception {
        openMenu();

        // kiválasztjuk a menüből a nem naplózott órák menüpontot
        onWebView()
                .withElement(findElement(Locator.XPATH, "//ion-menu//ion-menu-toggle[3]/ion-item"))
                .perform(webClick());

        if(sleep) Thread.sleep(1000);
        T06_settingsTest();
    }

    //@Test
    public void T06_settingsTest() throws Exception {
        openMenu();

        // kiválasztjuk a menüből a beállítások menüpontot
        onWebView()
                .withElement(findElement(Locator.XPATH, "//ion-menu//ion-menu-toggle[4]/ion-item"))
                .perform(webClick());

        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.XPATH, "//app-settings//ion-list//ion-item[1]/ion-select")));

//        onWebView()
//                // megnyitjuk a téma popovert
//                .withElement(findElement(Locator.XPATH, "//app-settings//ion-list//ion-item[1]/ion-select"))
//                .perform(webClick());
//
//        // megvárjuk míg betöltődik a picker
//        ConditionWatcher.waitForCondition(
//                new WebViewAvailableInstruction(findElement(Locator.XPATH, "//ion-select-popover//ion-radio-group/ion-item[2]")));
//
//        onWebView()
//                .withElement(findElement(Locator.XPATH, "//ion-select-popover//ion-radio-group/ion-item[2]"))
//                .perform(webClick());

        //Espresso.pressBackUnconditionally();

        if(sleep) Thread.sleep(1000);
        T07_logoutTest();
    }

    //@Test
    public void T07_logoutTest() throws Exception {
        openMenu();

        onWebView()
                .withElement(findElement(Locator.XPATH, "//ion-menu/ion-footer/ion-button"))
                .perform(webClick());

        Thread.sleep(10000);
    }

    public void openMenu() throws Exception {
        openMenu(false);
    }

    public void openMenu(boolean first) throws Exception {
        if(first) {
            // megvárjuk míg lesz előre gomb
            ConditionWatcher.waitForCondition(
                    new WebViewAvailableInstruction(findElement(Locator.CSS_SELECTOR, "app-timetable ion-toolbar[color=secondary]>ion-icon[slot=end]")));
        }

        try {
            onWebView()
                    // megnyitjuk a menüt
                    .withElement(findElement(Locator.XPATH, "//ion-toolbar/ion-buttons[@slot='start']/ion-menu-button"))
                    .perform(webClick());
        }
        catch (Exception e){
            onWebView()
                    // megnyitjuk a menüt
                    .withElement(findElement(Locator.XPATH, "//ion-toolbar/ion-buttons[@slot='start']/ion-menu-button"))
                    .perform(webClick());
        }

        // megvárjuk míg kinyílik a menü
        ConditionWatcher.waitForCondition(
                new WebViewAvailableInstruction(findElement(Locator.XPATH, "//ion-menu[contains(@class, 'show-menu')]")));
        Thread.sleep(5000); // direkt van itt fixen, a menü lassan jelenik meg... kellene jobb megoldás
    }

//        ViewInteraction webView = onView(
//                allOf(childAtPosition(
//                        allOf(withId(android.R.id.content),
//                                childAtPosition(
//                                        IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class),
//                                        0)),
//                        0),
//                        isDisplayed()));
//        webView.check(matches(isDisplayed()));



    // Similar to check(matches(...))
    //.check(webMatches(getCurrentUrl(), containsString("navigation_2.html")));

}
