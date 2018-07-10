document.addEventListener('DOMContentLoaded', function () {
    initDelete();
    initDisableButtonsOnSubmit();
    initBack();
    initToggle();
    initTime();
});

document.addEventListener('turbolinks:load', function() {
    initDelete();
    initDisableButtonsOnSubmit();
    initBack();
    initToggle();
    initTime();

    setTimeout(function () {
        var elements = document.querySelectorAll('.js-scroll-into-view');
        for (var i in elements) {
            var element = elements[i];
            if (element && element.scrollIntoView)
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 1);
});

function initTime() {
    if (window.timeago)
        window.timeago().render(document.querySelectorAll('.time-ago'));

    var dateElements = document.querySelectorAll(".date-time");
    dateElements.forEach(function(elem){
        var date = new Date(elem.dateTime);
        elem.innerHTML = date.toLocaleDateString() +", " + date.toLocaleTimeString().substr(0,5)+" Uhr";
    });
}

function initDelete() {
    var elements = document.getElementsByClassName('js-delete');

    function handleClick(event) {
        event.preventDefault();

        if (!event.currentTarget.classList.contains('js-delete-no-confirm')) {
            if (!confirm('Are you sure you want to delete this?')) {
                return;
            }
        }

        var form = document.createElement('form');
        form.action = event.currentTarget.href;
        form.method = 'POST';

        var methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'DELETE';

        form.appendChild(methodInput);

        document.body.appendChild(form);
        submitForm(form);
    }

    for (var i in elements) {
        var element = elements[i];
        if (element instanceof HTMLAnchorElement) {
            element.addEventListener('click', handleClick);
        }
    }
}

function initBack() {
    var elements = document.getElementsByClassName('js-back');

    function handleClick(event) {
        event.preventDefault();
        event.target.setAttribute('disabled', 'disabled');
        event.target.classList.add('disabled');

        window.history.back();
    }

    for (var i in elements) {
        var element = elements[i];
        if (element instanceof HTMLButtonElement) {
            element.addEventListener('click', handleClick);
        } else if (element instanceof HTMLAnchorElement) {
            console.error('js-back does not supports <a> elements, use a <button> instead', element);
        }
    }
}

function initDisableButtonsOnSubmit() {
    if (window.initDisableButtonsOnSubmitRun) {
        return;
    }
    window.initDisableButtonsOnSubmitRun = true;

    document.addEventListener('submit', function (event) {
        event.preventDefault();

        var form = event.target;
        submitForm(form);
    });
}

function submitForm(form) {
    var request = new XMLHttpRequest();
    request.onload = function () {
        var snapshot = Turbolinks.Snapshot.wrap(request.response);
        Turbolinks.controller.cache.put(request.responseURL, snapshot);
        Turbolinks.visit(request.responseURL, { action: 'restore' });
        Turbolinks.clearCache();
    };
    request.open(form.method, form.action, true);
    console.log(event);

    var submit = document.activeElement;
    var formData = new FormData(form);

    if (submit instanceof HTMLInputElement || (submit instanceof HTMLButtonElement && submit.getAttribute('type') == 'submit')) {
        formData.set(submit.getAttribute('name'), submit.getAttribute('value'));
    }

    var parameters = []
    for (var pair of formData.entries()) {
        parameters.push(
            encodeURIComponent(pair[0]) + '=' +
            encodeURIComponent(pair[1])
        );
    }

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(parameters.join('&'));

    var buttons = form.getElementsByTagName('button');
    for (var j in buttons) {
        var button = buttons[j];
        if (button instanceof HTMLButtonElement) {
            // We cannot disable the button right now, as then it's value
            // is not sent to the server
            // See https://sarbbottam.github.io/blog/2015/08/21/multiple-submit-buttons-and-javascript
            setTimeout(function () { this.setAttribute('disabled', 'disabled'); }.bind(button), 0);
        }
    }

    var alerts = form.getElementsByClassName('alert');
    for (var j in alerts) {
        var alert = alerts[j];
        if (alert instanceof HTMLDivElement) {
            alert.classList.add('dismiss');
        }
    }
}

function initToggle() {
    var elements = document.querySelectorAll('[data-toggle]');

    function handler () {
        var elements = document.querySelectorAll(this.getAttribute('data-toggle'));
        for (var i in elements) {
            var element = elements[i];
            if (!(element instanceof HTMLElement)) {
                return;
            }

            if (!this.checked) {
                element.setAttribute('disabled', 'disabled');
            } else {
                element.removeAttribute('disabled');
            }
         }

    };

    for (var i in elements) {
        var element = elements[i];
        if (!(element instanceof HTMLInputElement)) {
            continue;
        }

        element.addEventListener('change', handler);
        handler.call(element);
    }
}
