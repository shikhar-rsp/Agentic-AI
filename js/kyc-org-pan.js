(function () {
    'use strict';

    if (!window.INITS) {
        window.INITS = {};
    }

    console.log('ORG PAN JS FILE LOADED');

    INITS['org-pan'] = function () {


        var root = document.getElementById(
            'screen-org-pan'
        );




        if (!root || root.dataset.inited) return;

        root.dataset.inited = '1';

        console.log('ORG PAN INIT');

        var panInput = root.querySelector(
            '#org-pan-num'
        );

        console.log(panInput);

        var security = root.querySelector(
            '#org-pan-sec'
        );

        var submit = root.querySelector(
            '#org-pan-submit'
        );

        var consent1 = root.querySelector(
            '#org-pan-c1'
        );

        var consent2 = root.querySelector(
            '#org-pan-c2'
        );

        var SECURITY_ANSWER = '14';

        function isPanValid() {

            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                (panInput.value || '').trim()
            );
        }

        function isSecurityValid() {

            return security &&
                (security.value || '').trim() ===
                SECURITY_ANSWER;
        }

        function isConsented() {

            return consent1 &&
                consent2 &&
                consent1.checked &&
                consent2.checked;
        }

        function fieldOf(el) {

            return el
                ? el.closest('.form-field')
                : null;
        }

        function validate() {

            var panValid = isPanValid();

            var securityValid =
                isSecurityValid();

            // PAN field state
            var panField = fieldOf(panInput);

            if (panField) {

                var hasError =
                    panInput.value.trim().length === 10 &&
                    !panValid;

                panField.classList.remove(
                    'is-valid',
                    'is-error'
                );

                if (panValid) {

                    panField.classList.add(
                        'is-valid'
                    );

                } else if (hasError) {

                    panField.classList.add(
                        'is-error'
                    );
                }
            }

            // security validation
            var securityField = fieldOf(
                security
            );

            if (securityField && security) {

                securityField.classList.remove(
                    'is-valid',
                    'is-error'
                );

                if (
                    security.value.trim().length
                ) {

                    if (securityValid) {

                        securityField.classList.add(
                            'is-valid'
                        );

                    } else {

                        securityField.classList.add(
                            'is-error'
                        );
                    }
                }
            }

            // submit state
            if (submit) {

                submit.disabled = !(
                    panValid &&
                    securityValid &&
                    isConsented()
                );
            }
        }

        // PAN input
        if (panInput) {

            panInput.addEventListener(
                'input',
                function () {

                    panInput.value =
                        panInput.value
                            .toUpperCase()
                            .replace(
                                /[^A-Z0-9]/g,
                                ''
                            )
                            .slice(0, 10);

                    validate();
                }
            );
        }

        // security input
        if (security) {

            security.addEventListener(
                'input',
                function () {

                    security.value =
                        security.value
                            .replace(/\D/g, '')
                            .slice(0, 3);

                    validate();
                }
            );
        }

        if (consent1) {
            consent1.addEventListener(
                'change',
                validate
            );
        }

        if (consent2) {
            consent2.addEventListener(
                'change',
                validate
            );
        }

        // submit
        if (submit) {

            submit.addEventListener(
                'click',
                function () {

                    if (submit.disabled) {
                        return;
                    }

                    goto('pan-verifying');
                }
            );
        }

        validate();
    };

    INITS['org-pan-address'] = function () {

        var root = document.getElementById(
            'screen-org-pan-address'
        );

        if (!root || root.dataset.inited) {
            return;
        }

        root.dataset.inited = '1';

        var gstInput = root.querySelector(
            '#org-gst-num'
        );

        var security = root.querySelector(
            '#org-pan-sec'
        );

        var submit = root.querySelector(
            '#org-gst-submit'
        );

        var errorToast = root.querySelector(
            '#org-gst-error-toast'
        );

        var SECURITY_ANSWER = '14';

        function isGSTValid() {

            return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                (gstInput.value || '').trim()
            );
        }

        function isSecurityValid() {

            return security &&
                (security.value || '').trim() ===
                SECURITY_ANSWER;
        }

        function fieldOf(el) {

            return el
                ? el.closest('.form-field')
                : null;
        }

        function isSampleFailureGST() {

            return (
                gstInput.value.trim() ===
                '22AAAAA0000A1Z5'
            );
        }

        function validate() {

            var gstValid = isGSTValid();

            var securityValid =
                isSecurityValid();

            // GST field validation
            var gstField = fieldOf(
                gstInput
            );

            if (gstField) {

                var hasError =
                    gstInput.value.trim().length === 15 &&
                    !gstValid;

                gstField.classList.remove(
                    'is-valid',
                    'is-error'
                );

                if (gstValid) {

                    gstField.classList.add(
                        'is-valid'
                    );

                } else if (hasError) {

                    gstField.classList.add(
                        'is-error'
                    );
                }
            }

            if (errorToast) {

                if (
                    gstValid &&
                    isSampleFailureGST()
                ) {

                    errorToast.hidden = false;

                } else {

                    errorToast.hidden = true;
                }
            }

            // Security validation
            var securityField = fieldOf(
                security
            );

            if (securityField && security) {

                securityField.classList.remove(
                    'is-valid',
                    'is-error'
                );

                if (
                    security.value.trim().length
                ) {

                    if (securityValid) {

                        securityField.classList.add(
                            'is-valid'
                        );

                    } else {

                        securityField.classList.add(
                            'is-error'
                        );
                    }
                }
            }

            // Submit button
            if (submit) {

                submit.disabled = !(
                    gstValid &&
                    securityValid
                );
            }
        }

        // GST input
        if (gstInput) {

            gstInput.addEventListener(
                'input',
                function () {

                    gstInput.value =
                        gstInput.value
                            .toUpperCase()
                            .replace(
                                /[^A-Z0-9]/g,
                                ''
                            )
                            .slice(0, 15);

                    validate();
                }
            );
        }

        // Security input
        if (security) {

            security.addEventListener(
                'input',
                function () {

                    security.value =
                        security.value
                            .replace(/\D/g, '')
                            .slice(0, 3);

                    validate();
                }
            );
        }

        // Submit
        if (submit) {

            submit.addEventListener(
                'click',
                function () {

                    if (submit.disabled) {
                        return;
                    }

                    goto('document-scanning');
                }
            );
        }

        validate();
    };
})();
