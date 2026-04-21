const NAV_LOCK_MS = 450;
let navLockedUntil = 0;

function now() {
  return Date.now();
}

function canNavigate() {
  if (now() < navLockedUntil) {
    return false;
  }
  navLockedUntil = now() + NAV_LOCK_MS;
  return true;
}

function releaseLock() {
  setTimeout(() => {
    navLockedUntil = 0;
  }, NAV_LOCK_MS);
}

function getPageStackSize() {
  try {
    const pages = getCurrentPages();
    return Array.isArray(pages) ? pages.length : 0;
  } catch (error) {
    return 0;
  }
}

function withGuard(action) {
  if (!canNavigate()) return;
  action();
  releaseLock();
}

export function safeNavigateTo(url, fallbackUrl = '/pages/index/index') {
  withGuard(() => {
    const stack = getPageStackSize();
    if (stack >= 10) {
      uni.redirectTo({
        url,
        fail: () => {
          uni.reLaunch({
            url: fallbackUrl
          });
        }
      });
      return;
    }

    uni.navigateTo({
      url,
      fail: () => {
        uni.redirectTo({
          url,
          fail: () => {
            uni.reLaunch({
              url: fallbackUrl
            });
          }
        });
      }
    });
  });
}

export function forceNavigateTo(url, fallbackUrl = '/pages/index/index') {
  const stack = getPageStackSize();
  if (stack >= 10) {
    uni.redirectTo({
      url,
      fail: () => {
        uni.reLaunch({
          url: fallbackUrl
        });
      }
    });
    return;
  }

  uni.navigateTo({
    url,
    fail: () => {
      uni.redirectTo({
        url,
        fail: () => {
          uni.reLaunch({
            url: fallbackUrl
          });
        }
      });
    }
  });
}

export function safeRedirectTo(url, fallbackUrl = '/pages/index/index') {
  withGuard(() => {
    uni.redirectTo({
      url,
      fail: () => {
        uni.reLaunch({
          url: fallbackUrl
        });
      }
    });
  });
}

export function safeReLaunch(url = '/pages/index/index') {
  withGuard(() => {
    uni.reLaunch({
      url
    });
  });
}

export function safeBack(delta = 1, fallbackUrl = '/pages/index/index') {
  withGuard(() => {
    const stack = getPageStackSize();
    if (stack > delta) {
      uni.navigateBack({
        delta,
        fail: () => {
          uni.reLaunch({
            url: fallbackUrl
          });
        }
      });
      return;
    }

    uni.reLaunch({
      url: fallbackUrl
    });
  });
}
