import type * as d from '@stencil/core/declarations';
import { OutputTargetWww } from '@stencil/core/declarations';
import { mockCompilerSystem } from '@stencil/core/testing';
import { validateServiceWorker } from '../validate-service-worker';

describe('validateServiceWorker', () => {
  const config: d.Config = {
    fsNamespace: 'app',
    sys: mockCompilerSystem(),
    devMode: false,
    flags: {},
  };

  let outputTarget: d.OutputTargetWww;

  /**
   * A little util to work around a typescript annoyance. Because
   * `outputTarget.serviceWorker` is typed as
   * `serviceWorker?: ServiceWorkerConfig | null | false;` we get type errors
   * all over if we try to just access it directly. So instead, do a little
   * check to see if it's falsy. If not, we return it, and if it is we fail the test.
   *
   * @param target the output target from which we want to pull the serviceWorker
   * @returns a serviceWorker object or `void`, with a `void` return being
   * accompanied by a manually-triggered test failure.
   */
  function getServiceWorker(target: OutputTargetWww) {
    if (target.serviceWorker) {
      return target.serviceWorker;
    } else {
      fail('the serviceWorker on the provided target was unexpectedly falsy, so this test needs to fail!');
    }
  }

  it('should add host.config.json to globIgnores', () => {
    outputTarget = {
      type: 'www',
      appDir: '/User/me/app/www/',
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globIgnores).toContain('**/host.config.json');
  });

  it('should set globIgnores from string', () => {
    outputTarget = {
      type: 'www',
      appDir: '/User/me/app/www/',
      serviceWorker: {
        globIgnores: '**/some-file.js',
      },
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globIgnores).toContain('**/some-file.js');
  });

  it('should set globDirectory', () => {
    outputTarget = {
      type: 'www',
      appDir: '/User/me/app/www/',
      serviceWorker: {
        globDirectory: '/custom/www',
      },
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globDirectory).toBe('/custom/www');
  });

  it('should set default globDirectory', () => {
    outputTarget = {
      type: 'www',
      appDir: '/User/me/app/www/',
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globDirectory).toBe('/User/me/app/www/');
  });

  it('should set globPatterns array', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
      serviceWorker: {
        globPatterns: ['**/*.{png,svg}'],
      },
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globPatterns).toEqual(['**/*.{png,svg}']);
  });

  it('should set globPatterns string', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
      serviceWorker: {
        globPatterns: '**/*.{png,svg}' as any,
      },
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globPatterns).toEqual(['**/*.{png,svg}']);
  });

  it('should create default globPatterns', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
    };
    validateServiceWorker(config, outputTarget);
    expect(getServiceWorker(outputTarget).globPatterns).toEqual(['*.html', '**/*.{js,css,json}']);
  });

  it('should create default sw config when www type and prod mode', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
    };
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).not.toBe(null);
  });

  it('should not create default sw config when www type and devMode', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
    };
    config.devMode = true;
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).toBe(null);
  });

  it('should not create default sw config when not www type', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
    };
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).toBe(null);
  });

  it('should create default sw config when true boolean, even if devMode', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
      serviceWorker: true as any,
    };
    config.devMode = true;
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).not.toBe(true);
  });

  it('should not create sw config when in devMode', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
      serviceWorker: true as any,
    };
    config.devMode = true;
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).toBe(null);
  });

  it('should create sw config when in devMode if flag serviceWorker', () => {
    outputTarget = {
      type: 'www',
      appDir: '/www',
      serviceWorker: true as any,
    };
    config.devMode = true;
    config.flags.serviceWorker = true;
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).not.toBe(null);
  });

  it('should stay null', () => {
    outputTarget = {
      type: 'www',
      serviceWorker: null,
    };
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).toBe(null);
  });

  it('should stay false', () => {
    outputTarget = {
      type: 'www',
      serviceWorker: false,
    };
    validateServiceWorker(config, outputTarget);
    expect(outputTarget.serviceWorker).toBe(false);
  });
});
