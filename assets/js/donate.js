'use strict';

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Set stripe public key
var stripe = null;
var is_test = null;
var donate_page = null;
(function () {
    is_test = getParameterByName('test');
    if (is_test) {
        stripe = Stripe('pk_test_S3njVuxzS3zNbojaCmZRFKSA');
        donate_page = 'test-donate';
    } else {
        stripe = Stripe('pk_live_UZHjGZIYsR7hUn04uwAe5ofW');
        donate_page = 'donate';
    }
})();

function registerElements(elements, formName) {
    var formClass = '.' + formName;
    var donateForm = document.querySelector(formClass);

    var form = donateForm.querySelector('form');
    var error = form.querySelector('.error');
    var errorMessage = error.querySelector('.message');

    function enableInputs() {
        Array.prototype.forEach.call(
            form.querySelectorAll(
                "input[type='text'], input[type='email'], input[type='tel']"
            ),
            function (input) {
                input.removeAttribute('disabled');
            }
        );
    }

    function disableInputs() {
        Array.prototype.forEach.call(
            form.querySelectorAll(
                "input[type='text'], input[type='email'], input[type='tel']"
            ),
            function (input) {
                input.setAttribute('disabled', 'true');
            }
        );
    }

    // Listen for errors from each Element, and show error messages in the UI.
    var savedErrors = {};
    elements.forEach(function (element, idx) {
        element.on('change', function (event) {
            if (event.error) {
                error.classList.add('visible');
                savedErrors[idx] = event.error.message;
                errorMessage.innerText = event.error.message;
            } else {
                savedErrors[idx] = null;

                // Loop over the saved errors and find the first one, if any.
                var nextError = Object.keys(savedErrors)
                    .sort()
                    .reduce(function (maybeFoundError, key) {
                        return maybeFoundError || savedErrors[key];
                    }, null);

                if (nextError) {
                    // Now that they've fixed the current error, show another one.
                    errorMessage.innerText = nextError;
                } else {
                    // The user fixed the last error; no more errors.
                    error.classList.remove('visible');
                }
            }
        });
    });

    // Listen on the form's 'submit' handler...
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Show a loading screen...
        donateForm.classList.add('submitting');

        // Disable all inputs.
        disableInputs();

        // Gather additional customer data we may have collected in our form.
        var name = form.querySelector('#' + formName + '-name');
        var email = form.querySelector('#' + formName + '-email');
        var message = form.querySelector('#' + formName + '-message');
        var amount = form.querySelector('#' + formName + '-amount');
        var donation_type = $('input[name=donation-type]:checked', form).val();

        name = name ? name.value : undefined;
        email = email ? email.value : undefined;
        message = message ? message.value : undefined;
        amount = amount ? amount.value : undefined;

        var additionalData = {
            name: name,
            email: email,
        };

        var error = $('.error')[0];
        error.classList.remove('visible');

        // Use Stripe.js to create a token. We only need to pass in one Element
        // from the Element group in order to create a token. We can also pass
        // in the additional customer data we collected in our form.
        stripe.createToken(elements[0], additionalData).then(function (result) {


            if (result.error) {
                donateForm.classList.remove('submitting');
                error.classList.add('visible');
                errorMessage.innerText = result.error.message;
                enableInputs();
            }
            else if (result.token) {
                var endpoint;
                if (window.location.href.indexOf('ngrok.io') > -1) {
                    // We use ngrok for local https: `ngrok http -bind-tls=true localhost:63342`
                    endpoint = 'https://a978232f.ngrok.io/'
                }
                else {
                    endpoint = 'https://deepdrive-io.appspot.com/'
                }
                endpoint += donate_page;

                // Send token to backend
                $.post(endpoint, {
                    card_token: result.token.id,
                    amount: amount,
                    message: message,
                    email: email,
                    name: name,
                    donation_type: donation_type,
                }, function (data) {
                    if (data.error) {
                        donateForm.classList.remove('submitting');
                        error.classList.add('visible');
                        errorMessage.innerText = data.error;
                        enableInputs();
                    }
                    else {
                        // donateForm.querySelector('.token').innerText = result.token.id;
                        donateForm.classList.add('submitted');
                    }
                }, "json");
            } else {
                // Otherwise, un-disable inputs.
                enableInputs();
            }
        });
    });
}
