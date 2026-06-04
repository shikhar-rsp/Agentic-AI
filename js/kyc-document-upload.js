(function () {
    'use strict';

    if (!window.INITS) {
        window.INITS = {};
    }

    INITS['document-upload'] = function () {
        var root = document.getElementById('screen-document-upload');
        if (!root || root.dataset.inited) return;

        root.dataset.inited = '1';


        var dropdown = root.querySelector('#doc-upload-dropdown');
        var menu = root.querySelector('#doc-upload-menu');
        var value = root.querySelector('#doc-upload-value');
        var uploadContainer = root.querySelector('#document-upload-container');
        var uploadLabel = root.querySelector('#document-upload-label');
        var selectedDoc = '';

        console.log('DOCUMENT INIT');
        console.log('uploadContainer', uploadContainer);
        console.log('uploadLabel', uploadLabel);

        if (uploadContainer) {
            uploadContainer.classList.remove('is-visible');
        }

        if (dropdown && menu && value) {

            menu.querySelectorAll('.dropdown-menu-item')
                .forEach(function (item) {
                    item.addEventListener('click', function () {
                        console.log('Dropdown clicked');
                        console.log('Selected:', item.dataset.value);

                        console.log('Before:', uploadContainer.classList.contains('is-visible'));

                        if (uploadContainer) {
                            uploadContainer.classList.add('is-visible');
                        }

                        console.log('After:', uploadContainer.hidden);
                        console.log('Element:', uploadContainer);

                        selectedDoc = item.dataset.value;

                        value.textContent = selectedDoc;

                        value.classList.remove('dropdown-input-placeholder');
                        value.classList.add('dropdown-input-value');

                        menu.classList.remove('dropdown-menu--open');

                        // Show upload section after selection
                        if (uploadContainer) {
                            uploadContainer.hidden = false;
                        }

                        // Update document label
                        if (uploadLabel) {
                            uploadLabel.textContent = selectedDoc + ' Document';
                        }

                        // Reset previous upload state when changing document type
                        // Reset upload state
                        if (typeof fileInput !== 'undefined' && fileInput) {
                            fileInput.value = '';
                        }

                        if (preview) {
                            preview.hidden = true;
                        }

                        if (placeholder) {
                            placeholder.hidden = false;
                        }

                        if (successRow) {
                            successRow.hidden = true;
                        }

                        if (consent) {
                            consent.hidden = true;
                        }
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
        var consent = root.querySelector('#document-upload-consent');
        var consent1 = root.querySelector('#document-upload-c1');
        var consent2 = root.querySelector('#document-upload-c2');
        var submitBtn = root.querySelector('#document-upload-submit');

        function showDocumentError(type) {
            var modal = document.getElementById(
                'document-file-error-modal'
            );

            var title = document.getElementById(
                'document-upload-error-title'
            );

            var message = document.getElementById(
                'document-upload-error-message'
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
                    console.log('File size error');
                    title.textContent =
                        'File size too large';

                    message.textContent =
                        'Upload a document smaller than 2 MB to continue.';
                    break;
            }

            modal.classList.add('is-open');
            modal.removeAttribute('hidden');

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        var documentErrorModal = document.getElementById(
            'document-file-error-modal'
        );

        var documentErrorReupload =
            document.getElementById('document-upload-error-reupload');

        if (documentErrorReupload) {
            documentErrorReupload.addEventListener('click', function () {

                documentErrorModal.classList.remove('is-open');
                documentErrorModal.setAttribute('hidden', '');

                fileInput.value = '';
                fileInput.click();
            });
        }

        if (dropzone && fileInput) {

            dropzone.addEventListener('click', function () {
                fileInput.click();
            });

            var consent = root.querySelector('#document-upload-consent');

            fileInput.addEventListener('change', function () {

                if (!fileInput.files.length) return;

                var file = fileInput.files[0];

                // 2 MB limit
                if (file.size > 2 * 1024 * 1024) {
                    console.log('File too large');
                    showDocumentError('file-size');

                    fileInput.value = '';
                    return;
                }

                if (file.name.toLowerCase().indexOf('unreadable') !== -1) {
                    showDocumentError('unreadable');
                    fileInput.value = '';
                    return;
                }

                if (file.name.toLowerCase().indexOf('expired') !== -1) {
                    showDocumentError('expired');
                    fileInput.value = '';
                    return;
                }

                fileName.textContent = file.name;

                successRow.hidden = false;

                console.log('consent element', consent);

                if (consent) {

                    consent.removeAttribute('hidden');
                    consent.classList.add('is-visible');

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

            var reuploadModal = document.getElementById('document-reupload-modal');
            var confirmReupload = document.getElementById('confirm-document-reupload');

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
        }

        submitBtn.addEventListener('click', function () {
            console.log('Submit button clicked', selectedDoc);

            if (selectedDoc === 'Pan Card') {
                goto('doc-pan-address-proof');
            } else {
                goto('document-verifying');
            }
        });

        function updateSubmitButton() {
            if (!submitBtn || !consent1 || !consent2) return;

            submitBtn.disabled = !(consent1.checked && consent2.checked);

        }
        if (consent1) {
            consent1.addEventListener('change', updateSubmitButton);
        }

        if (consent2) {
            consent2.addEventListener('change', updateSubmitButton);
        }
    };

    INITS['doc-pan-address-proof'] = function () {
        var root = document.getElementById(
            'screen-doc-pan-address-proof'
        );

        if (!root || root.dataset.inited) return;

        root.dataset.inited = '1';

        var dropdown = root.querySelector('.dropdown-input-wrapper');
        var menu = root.querySelector('#document-address-type-menu');
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

        var fileInput = root.querySelector('#document-file');
        var dropzone = root.querySelector('#document-dropzone');
        var preview = root.querySelector('#document-preview');
        var previewImage = root.querySelector('#document-preview-image');
        var placeholder = root.querySelector('#document-placeholder');
        var successRow = root.querySelector('#document-success-row');
        var fileName = root.querySelector('#document-file-name');
        var reuploadBtn = root.querySelector('#document-reupload-btn');
        var consent = root.querySelector('#document-upload-consent');
        var consent1 = root.querySelector('#document-upload-c1');
        var consent2 = root.querySelector('#document-upload-c2');
        var submitBtn = root.querySelector('#document-address-upload-submit');

        function showDocumentError(type) {
            var modal = document.getElementById(
                'document-address-file-error-modal'
            );

            var title = document.getElementById(
                'document-address-upload-error-title'
            );

            var message = document.getElementById(
                'document-address-upload-error-message'
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
                    console.log('File size error');
                    title.textContent =
                        'File size too large';

                    message.textContent =
                        'Upload a document smaller than 2 MB to continue.';
                    break;
            }

            modal.classList.add('is-open');
            modal.removeAttribute('hidden');

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        var documentErrorModal = document.getElementById(
            'document-address-file-error-modal'
        );

        var documentErrorReupload =
            document.getElementById('document-address-upload-error-reupload');

        if (documentErrorReupload) {
            documentErrorReupload.addEventListener('click', function () {

                documentErrorModal.classList.remove('is-open');
                documentErrorModal.setAttribute('hidden', '');

                fileInput.value = '';
                fileInput.click();
            });
        }

        if (dropzone && fileInput) {

            dropzone.addEventListener('click', function () {
                fileInput.click();
            });

            var consent = root.querySelector('#document-upload-consent');

            fileInput.addEventListener('change', function () {

                if (!fileInput.files.length) return;

                var file = fileInput.files[0];

                // 2 MB limit
                if (file.size > 2 * 1024 * 1024) {
                    console.log('File too large');
                    showDocumentError('file-size');

                    fileInput.value = '';
                    return;
                }

                if (file.name.toLowerCase().indexOf('unreadable') !== -1) {
                    showDocumentError('unreadable');
                    fileInput.value = '';
                    return;
                }

                if (file.name.toLowerCase().indexOf('expired') !== -1) {
                    showDocumentError('expired');
                    fileInput.value = '';
                    return;
                }

                fileName.textContent = file.name;

                successRow.hidden = false;

                console.log('consent element', consent);

                if (consent) {

                    consent.removeAttribute('hidden');
                    consent.classList.add('is-visible');

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

            var reuploadModal = document.getElementById('document-address-reupload-modal');
            var confirmReupload = document.getElementById('confirm-document-address-reupload');

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
        }

        submitBtn.addEventListener('click', function () {
            goto('document-verifying');

        });

        function updateSubmitButton() {
            if (!submitBtn || !consent1 || !consent2) return;

            submitBtn.disabled = !(consent1.checked && consent2.checked);

        }
        if (consent1) {
            consent1.addEventListener('change', updateSubmitButton);
        }

        if (consent2) {
            consent2.addEventListener('change', updateSubmitButton);
        }

        var backBtn = root.querySelector(
            '#document-address-back-btn'
        );

        var leaveModal = document.getElementById(
            'document-address-leave-modal'
        );
        console.log('BACK BTN:', backBtn);
        console.log('LEAVE MODAL:', leaveModal);
        if (backBtn && leaveModal) {

            backBtn.addEventListener('click', function (e) {

                e.preventDefault();

                leaveModal.classList.add('is-open');

                leaveModal.removeAttribute('hidden');

                if (window.lucide) {
                    window.lucide.createIcons();
                }
            });
        }

        var goBackBtn = document.getElementById(
            'document-address-go-back-btn'
        );

        if (goBackBtn && leaveModal) {

            goBackBtn.addEventListener('click', function () {

                leaveModal.classList.remove('is-open');

                leaveModal.setAttribute('hidden', '');

                goto('document-upload');
            });
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

        var reviewReuploadBtn = root.querySelector(
            '#review-reupload-btn'
        );

        var reuploadModal = document.getElementById(
            'document-review-reupload-modal'
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

        if (reviewReuploadBtn && reuploadModal) {

            reviewReuploadBtn.addEventListener(
                'click',
                function () {

                    reuploadModal.querySelector(
                        '.modal-body'
                    ).textContent =
                        'Are you sure you want to re-upload the document? The existing file will be replaced with the new upload.';

                    reuploadModal.classList.add('is-open');
                    reuploadModal.removeAttribute('hidden');
                }
            );
        }

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