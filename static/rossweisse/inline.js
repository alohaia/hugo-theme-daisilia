(function (global) {
  'use strict';

  var SCRIPT = document.currentScript;
  var DEFAULT_BASE = SCRIPT
    ? SCRIPT.src.split('?')[0].split('#')[0].replace(/\/[^/]*$/, '/')
    : '';

  var MODELS = {
    '1': {
      json: 'assets/p2/P2.json',
      atlas: 'assets/p2/P2.atlas',
      runtime: '4.2',
      skin: 'default',
      viewport: { x: -1550, y: -230, width: 3000, height: 4600, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    },
    '2': {
      json: 'assets/30134_02.json',
      atlas: 'assets/30134_02.atlas',
      viewport: { x: -500, y: -640, width: 1003, height: 1180, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    }
  };

  var POSES = {
    duck: {
      label: '鸭子坐',
      icon: 'dongzuo_4.png',
      dir: 'duck',
      json: 'P3_1.json',
      atlas: 'P3_1.atlas',
      viewport: { x: -1338.63, y: -630.32, width: 3118, height: 2981.96, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    },
    lean: {
      label: '倚靠',
      icon: 'dongzuo_5.png',
      dir: 'lean',
      json: 'p3_2.json',
      atlas: 'p3_2.atlas',
      viewport: { x: -982.29, y: -1004.2, width: 2653.5, height: 3741.5, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    },
    pini: {
      label: '睥睨',
      icon: 'dongzuo_2.png',
      dir: 'pini',
      json: 'p3-3.json',
      atlas: 'p3-3.atlas',
      viewport: { x: -2166.36, y: -136.24, width: 4335.61, height: 3330.5, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    },
    zhandou: {
      label: '战斗',
      icon: 'dongzuo_6.png',
      dir: 'zhandou',
      json: 'p3_4.json',
      atlas: 'p3_4.atlas',
      viewport: { x: -1582, y: -29.08, width: 2869.5, height: 3692, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 }
    }
  };

  // legacy:true 表示改用旧 3.8 模型播放它原本的 touch 动画。
  var SKIN1_ZONES = [
    { key: 'other', label: '其他区域', anim: 'confused', x: 0.26, y: 0.7, w: 0.51, h: 0.84 }, // covered by followed areas
    { key: 'head', label: '头', anim: 'idle1', x: 0.44, y: 0.14, w: 0.125, h: 0.07 },
    { key: 'head', label: '头部', anim: 'surprise', x: 0.43, y: 0.21, w: 0.135, h: 0.10 },
    { key: 'chest_thigh', label: '胸部大腿', anim: 'shy', x: 0.40, y: 0.31, w: 0.195, h: 0.32 },
    { key: 'feet', label: '脚', anim: 'shy', x: 0.44, y: 0.91, w: 0.13, h: 0.85 },
    { key: 'hand_sword', label: '手/剑（原 touch）', anim: 'touch', legacy: true, x: 0.565, y: 0.12, w: 0.13, h: 0.23 }
  ];

  var CSS = [
    '.czn-live{position:relative;display:grid;grid-template-rows:minmax(0,1fr) auto;overflow:hidden;background:transparent}',
    '.czn-live.czn-pass{pointer-events:none}',
    '.czn-stage{grid-row:1;position:relative;min-height:0;overflow:hidden}',
    '.czn-pane{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;z-index:1;pointer-events:none;transform-origin:top left;transition:none}',
    '.czn-pane.active{opacity:1;z-index:2;pointer-events:none}',
    '.czn-pane.incoming{opacity:1;z-index:3;pointer-events:none}',
    '.czn-pane .spine-player,.czn-pane canvas{width:100%!important;height:100%!important;display:block;background:transparent!important}',
    '.czn-live canvas{touch-action:manipulation}',
    '.czn-hit{position:absolute;inset:0;z-index:2;pointer-events:auto;cursor:pointer}',
    '.czn-zones{position:absolute;inset:0;z-index:3;pointer-events:none}',
    '.czn-zone{position:absolute;pointer-events:auto;cursor:pointer;background:transparent}',
    // 原 touch（legacy 3.8 模型）播放时 zones 保持可见并提到最上层，任意区域都能立刻打断它。
    '.czn-live.czn-legacy .czn-zones{z-index:7}',
    '.czn-live.czn-skin-2 .czn-zones,.czn-live.czn-pose .czn-zones,.czn-live.czn-loading .czn-zones{display:none}',
    '.czn-menu{position:absolute;right:8px;top:15%;z-index:6;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:none}',
    '.czn-menu-toggle{pointer-events:auto;width:42px;height:42px;border:0;border-radius:50%;background:rgba(18,10,34,.62);color:#f4ecff;font:600 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2);backdrop-filter:blur(6px)}',
    '.czn-menu-toggle:hover{background:rgba(80,50,120,.8)}',
    '.czn-menu-list{display:none;flex-direction:column;gap:4px;padding:4px;border-radius:14px;background:rgba(18,10,34,.62);box-shadow:0 4px 18px rgba(0,0,0,.25);backdrop-filter:blur(8px);pointer-events:auto}',
    '.czn-menu.open .czn-menu-list{display:flex}',
    '.czn-menu-item{position:relative;width:48px;height:54px;padding:0;border:0;border-radius:10px;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;overflow:hidden}',
    '.czn-menu-item img{width:44px;height:44px;object-fit:contain;display:block;pointer-events:none}',
    '.czn-menu-item span{font-size:9px;line-height:1;color:#f4ecff;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none}',
    '.czn-menu-item.active{background:rgba(155,112,210,.55)}',
    '.czn-menu-item.idle{justify-content:center}',
    '.czn-menu-item.idle span{font-size:11px}',
    '.czn-live.czn-skin-2 .czn-menu{display:none}',
    '.czn-skins{grid-row:2;position:relative;justify-self:center;z-index:4;display:flex;gap:2px;margin:0 0 8px;padding:3px;border-radius:999px;background:rgba(18,10,34,.42);box-shadow:0 2px 12px rgba(0,0,0,.12);backdrop-filter:blur(6px);opacity:.7;transition:opacity .2s;pointer-events:auto;user-select:none}',
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
    var showActions = opts.showActions !== false;
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

    var menuItems = '<button type="button" class="czn-menu-item idle active" data-pose="idle" title="待机"><span>待机</span></button>';
    for (var pk in POSES) {
      menuItems += '<button type="button" class="czn-menu-item" data-pose="' + pk + '" title="' + POSES[pk].label + '">' +
        '<img src="' + base + 'assets/ui/' + POSES[pk].icon + '" alt="">' +
        '<span>' + POSES[pk].label + '</span></button>';
    }
    var menuHtml = '<div class="czn-menu">' +
      '<button type="button" class="czn-menu-toggle" aria-expanded="false" aria-label="动作菜单">动作</button>' +
      '<div class="czn-menu-list" role="menu">' + menuItems + '</div>' +
    '</div>';

    var zonesHtml = '';
    for (var zi = 0; zi < SKIN1_ZONES.length; zi++) {
      var z = SKIN1_ZONES[zi];
      zonesHtml += '<div class="czn-zone" data-zone="' + z.key + '" data-anim="' + z.anim + '"' +
        (z.legacy ? ' data-legacy="1"' : '') +
        ' style="left:' + (z.x * 100) + '%;top:' + (z.y * 100) + '%;width:' + (z.w * 100) + '%;height:' + (z.h * 100) + '%"' +
        ' title="' + z.label + '"></div>';
    }

    host.innerHTML =
      '<div class="czn-stage">' +
        '<div class="czn-pane" data-pane="0"></div>' +
        '<div class="czn-pane" data-pane="1"></div>' +
        '<div class="czn-pane" data-pane="2"></div>' +
        '<div class="czn-pane" data-pane="3"></div>' +
        '<div class="czn-zones">' + zonesHtml + '</div>' +
        (showActions ? menuHtml : '') +
      '</div>' +
      (showSkins
        ? '<div class="czn-skins">' +
            '<button type="button" data-skin="1">战斗服</button>' +
            '<button type="button" data-skin="2">金礼服</button>' +
          '</div>'
        : '') +
      (passthrough ? '<div class="czn-hit" role="button" tabindex="0" aria-label="点击互动"></div>' : '');

    var panes = host.querySelectorAll('.czn-pane');
    var hit = host.querySelector('.czn-hit');
    var activePane = null;
    var activePlayer = null;
    var currentAnim = 'idle';
    var returnTimer = 0;
    var destroyed = false;
    var players = { '1': null, '2': null };
    var playerReady = { '1': false, '2': false };
    var playerLoading = { '1': false, '2': false };
    var playerWaiters = { '1': [], '2': [] };
    var loadToken = { '1': 0, '2': 0 };
    var preloadTimer = 0;
    var preloadDelay = opts.preloadDelay === undefined ? 1200 : opts.preloadDelay;
    var preloadSkins = opts.preloadSkins !== false;
    var preloadPoses = opts.preloadPoses === true;
    var preloadLegacy = opts.preloadLegacy !== false;
    var poseAssetsPreloaded = false;
    var menuEl = host.querySelector('.czn-menu');
    var menuToggle = host.querySelector('.czn-menu-toggle');
    var posePane = panes[2];
    var posePlayer = null;
    var poseReady = false;
    var poseKey = 'idle';
    var poseLoading = false;
    var poseToken = 0;
    var poseRuntimeState = 0;
    var poseRuntimeWaiters = [];
    var legacyPane = panes[3];
    var legacyPlayer = null;
    var legacyReady = false;
    var legacyLoading = false;
    var legacyWaiters = [];
    var legacyToken = 0;
    var legacyBusy = false;
    var legacyRequest = false;

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

    // SpinePlayer assigns window.onresize itself; with several players only the
    // last one survives, so redraw all of them explicitly.
    global.addEventListener('resize', function () {
      for (var s in players) {
        if (players[s] && playerReady[s]) {
          try { players[s].drawFrame(false); } catch (e) {}
        }
      }
      if (posePlayer && poseReady) {
        try { posePlayer.drawFrame(false); } catch (e) {}
      }
      if (legacyPlayer && legacyReady) {
        try { legacyPlayer.drawFrame(false); } catch (e) {}
      }
    });

    function paneFor(skin) {
      return panes[skin === '2' ? 1 : 0];
    }

    function setActiveSkin() {
      var buttons = host.querySelectorAll('[data-skin]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle('active', buttons[i].getAttribute('data-skin') === currentSkin);
      }
    }
    setActiveSkin();
    setActivePoseButton();

    function play(name) {
      // 原 touch 播放中点在空白处：结束它并回到 P2，让随后的动作正常播放。
      if (legacyBusy) stopLegacy(true);
      if (!activePlayer) return;
      if (posePlayer && activePlayer === posePlayer) return;
      clearTimeout(returnTimer);
      currentAnim = name;
      var animName = name === 'touch' && currentSkin === '1' ? 'confused' : name;
      activePlayer.setAnimation(animName, animName === 'idle');

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

    function setActivePoseButton() {
      var buttons = host.querySelectorAll('[data-pose]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle('active', buttons[i].getAttribute('data-pose') === poseKey);
      }
    }

    function ensurePoseRuntime(cb) {
      if (global.spine && global.spine.SpinePlayer) {
        cb(true);
        return;
      }
      if (poseRuntimeState === 2) {
        cb(true);
        return;
      }
      if (poseRuntimeState === -1) {
        cb(false);
        return;
      }
      poseRuntimeWaiters.push(cb);
      if (poseRuntimeState === 1) return;

      poseRuntimeState = 1;
      var s = document.createElement('script');
      s.src = base + 'vendor/spine-player-4.2.js';
      s.async = true;
      s.onload = function () {
        var ok = !!(global.spine && global.spine.SpinePlayer);
        poseRuntimeState = ok ? 2 : -1;
        var waiters = poseRuntimeWaiters;
        poseRuntimeWaiters = [];
        for (var i = 0; i < waiters.length; i++) waiters[i](ok);
      };
      s.onerror = function () {
        poseRuntimeState = -1;
        var waiters = poseRuntimeWaiters;
        poseRuntimeWaiters = [];
        for (var i = 0; i < waiters.length; i++) waiters[i](false);
      };
      document.head.appendChild(s);
    }

    // keepVisible: 切换 pose 时保留当前画面，等新 pose 加载完成再替换，
    // 避免中间露出底下的 P2 待机模型。
    function clearPosePlayer(keepVisible) {
      poseToken++;
      poseLoading = false;
      poseReady = false;
      if (posePlayer) {
        if (activePlayer === posePlayer) activePlayer = null;
        disposePlayer(posePlayer);
        posePlayer = null;
      }
      if (posePane) {
        if (keepVisible) {
          // 旧画面继续显示在最上层，直到新 pose 的 success 回调把它替换掉。
          if (posePane.firstChild) posePane.classList.add('incoming');
        } else {
          posePane.classList.remove('active');
          posePane.classList.remove('incoming');
          posePane.innerHTML = '';
        }
      }
    }

    function showPose(key, p, holder) {
      // 原 touch 还在播放时打开 pose，先把它收掉，否则两套模型会叠在一起。
      if (legacyBusy) stopLegacy();
      poseKey = key;
      poseReady = true;
      poseLoading = false;
      currentSkin = '1';
      host.classList.remove('czn-skin-2');
      host.classList.remove('czn-legacy');
      host.classList.remove('czn-loading');
      host.classList.add('czn-pose');
      setActiveSkin();
      setActivePoseButton();

      for (var s in players) {
        if (players[s] && playerReady[s]) {
          try { players[s].pause(); } catch (e) {}
        }
      }
      if (panes[0]) panes[0].classList.remove('active');
      if (panes[1]) panes[1].classList.remove('active');
      // 新 pose 已就绪，再丢掉旧的画面，避免切换时闪出底下的 P2。
      // holder 为空表示重复选中当前 pose，此时不要清掉它自己的 canvas。
      if (posePane && holder) {
        var slots = posePane.querySelectorAll('.czn-pose-slot');
        for (var i = 0; i < slots.length; i++) {
          if (slots[i] !== holder) posePane.removeChild(slots[i]);
        }
        if (holder.parentNode !== posePane) posePane.appendChild(holder);
      }
      posePane.classList.add('active');
      posePane.classList.remove('incoming');

      activePlayer = p;
      activePane = posePane;
      currentAnim = 'idle';
      try {
        p.setAnimation('idle', true);
        p.play();
      } catch (e) {}
      schedulePreload();
    }

    function createPosePlayer(key, cfg) {
      poseLoading = true;
      poseReady = false;
      var token = ++poseToken;
      var pane = posePane;
      // 用一层新的容器承载新 pose，旧 pose 的画面留到新模型成功后再清掉。
      var holder = document.createElement('div');
      holder.className = 'czn-pose-slot';
      holder.style.cssText = 'position:absolute;inset:0';
      pane.appendChild(holder);
      var p = new global.spine.SpinePlayer(holder, {
        jsonUrl: base + 'assets/poses/' + cfg.dir + '/' + cfg.json,
        atlasUrl: base + 'assets/poses/' + cfg.dir + '/' + cfg.atlas,
        showLoading: false,
        showControls: false,
        animation: 'idle',
        alpha: true,
        premultipliedAlpha: true,
        backgroundColor: '#00000000',
        viewport: cfg.viewport,
        success: function (pl) {
          if (destroyed || token !== poseToken || currentSkin !== '1' || poseKey !== key) {
            if (holder.parentNode) holder.parentNode.removeChild(holder);
            disposePlayer(pl);
            return;
          }
          posePlayer = pl;
          showPose(key, pl, holder);
        },
        error: function () {
          if (destroyed || token !== poseToken) return;
          if (holder.parentNode) holder.parentNode.removeChild(holder);
          poseLoading = false;
          poseReady = false;
          poseKey = 'idle';
          setActivePoseButton();
          if (posePane) {
            posePane.classList.remove('active');
            posePane.classList.remove('incoming');
            posePane.innerHTML = '';
          }
          host.classList.remove('czn-loading');
          if (currentSkin === '1') activateSkin('1');
        }
      });
    }

    function selectPose(key) {
      if (destroyed || currentSkin !== '1') return;
      if (legacyBusy) stopLegacy();
      if (key === 'idle') {
        exitPose(true);
        return;
      }
      var cfg = POSES[key];
      if (!cfg) return;
      if (posePlayer && poseKey === key && poseReady) {
        host.classList.remove('czn-loading');
        if (posePane) posePane.classList.add('active');
        showPose(key, posePlayer);
        return;
      }
      if (poseLoading && poseKey === key) return;

      clearPosePlayer(true);
      poseKey = key;
      setActivePoseButton();
      // 加载新 pose 期间保持当前画面（czn-loading），不要让 P2 待机模型露出来。
      host.classList.add('czn-loading');
      if (posePane) posePane.classList.add('active');

      ensurePoseRuntime(function (ok) {
        if (!ok) {
          if (destroyed || currentSkin !== '1' || poseKey !== key) return;
          console.error('[CZNInline] spine-player-4.2.js failed to load');
          poseKey = 'idle';
          setActivePoseButton();
          exitPose(true);
          return;
        }
        if (destroyed || currentSkin !== '1' || poseKey !== key) return;
        createPosePlayer(key, cfg);
      });
    }

    function exitPose(showBase) {
      clearPosePlayer();
      host.classList.remove('czn-loading');
      poseKey = 'idle';
      setActivePoseButton();
      if (showBase && currentSkin === '1') activateSkin('1');
    }

    function ensureLegacyPlayer(cb) {
      if (destroyed) {
        if (cb) cb(null);
        return;
      }
      if (legacyPlayer && legacyReady) {
        if (cb) cb(legacyPlayer);
        return;
      }
      if (legacyLoading) {
        if (cb) legacyWaiters.push(cb);
        return;
      }

      legacyLoading = true;
      if (cb) legacyWaiters.push(cb);
      var token = ++legacyToken;
      legacyPane.innerHTML = '';
      var p = new global.spine_3_8.SpinePlayer(legacyPane, {
        jsonUrl: base + 'assets/30134.json',
        atlasUrl: base + 'assets/30134.atlas',
        showLoading: false,
        showControls: false,
        animation: 'idle',
        skin: 'normal',
        alpha: true,
        premultipliedAlpha: true,
        backgroundColor: '#00000000',
        viewport: { x: -500, y: -640, width: 1003, height: 1180, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 },
        success: function (pl) {
          if (destroyed || token !== legacyToken) {
            disposePlayer(pl);
            return;
          }
          legacyPlayer = pl;
          legacyReady = true;
          legacyLoading = false;
          pl.play();
          try { pl.pause(); } catch (e) {}
          var waiters = legacyWaiters;
          legacyWaiters = [];
          for (var w = 0; w < waiters.length; w++) waiters[w](pl);
        },
        error: function () {
          if (destroyed || token !== legacyToken) return;
          legacyLoading = false;
          legacyPlayer = null;
          legacyReady = false;
          legacyPane.innerHTML = '';
          var waiters = legacyWaiters;
          legacyWaiters = [];
          for (var w = 0; w < waiters.length; w++) waiters[w](null);
        }
      });
    }

    // 结束/打断原 touch 的公共收尾。调用方负责决定接下来显示什么：
    // stopLegacy 交给后续流程（激活 P2 或切换皮肤），endLegacy 自己回待机。
    function resetLegacyView() {
      clearTimeout(returnTimer);
      legacyBusy = false;
      host.classList.remove('czn-legacy');
      host.classList.remove('czn-loading');
      if (legacyPane) {
        legacyPane.classList.remove('active');
        legacyPane.style.zIndex = '';
      }
      if (legacyPlayer) {
        try { legacyPlayer.pause(); } catch (e) {}
      }
      if (activePlayer === legacyPlayer) activePlayer = null;
      currentAnim = 'idle';
    }

    // restoreBase: 打断原 touch 后回到皮肤 1 的 P2 待机（点击区域随之恢复）。
    function stopLegacy(restoreBase) {
      resetLegacyView();
      if (restoreBase && currentSkin === '1' && !posePlayer && !poseLoading) activateSkin('1');
    }

    function endLegacy() {
      if (!legacyBusy) return;
      // 播放完毕：回到皮肤 1 的 P2 待机，点击区域保持可用。
      resetLegacyView();
      if (currentSkin === '1' && !posePlayer && !poseLoading) activateSkin('1');
    }

    function playLegacyTouch() {
      if (destroyed || currentSkin !== '1' || legacyRequest) return;
      if (posePlayer || poseLoading) return;
      if (!players['1'] || !playerReady['1']) return;
      if (legacyBusy) stopLegacy(true);
      legacyRequest = true;

      ensureLegacyPlayer(function (p) {
        legacyRequest = false;
        if (!p || destroyed || currentSkin !== '1' || posePlayer || poseLoading) return;
        legacyBusy = true;
        clearTimeout(returnTimer);
        host.classList.add('czn-legacy');
        currentAnim = 'touch';
        try {
          p.setAnimation('touch', false);
          p.play();
          // 关键：在 pane 还隐藏时同步画一帧。
          // 第一帧会完成 shader / 纹理上传；画完再切到前面，
          // 浏览器不会把空的 WebGL canvas 合成出来。
          p.drawFrame(false);
        } catch (e) {
          resetLegacyView();
          return;
        }

        if (players['1']) {
          try { players['1'].pause(); } catch (e) {}
        }
        if (panes[0]) panes[0].classList.remove('active');
        legacyPane.classList.add('active');
        legacyPane.style.zIndex = '';
        activePlayer = p;
        activePane = legacyPane;

        var current = p.animationState && p.animationState.getCurrent(0);
        var duration = current && current.animation ? current.animation.duration : 4;
        returnTimer = setTimeout(endLegacy, duration * 1000 + 80);
      });
    }

    function playP2(anim) {
      if (destroyed || currentSkin !== '1') return;
      if (posePlayer || poseLoading) return;
      // 原 touch（旧 3.8 模型）正在播放时，先结束它并回到 P2，再播放新动作。
      if (legacyBusy) stopLegacy(true);
      if (!players['1'] || !playerReady['1']) return;
      if (activePlayer !== players['1'] || activePane !== paneFor('1')) activateSkin('1');
      activePlayer = players['1'];
      clearTimeout(returnTimer);
      currentAnim = anim;
      try {
        activePlayer.setAnimation(anim, anim === 'idle');
        activePlayer.play();
      } catch (e) {
        return;
      }
      if (anim !== 'idle') {
        var current = activePlayer.animationState && activePlayer.animationState.getCurrent(0);
        var duration = current && current.animation ? current.animation.duration : 4;
        returnTimer = setTimeout(function () {
          if (currentAnim === anim) playP2('idle');
        }, duration * 1000 + 80);
      }
    }

    function preloadPoseAssets() {
      if (!preloadPoses || destroyed || poseAssetsPreloaded) return;
      poseAssetsPreloaded = true;
      ensurePoseRuntime(function (ok) {
        if (!ok || destroyed) return;
        for (var key in POSES) {
          (function (cfg) {
            var dir = base + 'assets/poses/' + cfg.dir + '/';
            try {
              fetch(dir + cfg.json, { cache: 'force-cache' }).then(function (res) {
                return res.text();
              }).catch(function () {});
            } catch (e) {}
            try {
              fetch(dir + cfg.atlas, { cache: 'force-cache' }).then(function (res) {
                return res.text();
              }).then(function (text) {
                if (destroyed) return;
                text.split(/\r?\n/).forEach(function (line) {
                  var name = line.trim();
                  if (/\.png$/i.test(name)) {
                    var img = new Image();
                    img.onload = function () { img = null; };
                    img.src = dir + name;
                  }
                });
              }).catch(function () {});
            } catch (e) {}
          })(POSES[key]);
        }

        // 旧 3.8 皮肤 1：给“原 touch”区域用的经典模型。
        // 默认直接把 player 建好并暂停，第一次点手/剑时不用再加载。
        if (preloadLegacy) ensureLegacyPlayer(null);
      });
    }

    function ensurePlayer(skin, cb) {
      if (destroyed) {
        if (cb) cb(null);
        return;
      }
      if (players[skin] && playerReady[skin]) {
        if (cb) cb(players[skin]);
        return;
      }
      if (playerLoading[skin]) {
        if (cb) playerWaiters[skin].push(cb);
        return;
      }
      if (!MODELS[skin]) {
        if (cb) cb(null);
        return;
      }

      playerLoading[skin] = true;
      var token = ++loadToken[skin];
      var pane = paneFor(skin);
      var model = MODELS[skin];

      function fail() {
        if (destroyed || token !== loadToken[skin]) return;
        playerLoading[skin] = false;
        players[skin] = null;
        playerReady[skin] = false;
        pane.innerHTML = '';
        var waiters = playerWaiters[skin];
        playerWaiters[skin] = [];
        for (var w = 0; w < waiters.length; w++) waiters[w](null);
        if (currentSkin === skin) {
          var other = skin === '1' ? '2' : '1';
          if (playerReady[other]) {
            currentSkin = other;
            activateSkin(other);
          } else {
            setActiveSkin();
          }
        }
      }

      function start() {
        if (destroyed || token !== loadToken[skin]) return;
        var Ctor;
        if (model.runtime === '4.2') {
          if (!global.spine || !global.spine.SpinePlayer) {
            fail();
            return;
          }
          Ctor = global.spine.SpinePlayer;
        } else {
          if (!global.spine_3_8 || !global.spine_3_8.SpinePlayer) {
            fail();
            return;
          }
          Ctor = global.spine_3_8.SpinePlayer;
        }

        pane.innerHTML = '';
        var next = new Ctor(pane, {
          jsonUrl: base + model.json,
          atlasUrl: base + model.atlas,
          showLoading: false,
          showControls: false,
          animation: 'idle',
          skin: model.skin || 'normal',
          alpha: true,
          premultipliedAlpha: true,
          backgroundColor: '#00000000',
          viewport: model.viewport,
          success: function (p) {
            if (destroyed || token !== loadToken[skin]) {
              disposePlayer(p);
              return;
            }
            players[skin] = p;
            playerReady[skin] = true;
            playerLoading[skin] = false;
            p.play();
            if (currentSkin !== skin) {
              try { p.pause(); } catch (e) {}
            }
            var waiters = playerWaiters[skin];
            playerWaiters[skin] = [];
            for (var w = 0; w < waiters.length; w++) waiters[w](p);
            if (currentSkin === skin) activateSkin(skin);
            if (skin === '2') preloadPoseAssets();
          },
          error: function () { fail(); }
        });

      }

      if (model.runtime === '4.2') {
        ensurePoseRuntime(function (ok) {
          if (ok) start();
          else fail();
        });
      } else {
        start();
      }
    }

    function activateSkin(skin) {
      if (destroyed) return;
      // pose 加载中不要回到底下的 P2 待机模型，否则切换 pose 时会短暂闪出 P2。
      if (posePlayer || poseLoading || host.classList.contains('czn-loading')) return;
      if (!players[skin] || !playerReady[skin]) {
        ensurePlayer(skin, function (p) {
          if (p && !destroyed && currentSkin === skin) activateSkin(skin);
        });
        return;
      }

      currentSkin = skin;
      currentAnim = 'idle';
      clearTimeout(returnTimer);
      host.classList.remove('czn-loading');
      host.classList.toggle('czn-skin-2', skin === '2');
      host.classList.remove('czn-pose');
      host.classList.remove('czn-legacy');
      setActiveSkin();
      activePlayer = players[skin];
      activePane = paneFor(skin);
      if (posePane) posePane.classList.remove('active');

      for (var s in players) {
        var pane = paneFor(s);
        if (!pane) continue;
        var on = s === skin;
        pane.classList.toggle('active', on);
        pane.classList.remove('incoming');
        if (players[s] && playerReady[s]) {
          if (on) {
            try { players[s].play(); } catch (e) {}
          } else {
            try { players[s].pause(); } catch (e) {}
          }
        }
      }

      try {
        activePlayer.setAnimation('idle', true);
        activePlayer.play();
      } catch (e) {}
      schedulePreload();
    }

    function selectSkin(skin) {
      if (destroyed) return;
      if (skin !== '1' && skin !== '2') skin = '1';
      stopLegacy();
      host.classList.remove('czn-pose');
      if (posePlayer || poseLoading || poseKey !== 'idle') exitPose(false);
      currentSkin = skin;
      currentAnim = 'idle';
      clearTimeout(returnTimer);
      host.classList.toggle('czn-skin-2', skin === '2');
      setActiveSkin();
      activateSkin(skin);
    }

    function schedulePreload() {
      if (!preloadSkins || destroyed) return;
      clearTimeout(preloadTimer);
      preloadTimer = 0;
      var other = currentSkin === '1' ? '2' : '1';
      if (players[other] || playerLoading[other]) return;
      preloadTimer = setTimeout(function () {
        preloadTimer = 0;
        if (!destroyed && !players[other] && !playerLoading[other]) {
          ensurePlayer(other, null);
        }
      }, preloadDelay);
    }

    host.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('.czn-skins')) return;
      if (e.target && e.target.closest && e.target.closest('.czn-menu')) return;
      if (e.target && e.target.closest && e.target.closest('.czn-zones')) return;
      if (!passthrough) play('touch');
    });

    function closeMenu() {
      if (!menuEl) return;
      menuEl.classList.remove('open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }

    function onDocumentClick(e) {
      if (!menuEl || menuEl.contains(e.target)) return;
      closeMenu();
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menuEl.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    document.addEventListener('click', onDocumentClick);

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
        if (skin !== currentSkin || !playerReady[skin]) selectSkin(skin);
      });
    }

    var poseButtons = host.querySelectorAll('[data-pose]');
    for (var pi = 0; pi < poseButtons.length; pi++) {
      poseButtons[pi].addEventListener('click', function (e) {
        e.stopPropagation();
        selectPose(this.getAttribute('data-pose'));
        closeMenu();
      });
    }

    var zoneEls = host.querySelectorAll('.czn-zone');
    for (var zj = 0; zj < zoneEls.length; zj++) {
      zoneEls[zj].addEventListener('click', function (e) {
        // 阻止默认行为，避免按下区域时先触发 focus/blur 之类的副作用。
        e.preventDefault();
        e.stopPropagation();
        // 区域在 legacy 播放期间保持可点：任何一个区域都能立刻打断原 touch。
        if (this.getAttribute('data-legacy') === '1') playLegacyTouch();
        else playP2(this.getAttribute('data-anim'));
      });
    }

    var api = {
      play: play,
      setSkin: function (skin) {
        skin = skin === '2' || skin === 2 ? '2' : '1';
        if (skin !== currentSkin || !playerReady[skin]) selectSkin(skin);
      },
      setPose: function (key) {
        selectPose(key || 'idle');
      },
      playP2: function (anim) {
        playP2(anim || 'idle');
      },
      playLegacyTouch: playLegacyTouch,
      getState: function () {
        return {
          skin: currentSkin,
          anim: currentAnim,
          ready: !!activePlayer,
          cached: { '1': playerReady['1'], '2': playerReady['2'] },
          pose: poseKey,
          poseReady: poseReady,
          legacy: legacyBusy
        };
      },
      destroy: function () {
        destroyed = true;
        clearTimeout(returnTimer);
        clearTimeout(preloadTimer);
        preloadTimer = 0;
        stopLegacy();
        document.removeEventListener('click', onDocumentClick);
        clearPosePlayer();
        poseRuntimeWaiters = [];
        legacyWaiters = [];
        legacyRequest = false;
        legacyLoading = false;
        if (legacyPlayer) disposePlayer(legacyPlayer);
        legacyPlayer = null;
        legacyReady = false;
        for (var s in players) {
          if (players[s]) disposePlayer(players[s]);
        }
        players = { '1': null, '2': null };
        playerReady = { '1': false, '2': false };
        playerLoading = { '1': false, '2': false };
        playerWaiters = { '1': [], '2': [] };
        activePlayer = null;
        activePane = null;
        host.innerHTML = '';
      }
    };
    host.__czn = api;

    selectSkin(currentSkin);
    return api;
  }

  global.CZNInline = { mount: mount };
})(window);
