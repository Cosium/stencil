import type { BuildCtx, Cache, CompilerCtx, CompilerSystem, Config, Module } from '@stencil/core/internal';
import { BuildContext } from '../compiler/build/build-ctx';
import { Cache as CompilerCache } from '../compiler/cache';
import { createInMemoryFs } from '../compiler/sys/in-memory-fs';
import { createTestingSystem, TestingSystem } from './testing-sys';
import { createWorkerContext } from '@stencil/core/compiler';
import { MockWindow } from '@stencil/core/mock-doc';
import { TestingLogger } from './testing-logger';
import path from 'path';
import { noop } from '@utils';
import { buildEvents } from '../compiler/events';

export function mockConfig(sys?: CompilerSystem) {
  const rootDir = path.resolve('/');

  if (!sys) {
    sys = createTestingSystem();
  }
  sys.getCurrentDirectory = () => rootDir;

  const config: Config = {
    _isTesting: true,

    namespace: 'Testing',
    rootDir: rootDir,
    globalScript: null,
    devMode: true,
    enableCache: false,
    buildAppCore: false,
    buildDist: true,
    flags: {},
    bundles: null,
    outputTargets: null,
    buildEs5: false,
    hashFileNames: false,
    logger: new TestingLogger(),
    maxConcurrentWorkers: 0,
    minifyCss: false,
    minifyJs: false,
    sys,
    testing: null,
    validateTypes: false,
    extras: {},
    nodeResolve: {
      customResolveOptions: {},
    },
    sourceMap: true,
    rollupPlugins: {
      before: [],
      after: [],
    },
  };

  return config;
}

export function mockCompilerCtx(config?: Config) {
  if (!config) {
    config = mockConfig();
  }
  const compilerCtx: CompilerCtx = {
    version: 1,
    activeBuildId: 0,
    activeDirsAdded: [],
    activeDirsDeleted: [],
    activeFilesAdded: [],
    activeFilesDeleted: [],
    activeFilesUpdated: [],
    addWatchDir: noop,
    addWatchFile: noop,
    cachedGlobalStyle: null,
    changedFiles: new Set(),
    changedModules: new Set(),
    collections: [],
    compilerOptions: null,
    cache: null,
    cssModuleImports: new Map(),
    events: buildEvents(),
    fs: null,
    hasSuccessfulBuild: false,
    isActivelyBuilding: false,
    lastBuildResults: null,
    moduleMap: new Map(),
    nodeMap: new WeakMap(),
    reset: noop,
    resolvedCollections: new Set(),
    rollupCache: new Map(),
    rollupCacheHydrate: null,
    rollupCacheLazy: null,
    rollupCacheNative: null,
    styleModeNames: new Set(),
    worker: createWorkerContext(config.sys),
  };

  Object.defineProperty(compilerCtx, 'fs', {
    get() {
      if (this._fs == null) {
        this._fs = createInMemoryFs(config.sys);
      }
      return this._fs;
    },
  });

  Object.defineProperty(compilerCtx, 'cache', {
    get() {
      if (this._cache == null) {
        this._cache = mockCache(config, compilerCtx);
      }
      return this._cache;
    },
  });

  return compilerCtx;
}

export function mockBuildCtx(config?: Config, compilerCtx?: CompilerCtx): BuildCtx {
  if (!config) {
    config = mockConfig();
  }
  if (!compilerCtx) {
    compilerCtx = mockCompilerCtx(config);
  }
  const buildCtx = new BuildContext(config, compilerCtx);

  return buildCtx as BuildCtx;
}

export function mockCache(config?: Config, compilerCtx?: CompilerCtx) {
  if (!config) {
    config = mockConfig();
  }
  if (!compilerCtx) {
    compilerCtx = mockCompilerCtx(config);
  }
  config.enableCache = true;
  const cache = new CompilerCache(config, compilerCtx.fs);
  cache.initCacheDir();
  return cache as Cache;
}

export function mockLogger() {
  return new TestingLogger();
}

/**
 * Create a {@link CompilerSystem} entity for testing the compiler.
 *
 * This function acts as a thin wrapper around a {@link TestingSystem} entity creation. It exists to provide a logical
 * place in the codebase where we might expect Stencil engineers to reach for when attempting to mock a
 * {@link CompilerSystem} base type. Should there prove to be usage of both this function and the one it wraps,
 * reconsider if this wrapper is necessary.
 *
 * @returns a System instance for testing purposes.
 */
export function mockCompilerSystem(): TestingSystem {
  return createTestingSystem();
}

export function mockDocument(html: string = null) {
  const win = new MockWindow(html);
  return win.document as Document;
}

export function mockWindow(html: string = null) {
  const win = new MockWindow(html);
  return win as any as Window;
}

/**
 * This gives you a mock Module, an interface which is the internal compiler
 * representation of a module. It includes a bunch of information necessary for
 * compilation, this mock basically sets sane defaults for all those values.
 *
 * @param mod is an override module that you can supply to set particular values
 * @returns a module object ready to use in tests!
 */
export const mockModule = (mod: Partial<Module> = {}): Module => ({
  cmps: [],
  coreRuntimeApis: [],
  collectionName: '',
  dtsFilePath: '',
  excludeFromCollection: false,
  externalImports: [],
  htmlAttrNames: [],
  htmlTagNames: [],
  htmlParts: [],
  isCollectionDependency: false,
  isLegacy: false,
  jsFilePath: '',
  localImports: [],
  originalImports: [],
  originalCollectionComponentPath: '',
  potentialCmpRefs: [],
  sourceFilePath: '',
  staticSourceFile: '',
  staticSourceFileText: '',
  sourceMapPath: '',
  sourceMapFileText: '',

  // build features
  hasVdomAttribute: false,
  hasVdomClass: false,
  hasVdomFunctional: false,
  hasVdomKey: false,
  hasVdomListener: false,
  hasVdomPropOrAttr: false,
  hasVdomRef: false,
  hasVdomRender: false,
  hasVdomStyle: false,
  hasVdomText: false,
  hasVdomXlink: false,
  ...mod,
});
