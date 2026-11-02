/* CZN 罗丝薇瑟 · 直接插入 canvas 的小组件
 *
 * 用法：
 *   <div id="czn-live"></div>
 *   <script src="/live-bg/vendor/spine-player-3.8.js"></script>
 *   <script src="/live-bg/inline.js"></script>
 *   <script>CZNInline.mount('#czn-live');</script>
 */
(function (global) {
  'use strict';

  var SCRIPT = document.currentScript;
  var DEFAULT_BASE = SCRIPT
    ? SCRIPT.src.split('?')[0].split('#')[0].replace(/\/[^/]*$/, '/')
    : '';

  var MODELS = {
    '1': {
      json: 'assets/30134.json',
      atlas: 'assets/30134.atlas',
      viewport: { x: -500, y: -640, width: 1003, height: 1180, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    },
    '2': {
      json: 'assets/30134_02.json',
      atlas: 'assets/30134_02.atlas',
      viewport: { x: -500, y: -640, width: 1003, height: 1180, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    }
  };

  var CSS = [
    '.czn-live{position:relative;display:grid;grid-template-rows:minmax(0,1fr) auto;overflow:hidden;background:transparent}',
    '.czn-live.czn-pass{pointer-events:none}',
    '.czn-stage{grid-row:1;position:relative;min-height:0;overflow:hidden}',
    '.czn-pane{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;z-index:1;pointer-events:none;transform-origin:top left;transition:none}',
    '.czn-pane.active{opacity:1;z-index:2;pointer-events:none}',
    '.czn-pane.incoming{opacity:0;z-index:3;pointer-events:none}',
    '.czn-pane .spine-player,.czn-pane canvas{width:100%!important;height:100%!important;display:block}',
    '.czn-live canvas{touch-action:manipulation}',
    '.czn-hit{position:absolute;inset:0;z-index:2;pointer-events:auto;cursor:pointer}',
    '.czn-skins{grid-row:2;position:relative;justify-self:center;z-index:4;display:flex;gap:2px;margin:0 0 8px;padding:3px;border-radius:999px;background:rgba(18,10,34,.42);box-shadow:0 2px 12px rgba(0,0,0,.12);backdrop-filter:blur(6px);opacity:.45;transition:opacity .2s;pointer-events:auto;user-select:none}',
    '.czn-skins:hover,.czn-skins:focus-within{opacity:.95}',
    '.czn-skins button{appearance:none;border:0;border-radius:999px;padding:4px 10px;background:transparent;color:#f4ecff;font:inherit;font-size:11px;line-height:1.4;letter-spacing:.03em;cursor:pointer}',
    '.czn-skins button.active{background:rgba(155,112,210,.55)}',
    '.czn-skins button:focus-visible{outline:1px solid rgba(255,255,255,.8)}',
    '.czn-live.czn-no-ui .czn-skins{display:none}'
  ].join('');

  function ensureCSS() {
    if (document.getElementById('czn-inline-style')) return;
    var style = document.createElement('style');
    style.id = 'czn-inline-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function resolve(target) {
    return typeof target === 'string' ? document.querySelector(target) : target;
  }

  function mount(target, options) {
    ensureCSS();

    var host = resolve(target);
    if (!host) throw new Error('[CZNInline] target not found');
    if (!global.spine_3_8 || !global.spine_3_8.SpinePlayer) {
      throw new Error('[CZNInline] spine-player-3.8.js must be loaded first');
    }

    var opts = options || {};
    var base = opts.base || DEFAULT_BASE;
    var passthrough = !!opts.passthrough;
    var showSkins = opts.showSkins !== false;
    var hitShape = opts.hitShape || 'ellipse(15% 40% at 50% 53%)';
    var currentSkin = opts.skin === '2' || opts.skin === 2 ? '2' : '1';

    host.classList.add('czn-live');
    if (passthrough) host.classList.add('czn-pass');
    if (!showSkins) host.classList.add('czn-no-ui');

    // Respect sizing already provided by the host element / CSS.
    if (opts.width) host.style.width = opts.width;
    else if (getComputedStyle(host).width === 'auto') host.style.width = '100%';
    if (opts.height) host.style.height = opts.height;
    else if (getComputedStyle(host).height === '0px') host.style.height = '640px';

    host.innerHTML =
      '<div class="czn-stage">' +
        '<div class="czn-pane" data-pane="0"></div>' +
        '<div class="czn-pane" data-pane="1"></div>' +
      '</div>' +
      (showSkins
        ? '<div class="czn-skins">' +
            '<button type="button" data-skin="1">皮肤 1</button>' +
            '<button type="button" data-skin="2">皮肤 2</button>' +
          '</div>'
        : '') +
      (passthrough ? '<div class="czn-hit" role="button" tabindex="0" aria-label="点击互动"></div>' : '');

    var panes = host.querySelectorAll('.czn-pane');
    var stage = host.querySelector('.czn-stage');
    var hit = host.querySelector('.czn-hit');
    var activePane = null;
    var activePlayer = null;
    var currentAnim = 'idle';
    var returnTimer = 0;
    var switching = false;
    var mountToken = 0;
    var destroyed = false;

    if (hit) {
      hit.style.clipPath = hitShape;
      hit.style.webkitClipPath = hitShape;
    }

    function applySuperSampling() {
      var dpr = global.devicePixelRatio || 1;
      var ss = Math.min(3, Math.max(2, Math.ceil(dpr)));
      for (var i = 0; i < panes.length; i++) {
        panes[i].style.width = (ss * 100) + '%';
        panes[i].style.height = (ss * 100) + '%';
        panes[i].style.transform = 'scale(' + (1 / ss) + ')';
      }
    }
    applySuperSampling();
    global.addEventListener('resize', applySuperSampling);

    function setActiveSkin() {
      var buttons = host.querySelectorAll('[data-skin]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle('active', buttons[i].getAttribute('data-skin') === currentSkin);
      }
    }
    setActiveSkin();

    function play(name) {
      if (!activePlayer) return;
      clearTimeout(returnTimer);
      currentAnim = name;
      activePlayer.setAnimation(name, name === 'idle');

      if (name === 'touch') {
        var current = activePlayer.animationState && activePlayer.animationState.getCurrent(0);
        var duration = current && current.animation ? current.animation.duration : 11.5;
        returnTimer = setTimeout(function () {
          if (currentAnim === 'touch') play('idle');
        }, duration * 1000 + 80);
      }
    }

    function disposePlayer(p) {
      if (!p) return;
      try { p.stopRendering(); } catch (e) {}
      setTimeout(function () {
        try { p.assetManager.dispose(); } catch (e) {}
      }, 300);
    }

    function mountSkin(skin) {
      if (destroyed || switching) return;
      if (skin === currentSkin && activePlayer) {
        setActiveSkin();
        return;
      }

      switching = true;
      var previousSkin = currentSkin;
      currentSkin = skin;
      currentAnim = 'idle';
      clearTimeout(returnTimer);
      setActiveSkin();

      var incoming = activePane
        ? (activePane === panes[0] ? panes[1] : panes[0])
        : panes[0];
      var oldPane = activePane;
      var oldPlayer = activePlayer;
      var token = ++mountToken;

      incoming.innerHTML = '';
      incoming.classList.remove('active');
      incoming.classList.add('incoming');
      applySuperSampling();

      var model = MODELS[skin];
      var next = new global.spine_3_8.SpinePlayer(incoming, {
        jsonUrl: base + model.json,
        atlasUrl: base + model.atlas,
        showLoading: false,
        showControls: false,
        animation: 'idle',
        skin: 'normal',
        alpha: true,
        premultipliedAlpha: true,
        backgroundColor: '#00000000',
        viewport: model.viewport,
        success: function (p) {
          if (token !== mountToken) {
            disposePlayer(p);
            return;
          }
          activePlayer = p;
          p.play();

          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              if (token !== mountToken) return;
              incoming.classList.remove('incoming');
              incoming.classList.add('active');
              activePane = incoming;
              switching = false;

              if (oldPane && oldPane !== incoming) {
                oldPane.classList.remove('active');
                setTimeout(function () {
                  if (oldPane === activePane) return;
                  if (oldPane.classList.contains('incoming')) return;
                  disposePlayer(oldPlayer);
                  oldPane.innerHTML = '';
                }, 60);
              }
            });
          });
        },
        error: function () {
          if (token !== mountToken) return;
          currentSkin = previousSkin;
          setActiveSkin();
          incoming.classList.remove('incoming');
          incoming.innerHTML = '';
          switching = false;
        }
      });

      incoming.__spine = next;
    }

    host.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('.czn-skins')) return;
      if (!passthrough) play('touch');
    });

    if (hit) {
      hit.addEventListener('click', function () { play('touch'); });
      hit.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          play('touch');
        }
      });
    }

    var skinButtons = host.querySelectorAll('[data-skin]');
    for (var i = 0; i < skinButtons.length; i++) {
      skinButtons[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var skin = this.getAttribute('data-skin');
        if (skin !== currentSkin) mountSkin(skin);
      });
    }

    var api = {
      play: play,
      setSkin: function (skin) {
        skin = skin === '2' || skin === 2 ? '2' : '1';
        if (skin !== currentSkin) mountSkin(skin);
      },
      getState: function () {
        return { skin: currentSkin, anim: currentAnim, ready: !!activePlayer };
      },
      destroy: function () {
        destroyed = true;
        clearTimeout(returnTimer);
        disposePlayer(activePlayer);
        activePlayer = null;
        host.innerHTML = '';
      }
    };
    host.__czn = api;

    mountSkin(currentSkin);
    return api;
  }

  global.CZNInline = { mount: mount };
})(window);
