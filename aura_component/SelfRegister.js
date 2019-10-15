({
    initialize: function(component, event, helper) {
        $A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap}).fire();
        $A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap2}).fire();        
        component.set('v.extraFields', helper.getExtraFields(component, event, helper));
        
        //Hide content for stepwise process
        var cmpTarget = component.find('section-two');
        $A.util.addClass(cmpTarget, 'hidden');
        
        cmpTarget = component.find('section-three');
        $A.util.addClass(cmpTarget, 'hidden');
       
        cmpTarget = component.find('prevButtonContainer');
        $A.util.addClass(cmpTarget, 'hidden');
        
        cmpTarget = component.find('sfdc_submit');
        $A.util.addClass(cmpTarget, 'hidden');
        
        cmpTarget = component.find('sfdc_button_spacer');
        $A.util.addClass(cmpTarget, 'hidden');
        
        //Keep track of stage
        component.set('v.step', "1");

    },
    
    prevStep:  function (component, event, helpler) {
        var currentStep = component.get('v.step');
        
        if (currentStep == "2") {
            var cmpTarget = component.find('section-one');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('section-two');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('prevButtonContainer');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('sfdc_button_spacer');
            $A.util.addClass(cmpTarget, 'hidden');   
            
            component.set('v.step', "1");
        } else if (currentStep == "3") {
            var cmpTarget = component.find('section-two');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('section-three');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('nextButtonContainer');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('sfdc_submit');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('sfdc_button_spacer');
       	    $A.util.removeClass(cmpTarget, 'hidden');
            
            component.set('v.step', "2");
        }
    },
    
    nextStep:  function (component, event, helpler) {
        var currentStep = component.get('v.step');
        
        if (currentStep == "1") {
            var cmpTarget = component.find('section-two');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('section-one');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('prevButtonContainer');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('sfdc_button_spacer');
       	    $A.util.removeClass(cmpTarget, 'hidden');
            
            component.set('v.step', "2");
        } else if (currentStep == "2") {
            var cmpTarget = component.find('section-two');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('section-three');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('sfdc_submit');
            $A.util.removeClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('nextButtonContainer');
            $A.util.addClass(cmpTarget, 'hidden');
            
            cmpTarget = component.find('sfdc_button_spacer');
       	    $A.util.addClass(cmpTarget, 'hidden');
            
            component.set('v.step', "3");
        }
    },
    
    handleSelfRegister: function (component, event, helpler) {
        helpler.handleSelfRegister(component, event, helpler);
    },
    
    setStartUrl: function (component, event, helpler) {
        var startUrl = event.getParam('startURL');
        if(startUrl) {
            component.set("v.startUrl", startUrl);
        }
    },
    
    setExpId: function (component, event, helper) {
        var expId = event.getParam('expid');
        if (expId) {
            component.set("v.expid", expId);
        }
        helper.setBrandingCookie(component, event, helper);
    },
    
    onKeyUp: function(component, event, helpler){
        //checks for "enter" key
        if (event.getParam('keyCode')===13) {
            helpler.handleSelfRegister(component, event, helpler);
        }
    }   
})