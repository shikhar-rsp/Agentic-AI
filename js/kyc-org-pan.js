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

        var failureActions = root.querySelector(
            '#org-gst-failure-actions'
        );

        var retryBtn = root.querySelector(
            '#org-gst-retry-btn'
        );

        var gstDocBtn = root.querySelector(
            '#org-gst-doc-btn'
        );

        var successToast = root.querySelector(
            '#org-poi-success-toast'
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

        function isGSTVerified() {

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

                var gstValue =
                    gstInput.value.trim();

                var hasFormatError =
                    gstValue.length === 15 &&
                    !gstValid;

                var isVerifiedGST =
                    gstValue === '22AAAAA0000A1Z5';

                var verificationFailed =
                    gstValue.length === 15 &&
                    gstValid &&
                    !isVerifiedGST;

                gstField.classList.remove(
                    'is-valid',
                    'is-error',
                    'is-verification-failed'
                );

                // verified GST
                if (isVerifiedGST) {

                    gstField.classList.add(
                        'is-valid'
                    );
                }
                // invalid GST format
                else if (hasFormatError) {

                    gstField.classList.add(
                        'is-error'
                    );
                }
                // GST verification failed
                else if (verificationFailed) {

                    gstField.classList.add(
                        'is-error'
                    );

                    gstField.classList.add(
                        'is-verification-failed'
                    );
                }

                // error label handling
                var errorLabel = gstField.querySelector(
                    '.form-error'
                );

                if (errorLabel) {

                    errorLabel.style.display =
                        hasFormatError
                            ? 'block'
                            : 'none';
                }
            }

            if (errorToast) {

                var showVerificationError =
                    gstInput.value.trim().length === 15 &&
                    gstValid &&
                    !isGSTVerified();

                errorToast.hidden =
                    !showVerificationError;
            }

            if (successToast) {

                successToast.hidden =
                    verificationFailed;
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

            if (failureActions) {

                failureActions.hidden =
                    !verificationFailed;
            }

            if (retryBtn) {

                retryBtn.addEventListener(
                    'click',
                    function () {

                        gstInput.focus();
                    }
                );
            }

            if (gstDocBtn) {

                gstDocBtn.addEventListener(
                    'click',
                    function () {

                        goto('org-pan-gst-doc');
                    }
                );
            }

            if (submit) {

                if (verificationFailed) {

                    submit.style.display = 'none';

                } else {

                    submit.style.display = '';
                }

                submit.disabled = !(
                    gstValid &&
                    securityValid &&
                    isVerifiedGST
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

    INITS['org-pan-gst-doc'] = function () {

        var root = document.getElementById(
            'screen-org-pan-gst-doc'
        );

        if (!root || root.dataset.inited) {
            return;
        }

        root.dataset.inited = '1';

        var gstInput = root.querySelector(
            '#org-gst-doc-num'
        );

        var expiryInput = root.querySelector(
            '#org-gst-doc-expiry'
        );

        var security = root.querySelector(
            '#org-gst-doc-sec'
        );

        var fileInput = root.querySelector(
            '#org-gst-doc-file'
        );

        var dropzone = root.querySelector(
            '#org-gst-doc-dropzone'
        );

        var preview = root.querySelector(
            '#org-gst-doc-preview'
        );

        var previewImage = root.querySelector(
            '#org-gst-doc-preview-image'
        );

        var placeholder = root.querySelector(
            '#org-gst-doc-placeholder'
        );

        var successRow = root.querySelector(
            '#org-gst-doc-success-row'
        );

        var fileName = root.querySelector(
            '#org-gst-doc-file-name'
        );

        var reuploadBtn = root.querySelector(
            '#org-gst-doc-reupload-btn'
        );

        var submit = root.querySelector(
            '#org-gst-doc-submit'
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

        function hasUploadedFile() {

            return !!(
                fileInput &&
                fileInput.files &&
                fileInput.files.length
            );
        }

        function fieldOf(el) {

            return el
                ? el.closest('.form-field')
                : null;
        }

        function validate() {

            var gstValid = isGSTValid();

            var securityValid =
                isSecurityValid();

            // GST validation
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

            // Security validation
            var securityField = fieldOf(
                security
            );

            if (securityField) {

                var securityHasError =
                    security.value.trim().length > 0 &&
                    !securityValid;

                securityField.classList.remove(
                    'is-valid',
                    'is-error'
                );

                if (securityValid) {

                    securityField.classList.add(
                        'is-valid'
                    );

                } else if (securityHasError) {

                    securityField.classList.add(
                        'is-error'
                    );
                }
            }

            // Submit button
            if (submit) {

                submit.disabled = !(
                    gstValid &&
                    securityValid &&
                    hasUploadedFile()
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

        // Expiry input
        if (expiryInput) {

            expiryInput.addEventListener(
                'input',
                function () {

                    var value =
                        expiryInput.value
                            .replace(/\D/g, '')
                            .slice(0, 8);

                    if (value.length > 4) {

                        value =
                            value.slice(0, 2) +
                            '/' +
                            value.slice(2, 4) +
                            '/' +
                            value.slice(4);

                    } else if (
                        value.length > 2
                    ) {

                        value =
                            value.slice(0, 2) +
                            '/' +
                            value.slice(2);
                    }

                    expiryInput.value = value;
                }
            );
        }

        // Upload click
        if (dropzone) {

            dropzone.addEventListener(
                'click',
                function () {

                    fileInput.click();
                }
            );
        }

        // File select
        if (fileInput) {

            fileInput.addEventListener(
                'change',
                function () {

                    if (
                        fileInput.files &&
                        fileInput.files.length
                    ) {

                        handleFile(
                            fileInput.files[0]
                        );
                    }
                }
            );
        }

        // Drag over
        if (dropzone) {

            dropzone.addEventListener(
                'dragover',
                function (e) {

                    e.preventDefault();

                    dropzone.classList.add(
                        'atlas-drag-drop--is-dragging'
                    );
                }
            );

            dropzone.addEventListener(
                'dragleave',
                function () {

                    dropzone.classList.remove(
                        'atlas-drag-drop--is-dragging'
                    );
                }
            );

            dropzone.addEventListener(
                'drop',
                function (e) {

                    e.preventDefault();

                    dropzone.classList.remove(
                        'atlas-drag-drop--is-dragging'
                    );

                    var file =
                        e.dataTransfer.files[0];

                    handleFile(file);
                }
            );
        }

        function handleFile(file) {

            if (!file) return;

            fileName.textContent =
                file.name;

            successRow.hidden = false;

            placeholder.style.display =
                'none';

            preview.style.display =
                'flex';

            if (
                file.type.startsWith(
                    'image/'
                )
            ) {

                var reader =
                    new FileReader();

                reader.onload =
                    function (e) {

                        previewImage.src =
                            e.target.result;
                    };

                reader.readAsDataURL(file);
            }

            validate();
        }

        // Reupload
        if (reuploadBtn) {

            reuploadBtn.addEventListener(
                'click',
                function () {

                    fileInput.value = '';

                    fileInput.click();
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
