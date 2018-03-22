(function () {
    'use strict';

    var elements = stripe.elements({
        fonts: [
            {
                cssSrc: 'https://fonts.googleapis.com/css?family=Source+Code+Pro',
            },
        ],
        // Stripe's examples are localized to specific languages, but if
        // you wish to have Elements automatically detect your user's locale,
        // use `locale: 'auto'` instead.
        locale: window.__exampleLocale
    });

    // Floating labels
    var inputs = document.querySelectorAll('.cell.donate-form.donate-form2 .input');
    Array.prototype.forEach.call(inputs, function (input) {
        input.addEventListener('focus', function () {
            input.classList.add('focused');
        });
        input.addEventListener('blur', function () {
            input.classList.remove('focused');
        });
        input.addEventListener('keyup', function () {
            if (input.value.length === 0) {
                input.classList.add('empty');
            } else {
                input.classList.remove('empty');
            }
        });
    });


    /**
     * Card Element
     */
    var card = elements.create("card", {
        style: {
            base: {
                color: "#444",
                fontWeight: 500,
                fontFamily: "Inter UI, Open Sans, Segoe UI, sans-serif",
                fontSize: "19px",
                fontSmoothing: "antialiased",

                "::placeholder": {
                    color: "#aaa"
                }
            },
            invalid: {
                color: "#E25950"
            }
        }
    });
    card.mount("#donate-card");

    registerElements([card], 'donate-form');
})();

// One-time / recurring highlighting
(function () {
    'use strict';

    var options = $('.donate-option');

    options.click(function(event){
        console.log(event.target.tagName);
        if(event.target.tagName.toLowerCase() !== "label") {
            options.removeClass('donate-type-selected');
            $(this).addClass('donate-type-selected');
            $(this).find('input').prop('checked', true);
        }
    });

    options[0].click();
})();