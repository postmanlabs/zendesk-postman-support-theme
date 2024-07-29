// Vanilla JS debounce function, by Josh W. Comeau:
// https://www.joshwcomeau.com/snippets/javascript/debounce/
function debounce(callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

// Define variables for search field
let searchFormFilledClassName = 'search-has-value';
let searchFormSelector = "form[role='search']";

// Clear the search input, and then return focus to it
function clearSearchInput(event) {
  event.target.closest(searchFormSelector).classList.remove(searchFormFilledClassName);

  let input;
  if (event.target.tagName === 'INPUT') {
    input = event.target;
  } else if (event.target.tagName === 'BUTTON') {
    input = event.target.previousElementSibling;
  } else {
    input = event.target.closest('button').previousElementSibling;
  }
  input.value = '';
  input.focus();
}

// Have the search input and clear button respond
// when someone presses the escape key, per:
// https://twitter.com/adambsilver/status/1152452833234554880
function clearSearchInputOnKeypress(event) {
  const searchInputDeleteKeys = ['Delete', 'Escape'];
  if (searchInputDeleteKeys.includes(event.key)) {
    clearSearchInput(event);
  }
}

// Create an HTML button that all users -- especially keyboard users --
// can interact with, to clear the search input.
// To learn more about this, see:
// https://adrianroselli.com/2019/07/ignore-typesearch.html#Delete
// https://www.scottohara.me/blog/2022/02/19/custom-clear-buttons.html
function buildClearSearchButton(inputId) {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('aria-controls', inputId);
  button.classList.add('clear-button');
  const buttonLabel = window.searchClearButtonLabelLocalized;
  const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
  button.innerHTML = icon;
  button.addEventListener('click', clearSearchInput);
  button.addEventListener('keyup', clearSearchInputOnKeypress);
  return button;
}

// Append the clear button to the search form
function appendClearSearchButton(input, form) {
  searchClearButton = buildClearSearchButton(input.id);
  form.append(searchClearButton);
  if (input.value.length > 0) {
    form.classList.add(searchFormFilledClassName);
  }
}

// Add a class to the search form when the input has a value;
// Remove that class from the search form when the input doesn't have a value.
// Do this on a delay, rather than on every keystroke.
const toggleClearSearchButtonAvailability = debounce(function (event) {
  const form = event.target.closest(searchFormSelector);
  form.classList.toggle(searchFormFilledClassName, event.target.value.length > 0);
}, 200);

document.addEventListener('DOMContentLoaded', function () {
  // Key map
  var ENTER = 13;
  var ESCAPE = 27;
  var SPACE = 32;
  var UP = 38;
  var DOWN = 40;
  var TAB = 9;

  function closest(element, selector) {
    if (Element.prototype.closest) {
      return element.closest(selector);
    }
    do {
      if (
        (Element.prototype.matches && element.matches(selector)) ||
        (Element.prototype.msMatchesSelector && element.msMatchesSelector(selector)) ||
        (Element.prototype.webkitMatchesSelector && element.webkitMatchesSelector(selector))
      ) {
        return element;
      }
      element = element.parentElement || element.parentNode;
    } while (element !== null && element.nodeType === 1);
    return null;
  }

  // Set up clear functionality for the search field
  const searchForms = [...document.querySelectorAll(searchFormSelector)];
  const searchInputs = searchForms.map((form) => form.querySelector("input[type='search']"));
  searchInputs.forEach((input) => {
    appendClearSearchButton(input, input.closest(searchFormSelector));
    input.addEventListener('keyup', clearSearchInputOnKeypress);
    input.addEventListener('keyup', toggleClearSearchButtonAvailability);
  });

  // social share popups
  Array.prototype.forEach.call(document.querySelectorAll('.share a'), function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      window.open(this.href, '', 'height = 500, width = 500');
    });
  });

  // In some cases we should preserve focus after page reload
  function saveFocus() {
    var activeElementId = document.activeElement.getAttribute('id');
    sessionStorage.setItem('returnFocusTo', '#' + activeElementId);
  }
  var returnFocusTo = sessionStorage.getItem('returnFocusTo');
  if (returnFocusTo) {
    sessionStorage.removeItem('returnFocusTo');
    var returnFocusToEl = document.querySelector(returnFocusTo);
    returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
  }

  // show form controls when the textarea receives focus or backbutton is used and value exists
  var commentContainerTextarea = document.querySelector('.comment-container textarea'),
    commentContainerFormControls = document.querySelector('.comment-form-controls, .comment-ccs');

  if (commentContainerTextarea) {
    commentContainerTextarea.addEventListener('focus', function focusCommentContainerTextarea() {
      commentContainerFormControls.style.display = 'block';
      commentContainerTextarea.removeEventListener('focus', focusCommentContainerTextarea);
    });

    if (commentContainerTextarea.value !== '') {
      commentContainerFormControls.style.display = 'block';
    }
  }

  // Expand Request comment form when Add to conversation is clicked
  var showRequestCommentContainerTrigger = document.querySelector(
      '.request-container .comment-container .comment-show-container',
    ),
    requestCommentFields = document.querySelectorAll(
      '.request-container .comment-container .comment-fields',
    ),
    requestCommentSubmit = document.querySelector(
      '.request-container .comment-container .request-submit-comment',
    );

  if (showRequestCommentContainerTrigger) {
    showRequestCommentContainerTrigger.addEventListener('click', function () {
      showRequestCommentContainerTrigger.style.display = 'none';
      Array.prototype.forEach.call(requestCommentFields, function (e) {
        e.style.display = 'block';
      });
      requestCommentSubmit.style.display = 'inline-block';

      if (commentContainerTextarea) {
        commentContainerTextarea.focus();
      }
    });
  }

  // Mark as solved button
  var requestMarkAsSolvedButton = document.querySelector(
      '.request-container .mark-as-solved:not([data-disabled])',
    ),
    requestMarkAsSolvedCheckbox = document.querySelector(
      '.request-container .comment-container input[type=checkbox]',
    ),
    requestCommentSubmitButton = document.querySelector(
      '.request-container .comment-container input[type=submit]',
    );

  if (requestMarkAsSolvedButton) {
    requestMarkAsSolvedButton.addEventListener('click', function () {
      requestMarkAsSolvedCheckbox.setAttribute('checked', true);
      requestCommentSubmitButton.disabled = true;
      this.setAttribute('data-disabled', true);
      // Element.closest is not supported in IE11
      closest(this, 'form').submit();
    });
  }

  // Change Mark as solved text according to whether comment is filled
  var requestCommentTextarea = document.querySelector(
    '.request-container .comment-container textarea',
  );

  var usesWysiwyg = requestCommentTextarea && requestCommentTextarea.dataset.helper === 'wysiwyg';

  function isEmptyPlaintext(s) {
    return s.trim() === '';
  }

  function isEmptyHtml(xml) {
    var doc = new DOMParser().parseFromString(`<_>${xml}</_>`, 'text/xml');
    var img = doc.querySelector('img');
    return img === null && isEmptyPlaintext(doc.children[0].textContent);
  }

  var isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

  if (requestCommentTextarea) {
    requestCommentTextarea.addEventListener('input', function () {
      if (isEmpty(requestCommentTextarea.value)) {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText =
            requestMarkAsSolvedButton.getAttribute('data-solve-translation');
        }
        requestCommentSubmitButton.disabled = true;
      } else {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute(
            'data-solve-and-submit-translation',
          );
        }
        requestCommentSubmitButton.disabled = false;
      }
    });
  }

  // Disable submit button if textarea is empty
  if (requestCommentTextarea && isEmpty(requestCommentTextarea.value)) {
    requestCommentSubmitButton.disabled = true;
  }

  // Submit requests filter form on status or organization change in the request list page
  Array.prototype.forEach.call(
    document.querySelectorAll('#request-status-select, #request-organization-select'),
    function (el) {
      el.addEventListener('change', function (e) {
        e.stopPropagation();
        saveFocus();
        closest(this, 'form').submit();
      });
    },
  );

  // Submit requests filter form on search in the request list page
  var quickSearch = document.querySelector('#quick-search');
  quickSearch &&
    quickSearch.addEventListener('keyup', function (e) {
      if (e.keyCode === ENTER) {
        e.stopPropagation();
        saveFocus();
        closest(this, 'form').submit();
      }
    });

  var menuButton = document.getElementById('collapsible-sidebar-toggle');
  var menuList = document.querySelector('#user-nav-mobile');

  function toggleNavigation(toggle, menu) {
    var isExpanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', !isExpanded);
    toggle.setAttribute('aria-expanded', !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute('aria-expanded', false);
    toggle.setAttribute('aria-expanded', false);
    toggle.focus();
  }
  if (menuButton) {
    menuButton.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleNavigation(this, menuList);
    });
  }

  if (menuButton) {
    menuList.addEventListener('keyup', function (e) {
      if (e.keyCode === ESCAPE) {
        e.stopPropagation();
        closeNavigation(menuButton, this);
      }
    });
  }

  // Toggles expanded aria to collapsible elements
  var collapsible = document.querySelectorAll('.collapsible-nav, .collapsible-sidebar');

  Array.prototype.forEach.call(collapsible, function (el) {
    var toggle = el.querySelector('.collapsible-nav-toggle, .collapsible-sidebar-toggle');

    el.addEventListener('click', function (e) {
      toggleNavigation(toggle, this);
    });

    el.addEventListener('keyup', function (e) {
      if (e.keyCode === ESCAPE) {
        closeNavigation(toggle, this);
      }
    });
  });

  // Submit organization form in the request page
  var requestOrganisationSelect = document.querySelector('#request-organization select');

  if (requestOrganisationSelect) {
    requestOrganisationSelect.addEventListener('change', function () {
      closest(this, 'form').submit();
    });
  }

  // If multibrand search has more than 5 help centers or categories collapse the list
  var multibrandFilterLists = document.querySelectorAll('.multibrand-filter-list');
  Array.prototype.forEach.call(multibrandFilterLists, function (filter) {
    if (filter.children.length > 6) {
      // Display the show more button
      var trigger = filter.querySelector('.see-all-filters');
      trigger.setAttribute('aria-hidden', false);

      // Add event handler for click
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        trigger.parentNode.removeChild(trigger);
        filter.classList.remove('multibrand-filter-list--collapsed');
      });
    }
  });

  // If there are any error notifications below an input field, focus that field
  var notificationElm = document.querySelector('.notification-error');
  if (
    notificationElm &&
    notificationElm.previousElementSibling &&
    typeof notificationElm.previousElementSibling.focus === 'function'
  ) {
    notificationElm.previousElementSibling.focus();
  }

  // Dropdowns

  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains('dropdown-menu-top'),
      end: menu.classList.contains('dropdown-menu-end'),
    };

    this.toggle.addEventListener('click', this.clickHandler.bind(this));
    this.toggle.addEventListener('keydown', this.toggleKeyHandler.bind(this));
    this.menu.addEventListener('keydown', this.menuKeyHandler.bind(this));
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.menu.getAttribute('aria-expanded') === 'true';
    },

    get menuItems() {
      return Array.prototype.slice.call(this.menu.querySelectorAll("[role='menuitem']"));
    },

    dismiss: function () {
      if (!this.isExpanded) return;

      this.menu.setAttribute('aria-expanded', false);
      this.menu.classList.remove('dropdown-menu-end', 'dropdown-menu-top');
    },

    open: function () {
      if (this.isExpanded) return;

      this.menu.setAttribute('aria-expanded', true);
      this.handleOverflow();
    },

    handleOverflow: function () {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add('dropdown-menu-end');
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add('dropdown-menu-top');
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove('dropdown-menu-top');
      }
    },

    focusNextMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var nextIndex =
        currentIndex === this.menuItems.length - 1 || currentIndex < 0 ? 0 : currentIndex + 1;

      this.menuItems[nextIndex].focus();
    },

    focusPreviousMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var previousIndex = currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.menuItems[previousIndex].focus();
    },

    clickHandler: function () {
      if (this.isExpanded) {
        this.dismiss();
      } else {
        this.open();
      }
    },

    toggleKeyHandler: function (e) {
      switch (e.keyCode) {
        case ENTER:
        case SPACE:
        case DOWN:
          e.preventDefault();
          this.open();
          this.focusNextMenuItem();
          break;
        case UP:
          e.preventDefault();
          this.open();
          this.focusPreviousMenuItem();
          break;
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
      }
    },

    menuKeyHandler: function (e) {
      var firstItem = this.menuItems[0];
      var lastItem = this.menuItems[this.menuItems.length - 1];
      var currentElement = e.target;

      switch (e.keyCode) {
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
        case DOWN:
          e.preventDefault();
          this.focusNextMenuItem(currentElement);
          break;
        case UP:
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        case TAB:
          if (e.shiftKey) {
            if (currentElement === firstItem) {
              this.dismiss();
            } else {
              e.preventDefault();
              this.focusPreviousMenuItem(currentElement);
            }
          } else if (currentElement === lastItem) {
            this.dismiss();
          } else {
            e.preventDefault();
            this.focusNextMenuItem(currentElement);
          }
          break;
        case ENTER:
        case SPACE:
          e.preventDefault();
          currentElement.click();
          break;
      }
    },
  };

  var dropdowns = [];
  var dropdownToggles = Array.prototype.slice.call(document.querySelectorAll('.dropdown-toggle'));

  dropdownToggles.forEach(function (toggle) {
    var menu = toggle.nextElementSibling;
    if (menu && menu.classList.contains('dropdown-menu')) {
      dropdowns.push(new Dropdown(toggle, menu));
    }
  });

  document.addEventListener('click', function (evt) {
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.toggle.contains(evt.target)) {
        dropdown.dismiss();
      }
    });
  });

  /* Desktop Navbar Animations
   ***********************************************************************/

  function getCookie(a) {
    if (typeof document !== 'undefined') {
      const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
      return b ? b.pop() : '';
    }
    return false;
  }
  const cookie = getCookie('getpostmanlogin');
  // Checks if login cookie exists and changes link in uber-nav from 'sign in' to 'launch postman'.
  // Hides 'register' button if signed in

  if (cookie !== 'yes') {
    const signInButton = document.querySelector('.nav-sign-in-button');
    const signUpButton = document.querySelector('.nav-sign-up-button');
    signInButton.classList.remove('d-none');
    signInButton.setAttribute(
      'href',
      'https://identity.getpostman.com/login?continue=https%3A%2F%2Fgo.postman.co%2Fbuild',
    );
    signUpButton.classList.remove('d-none');
    signUpButton.setAttribute(
      'href',
      'https://identity.getpostman.com/signup?continue=https%3A%2F%2Fgo.postman.co%2Fbuild',
    );
  } else {
    const launchPostmanButton = document.querySelector('.nav-launch-postman-button');
    launchPostmanButton.classList.remove('d-none');
    launchPostmanButton.setAttribute('href', 'https://go.postman.co/build');
  }

  /* Postman Status API
   ***********************************************************************/

  function setStatusIcon(icon) {
    const statusResponse = document.getElementById('pm-status');
    let fontAwesomeIcon = document.createElement('i');
    fontAwesomeIcon.className = icon;
    return statusResponse.prepend(fontAwesomeIcon);
  }

  const statusResponse = document.getElementById('pm-status');
  if (statusResponse !== null || undefined) {
    let postmanStatusAPI = new StatusPage.page({ page: 'ms1frkqnsp7r' });
    postmanStatusAPI.status({
      success: function (data) {
        const { indicator, description } = data.status;
        if (indicator === 'none') {
          statusResponse.prepend(`All systems operational. `);
          setStatusIcon(`icon-indicator fa-solid fa-check status-green`);
        } else if (indicator === 'minor') {
          statusResponse.prepend(`${description}. `);
          setStatusIcon('icon-indicator fa-solid fa-square-minus status-yellow');
        } else if (indicator === 'major') {
          statusResponse.prepend(`${description}. `);
          setStatusIcon('icon-indicator fa-solid fa-xmark status-red');
        } else if (indicator === 'critical') {
          statusResponse.prepend(`${description}. `);
          setStatusIcon('icon-indicator fa-solid fa-wrench status-blue');
        } else if (indicator === '') {
          statusResponse.prepend(`We're having issues retrieving data for Postman.`);
        }
      },
    });
  }

  /* Navbar Global and Secondary
   ***********************************************************************/
  $('.mobile-icon-button_caret').bind('click', function () {
    $('.icon-caret').toggleClass('open');
  });

  // Brandon animations start
  $('#secondaryNav').on('click', function () {
    $('body').toggleClass('menu-open');
    $('.nav-primary').toggleClass('activeMenu');
    $('.nav-secondary').toggleClass('activeMenu');
  });

  function showBsDropdown() {
    $(this).find('.dropdown-menu').first().stop(true, true).slideDown(225);
    $(this).find('.arrow-icon').addClass('show');
  }

  function hideBsDropdown() {
    $(this).find('.dropdown-menu').stop(true, true).slideUp(225);
    $(this).find('.arrow-icon').removeClass('show');
  }
  $('.dropdown').on('show.bs.dropdown', showBsDropdown);
  $('.dropdown').on('hide.bs.dropdown', hideBsDropdown);

  function toggleGlobalNav() {
    // Global Mobile Icon Transition
    const toggler = document.getElementById('postman-primary-nav').getAttribute('aria-expanded');
    const body = document.querySelector('body');
    const icon1 = document.querySelector('#icon-wrap-one');
    if (toggler === 'true') {
      body.classList.add('lock');
      icon1.classList.add('open');
    } else {
      icon1.classList.remove('open');
      body.classList.remove('lock');
      const icon2 = document.getElementById('navbar-chevron-icons');
      const togglerSecondary = document
        .querySelector('#secondaryNav.navbar-toggler')
        .getAttribute('aria-expanded');
      if (togglerSecondary === 'true') {
        icon2.classList.remove('open');
      }
    }
  }

  let primaryNav = document.getElementById('postman-primary-nav');
  primaryNav.addEventListener('click', function (e) {
    toggleGlobalNav();
  });

  function showTargetElement() {
    const toggler = document.getElementById('secondaryNav').getAttribute('aria-expanded');
    const toggleChevron = document.getElementById('navbar-chevron-icons');
    if (toggler === 'false') {
      toggleChevron.classList.remove('open');
    } else {
      toggleChevron.classList.add('open');
    }
  }
  let secondaryNav = document.getElementById('secondaryNav');
  secondaryNav.addEventListener('click', function (e) {
    showTargetElement();
  });
  //  animations finish
});

// Notification Banner
if (window.location.href.includes("https://support.postman.com")) {
  document.addEventListener('DOMContentLoaded', async function () {
    // Article label to be considered for the alerts
    const label = 'Alert'
  
    // Show the article body within the alertbox? (Boolean: true/false)
    const showArticleBody = true;
  
    // Get current help center locale
    const locale = document
      .querySelector('html')
      .getAttribute('lang')
      .toLowerCase()
  
    // URL to be called to get the alert data
    const url = `/api/v2/help_center/${locale}/articles.json?label_names=${label}`
  
    // Raw data collected from the endpoint above
    const data = await (await fetch(url)).json()
    // List of articles returned
    const articles = (data && data.articles) || []
    if (articles.length === 0) {
      const html = `<div class='d-none no-alert'/>`
    document.querySelector('.alertbox').insertAdjacentHTML('beforeend', html)
    } else {
       // Handle returned articles
       for (let i = 0; i < articles.length; i++) {
        const title = articles[i].title
        const body = articles[i].body
    
        const html = body ? (`
          <div class="ns-box ns-bar ns-effect-slidetop ns-type-notice ns-show">
            <div class="ns-box-inner">
              ${showArticleBody ? `<p><strong>${title}</strong></p>${body}` : ''} 
              <span class="ns-close">
              </span>
            </div>
          </div>
        `) :   `<div class='d-none no-alert'/>`
    
        // Append current alert to the alertbox container
        document.querySelector('.alertbox').insertAdjacentHTML('beforeend', html)
    }

    }
  })

  document.addEventListener('click', function (event) {
    // Close alertbox
    if (event.target.matches('.ns-close')) {
      event.preventDefault()
      event.target.parentElement.remove()
    }
  });
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

(function updateMyRequestsTitleOnLogin() {
  setTimeout(() => {
    let profile = document.getElementById("pm-signed-in");
    const isSignedIn = getCookie("ajs_user_id");
    isSignedIn && profile ? profile.setAttribute("title", "My Requests") : null;
  }, 1000)

}())


jQuery(document).ready(function () {
  /* pmtSDK
  ***********************************************************************/
  window.pmt=function(){var t={version:"v2.0.39",log:function(e){t.output=t.output||[],t.output.push(e)},url:function(){return (URL && new URL(window.location.href).href).startsWith("http")&&(new URL(window.location.href).href)||""},set:function(e,o){t[e]=o},getPubId:function(){return(document.cookie.match("(^|;) ?_PUB_ID=([^;]*)(;|$)")||[])[2]},drivePubId:function(e){const o=t.url(),n="pub_id=";let a,c;if(o.match(n)){if(c=o.split(n).pop().split("&").shift(),a="_PUB_ID="+c+"; path=/",document.cookie=a,e){let t=o.replace(n+c,"");t=t.replace("?&","?"),t=t.replace("&&","&");t.split("?").pop()||(t=t.split("?").shift());const e=t.length-1;"&"===t.charAt(e)&&(t=t.substring(0,e)),window.location.replace(t)}return a}return t.getPubId()},driveCampaignId:function(e){let o;const n="dcid=",a=e&&e.dcid||window.location.search&&window.location.search.match(n)&&window.location.search.split(n).pop().split("&").shift()||(document.cookie.match("(^|;) ?dcid=([^;]*)(;|$)")||[])[2];let c,i;const r=e&&e.form,s=e&&e.url||t.url();return function(t){const e=t;let o;const c=a&&a.replace(n,"");t&&(e.tagName?a&&!e.driver_campaign_id&&(o=document.createElement("input"),o.type="hidden",o.name="driver_campaign_id",o.value=c,e.appendChild(o)):a&&(e.driver_campaign_id=c))}(r),s.match(n)?(c=s.split(n).pop().split("&").shift(),i=new Date,i.setDate(i.getDate()+30),o="dcid="+c+"; expires="+i.toUTCString()+"; path=/",document.cookie=o,o):e}};return t.enablePostmanAnalytics=function(e,o,n){if("function"!=typeof e||e.postmanAnalyticsEnabled||navigator.doNotTrack&&!o._disableDoNotTrack)return e;function a(t){return t.replace(/"/gi,'"')}function c(t){return"string"==typeof t&&t.split(window.location.host).pop()}return o||(o={}),e.postmanAnalyticsEnabled=!0,function(i,r,s,d,l){const u="load"!==r||t.url()!==t.currentURL;if(!u)return!1;e.apply(this,arguments);const p="gtm.uniqueEventId";let m,f,g,h;const w=r||n;t.initCategory||(t.initCategory=i);const y={category:i,action:w,indexType:"client-events",property:o._property||document.location.host,propertyId:document.location.host,traceId:t.getTraceId(null,o),timestamp:(new Date).toISOString()},I=c(t.currentURL)||document.referrer||t.externalURL||"",b=navigator.language||window.navigator.userLanguage||"?";function k(t,e){const o=t&&t.split(",")||[],n=o.length;let a,c;for(a=0;a<n;a+=1){const t=o[a];if(c=-1!==e.indexOf(t),c)break}return c}y.meta={url:c(I),language:b,user:t.user},s&&(y.entityId=s),l&&(y.meta.user=l),"load"===y.action&&y.entityId&&document.body&&document.body.id&&(y.entityId=y.entityId+"#"+document.body.id),d&&(m=parseInt(d,10),f=m&&!m.isNaN&&m||null,h="string"==typeof d,g=h&&d.match(":")&&d.split(":").pop()||h&&d||"object"==typeof d&&a(JSON.stringify(d))||"",f&&(y.value=f),g&&(s?y.entityId+=":"+g:y.entityId=g)),(Object.keys(o)||[]).forEach((function(t){"_"!==t.charAt(0)&&(y[t]=o[t])})),r||"object"!=typeof i||(y.action=i.action||i.event||i[Object.keys(i)[0]],i[p]&&(y.category=p+"-"+i[p])),"local"===y.env&&(y.env="beta"),"object"==typeof y.category&&y.category&&"string"==typeof y.category.category&&(y.category=y.category.category),["category","event","label"].forEach((function(t){"object"==typeof y[t]&&(y[t]=y[t]&&a(JSON.stringify(y[t])))})),y.userId=t.getPubId()||t.store()&&t.store().userId||y.userId,t.userId=y.userId;const _=t.getTraceId().split("|").pop();return t.traceId=t.getTraceId().split(_).shift()+t.userId,window.name&&!window.name.startsWith("pm")&&(window.name=t.getTraceId()),t.api().store(),setTimeout((function(){t.api()}),1e3),y.category&&y.action&&"function"==typeof o.fetch&&o.fetch(o._url,y)||y.entityId&&"object"==typeof document&&(()=>{const e=o._allow&&k(o._allow,document.location.pathname)||!o._allow&&!0,n=o._disallow&&k(o._disallow,document.location.pathname),a=btoa(JSON.stringify(y));if(e&&!n){if(fetch){if("load"===y.action){if(y.action&&!u)return t.trackIt(),!1;y.entityId=y.entityId.split("#").shift()}t.getTraceId(y),fetch(o._url,{method:"POST",headers:{Accept:"text/html","Content-Type":"text/html"},body:a,mode:"no-cors",keepalive:!0}).catch((function(e){t.log(e)})),t.event=y}else!function(t){const e=new XMLHttpRequest;e.open("POST",o._url),e.setRequestHeader("Accept","application/json"),e.setRequestHeader("Content-type","text/plain"),e.send(t)}(a);t.currentURL=t.url(),-1===y.meta.url.indexOf(document.location.host)&&(t.externalURL=y.meta.url)}})(),!0}},t.watch=function(){const e=(new Date).getTime();if(t.store().session>36e5){t.store("time",e),t.store("session",1);let o=t.getTraceId().split("|");o.shift(),o=o.join("|"),t.event&&window.pmt("setScalp",[{property:t.event.property,_traceId:"pm"+btoa((new Date).getTime())+"|"+o}])}else t.store("session",e-t.store().time);return t.store("time",e),t.stored},t.ga=function(){"function"==typeof window.ga&&window.ga.apply(this,arguments)},t.getEnv=function(t){let e;e="production";const o=t||document.location.hostname;return["beta","local","stag"].forEach((function(t){o.match(t)&&(e=t)})),e},t.setScalp=function(e){if("object"==typeof window){const o=(document.location.search&&document.location.search.match("dcid=([^;]*)(;|$)")||[])[1],n=o&&o.split("&").shift()||(document.cookie.match("(^|;) ?dcid=([^;]*)(;|$)")||[])[2],a=document.location.search.substr(1).split("&"),c=window.localStorage.getItem("utms"),i=c&&c.split(",")||[];a.forEach((t=>{const e=t.match("([UTM|utm].*)=([^;]*)(;|$)");e&&(-1!==e[0].indexOf("utm")||-1!==e[0].indexOf("UTM"))&&i.push(e[0])}));const r=i.length&&i.join(".")||"",s="PM."+btoa((new Date).toISOString()),d=t.getUserId()||window.name&&window.name.match("|PM.")&&window.name.split("|").pop()||t.store()&&t.store().userId;t.store("userId",d||s);const l=(document.cookie.match("(^|;) ?_pm.store=([^;]*)(;|$)")||[])[2],u=l&&JSON.parse(l)||{},p="pm"+btoa((new Date).getTime());"string"==typeof window.name&&"pm"===window.name.substring(0,2)||(n&&-1===window.name.indexOf("DCID.")?window.name=!t.scalpCount&&u.traceId||p+"|DCID."+n+(r&&"|"+r||"")+"|"+(d||s):window.name=!t.scalpCount&&u.traceId||p+(r&&"|"+r||"")+"|"+(d||s));const m=!t.scalpCount&&u.traceId||e._traceId||window.parent&&window.parent.name||window.name,f=function(){t.scalpCount||(t.scalpCount=0),t.scalpCount+=1,t.watch()},g=t.getPubId()||d||window.name.split("|").pop(),h={env:"function"==typeof t.getEnv&&t.getEnv()||"production",type:"events-website",userId:g,_allow:!e.disallow&&e.allow,_disableDoNotTrack:void 0===e.disableDoNotTrack||e.disableDoNotTrack,_disallow:!e.allow&&e.disallow,_property:e.property||document.location.host,_traceId:m},w=h.env.match("prod")?"https://bi.pst.tech/events":"https://bi-beta.pst.tech/events";h._url=e.url||w,t.store("session",1),t.store("traceId",m),t.traceId=m,t.userId=g,t.scalp=t.enablePostmanAnalytics(f,h)}},t.getTraceUrl=function(e){const o=-1!==e.indexOf("?")?"&":"?";return e+o+"trace="+t.getTraceId()},t.trace=function(e){document.location.href=t.getTraceUrl(e)},t.getUtmUrl=function(e){const o=-1!==e.indexOf("?")?"&":"?",n=t.traceId.split(".").pop(),a=t.traceId.split("."+n).shift().substr(1).split("."),c=[];return a.forEach((t=>{const e=t.match("([UTM|utm].*)=([^;]*)(;|$)");e&&(-1!==e[0].indexOf("utm")||-1!==e[0].indexOf("UTM"))&&c.push(e[0])})),e+o+(c.length&&c.join("&")||"utm="+document.location.host)},t.utm=function(e){let o=t.getUtmUrl(e);o.match("trace=")||(o=o+"&trace="+t.traceId),document.location.href=o},t.trackClicks=function(e,o){const n=function(n){const a=document.body&&document.body.id&&"#"+document.body.id||"";if(e){const c=n.target.getAttribute(e);c&&t.scalp(o||t.initCategory,"click","target",a+c)}else if(!e&&("string"==typeof n.target.className||"string"==typeof n.target.id)){const e=n.target.className||n.target.id||n.target.parentNode.className||-1;if("string"==typeof e){const c=document.location.pathname+a+":"+n.target.tagName+"."+e.split(" ").join("_");try{t.scalp(o||t.initCategory,"click",c)}catch(e){t.log(e.message)}}}};document.body.getAttribute("data-trackClicks")||document.body.addEventListener("mousedown",n,!0),document.body.setAttribute("data-trackClicks",e||"default")},t.driveTrack=function(e){let o;const n="_track=",a=e&&e._track||window.location.search&&window.location.search.match(n)&&window.location.search.split(n).pop().split("&").shift()||(document.cookie.match("(^|;) ?"+n+"([^;]*)(;|$)")||[])[2],c=e&&e.url||t.url(),i=t.getEnv(),r=i.match("stag")?"stage":i;return t.tracking=!0,t.trackIt(),c.match(n)?(o="postman-"+r+".track="+a+"; path=/",document.cookie=o,o):e},t.trackIt=function(){const e=(document.cookie.match("(^|;) ?postman-[a-z]+.track=([^;]*)(;|$)")||[])[2];if(e&&t.tracking){let o=t.url();const n=-1===o.indexOf("?")?"?":"&";-1===o.indexOf("_track")&&"default"!==e&&(o=`${o}${n}_track=${e}`,document.location.replace(o))}},t.xhr=function(t,e){const o=new XMLHttpRequest,n="t="+(new Date).getTime(),a=-1===t.indexOf("?")?"?":"&",c=t+a+n;o.withCredentials=!0,o.addEventListener("readystatechange",(function(){4===this.readyState&&e(this.responseText)})),o.open("GET",c),o.send()},t.bff=function(e,o,n){const a=(n?"/mkapi/":"https://www.postman.com/mkapi/")+e+".json";t.xhr(a,o)},t.store=function(e,o){const n=(document.cookie.match("(^|;) ?_pm.store=([^;]*)(;|$)")||[])[2],a=n&&JSON.parse(n)||{};t.stored={...a},e&&o&&(t.stored[e]=o);const c=document.location.host.split("."),i=c.pop(),r=c.pop(),s=new Date;s.setDate(s.getDate()+1080);let d="_pm.store="+JSON.stringify(t.stored)+"; expires="+s.toUTCString()+"; domain=."+r+"."+i+"; path=/";if(!r){const t=d.split("domain=").pop().split(";").shift();d=d.replace(t,"localhost")}return document.cookie=d,t.stored},t.getTraceIdFromCookie=function(){return(document.cookie.match("(^|;) ?_pmt=([^;]*)(;|$)")||[])[2]},t.getTraceIdFromUrl=function(){const e="trace=",o=t.url(),n=o.match(e)&&o.split(e).pop().split("&").shift();return n&&t.store("traceId",n),n},t.getTraceId=function(e,o){const n=t.getTraceIdFromUrl()||t.getTraceIdFromCookie()||t.store().traceId||t.traceId||o&&o._traceId||"";return n&&e&&(e.traceId=n),n},t.getUserId=function(e){const o=t.getTraceId().split("|").pop()||t.store().userId||t.userId||"";return o&&e&&(e.userId=o),o},t.api=function(e){"object"==typeof e&&Object.keys(e).forEach((function(t){window[t]=e[t]}));const o=window.pm,n=o&&o.billing,a=n&&n.plan,c=a&&a.features;if(c){const e=c&&c.is_paid_plan_growth,o=e&&e.value,n=c&&c.is_enterprise_plan_growth,a=(n&&n.value?"enterprise":o&&"paid")||"free";t.store("plan",a)}return t},setTimeout((function(){const t=document.getElementById("pmtSDK"),e=t&&t.getAttribute("data-track-category")||"pm-analytics",o=t&&t.getAttribute("data-track-property"),n=t&&t.getAttribute("data-track-url"),a=t&&"false"!==t.getAttribute("data-track-disable-do-not-track"),c=t&&"true"===t.getAttribute("data-drive-track"),i=t&&"false"!==t.getAttribute("data-drive-campaign-id"),r=t&&"false"!==t.getAttribute("data-drive-pub-id"),s=t&&"false"!==t.getAttribute("data-track-load"),d=t&&"false"!==t.getAttribute("data-track-clicks"),l=d&&t.getAttribute("data-track-clicks-attribute")||null;if(o){const t={property:o};n&&(t.url=n),a&&(t.disableDoNotTrack=a),window.pmt("setScalp",[t]),s&&window.pmt("scalp",[e,"load",document.location.pathname]),d&&window.pmt("trackClicks",[l,e]),i&&window.pmt("driveCampaignId"),r&&window.pmt("drivePubId",[!0]),c&&window.pmt("driveTrack")}}),1e3),function(e,o){return t[e]?"function"==typeof t[e]?t[e].apply(t,o):t[e]:null}}();

  /* pmtConfig
  ***********************************************************************/
  window.pmt('setScalp', [{ property: 'postman-support-center' }]);
  window.pmt('scalp', ['pm-analytics', 'load', document.location.pathname]);
  window.pmt('trackClicks', []);

})