(function() {
  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getDirectSubmenuTrigger(submenu) {
    var children = submenu.children || [];
    for (var i = 0; i < children.length; i += 1) {
      var child = children[i];
      if (child.classList && child.classList.contains('pushy-btn')) {
        return child;
      }
      if (child.tagName === 'A') {
        return child;
      }
    }
    return null;
  }

  function initPushy() {
    var body = document.body;
    var menu = query('.pushy');
    var overlay = query('.site-overlay');
    var menuButton = query('.menu-btn.global-menu') || query('.menu-btn');

    if (!body || !menu || !overlay || !menuButton) {
      return;
    }

    var openClass = menu.classList.contains('pushy-right') ? 'pushy-open-right' : 'pushy-open-left';

    function closeMenu() {
      body.classList.remove('pushy-open-left');
      body.classList.remove('pushy-open-right');
      menuButton.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      body.classList.remove('pushy-open-left');
      body.classList.remove('pushy-open-right');
      body.classList.add(openClass);
      menuButton.setAttribute('aria-expanded', 'true');
    }

    function toggleMenu(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (body.classList.contains(openClass)) {
        closeMenu();
        return;
      }

      openMenu();
    }

    if (!menuButton.hasAttribute('data-pushy-bound')) {
      menuButton.setAttribute('data-pushy-bound', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.addEventListener('click', toggleMenu);
    }

    if (!overlay.hasAttribute('data-pushy-bound')) {
      overlay.setAttribute('data-pushy-bound', 'true');
      overlay.addEventListener('click', closeMenu);
    }

    queryAll('.pushy-link a', menu).forEach(function(link) {
      if (link.hasAttribute('data-pushy-link-bound')) {
        return;
      }
      link.setAttribute('data-pushy-link-bound', 'true');
      link.addEventListener('click', closeMenu);
    });

    queryAll('.pushy-submenu', menu).forEach(function(submenu) {
      if (!submenu.classList.contains('pushy-submenu-open') && !submenu.classList.contains('pushy-submenu-closed')) {
        submenu.classList.add('pushy-submenu-closed');
      }

      var trigger = getDirectSubmenuTrigger(submenu);
      if (!trigger || trigger.hasAttribute('data-pushy-submenu-bound')) {
        return;
      }

      trigger.setAttribute('data-pushy-submenu-bound', 'true');
      trigger.addEventListener('click', function(event) {
        event.preventDefault();
        submenu.classList.toggle('pushy-submenu-open');
        submenu.classList.toggle('pushy-submenu-closed');
      });
    });

    if (!document.documentElement.hasAttribute('data-pushy-escape-bound')) {
      document.documentElement.setAttribute('data-pushy-escape-bound', 'true');
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          closeMenu();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPushy, { once: true });
  } else {
    initPushy();
  }

  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', initPushy);
  }
})();
