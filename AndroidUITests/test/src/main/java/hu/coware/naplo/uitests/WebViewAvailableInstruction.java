package hu.coware.naplo.uitests;

import androidx.test.espresso.web.model.Atom;
import androidx.test.espresso.web.model.ElementReference;
import androidx.test.espresso.web.sugar.Web;
import com.azimolabs.conditionwatcher.Instruction;

import static androidx.test.espresso.web.sugar.Web.onWebView;
import static androidx.test.espresso.web.webdriver.DriverAtoms.*;

public class WebViewAvailableInstruction extends Instruction {

    Atom<ElementReference> waitForElement;

    public WebViewAvailableInstruction(Atom<ElementReference> waitForElement){
        this.waitForElement = waitForElement;
    }

    @Override
    public String getDescription() {
        return "Cordova Web View availability";
    }

    @Override
    public boolean checkCondition() {
        try {
            Web.WebInteraction<Void> element = onWebView().withElement(this.waitForElement);
                    
            if(element == null)
                return false;

            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
