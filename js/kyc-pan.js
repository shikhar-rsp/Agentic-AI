(function () {
    'use strict';

    if (!window.INITS) {
        window.INITS = {};
    }

    INITS['pan'] = function () {
        var root = document.getElementById('screen-pan');
        if (!root || root.dataset.inited) return;
        root.dataset.inited = '1';

        var panInput = root.querySelector('#pan-num');
        var mobile = root.querySelector('#pan-mobile');
        var submit = root.querySelector('#pan-submit');

        var SECURITY_ANSWER = '14';

        var security = root.querySelector('#pan-sec');
        var consent1 = root.querySelector('#pan-c1');
        var consent2 = root.querySelector('#pan-c2');
        var card = root.querySelector('.pan-card');

        function isPanValid() {
            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
                (panInput.value || '').trim()
            );
        }

        function isMobileValid() {
            return /^\d{10}$/.test(
                (mobile.value || '').trim()
            );
        }

        function isSecurityValid() {
            return security &&
                (security.value || '').trim() === SECURITY_ANSWER;
        }

        function isConsented() {
            return consent1 &&
                consent2 &&
                consent1.checked &&
                consent2.checked;
        }

        function fieldOf(el) {
            return el ? el.closest('.form-field') : null;
        }

        function setValid(el, ok) {
            var field = fieldOf(el);
            if (field) {
                field.classList.toggle('is-valid', !!ok);
            }
        }

        function isMobileMatchingPan() {
            if (!isMobileValid() || !isPanValid()) {
                return true;
            }

            // Mock validation failure
            return mobile.value.trim() === '9876543210';
        }

        function validate() {
            console.log('validate called');
            var panValid = isPanValid();
            var mobileValid = isMobileValid();
            var securityValid = isSecurityValid();

            setValid(panInput, panValid);

            setValid(security, securityValid);



            var panField = fieldOf(panInput);

            if (panField) {
                var hasError =
                    panInput.value.trim().length == 10 &&
                    !panValid;

                panField.classList.remove('is-valid', 'is-error');

                if (panValid) {
                    panField.classList.add('is-valid');
                } else if (hasError) {
                    panField.classList.add('is-error');
                }
            }

            var mobileField = fieldOf(mobile);

            if (mobileField) {
                var hasMobileError =
                    mobile.value.trim().length === 10 &&
                    !isMobileMatchingPan();

                mobileField.classList.remove('is-valid', 'is-error');

                if (hasMobileError) {
                    mobileField.classList.add('is-error');
                } else if (mobile.value.trim() === '9876543210') {
                    mobileField.classList.add('is-valid');
                }
            }

            var mobileSuccess = root.querySelector('#pan-mobile-success');

            if (mobileSuccess) {
                mobileSuccess.style.display =
                    hasMobileError ? 'none' : '';
            }

            var mobileMatchesPan = isMobileMatchingPan();

            var extended =
                panValid &&
                mobileValid &&
                mobileMatchesPan;

            var securitySection = root.querySelector('#pan-security');
            var consentSection = root.querySelector('#pan-consent');

            if (securitySection) {
                securitySection.style.display = extended ? '' : 'none';
            }

            if (consentSection) {
                consentSection.style.display = extended ? '' : 'none';
            }

            if (card) {
                card.classList.toggle('is-extended', extended);
            }

            if (submit) {
                submit.disabled = !(
                    panValid &&
                    mobileValid &&
                    mobileMatchesPan &&
                    securityValid &&
                    isConsented()
                );
            }
        }

        if (panInput) {
            panInput.addEventListener('input', function () {
                console.log('PAN listener fired');

                panInput.value = panInput.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 10);

                validate();
            });
        }

        if (mobile) {
            mobile.addEventListener('input', function () {
                mobile.value = mobile.value
                    .replace(/\D/g, '')
                    .slice(0, 10);

                validate();
            });
        }

        if (security) {
            security.addEventListener('input', function () {
                security.value = security.value
                    .replace(/\D/g, '')
                    .slice(0, 3);

                validate();
            });
        }

        if (consent1) {
            consent1.addEventListener('change', validate);
        }

        if (consent2) {
            consent2.addEventListener('change', validate);
        }

        if (submit) {
            submit.addEventListener('click', function () {
                if (submit.disabled) return;

                console.log('PAN Verification', {
                    pan: panInput.value,
                    mobile: mobile.value
                });
                console.log('Navigating to pan-otp');

                // Navigate to next step
                window.show('pan-otp');
            });
        }

        validate();
    };

    INITS['pan-otp'] = function () {
        var root = document.getElementById('screen-pan-otp');
        if (!root || root.dataset.inited) return;
        root.dataset.inited = '1';

        var CORRECT_OTP   = '000000';
        var MAX_ATTEMPTS  = 3;
        var attemptsLeft  = MAX_ATTEMPTS;

        var boxes        = Array.from(root.querySelectorAll('.pan-otp__box'));
        var otpWrap      = root.querySelector('.pan-otp');
        var verifyBtn    = root.querySelector('#pan-verify');
        var resendBtn    = root.querySelector('#pan-resend');
        var otpError     = root.querySelector('#pan-otp-error');
        var attemptsSpan = root.querySelector('#pan-otp-attempts-left');

        function collectOtp() {
            return boxes.map(function (b) { return b.value; }).join('');
        }

        function updateButton() {
            if (verifyBtn) verifyBtn.disabled = collectOtp().length !== 6;
        }

        function clearError() {
            if (otpWrap)  otpWrap.classList.remove('is-error');
            if (otpError) otpError.hidden = true;
        }

        boxes.forEach(function (box, index) {
            box.addEventListener('input', function () {
                box.value = box.value.replace(/\D/g, '').slice(0, 1);
                clearError();
                if (box.value && boxes[index + 1]) {
                    setTimeout(function () { boxes[index + 1].focus(); }, 0);
                }
                updateButton();
            });

            box.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !box.value && boxes[index - 1]) {
                    boxes[index - 1].focus();
                }
            });
        });

        if (resendBtn) {
            resendBtn.addEventListener('click', function (e) {
                e.preventDefault();
                attemptsLeft = MAX_ATTEMPTS;
                boxes.forEach(function (b) { b.value = ''; });
                clearError();
                if (verifyBtn) verifyBtn.disabled = true;
                if (boxes[0]) boxes[0].focus();
            });
        }

        if (verifyBtn) {
            verifyBtn.addEventListener('click', function () {
                if (verifyBtn.disabled) return;

                var otp = collectOtp();

                if (otp === CORRECT_OTP) {
                    clearError();
                    window.ekyc.goto('pan-verifying');
                    return;
                }

                if (otpWrap) otpWrap.classList.add('is-error');
                attemptsLeft -= 1;

                if (attemptsLeft <= 0) {
                    clearError();
                    if (otpWrap) otpWrap.classList.remove('is-error');
                    window.ekyc.openModal('pan-otp-maxattempts-modal');
                    attemptsLeft = MAX_ATTEMPTS;
                } else {
                    if (attemptsSpan) attemptsSpan.textContent = attemptsLeft;
                    if (otpError)     otpError.hidden = false;
                }
            });
        }

        updateButton();
        if (boxes[0]) boxes[0].focus();
    };

    INITS['pan-address-proof'] = function () {
        var root = document.getElementById('screen-pan-address-proof');
        if (!root || root.dataset.inited) return;

        root.dataset.inited = '1';

        var dropdown = root.querySelector('.dropdown-input-wrapper');
        var menu = root.querySelector('#document-type-menu');
        var value =
            root.querySelector('.dropdown-input-value') ||
            root.querySelector('.dropdown-input-placeholder');

        if (!dropdown || !menu || !value) return;

        menu.querySelectorAll('.dropdown-menu-item')
            .forEach(function (item) {
                item.addEventListener('click', function () {

                    value.textContent = item.dataset.value;

                    value.classList.remove('dropdown-input-placeholder');
                    value.classList.add('dropdown-input-value');

                    menu.classList.remove('dropdown-menu--open');
                });
            });

        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();

            var rect = dropdown.getBoundingClientRect();

            menu.style.left = rect.left + 'px';
            menu.style.top = (rect.bottom + 4) + 'px';
            menu.style.width = rect.width + 'px';

            menu.classList.toggle('dropdown-menu--open');
        });


        var fileInput = root.querySelector('#address-proof-file');
        var dropzone = root.querySelector('#address-proof-dropzone');

        var successRow = root.querySelector('#upload-success-row');
        var fileName = root.querySelector('#upload-file-name');
        var reuploadBtn = root.querySelector('#reupload-btn');

        var proceedBtn = root.querySelector('.pan-submit');

        var preview = root.querySelector('#upload-preview');
        var previewImage = root.querySelector('#upload-preview-image');
        var placeholder = root.querySelector('#upload-placeholder');


        function handleFile(file) {
            if (!file) return;
            // File size > 10MB
            if (file.size > 10 * 1024 * 1024) {
                window.ekyc.openModal('file-size-modal');
                return;
            }

            // Demo: unreadable file
            if (file.name.toLowerCase().includes('blur')) {
                showDocumentError('unreadable');
                return;
            }

            // Demo: expired document
            if (file.name.toLowerCase().includes('expired')) {
                showDocumentError('expired');
                return;
            }

            fileName.textContent =
                file.name + ' uploaded successfully';

            successRow.hidden = false;

            placeholder.style.display = 'none';
            preview.style.display = 'flex';

            if (proceedBtn) {
                proceedBtn.disabled = false;
                proceedBtn.addEventListener('click', function () {
                    if (proceedBtn.disabled) return;

                    goto('document-scanning');
                });
            }

            if (file.type.startsWith('image/')) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                };

                reader.readAsDataURL(file);
            }
        }

        function showDocumentError(type) {
            var modal = document.getElementById(
                'document-error-modal'
            );

            var title = document.getElementById(
                'document-error-title'
            );

            var message = document.getElementById(
                'document-error-message'
            );

            switch (type) {
                case 'unreadable':
                    title.textContent =
                        "We couldn't read your document";

                    message.textContent =
                        'Your file is a bit unclear. Please upload a clearer image or PDF.';
                    break;

                case 'expired':
                    title.textContent =
                        'Expired Document';

                    message.textContent =
                        'The document you uploaded is no longer valid. Please upload a current, unexpired ID to continue.';
                    break;

                case 'file-size':
                    title.textContent =
                        'File size too large';

                    message.textContent =
                        'Upload a document smaller than 10 MB to continue.';
                    break;
            }

            modal.classList.add('is-open');
            modal.removeAttribute('hidden');

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        var documentErrorModal =
            document.getElementById('document-error-modal');

        var documentErrorReupload =
            document.getElementById('document-error-reupload');

        if (documentErrorReupload) {
            documentErrorReupload.addEventListener(
                'click',
                function () {

                    documentErrorModal.classList.remove('is-open');
                    documentErrorModal.setAttribute('hidden', '');

                    fileInput.value = '';
                    fileInput.click();
                }
            );
        }

        dropzone.addEventListener('click', function () {
            fileInput.click();
        });

        fileInput.addEventListener('change', function () {
            if (fileInput.files.length) {
                handleFile(fileInput.files[0]);
            }
        });

        dropzone.addEventListener('dragover', function (e) {
            e.preventDefault();

            dropzone.classList.add(
                'atlas-drag-drop--is-dragging'
            );
        });

        dropzone.addEventListener('dragleave', function () {
            dropzone.classList.remove(
                'atlas-drag-drop--is-dragging'
            );
        });

        dropzone.addEventListener('drop', function (e) {
            e.preventDefault();

            dropzone.classList.remove(
                'atlas-drag-drop--is-dragging'
            );

            var file = e.dataTransfer.files[0];

            handleFile(file);
        });

        var reuploadModal =
            document.getElementById('reupload-modal');

        var confirmReupload =
            document.getElementById('confirm-reupload');

        reuploadBtn.addEventListener('click', function () {

            var uploadedFileName =
                fileName.textContent.replace(
                    ' uploaded successfully',
                    ''
                );

            reuploadModal.querySelector('.modal-body').textContent =
                'Are you sure you want to re-upload the ' +
                uploadedFileName +
                '? The existing file will be replaced with the new upload.';

            reuploadModal.classList.add('is-open');
            reuploadModal.removeAttribute('hidden');
        });

        confirmReupload.addEventListener('click', function () {

            reuploadModal.classList.remove('is-open');
            reuploadModal.setAttribute('hidden', '');

            fileInput.value = '';

            placeholder.style.display = 'flex';
            preview.style.display = 'none';

            previewImage.src = '';

            fileInput.click();
        });
    };

    INITS['pan-done'] = function () {
        // nothing required for now
    };

    INITS['review-submit'] = function () {
        var root = document.querySelector(
            '#screen-review-submit'
        );

        if (!root) return;

        var submitBtn = root.querySelector(
            '#confirm-submit-btn'
        );

        var checkboxes = root.querySelectorAll(
            '.review-consent-checkbox'
        );

        function validateConsents() {
            var allChecked = true;

            Array.prototype.forEach.call(
                checkboxes,
                function (checkbox) {
                    if (!checkbox.checked) {
                        allChecked = false;
                    }
                }
            );

            submitBtn.disabled = !allChecked;
        }

        Array.prototype.forEach.call(
            checkboxes,
            function (checkbox) {
                checkbox.addEventListener(
                    'change',
                    validateConsents
                );
            }
        );

        submitBtn.addEventListener('click', function () {
            if (submitBtn.disabled) return;

            document
                .querySelector('#screen-review-submit')
                .hidden = true;

            document
                .querySelector('#screen-pan-done')
                .hidden = false;

            if (window.lucide) {
                window.lucide.createIcons();
            }
        });

        validateConsents();
    };
})();