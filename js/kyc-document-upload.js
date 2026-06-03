(function () {
    'use strict';

    if (!window.INITS) {
        window.INITS = {};
    }

    INITS['document-upload'] = function () {
        console.log('DOCUMENT INIT');
        var root = document.getElementById('screen-document-upload');
        if (!root || root.dataset.inited) return;

        root.dataset.inited = '1';


        var dropdown = root.querySelector('#doc-upload-dropdown');
        var menu = root.querySelector('#doc-upload-menu');
        var value = root.querySelector('#doc-upload-value');

        if (dropdown && menu && value) {

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

            document.addEventListener('click', function () {
                menu.classList.remove('dropdown-menu--open');
            });
        }

        var fileInput = root.querySelector('#document-file');
        var dropzone = root.querySelector('#document-dropzone');
        var preview = root.querySelector('#document-preview');
        var previewImage = root.querySelector('#document-preview-image');
        var placeholder = root.querySelector('#document-placeholder');
        var successRow = root.querySelector('#document-success-row');
        var fileName = root.querySelector('#document-file-name');
        var reuploadBtn = root.querySelector('#document-reupload-btn');
        var consent = root.querySelector('#document-consent');
        var consent1 = root.querySelector('#document-c1');
        var consent2 = root.querySelector('#document-c2');
        var submitBtn = root.querySelector('#document-upload-submit');

        if (dropzone && fileInput) {

            dropzone.addEventListener('click', function () {
                fileInput.click();
            });

            var consent = root.querySelector('#document-consent');

            fileInput.addEventListener('change', function () {

                if (!fileInput.files.length) return;

                var file = fileInput.files[0];

                fileName.textContent = file.name;

                successRow.hidden = false;

                console.log('consent element', consent);

                if (consent) {
                    consent.hidden = false;
                    consent.style.display = 'block';

                    if (consent1) consent1.checked = false;
                    if (consent2) consent2.checked = false;

                    updateSubmitButton();
                }

                if (file.type.indexOf('image/') === 0) {

                    var reader = new FileReader();

                    reader.onload = function (e) {
                        previewImage.src = e.target.result;
                        preview.hidden = false;
                        placeholder.hidden = true;
                    };

                    reader.readAsDataURL(file);
                }
            });

            reuploadBtn.addEventListener('click', function () {
                fileInput.value = '';

                preview.hidden = true;
                placeholder.hidden = false;
                successRow.hidden = true;

                fileInput.click();
            });
        }

        function updateSubmitButton() {
            if (!submitBtn || !consent1 || !consent2) return;

            submitBtn.disabled = !(consent1.checked && consent2.checked);
            submitBtn.addEventListener('click', function () {
                goto('document-verifying');
            });
        }
        if (consent1) {
            consent1.addEventListener('change', updateSubmitButton);
        }

        if (consent2) {
            consent2.addEventListener('change', updateSubmitButton);
        }
    };

    INITS['document-verifying'] = function () {

        var root = document.getElementById('screen-document-verifying');
        if (!root) return;

        var fill = root.querySelector('#document-verify-progress-fill');
        var percent = root.querySelector('#document-verify-percent');

        var progress = 50;

        fill.style.width = progress + '%';
        percent.textContent = progress + '%';

        var timer = setInterval(function () {

            progress += 10;

            fill.style.width = progress + '%';
            percent.textContent = progress + '%';

            if (progress >= 100) {

                clearInterval(timer);

                setTimeout(function () {
                    goto('document-review-submit');
                }, 500);
            }

        }, 400);
    };

    INITS['document-review-submit'] = function () {

        var root = document.querySelector(
            '#screen-document-review-submit'
        );

        if (!root) return;

        var submitBtn = root.querySelector(
            '#document-confirm-submit-btn'
        );

        var checkboxes = root.querySelectorAll(
            '.document-review-consent-checkbox'
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
                .querySelector('#screen-document-review-submit')
                .hidden = true;

            document
                .querySelector('#screen-aadhaar-done')
                .hidden = false;

            if (window.lucide) {
                window.lucide.createIcons();
            }

        });

        validateConsents();
    };
})();